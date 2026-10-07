"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, Button, Empty, Pill } from "@/components/ui";
import { askAI, NO_KEY_MESSAGE } from "@/lib/ai";
import { todayStr, daysAgoStr } from "@/lib/social";

/** Monday of the current week, YYYY-MM-DD. */
function mondayStr() {
  const d = new Date();
  const day = d.getDay();
  d.setDate(d.getDate() - ((day + 6) % 7));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ---------- Morning Tending ----------

interface Chore {
  text: string;
  href: string;
  label: string;
}

export function Tending() {
  const { data } = useStore();
  const chores: Chore[] = [];
  const today = todayStr();

  // 1. No snapshot logged today
  const snappedToday = data.social_snapshots.some((s) => s.date === today);
  if (!snappedToday) {
    chores.push({
      text: "No social snapshot logged today — 60 seconds in Pollinate.",
      href: "/pollinate",
      label: "Pollinate",
    });
  }

  // 2. Dinner within 7 days with unanswered invites
  for (const dinner of data.dinners) {
    if (!dinner.date || dinner.status === "complete") continue;
    const days = Math.ceil(
      (new Date(dinner.date + "T00:00:00").getTime() - Date.now()) / 86400000
    );
    if (days < 0 || days > 7) continue;
    const guests = data.guests.filter((g) => g.dinner_id === dinner.id);
    const unanswered = guests.filter((g) => g.rsvp === "invited").length;
    if (unanswered > 0) {
      chores.push({
        text: `${dinner.title} is in ${days} day${days === 1 ? "" : "s"} — ${unanswered} invite${unanswered === 1 ? "" : "s"} unanswered.`,
        href: "/garden",
        label: "The Garden",
      });
    }
  }

  // 3. Planned posts that slipped past their date
  const slipped = data.social_posts.filter(
    (p) => p.status === "planned" && p.date && p.date < today
  );
  for (const p of slipped.slice(0, 2)) {
    chores.push({
      text: `Planned post slipped: “${p.title}” (was ${p.date}).`,
      href: "/pollinate",
      label: "Pollinate",
    });
  }

  // 4. To-dos going stale
  const stale = data.todos.filter(
    (t) => !t.done && t.created_at.slice(0, 10) < daysAgoStr(21)
  );
  if (stale.length > 0) {
    chores.push({
      text: `${stale.length} to-do${stale.length === 1 ? " has" : "s have"} sat for 3+ weeks — do or compost.`,
      href: "/todos",
      label: "To-Dos",
    });
  }

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <div className="label-caps">Morning tending</div>
        <Pill tone={chores.length ? "blush" : "sage"}>
          {chores.length ? `${chores.length} to tend` : "tended"}
        </Pill>
      </div>
      {chores.length === 0 ? (
        <Empty>The garden is tended. Nothing needs you right now.</Empty>
      ) : (
        <ul className="space-y-2.5">
          {chores.slice(0, 5).map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="mt-0.5 text-olive-deep">✾</span>
              <span>
                {c.text}{" "}
                <Link
                  href={c.href}
                  className="whitespace-nowrap text-xs underline text-ink/50"
                >
                  {c.label} →
                </Link>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

// ---------- The Almanac ----------

export function Almanac() {
  const { data, insert, user } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const latest = [...data.digests].sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  )[0];
  const thisWeek = mondayStr();

  const write = async () => {
    setLoading(true);
    setError(null);

    const month = [...data.months].sort((a, b) =>
      b.created_at.localeCompare(a.created_at)
    )[0];
    const items = month
      ? data.box_items.filter((i) => i.month_id === month.id)
      : [];
    const dinner = month
      ? data.dinners.find((d) => d.month_id === month.id)
      : undefined;
    const guests = dinner
      ? data.guests.filter((g) => g.dinner_id === dinner.id)
      : [];
    const openTodos = data.todos.filter((t) => !t.done);
    const doneThisWeek = data.todos.filter(
      (t) => t.done && (t.done_at ?? "") >= thisWeek
    );
    const recentSnaps = data.social_snapshots
      .filter((s) => s.date >= daysAgoStr(10))
      .map(
        (s) => `${s.date} ${s.platform}: ${s.followers} followers, ${s.views} views`
      );
    const recentPosts = data.social_posts
      .filter((p) => p.date >= daysAgoStr(10))
      .map(
        (p) =>
          `${p.status} ${p.platform}/${p.format} "${p.title}" — ${p.views}v ${p.likes}l ${p.saves}s`
      );
    const sprouting = data.ideas.filter((i) => i.status === "sprouting");

    const prompt = [
      `Week of ${thisWeek}.`,
      month
        ? `Month: ${month.name}, theme "${month.theme}", status ${month.status}, song: ${month.song || "none"}`
        : "No month planned.",
      `Box: ${items.filter((i) => i.status === "assembled" || i.status === "shipped").length}/${items.length} items assembled or shipped. Items: ${items.map((i) => `${i.title} (${i.status})`).join("; ") || "none"}`,
      dinner
        ? `Dinner: ${dinner.title}, date ${dinner.date || "unset"}, venue ${dinner.venue || "TBD"}, ${guests.filter((g) => g.rsvp === "yes").length}/${guests.length} confirmed.`
        : "No dinner planned.",
      `Open to-dos (${openTodos.length}): ${openTodos.map((t) => `${t.title} [${t.assignee}]`).join("; ") || "none"}`,
      `Finished this week: ${doneThisWeek.map((t) => t.title).join("; ") || "nothing"}`,
      `Sprouting ideas: ${sprouting.map((i) => i.title).join("; ") || "none"}`,
      `Social snapshots (10d):\n${recentSnaps.join("\n") || "none"}`,
      `Posts (10d):\n${recentPosts.join("\n") || "none"}`,
    ].join("\n\n");

    const res = await askAI("almanac", prompt);
    setLoading(false);
    if (res.ok && res.text) {
      insert("digests", {
        week_of: thisWeek,
        body: res.text,
        created_by: user,
      });
    } else {
      setError(
        res.reason === "no-key"
          ? NO_KEY_MESSAGE
          : "The Almanac lost the thread — try again in a moment."
      );
    }
  };

  return (
    <Card className="lg:col-span-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="label-caps">The Almanac — weekly note</div>
        <Button onClick={write} disabled={loading}>
          {loading
            ? "Writing…"
            : latest?.week_of === thisWeek
              ? "Rewrite this week's note"
              : "Write this week's note"}
        </Button>
      </div>
      {error && <p className="mb-3 text-sm text-ink/60">{error}</p>}
      {latest ? (
        <div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink/85">
            {latest.body}
          </p>
          <p className="mt-3 text-[11px] text-ink/45">
            Week of {latest.week_of} — asked for by {latest.created_by}
          </p>
        </div>
      ) : (
        !error && (
          <Empty>
            Once a week, the Almanac reads everything — box, garden, to-dos,
            social — and writes you two a short note on what matters.
          </Empty>
        )
      )}
    </Card>
  );
}
