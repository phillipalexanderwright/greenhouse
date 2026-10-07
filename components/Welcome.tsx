"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const SEEN_KEY = "greenhouse-intro-seen";

const PETALS = [
  { glyph: "✿", left: "8%", size: "1.4rem", dur: "11s", delay: "0s", o: 0.4 },
  { glyph: "❀", left: "22%", size: "1rem", dur: "14s", delay: "2.5s", o: 0.35 },
  { glyph: "✺", left: "36%", size: "0.8rem", dur: "10s", delay: "5s", o: 0.3 },
  { glyph: "❧", left: "58%", size: "1.2rem", dur: "13s", delay: "1.2s", o: 0.4 },
  { glyph: "⚘", left: "72%", size: "1.5rem", dur: "12s", delay: "3.8s", o: 0.35 },
  { glyph: "☙", left: "86%", size: "1rem", dur: "15s", delay: "0.6s", o: 0.3 },
  { glyph: "✿", left: "48%", size: "0.9rem", dur: "16s", delay: "6.5s", o: 0.25 },
  { glyph: "❀", left: "92%", size: "0.8rem", dur: "11s", delay: "8s", o: 0.3 },
];

export default function Welcome() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<"idle" | "show" | "leaving" | "done">(
    "idle"
  );
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const leave = () => {
    setPhase((p) => (p === "show" ? "leaving" : p));
    timers.current.push(setTimeout(() => setPhase("done"), 1100));
  };

  useEffect(() => {
    // ?intro forces a replay and holds until tapped — for showing it off.
    const forced = new URLSearchParams(window.location.search).has("intro");
    if (!forced && sessionStorage.getItem(SEEN_KEY)) {
      setPhase("done");
      return;
    }
    sessionStorage.setItem(SEEN_KEY, "1");
    setPhase("show");
    if (!forced) {
      const t = setTimeout(() => {
        setPhase("leaving");
        timers.current.push(setTimeout(() => setPhase("done"), 1100));
      }, 5600);
      timers.current.push(t);
    }
    return () => timers.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === "idle" || phase === "done") return null;
  if (pathname.startsWith("/rsvp")) return null;

  return (
    <div
      className={`intro-overlay ${phase === "leaving" ? "intro-leaving" : ""}`}
      onClick={leave}
      role="button"
      aria-label="Enter The Greenhouse"
    >
      <div className="intro-grain" />
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="intro-petal"
          style={
            {
              left: p.left,
              fontSize: p.size,
              "--petal-dur": p.dur,
              "--petal-delay": p.delay,
              "--petal-opacity": p.o,
            } as React.CSSProperties
          }
        >
          {p.glyph}
        </span>
      ))}

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
