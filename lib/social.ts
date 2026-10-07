import { Platform, SocialPost, SocialSnapshot } from "./types";

export const PLATFORMS: Platform[] = ["instagram", "tiktok"];

export const PLATFORM_LABEL: Record<Platform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
};

export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function daysAgoStr(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Snapshots for a platform sorted oldest → newest by date. */
export function platformSnaps(snaps: SocialSnapshot[], platform: Platform) {
  return snaps
    .filter((s) => s.platform === platform && s.date)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function latestSnap(snaps: SocialSnapshot[], platform: Platform) {
  const list = platformSnaps(snaps, platform);
  return list.length ? list[list.length - 1] : null;
}

/** Follower change vs the closest snapshot ≥`days` days before the latest. */
export function followerDelta(
  snaps: SocialSnapshot[],
  platform: Platform,
  days: number
): number | null {
  const list = platformSnaps(snaps, platform);
  if (list.length < 2) return null;
  const latest = list[list.length - 1];
  const cutoff = (() => {
    const d = new Date(latest.date + "T00:00:00");
    d.setDate(d.getDate() - days);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();
  // Latest snapshot at or before the cutoff; else the oldest we have.
  const base =
    [...list].reverse().find((s) => s.date <= cutoff) ?? list[0];
  if (base.id === latest.id) return null;
  return latest.followers - base.followers;
}

/** Engagement rate of a single posted post: interactions / views. */
export function engagementRate(p: SocialPost): number | null {
  if (p.status !== "posted" || p.views <= 0) return null;
  return (p.likes + p.comments + p.saves + p.shares) / p.views;
}

/** Average ER across posts that have views logged. */
export function avgEngagement(posts: SocialPost[]): number | null {
  const rates = posts
    .map(engagementRate)
    .filter((r): r is number => r !== null);
  if (!rates.length) return null;
  return rates.reduce((a, b) => a + b, 0) / rates.length;
}

export function fmtPct(r: number) {
  return `${(r * 100).toFixed(1)}%`;
}

export function fmtDelta(n: number) {
  return n > 0 ? `+${n}` : `${n}`;
}

/** Best group (format/pillar) by avg ER among groups with ≥2 measured posts. */
export function bestGroup(
  posts: SocialPost[],
  keyOf: (p: SocialPost) => string
): { key: string; rate: number; count: number } | null {
  const groups = new Map<string, SocialPost[]>();
  for (const p of posts) {
    const k = keyOf(p);
    if (!k) continue;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(p);
  }
  let best: { key: string; rate: number; count: number } | null = null;
  for (const [key, group] of groups) {
    const measured = group.filter((p) => engagementRate(p) !== null);
    if (measured.length < 2) continue;
    const rate = avgEngagement(measured)!;
    if (!best || rate > best.rate) best = { key, rate, count: measured.length };
  }
  return best;
}

export interface Signal {
  tone: "good" | "watch" | "act";
  title: string;
  detail: string;
}

/** Plain-language strategy signals from snapshots + posts. */
export function computeSignals(
  snaps: SocialSnapshot[],
  posts: SocialPost[]
): Signal[] {
  const out: Signal[] = [];
  const posted = posts.filter((p) => p.status === "posted" && p.date);

  // Follower velocity per platform
  for (const platform of PLATFORMS) {
    const delta = followerDelta(snaps, platform, 7);
    if (delta === null) continue;
    if (delta < 0) {
      out.push({
        tone: "act",
        title: `${PLATFORM_LABEL[platform]} followers slipping (${fmtDelta(delta)} this week)`,
        detail:
          "Look at the last few posts — did the voice drift? Steady, true-to-brand beats clever.",
      });
    } else if (delta > 0) {
      out.push({
        tone: "good",
        title: `${PLATFORM_LABEL[platform]} +${delta} followers this week`,
        detail: "Whatever you posted this week, note it in Experiments and do it again.",
      });
    }
  }

  // Posting momentum
  if (posted.length) {
    const lastDate = posted
      .map((p) => p.date)
      .sort()
      .at(-1)!;
    const daysSince = Math.floor(
      (Date.now() - new Date(lastDate + "T00:00:00").getTime()) / 86400000
    );
    if (daysSince >= 4) {
      out.push({
        tone: "act",
        title: `No post in ${daysSince} days`,
        detail:
          "Momentum fades fast on both platforms. Even a story or a 10-second clip of the studio counts.",
      });
    } else if (daysSince >= 0) {
      out.push({
        tone: "good",
        title: "Posting cadence is alive",
        detail: `Last post ${daysSince === 0 ? "today" : `${daysSince} day${daysSince === 1 ? "" : "s"} ago`}. Keep the rhythm — consistency compounds.`,
      });
    }
  }

  // Engagement trend: last 14 days vs the 14 before
  const recent = posted.filter((p) => p.date >= daysAgoStr(14));
  const prior = posted.filter(
    (p) => p.date < daysAgoStr(14) && p.date >= daysAgoStr(28)
  );
  const recentER = avgEngagement(recent);
  const priorER = avgEngagement(prior);
  if (recentER !== null && priorER !== null && priorER > 0) {
    const change = (recentER - priorER) / priorER;
    if (change <= -0.2) {
      out.push({
        tone: "act",
        title: `Engagement down ${Math.abs(Math.round(change * 100))}% vs the prior two weeks`,
        detail:
          "Revisit what was different a month ago — format, pillar, or posting time — and test it in Experiments.",
      });
    } else if (change >= 0.2) {
      out.push({
        tone: "good",
        title: `Engagement up ${Math.round(change * 100)}% vs the prior two weeks`,
        detail: "The current mix is working. Don't change two things at once.",
      });
    }
  }

  // Best format / pillar
  const bf = bestGroup(posted, (p) => p.format);
  if (bf) {
    out.push({
      tone: "watch",
      title: `Best format: ${bf.key} (${fmtPct(bf.rate)} avg engagement, ${bf.count} posts)`,
      detail: "Lean the weekly mix toward it — but keep one wildcard slot for testing.",
    });
  }
  const bp = bestGroup(posted, (p) => p.pillar);
  if (bp) {
    out.push({
      tone: "watch",
      title: `Strongest pillar: ${bp.key} (${fmtPct(bp.rate)} avg engagement)`,
      detail: "This is what your audience keeps. Make it a fixture of every month's plan.",
    });
  }

  // Saves as the hero metric
  const saved = posted.filter((p) => engagementRate(p) !== null);
  if (saved.length >= 3) {
    const topSaver = [...saved].sort((a, b) => b.saves - a.saves)[0];
    if (topSaver.saves > 0) {
      out.push({
        tone: "watch",
        title: `Most-saved: "${topSaver.title}" (${topSaver.saves} saves)`,
        detail:
          "Saves mean someone wants to return to it — the truest 2N metric. Study why this one earned them.",
      });
    }
  }

  return out;
}
