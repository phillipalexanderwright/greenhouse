"use client";

// A small vine in the sidebar that grows as the week's to-dos get done.
// Resets every Monday — progress as growth, not a percent bar.
import { useStore } from "@/lib/store";

function mondayISO() {
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

const LEAVES = [
  { x: 23, y: 86, r: -40 },
  { x: 35, y: 72, r: 35 },
  { x: 22, y: 56, r: -35 },
  { x: 36, y: 42, r: 30 },
  { x: 24, y: 28, r: -30 },
];

export default function Vine() {
  const { data } = useStore();
  const monday = mondayISO();
  const count = data.todos.filter(
    (t) => t.done && t.done_at && t.done_at >= monday
  ).length;
  const growth = Math.max(0.07, Math.min(count, 6) / 6);

  return (
    <div
      className="text-center"
      title="The vine grows as this week's to-dos get done. It resets each Monday."
    >
      <svg viewBox="0 0 60 104" className="mx-auto h-20 w-12" aria-hidden>
        <path
          d="M30 100 C 29 86, 33 76, 30 62 C 27 48, 33 36, 30 22 C 29 16, 30 10, 30 6"
          fill="none"
          stroke="var(--color-olive-deep)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="120"
          strokeDashoffset={120 - 120 * growth}
          style={{
            transition: "stroke-dashoffset 1.2s cubic-bezier(0.25,0.6,0.3,1)",
          }}
        />
        {LEAVES.map((l, i) => (
          <text
            key={i}
            x={l.x}
            y={l.y}
            fontSize="10"
            fill="var(--color-olive)"
            transform={`rotate(${l.r} ${l.x} ${l.y})`}
            style={{
              opacity: count > i ? 0.9 : 0,
              transition: `opacity 0.6s ease ${0.2 + i * 0.15}s`,
            }}
          >
            ❧
          </text>
        ))}
        <text
          x="30"
          y="9"
          fontSize="12"
          textAnchor="middle"
          fill="var(--color-blush)"
          style={{
            opacity: count >= 6 ? 1 : 0,
            transition: "opacity 0.8s ease 1s",
          }}
        >
          ❀
        </text>
      </svg>
      <div className="label-caps mt-1">The vine</div>
      <p className="mt-0.5 text-[11px] text-ink/45">
        {count === 0
          ? "nothing tended yet this week"
          : `${count} tended this week${count >= 6 ? " — in bloom ❀" : ""}`}
      </p>
    </div>
  );
}
