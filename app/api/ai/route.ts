import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const BRAND_VOICE = `You write for 2nd Nature (2N), a San Diego company founded by Phillip and Hank.
2N reconnects people with in-real-life experiences — plants, spaces, people. A monthly box of
whimsical, tangible things (pressed flowers, embossed postcards, poems, flash tattoo ideas,
a song of the month) and a monthly dinner party series called The Garden.

Voice: warm, poetic, unhurried, whimsical. Never corporate, never growth-hacky, no hashtag
spam, no exclamation-point enthusiasm, no emoji unless a single botanical one truly earns its
place. Think vintage botanical illustration, cream paper, letterpress. Short sentences are
welcome. Depth over scale, always.`;

const TASKS: Record<string, { system: string; maxTokens: number }> = {
  scribe: {
    system: `${BRAND_VOICE}

You are The Scribe. Given a content idea and its context, draft social copy.
Return exactly three distinct options, numbered 1–3, each a complete caption ready to
lightly edit and post. Vary the angle: one quiet and poetic, one warm and conversational,
one minimal (a single line or two). After the three options, add one short line starting
with "Why this works:" explaining the shared idea. No preamble before option 1.`,
    maxTokens: 900,
  },
  almanac: {
    system: `${BRAND_VOICE}

You are The Almanac. You receive a compact snapshot of the studio's week: box progress,
dinner status, to-dos, ideas, and social numbers. Write a short Sunday-evening note to
Phillip and Hank: what happened, what is drifting, and the three things that matter most
this week. Address them as "you two" where natural. Keep it under 250 words. Use short
paragraphs, no headings, no bullet lists except the final three priorities (numbered).`,
    maxTokens: 700,
  },
  signals: {
    system: `${BRAND_VOICE}

You are the strategy reader for Pollinate, 2N's social dashboard. You receive raw metrics:
follower snapshots, posts with engagement, and rule-based signals already computed. Go one
level deeper than the rules: find the story in the numbers and say what to do about it.
Be concrete and honest — if the data is too thin to conclude anything, say so and name the
one experiment that would make it less thin. Under 200 words. No headings.`,
    maxTokens: 600,
  },
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, reason: "no-key" });
  }

  let body: { task?: string; prompt?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, reason: "bad-request" },
      { status: 400 }
    );
  }

  const task = TASKS[body.task ?? ""];
  const prompt = (body.prompt ?? "").slice(0, 20000);
  if (!task || !prompt) {
    return NextResponse.json(
      { ok: false, reason: "bad-request" },
      { status: 400 }
    );
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: task.maxTokens,
      system: task.system,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    return NextResponse.json(
      { ok: false, reason: "api-error", detail: detail.slice(0, 500) },
      { status: 502 }
    );
  }

  const data = (await res.json()) as {
    content: { type: string; text?: string }[];
  };
  const text = data.content
    .filter((c) => c.type === "text")
    .map((c) => c.text)
    .join("\n");

  return NextResponse.json({ ok: true, text });
}
