"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { isPublicPath } from "@/lib/public";

// Fixed drift lanes; the season decides what travels along them and which way.
const LANES = [
  { left: "8%", size: "1.4rem", dur: "11s", delay: "0s", o: 0.4 },
  { left: "22%", size: "1rem", dur: "14s", delay: "2.5s", o: 0.35 },
  { left: "36%", size: "0.8rem", dur: "10s", delay: "5s", o: 0.3 },
  { left: "58%", size: "1.2rem", dur: "13s", delay: "1.2s", o: 0.4 },
  { left: "72%", size: "1.5rem", dur: "12s", delay: "3.8s", o: 0.35 },
  { left: "86%", size: "1rem", dur: "15s", delay: "0.6s", o: 0.3 },
  { left: "48%", size: "0.9rem", dur: "16s", delay: "6.5s", o: 0.25 },
  { left: "92%", size: "0.8rem", dur: "11s", delay: "8s", o: 0.3 },
];

// Brand palette
const OLIVE = "#A7B79D";
const OLIVE_DEEP = "#6b7a5e";
const EARTH = "#BBAA92";
const BLUSH = "#E6C6C3";
const SKY = "#CFE2EE";

type Season = "spring" | "summer" | "autumn" | "winter";

const SEASONS: Record<
  Season,
  { glyphs: string[]; colors: string[]; fall: boolean }
> = {
  // petals rise like things growing
  spring: { glyphs: ["✿", "❀", "⚘", "❁"], colors: [OLIVE, BLUSH], fall: false },
  summer: {
    glyphs: ["✺", "❁", "✾", "❀"],
    colors: [OLIVE_DEEP, BLUSH],
    fall: false,
  },
  // leaves and snow fall like the season turning
  autumn: {
    glyphs: ["❧", "☙", "✾", "❧"],
    colors: [EARTH, OLIVE_DEEP],
    fall: true,
  },
  winter: { glyphs: ["❄", "❅", "✦", "❄"], colors: [SKY, EARTH], fall: true },
};

function currentSeason(): Season {
  const m = new Date().getMonth(); // 0 = Jan
  if (m >= 2 && m <= 4) return "spring";
  if (m >= 5 && m <= 7) return "summer";
  if (m >= 8 && m <= 10) return "autumn";
  return "winter";
}

export default function Welcome() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<"idle" | "show" | "leaving" | "done">(
    "idle"
  );
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const leave = () => {
    setPhase((p) => (p === "show" ? "leaving" : p));
    timers.current.push(setTimeout(() => setPhase("done"), 2650));
  };

  useEffect(() => {
    // The intro greets every full page load; in-app navigation never replays
    // it (this layout component only mounts once per load).
    // ?intro holds the scene until tapped — for showing it off.
    const forced = new URLSearchParams(window.location.search).has("intro");
    setPhase("show");
    if (!forced) {
      const t = setTimeout(() => {
        setPhase("leaving");
        timers.current.push(setTimeout(() => setPhase("done"), 2650));
      }, 5600);
      timers.current.push(t);
    }
    return () => timers.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === "idle" || phase === "done") return null;
  if (isPublicPath(pathname)) return null;

  return (
    <div
      className={`intro-overlay ${phase === "leaving" ? "intro-leaving" : ""}`}
      onClick={leave}
      role="button"
      aria-label="Enter The Greenhouse"
    >
      <div className="intro-grain" />
      {LANES.map((p, i) => {
        const season = SEASONS[currentSeason()];
        return (
          <span
            key={i}
            className={`intro-petal ${season.fall ? "intro-petal-fall" : ""}`}
            style={
              {
                left: p.left,
                fontSize: p.size,
                color: season.colors[i % season.colors.length],
                "--petal-dur": p.dur,
                "--petal-delay": p.delay,
                "--petal-opacity": p.o,
              } as React.CSSProperties
            }
          >
            {season.glyphs[i % season.glyphs.length]}
          </span>
        );
      })}

      <div className="relative px-6 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="2N botanical monogram"
          className="intro-logo mx-auto h-28 w-28 object-contain sm:h-36 sm:w-36"
        />
        <h1 className="intro-line-1 mt-6 font-display text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
          Welcome to The Greenhouse
        </h1>
        <div className="intro-rule mx-auto mt-5 h-px w-40 bg-earth/60 sm:w-56" />
        <p className="intro-line-2 mt-5 font-display text-lg italic text-ink/75 sm:text-2xl">
          where people connect with their second nature
        </p>
        <p className="intro-line-3 label-caps mt-6">
          Plants · Spaces · People
        </p>
        <p className="intro-hint mt-10 text-[11px] tracking-widest text-ink/35">
          tap anywhere to enter
        </p>
      </div>
    </div>
  );
}
