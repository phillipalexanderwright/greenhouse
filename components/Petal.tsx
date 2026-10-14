"use client";

import type { CSSProperties, ReactNode } from "react";

// Three looks for the drifting petals, previewable with ?petals= in the URL:
//   glyphs    — the original botanical Unicode characters
//   pressed   — hand-drawn petal, leaf, and bloom shapes (inline SVG)
//   ornaments — the printer's cuts from the design system (tinted via CSS mask)
export type PetalStyle = "glyphs" | "pressed" | "ornaments";

export function petalStyleFromSearch(search: string): PetalStyle {
  const v = new URLSearchParams(search).get("petals");
  return v === "pressed" || v === "ornaments" || v === "glyphs"
    ? v
    : "glyphs";
}

export type Lane = {
  left: string;
  size: string;
  dur: string;
  delay: string;
  o: number;
};

const ORNAMENTS = [
  "sprig",
  "cameo-tulip",
  "seal-blooms",
  "star",
  "flourish",
  "cameo-sprig",
  "acanthus",
  "seal-moth",
];

// Hand-drawn shapes on a 24×24 grid. Soft yellow stamens and cream veins
// come from the lily board palette.
function pressedShape(i: number, color: string): ReactNode {
  switch (i % 4) {
    case 0: // single pressed petal
      return (
        <path
          fill={color}
          d="M12 2.2C15.9 5.7 18 10.4 16.6 15c-.8 2.8-2.6 5.2-4.6 6.8-2-1.6-3.8-4-4.6-6.8C6 10.4 8.1 5.7 12 2.2Z"
        />
      );
    case 1: // leaf with a cream vein
      return (
        <g>
          <path
            fill={color}
            d="M4.5 19.5C4.5 10.5 10.5 4.5 19.5 4.5c0 9-6 15-15 15Z"
          />
          <path
            d="M6.5 17.5C9.5 14.5 13 11 17 7.5"
            stroke="#EFE6D5"
            strokeWidth="0.9"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      );
    case 2: // five-petal bloom with a stamen dot
      return (
        <g>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse
              key={a}
              cx="12"
              cy="6.8"
              rx="2.7"
              ry="4.8"
              fill={color}
              transform={`rotate(${a} 12 12)`}
            />
          ))}
          <circle cx="12" cy="12" r="1.9" fill="#E7C36B" />
        </g>
      );
    default: // curved falling petal
      return (
        <path
          fill={color}
          d="M5.5 16.5C5.5 9.5 10.8 4.2 18.2 3.2c1.1 7.3-2.3 13.4-8.6 16.4-1.8.9-4.1-.9-4.1-3.1Z"
        />
      );
  }
}

export function Petal({
  lane,
  index,
  color,
  glyph,
  variant,
  fall = false,
}: {
  lane: Lane;
  index: number;
  color: string;
  glyph: string;
  variant: PetalStyle;
  fall?: boolean;
}) {
  const cls = `intro-petal ${fall ? "intro-petal-fall" : ""}`;
  const base = {
    left: lane.left,
    "--petal-dur": lane.dur,
    "--petal-delay": lane.delay,
    "--petal-opacity": lane.o,
  } as CSSProperties;

  if (variant === "glyphs") {
    return (
      <span className={cls} style={{ ...base, fontSize: lane.size, color }}>
        {glyph}
      </span>
    );
  }

  const dim = `calc(${lane.size} * 1.5)`;
  const rotate = `rotate(${(index * 47) % 360}deg)`;

  if (variant === "ornaments") {
    const url = `url(/ornaments/${ORNAMENTS[index % ORNAMENTS.length]}.svg)`;
    return (
      <span className={cls} style={{ ...base, width: dim, height: dim }}>
        <span
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            backgroundColor: color,
            transform: rotate,
            WebkitMaskImage: url,
            maskImage: url,
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
          }}
        />
      </span>
    );
  }

  return (
    <span className={cls} style={{ ...base, width: dim, height: dim }}>
      <svg
        viewBox="0 0 24 24"
        width="100%"
        height="100%"
        style={{ transform: rotate, display: "block" }}
        aria-hidden
      >
        {pressedShape(index, color)}
      </svg>
    </span>
  );
}
