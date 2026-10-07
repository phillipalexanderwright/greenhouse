"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, PageHeader, Pill, Empty, statusLabel } from "@/components/ui";
import { Tending, Almanac } from "@/components/HomeCards";
import {
  PLATFORMS,
  PLATFORM_LABEL,
  latestSnap,
  followerDelta,
  fmtDelta,
  engagementRate,
  fmtPct,
  daysAgoStr,
} from "@/lib/social";

export default function ThisMonth() {
  const { data, user } = useStore();

  const month = [...data.months].sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  )[0];
  const items = month
    ? data.box_items.filter((i) => i.month_id === month.id)
    : [];
  const doneItems = items.filter(
    (i) => i.status === "assembled" || i.status === "shipped"
  ).length;
  const dinner = month
    ? data.dinners.find((d) => d.month_id === month.id)
    : undefined;
  const guests = dinner
    ? data.guests.filter((g) => g.dinner_id === dinner.id)
    : [];
  const confirmed = guests.filter((g) => g.rsvp === "yes").length;

  const myTodos = data.todos.filter(
    (t) => !t.done && (t.assignee === user || t.assignee === "Both")
  );
  const theirTodos = data.todos.filter(
    (t) => !t.done && t.assignee !== user && t.assignee !== "Both"
  );
  const recentDone = data.todos
    .filter((t) => t.done)
    .sort((a, b) => (b.done_at ?? "").localeCompare(a.done_at ?? ""))
    .slice(0, 5);

  const sprouting = data.ideas.filter((i) => i.status === "sprouting");
  const activeAgents = data.agents.filter((a) => a.status === "active");

  const hasSocial =
    data.social_snapshots.length > 0 ||
    data.social_posts.some((p) => p.status === "posted");
  const weekPosts = data.social_posts.filter(
    (p) => p.status === "posted" && p.date >= daysAgoStr(7)
  );
  const topPost = [...weekPosts].sort(
    (a, b) => (engagementRate(b) ?? -1) - (engagementRate(a) ?? -1)
  )[0];

  const daysToDinner = dinner?.date
    ? Math.ceil(
        (new Date(dinner.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div>
      <PageHeader
        title={month ? month.name : "This Month"}
        subtitle={month?.theme || "No theme set yet"}
        action={month && <Pill tone="olive">{statusLabel(month.status)}</Pill>}
      />

      {!month ? (
        <Empty>
          Plant your first month in <Link href="/box" className="underline">The Box</Link>.
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Link href="/box">
            <Card className="h-full transition-colors hover:bg-sage/30">
              <div className="label-caps mb-2">The Box</div>
              <div className="font-display text-3xl font-semibold">
                {doneItems} / {items.length}
              </div>
              <p className="mt-1 text-sm text-ink/60">
                items assembled or shipped
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-earth/20">
                <div
                  className="h-full rounded-full bg-olive"
                  style={{
                    width: items.length
                      ? `${(doneItems / items.length) * 100}%`
                      : "0%",
                  }}
                />
              </div>
            </Card>
          </Link>

          <Link href="/garden">
            <Card className="h-full transition-colors hover:bg-sage/30">
              <div className="label-caps mb-2">The Garden</div>
              <div className="font-display text-3xl font-semibold">
                {dinner
                  ? daysToDinner !== null && !isNaN(daysToDinner)
                    ? `${daysToDinner} days`
                    : "No date"
                  : "Not planned"}
              </div>
              <p className="mt-1 text-sm text-ink/60">
                {dinner
                  ? `${confirmed} of ${guests.length} guests confirmed · ${dinner.venue || "venue TBD"}`
                  : "no dinner on the books yet"}
              </p>
            </Card>
          </Link>

          <Card>
            <div className="label-caps mb-2">Song of the Month</div>
            <div className="font-display text-2xl italic">
              {month.song || "—"}
            </div>
          </Card>

          <div className="lg:col-span-2">
            <Tending />
          </div>

          <Card>
            <div className="label-caps mb-3">Recently finished</div>
            {recentDone.length === 0 ? (
              <Empty>Nothing yet.</Empty>
            ) : (
              <ul className="space-y-2">
                {recentDone.map((t) => (
                  <li key={t.id} className="text-sm text-ink/70">
                    <span className="text-olive-deep">✓</span>{" "}
                    <span className="line-through decoration-earth/60">
                      {t.title}
                    </span>{" "}
                    <span className="text-xs text-ink/45">— {t.done_by}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <div className="label-caps">Your to-dos, {user}</div>
              <Link href="/todos" className="text-xs underline text-ink/50">
                all to-dos →
              </Link>
            </div>
            {myTodos.length === 0 ? (
              <Empty>Nothing on your plate. Go touch grass — literally.</Empty>
            ) : (
              <ul className="space-y-2">
                {myTodos.slice(0, 6).map((t) => (
                  <li key={t.id} className="flex items-center gap-2 text-sm">
                    <span className="text-olive-deep">○</span> {t.title}
                    {t.assignee === "Both" && <Pill tone="sky">both</Pill>}
                  </li>
                ))}
              </ul>
            )}
            {theirTodos.length > 0 && (
              <p className="mt-3 text-xs text-ink/45">
                {theirTodos.length} open for{" "}
                {user === "Phillip" ? "Hank" : "Phillip"}
              </p>
            )}
          </Card>

          <Card>
            <div className="mb-3 flex items-center justify-between">
              <div className="label-caps">Agents</div>
              <Link href="/agents" className="text-xs underline text-ink/50">
                all agents →
              </Link>
            </div>
            <div className="font-display text-3xl font-semibold">
              {activeAgents.length}
            </div>
            <p className="mt-1 text-sm text-ink/60">
              active of {data.agents.length} defined
            </p>
          </Card>

          <Card className="lg:col-span-3">
            <div className="mb-3 flex items-center justify-between">
              <div className="label-caps">Sprouting ideas</div>
              <Link href="/ideas" className="text-xs underline text-ink/50">
                compost pile →
              </Link>
            </div>
            {sprouting.length === 0 ? (
              <Empty>Nothing sprouting. Toss something in the compost.</Empty>
            ) : (
              <ul className="space-y-2">
                {sprouting.slice(0, 5).map((i) => (
                  <li key={i.id} className="text-sm">
                    ✿ {i.title}{" "}
                    <span className="text-xs text-ink/45">— {i.added_by}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Almanac />

          <Card className="lg:col-span-3">
            <div className="mb-3 flex items-center justify-between">
              <div className="label-caps">Pollinate — this week</div>
              <Link href="/pollinate" className="text-xs underline text-ink/50">
                open pollinate →
              </Link>
            </div>
            {!hasSocial ? (
              <Empty>
                No signal yet. Log your first snapshot in Pollinate when the
                accounts go live.
              </Empty>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {PLATFORMS.map((platform) => {
                  const latest = latestSnap(data.social_snapshots, platform);
                  const delta = followerDelta(
                    data.social_snapshots,
                    platform,
                    7
                  );
                  return (
                    <div key={platform}>
                      <div className="text-[11px] uppercase tracking-wider text-ink/45">
                        {PLATFORM_LABEL[platform]}
                      </div>
                      <div className="font-display text-2xl font-semibold">
                        {latest ? latest.followers.toLocaleString() : "—"}
                        {delta !== null && (
                          <span
                            className={`ml-2 text-sm ${delta >= 0 ? "text-olive-deep" : "text-red-800"}`}
                          >
                            {fmtDelta(delta)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-ink/45">
                    Top post · 7d
                  </div>
                  {topPost ? (
                    <div className="text-sm">
                      {topPost.title}
                      {engagementRate(topPost) !== null && (
                        <span className="ml-2 text-xs text-ink/50">
                          {fmtPct(engagementRate(topPost)!)} eng.
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-ink/45">
                      no posts this week
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
