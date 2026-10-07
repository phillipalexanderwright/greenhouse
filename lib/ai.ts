export type AITask = "scribe" | "almanac" | "signals";

export interface AIResult {
  ok: boolean;
  text?: string;
  reason?: "no-key" | "bad-request" | "api-error" | "network";
}

export async function askAI(task: AITask, prompt: string): Promise<AIResult> {
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ task, prompt }),
    });
    return (await res.json()) as AIResult;
  } catch {
    return { ok: false, reason: "network" };
  }
}

export const NO_KEY_MESSAGE =
  "The Scribe is still asleep — add an ANTHROPIC_API_KEY to wake it.";
