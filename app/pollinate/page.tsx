"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { askAI, NO_KEY_MESSAGE } from "@/lib/ai";
import {
  Card,
  PageHeader,
  Pill,
  Button,
  Input,
  Select,
  TextArea,
  Empty,
} from "@/components/ui";
import {
  Platform,
  PostFormat,
  SocialPost,
  SocialSnapshot,
  Experiment,
} from "@/lib/types";
import {
  PLATFORMS,
  PLATFORM_LABEL,
  todayStr,
  platformSnaps,
  latestSnap,
  followerDelta,
  engagementRate,
  avgEngagement,
  fmtPct,
  fmtDelta,
  computeSignals,
  daysAgoStr,
} from "@/lib/social";

const FORMATS: PostFormat[] = [
  "reel",
  "carousel",
  "photo",
  "story",
  "video",
  "other",
];

const DEFAULT_PILLARS = [
  "Box reveal",
  "Garden recap",
  "Behind the scenes",
  "Plant & flower care",
  "Poem / words",
  "Community",
];

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const w = 120;
  const h = 32;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values
    .map(
      (v, i) =>
        `${(i / (values.length - 1)) * w},${h - 3 - ((v - min) / span) * (h - 6)}`
    )
    .join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline
        points={pts}
        fill="none"
        stroke="#A7B79D"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MetricInput({
  label,
  value,
  onCommit,
}: {
  label: string;
  value: number;
  onCommit: (n: number) => void;
}) {
  const [v, setV] = useState(String(value));
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-ink/45">
        {label}
      </span>
      <input
        type="number"
        min={0}
        value={v}
        onChange={(e) => setV(e.target.value)}
        onBlur={() => {
          const n = Math.max(0, Number(v) || 0);
          if (n !== value) onCommit(n);
        }}
        className="w-16 rounded-md border border-earth/40 bg-white/80 px-1.5 py-1 text-xs outline-none focus:border-olive-deep"
      />
    </label>
  );
}

function platformPill(p: Platform) {
  return p === "instagram" ? "blush" : "sky";
}

type Tab = "daily" | "content" | "signals" | "experiments" | "scribe";

export default function PollinatePage() {
  const { data } = useStore();
  const [tab, setTab] = useState<Tab>("daily");

  const snaps = data.social_snapshots;
  const posts = data.social_posts;

  const signals = useMemo(() => computeSignals(snaps, posts), [snaps, posts]);

  const posted = posts.filter((p) => p.status === "posted");
  const recentPosted = posted.filter((p) => p.date >= daysAgoStr(30));
  const er30 = avgEngagement(recentPosted);
  const saves30 = recentPosted.reduce((a, p) => a + p.saves, 0);

  const tabs: { key: Tab; label: string }[] = [
    { key: "daily", label: "Daily" },
    { key: "content", label: "Content" },
    {
      key: "signals",
      label: `Signals${signals.length ? ` · ${signals.length}` : ""}`,
    },
    { key: "experiments", label: "Experiments" },
    { key: "scribe", label: "Scribe ✒" },
  ];

  return (
    <div>
      <PageHeader
        title="Pollinate"
        subtitle="Instagram & TikTok — growth, content, strategy"
        action={
          <div className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-earth/40 bg-cream p-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-full px-3.5 py-1 text-sm transition-colors ${
                  tab === t.key
                    ? "bg-olive-deep text-cream"
                    : "text-ink hover:bg-sage/60"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        }
      />

      {/* Hero strip — always visible */}
      <div className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {PLATFORMS.map((platform) => {
          const latest = latestSnap(snaps, platform);
          const delta = followerDelta(snaps, platform, 7);
          const series = platformSnaps(snaps, platform)
            .slice(-30)
            .map((s) => s.followers);
          return (
            <Card key={platform}>
              <div className="mb-2 flex items-center justify-between">
                <div className="label-caps">{PLATFORM_LABEL[platform]}</div>
                {delta !== null && (
                  <Pill tone={delta >= 0 ? "sage" : "blush"}>
                    {fmtDelta(delta)} / 7d
                  </Pill>
                )}
              </div>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="font-display text-3xl font-semibold">
                    {latest ? latest.followers.toLocaleString() : "—"}
                  </div>
                  <p className="mt-1 text-sm text-ink/60">followers</p>
                </div>
                <Sparkline values={series} />
              </div>
            </Card>
          );
        })}
        <Card>
          <div className="label-caps mb-2">Hero metrics · 30d</div>
          <div className="flex items-baseline gap-6">
            <div>
              <div className="font-display text-3xl font-semibold">
                {er30 !== null ? fmtPct(er30) : "—"}
              </div>
              <p className="mt-1 text-sm text-ink/60">engagement</p>
            </div>
            <div>
              <div className="font-display text-3xl font-semibold">
                {saves30 || "—"}
              </div>
              <p className="mt-1 text-sm text-ink/60">saves</p>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-ink/45">
            Saves over followers — people keeping what you made.
          </p>
        </Card>
      </div>

      {tab === "daily" && <DailyTab />}
      {tab === "content" && <ContentTab />}
      {tab === "signals" && <SignalsTab />}
      {tab === "experiments" && <ExperimentsTab />}
      {tab === "scribe" && <ScribeTab />}
    </div>
  );
}

// ---------- Daily ----------
function DailyTab() {
  const { data, insert, update, remove, user } = useStore();
  const snaps = data.social_snapshots;

  const [platform, setPlatform] = useState<Platform>("instagram");
  const [date, setDate] = useState(todayStr());
  const [followers, setFollowers] = useState("");
  const [views, setViews] = useState("");
  const [visits, setVisits] = useState("");
  const [clicks, setClicks] = useState("");

  const existing = snaps.find(
    (s) => s.platform === platform && s.date === date
  );

  function save() {
    if (followers === "" && views === "") return;
    const payload = {
      followers: Number(followers) || 0,
      views: Number(views) || 0,
      profile_visits: Number(visits) || 0,
      link_clicks: Number(clicks) || 0,
    };
    if (existing) {
      update("social_snapshots", existing.id, payload);
    } else {
      insert("social_snapshots", {
        platform,
        date,
        ...payload,
        notes: "",
        entered_by: user,
      });
    }
    setFollowers("");
    setViews("");
    setVisits("");
    setClicks("");
  }

  const recent = [...snaps]
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) || a.platform.localeCompare(b.platform)
    )
    .slice(0, 20);

  function prevFor(s: SocialSnapshot) {
    const list = platformSnaps(snaps, s.platform);
    const i = list.findIndex((x) => x.id === s.id);
    return i > 0 ? list[i - 1] : null;
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <Card className="h-fit lg:col-span-1">
        <div className="label-caps mb-3">Today&apos;s numbers — 60 seconds</div>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {PLATFORM_LABEL[p]}
                </option>
              ))}
            </Select>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <Input
            type="number"
            placeholder="Followers"
            value={followers}
            onChange={(e) => setFollowers(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Views / reach today"
            value={views}
            onChange={(e) => setViews(e.target.value)}
          />
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Profile visits"
              value={visits}
              onChange={(e) => setVisits(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Link clicks"
              value={clicks}
              onChange={(e) => setClicks(e.target.value)}
            />
          </div>
          <Button onClick={save} className="w-full">
            {existing ? "Update this day" : "Log it"}
          </Button>
          {existing && (
            <p className="text-[11px] text-ink/45">
              A snapshot for {PLATFORM_LABEL[platform]} on {date} exists —
              saving will overwrite it.
            </p>
          )}
          <p className="text-[11px] text-ink/45">
            Numbers live in each app: Instagram → Professional dashboard ·
            TikTok → Creator tools → Analytics.
          </p>
        </div>
      </Card>

      <Card className="lg:col-span-2">
        <div className="label-caps mb-3">Recent snapshots</div>
        {recent.length === 0 ? (
          <Empty>
            No snapshots yet. Log today&apos;s numbers — the garden grows one
            day at a time.
          </Empty>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-ink/45">
                <th className="pb-2">Date</th>
                <th className="pb-2">Platform</th>
                <th className="pb-2 text-right">Followers</th>
                <th className="pb-2 text-right">Δ</th>
                <th className="pb-2 text-right">Views</th>
                <th className="pb-2 text-right">Visits</th>
                <th className="pb-2 text-right">Clicks</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-earth/15">
              {recent.map((s, idx) => {
                const prev = prevFor(s);
                const d = prev ? s.followers - prev.followers : null;
                return (
                  <tr
                    key={s.id}
                    className="gh-row-in group transition-colors hover:bg-sage/20"
                    style={{ animationDelay: `${Math.min(idx, 12) * 40}ms` }}
                  >
                    <td className="py-2">{s.date}</td>
                    <td className="py-2">
                      <Pill tone={platformPill(s.platform)}>
                        {PLATFORM_LABEL[s.platform]}
                      </Pill>
                    </td>
                    <td className="py-2 text-right">
                      {s.followers.toLocaleString()}
                    </td>
                    <td
                      className={`py-2 text-right text-xs ${
                        d === null
                          ? "text-ink/30"
                          : d >= 0
                            ? "text-olive-deep"
                            : "text-red-800"
                      }`}
                    >
                      {d === null ? "—" : fmtDelta(d)}
                    </td>
                    <td className="py-2 text-right">
                      {s.views.toLocaleString()}
                    </td>
                    <td className="py-2 text-right">{s.profile_visits}</td>
                    <td className="py-2 text-right">{s.link_clicks}</td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => remove("social_snapshots", s.id)}
                        aria-label="Remove snapshot"
                        className="rounded-full px-2 py-0.5 text-sm text-ink/30 opacity-0 transition-[opacity,color,background-color] duration-200 hover:bg-blush/40 hover:text-red-800 group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// ---------- Content ----------
function ContentTab() {
  const { data, insert, update, remove, user } = useStore();
  const posts = data.social_posts;
  const posted = posts.filter((p) => p.status === "posted");

  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [format, setFormat] = useState<PostFormat>("reel");
  const [pillar, setPillar] = useState("");
  const [date, setDate] = useState(todayStr());
  const [status, setStatus] = useState<SocialPost["status"]>("planned");

  const pillars = Array.from(
    new Set([...DEFAULT_PILLARS, ...posts.map((p) => p.pillar).filter(Boolean)])
  );

  function add() {
    if (!title.trim()) return;
    insert("social_posts", {
      platform,
      format,
      pillar: pillar.trim(),
      title: title.trim(),
      url: "",
      date,
      status,
      owner: user,
      views: 0,
      likes: 0,
      comments: 0,
      saves: 0,
      shares: 0,
      notes: "",
    });
    setTitle("");
    setPillar("");
  }

  const planned = posts
    .filter((p) => p.status === "planned")
    .sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));
  const postedList = [...posted].sort((a, b) =>
    (b.date || "").localeCompare(a.date || "")
  );

  return (
    <div>
      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Post idea / caption hook…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            className="min-w-56 flex-1"
          />
          <Select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as Platform)}
            className="w-32"
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {PLATFORM_LABEL[p]}
              </option>
            ))}
          </Select>
          <Select
            value={format}
            onChange={(e) => setFormat(e.target.value as PostFormat)}
            className="w-28"
          >
            {FORMATS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </Select>
          <Input
            list="pillars"
            placeholder="Pillar"
            value={pillar}
            onChange={(e) => setPillar(e.target.value)}
            className="w-44"
          />
          <datalist id="pillars">
            {pillars.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-40"
          />
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as SocialPost["status"])}
            className="w-28"
          >
            <option value="planned">planned</option>
            <option value="posted">posted</option>
          </Select>
          <Button onClick={add}>Add</Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div>
          <h2 className="mb-3 font-display text-2xl font-semibold">
            Calendar — planned{" "}
            <span className="text-base text-ink/40">{planned.length}</span>
          </h2>
          <div className="space-y-2">
            {planned.length === 0 ? (
              <Empty>Nothing planned. Seed next week&apos;s posts.</Empty>
            ) : (
              planned.map((p) => (
                <Card key={p.id} className="group !p-3">
                  <div className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 text-sm">{p.title}</span>
                    <Button
                      onClick={() =>
                        update("social_posts", p.id, {
                          status: "posted",
                          date: p.date || todayStr(),
                        })
                      }
                    >
                      Posted ✓
                    </Button>
                    <button
                      onClick={() => remove("social_posts", p.id)}
                      aria-label={`Remove ${p.title}`}
                      className="rounded-full px-2 py-0.5 text-sm text-ink/30 opacity-0 transition-[opacity,color,background-color] duration-200 hover:bg-blush/40 hover:text-red-800 group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Pill tone={platformPill(p.platform)}>
                      {PLATFORM_LABEL[p.platform]}
                    </Pill>
                    <Pill tone="earth">{p.format}</Pill>
                    {p.pillar && <Pill tone="sage">{p.pillar}</Pill>}
                    <span className="text-[11px] text-ink/45">
                      {p.date || "no date"} · {p.owner}
                    </span>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-3 font-display text-2xl font-semibold">
            Posted{" "}
            <span className="text-base text-ink/40">{postedList.length}</span>
          </h2>
          <div className="space-y-2">
            {postedList.length === 0 ? (
              <Empty>
                Nothing live yet. When the first post goes up, log its numbers
                here.
              </Empty>
            ) : (
              postedList.slice(0, 20).map((p) => {
                const er = engagementRate(p);
                return (
                  <Card key={p.id} className="group !p-3">
                    <div className="flex items-center gap-2">
                      <span className="min-w-0 flex-1 text-sm">
                        {p.url ? (
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noreferrer"
                            className="underline decoration-earth/50"
                          >
                            {p.title}
                          </a>
                        ) : (
                          p.title
                        )}
                      </span>
                      {er !== null && (
                        <Pill tone={er >= 0.05 ? "olive" : "earth"}>
                          {fmtPct(er)} eng.
                        </Pill>
                      )}
                      <button
                        onClick={() => remove("social_posts", p.id)}
                        aria-label={`Remove ${p.title}`}
                        className="rounded-full px-2 py-0.5 text-sm text-ink/30 opacity-0 transition-[opacity,color,background-color] duration-200 hover:bg-blush/40 hover:text-red-800 group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <Pill tone={platformPill(p.platform)}>
                        {PLATFORM_LABEL[p.platform]}
                      </Pill>
                      <Pill tone="earth">{p.format}</Pill>
                      {p.pillar && <Pill tone="sage">{p.pillar}</Pill>}
                      <span className="text-[11px] text-ink/45">{p.date}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-end gap-3">
                      <MetricInput
                        label="views"
                        value={p.views}
                        onCommit={(n) =>
                          update("social_posts", p.id, { views: n })
                        }
                      />
                      <MetricInput
                        label="likes"
                        value={p.likes}
                        onCommit={(n) =>
                          update("social_posts", p.id, { likes: n })
                        }
                      />
                      <MetricInput
                        label="comments"
                        value={p.comments}
                        onCommit={(n) =>
                          update("social_posts", p.id, { comments: n })
                        }
                      />
                      <MetricInput
                        label="saves"
                        value={p.saves}
                        onCommit={(n) =>
                          update("social_posts", p.id, { saves: n })
                        }
                      />
                      <MetricInput
                        label="shares"
                        value={p.shares}
                        onCommit={(n) =>
                          update("social_posts", p.id, { shares: n })
                        }
                      />
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Signals ----------
function SignalsTab() {
  const { data } = useStore();
  const signals = useMemo(
    () => computeSignals(data.social_snapshots, data.social_posts),
    [data.social_snapshots, data.social_posts]
  );
  const toneStyle: Record<
    string,
    { pill: "sage" | "sky" | "blush"; label: string }
  > = {
    good: { pill: "sage", label: "healthy" },
    watch: { pill: "sky", label: "worth knowing" },
    act: { pill: "blush", label: "act on this" },
  };
  return (
    <div>
      {signals.length === 0 ? (
        <Empty>
          Signals sharpen with data. Log a week of daily snapshots and a few
          posts, and this page starts telling you what to change.
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {signals.map((s, i) => (
            <Card key={i}>
              <div className="mb-2">
                <Pill tone={toneStyle[s.tone].pill}>
                  {toneStyle[s.tone].label}
                </Pill>
              </div>
              <div className="font-display text-xl font-semibold">
                {s.title}
              </div>
              <p className="mt-1 text-sm text-ink/60">{s.detail}</p>
            </Card>
          ))}
        </div>
      )}
      <DeeperRead />
      <p className="mt-6 text-[11px] text-ink/45">
        Signals are computed from your snapshots and post metrics — follower
        velocity, engagement trend (14d vs prior 14d), best format & pillar,
        posting momentum, and saves.
      </p>
    </div>
  );
}

function DeeperRead() {
  const { data } = useStore();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setResult(null);
    const snaps = data.social_snapshots
      .slice(-60)
      .map(
        (s) =>
          `${s.date} ${s.platform}: ${s.followers} followers, ${s.views} views, ${s.profile_visits} visits, ${s.link_clicks} clicks`
      )
      .join("\n");
    const posts = data.social_posts
      .filter((p) => p.status === "posted")
      .slice(-40)
      .map(
        (p) =>
          `${p.date} ${p.platform}/${p.format} [${p.pillar}] "${p.title}": ${p.views} views, ${p.likes} likes, ${p.comments} comments, ${p.saves} saves, ${p.shares} shares`
      )
      .join("\n");
    const signals = computeSignals(data.social_snapshots, data.social_posts)
      .map((s) => `[${s.tone}] ${s.title}`)
      .join("\n");
    const res = await askAI(
      "signals",
      `SNAPSHOTS:\n${snaps || "(none)"}\n\nPOSTED:\n${posts || "(none)"}\n\nRULE-BASED SIGNALS:\n${signals || "(none)"}`
    );
    setLoading(false);
    setResult(
      res.ok
        ? (res.text ?? "")
        : res.reason === "no-key"
          ? NO_KEY_MESSAGE
          : "The Scribe lost the thread — try again in a moment."
    );
  };

  return (
    <Card className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="label-caps">Deeper read</div>
          <p className="mt-1 text-sm text-ink/60">
            Let the Scribe read the numbers and find the story behind the
            signals.
          </p>
        </div>
        <Button onClick={run} disabled={loading}>
          {loading ? "Reading…" : "Read the leaves"}
        </Button>
      </div>
      {result && (
        <p className="mt-4 whitespace-pre-wrap border-t border-earth/20 pt-4 text-sm leading-relaxed text-ink/80">
          {result}
        </p>
      )}
    </Card>
  );
}

// ---------- Scribe ----------
function ScribeTab() {
  const { data } = useStore();
  const [idea, setIdea] = useState("");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [format, setFormat] = useState<PostFormat>("reel");
  const [pillar, setPillar] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const month = [...data.months].sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  )[0];

  const pillars = Array.from(
    new Set([
      ...DEFAULT_PILLARS,
      ...data.social_posts.map((p) => p.pillar).filter(Boolean),
    ])
  );

  const run = async () => {
    if (!idea.trim()) return;
    setLoading(true);
    setResult(null);
    setCopied(false);
    const context = [
      month ? `Current month: ${month.name} — theme "${month.theme}"` : "",
      month?.song ? `Song of the month: ${month.song}` : "",
      `Platform: ${PLATFORM_LABEL[platform]}, format: ${format}`,
      pillar ? `Content pillar: ${pillar}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    const res = await askAI("scribe", `${context}\n\nIDEA:\n${idea.trim()}`);
    setLoading(false);
    setResult(
      res.ok
        ? (res.text ?? "")
        : res.reason === "no-key"
          ? NO_KEY_MESSAGE
          : "The Scribe lost the thread — try again in a moment."
    );
  };

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <div className="label-caps mb-3">Ask the Scribe</div>
        <div className="space-y-3">
          <TextArea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="What's the post about? e.g. closeup of Hank pressing marigolds for the October box, golden hour light"
            rows={4}
          />
          <div className="flex flex-wrap gap-2">
            <Select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {PLATFORM_LABEL[p]}
                </option>
              ))}
            </Select>
            <Select
              value={format}
              onChange={(e) => setFormat(e.target.value as PostFormat)}
            >
              {FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </Select>
          </div>
          <Input
            value={pillar}
            onChange={(e) => setPillar(e.target.value)}
            placeholder="pillar (optional)"
            list="scribe-pillars"
          />
          <datalist id="scribe-pillars">
            {pillars.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
          <Button onClick={run} disabled={loading || !idea.trim()}>
            {loading ? "Writing…" : "Draft three options"}
          </Button>
          <p className="text-[11px] text-ink/45">
            The Scribe knows the month&apos;s theme, the song, and the 2N voice.
            It drafts — you decide.
          </p>
        </div>
      </Card>
      <Card className="lg:col-span-3">
        <div className="mb-3 flex items-center justify-between">
          <div className="label-caps">Drafts</div>
          {result && !loading && (
            <button
              onClick={copy}
              className="rounded-full border border-earth/40 px-3 py-1 text-xs hover:bg-sage/60"
            >
              {copied ? "Copied ✓" : "Copy all"}
            </button>
          )}
        </div>
        {loading ? (
          <Empty>The Scribe is dipping the pen…</Empty>
        ) : result ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink/85">
            {result}
          </p>
        ) : (
          <Empty>
            Give the Scribe an idea and it returns three captions in the 2N
            voice — one poetic, one conversational, one minimal.
          </Empty>
        )}
      </Card>
    </div>
  );
}

// ---------- Experiments ----------
function Verdict({ e }: { e: Experiment }) {
  const { update } = useStore();
  const [result, setResult] = useState(e.result);
  return (
    <div className="mt-3 space-y-2">
      <TextArea
        placeholder="What happened?"
        value={result}
        onChange={(ev) => setResult(ev.target.value)}
        onBlur={() => {
          if (result !== e.result) update("experiments", e.id, { result });
        }}
      />
      <div className="flex gap-2">
        <Button
          onClick={() => update("experiments", e.id, { status: "proven", result })}
        >
          Proven
        </Button>
        <Button
          variant="ghost"
          onClick={() =>
            update("experiments", e.id, { status: "disproven", result })
          }
        >
          Disproven
        </Button>
        <Button
          variant="ghost"
          onClick={() =>
            update("experiments", e.id, { status: "abandoned", result })
          }
        >
          Abandon
        </Button>
      </div>
    </div>
  );
}

function ExperimentsTab() {
  const { data, insert, update, remove, user } = useStore();
  const [title, setTitle] = useState("");
  const [hypothesis, setHypothesis] = useState("");

  function add() {
    if (!title.trim()) return;
    insert("experiments", {
      title: title.trim(),
      hypothesis: hypothesis.trim(),
      status: "running",
      result: "",
      created_by: user,
    });
    setTitle("");
    setHypothesis("");
  }

  const running = data.experiments.filter((e) => e.status === "running");
  const decided = data.experiments.filter((e) => e.status !== "running");

  return (
    <div>
      <Card className="mb-6 space-y-3">
        <Input
          placeholder="Experiment — e.g. Post reels at golden hour for two weeks"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            placeholder="Hypothesis — what do you expect, and why?"
            value={hypothesis}
            onChange={(e) => setHypothesis(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
          <Button onClick={add}>Start</Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div>
          <h2 className="mb-3 font-display text-2xl font-semibold">
            Running{" "}
            <span className="text-base text-ink/40">{running.length}</span>
          </h2>
          <div className="space-y-3">
            {running.length === 0 ? (
              <Empty>No experiments running. Strategy is a verb.</Empty>
            ) : (
              running.map((e) => (
                <Card key={e.id} className="group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-display text-xl font-semibold">
                      {e.title}
                    </div>
                    <button
                      onClick={() => remove("experiments", e.id)}
                      aria-label={`Remove ${e.title}`}
                      className="rounded-full px-2 py-0.5 text-sm text-ink/30 opacity-0 transition-[opacity,color,background-color] duration-200 hover:bg-blush/40 hover:text-red-800 group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                  {e.hypothesis && (
                    <p className="mt-1 text-sm italic text-ink/60">
                      “{e.hypothesis}”
                    </p>
                  )}
                  <p className="mt-1 text-[11px] text-ink/45">
                    started by {e.created_by}
                  </p>
                  <Verdict e={e} />
                </Card>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-3 font-display text-2xl font-semibold">
            Decided{" "}
            <span className="text-base text-ink/40">{decided.length}</span>
          </h2>
          <div className="space-y-3">
            {decided.length === 0 ? (
              <Empty>Verdicts will gather here — your playbook.</Empty>
            ) : (
              decided.map((e) => (
                <Card key={e.id}>
                  <div className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 font-display text-lg font-semibold">
                      {e.title}
                    </span>
                    <Pill
                      tone={
                        e.status === "proven"
                          ? "olive"
                          : e.status === "disproven"
                            ? "blush"
                            : "earth"
                      }
                    >
                      {e.status}
                    </Pill>
                  </div>
                  {e.result && (
                    <p className="mt-2 text-sm text-ink/70">{e.result}</p>
                  )}
                  <button
                    className="mt-2 text-[11px] text-ink/40 underline"
                    onClick={() =>
                      update("experiments", e.id, { status: "running" })
                    }
                  >
                    reopen
                  </button>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
