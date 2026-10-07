// Petal celebrations — for finished to-dos, garden yeses, and harvests.
const GLYPHS = ["❀", "✿", "❁", "✾"];
const COLORS = ["#A7B79D", "#E6C6C3", "#6b7a5e", "#BBAA92"];

function reduced() {
  return (
    typeof window === "undefined" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function petalBurst(x: number, y: number, count = 8, reach = 28) {
  if (reduced()) return;
  const host = document.createElement("div");
  host.className = "gh-petal-burst";
  host.style.left = `${x}px`;
  host.style.top = `${y}px`;
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.6;
    const dist = reach + Math.random() * reach;
    s.textContent = GLYPHS[i % GLYPHS.length];
    s.style.color = COLORS[i % COLORS.length];
    s.style.fontSize = `${10 + Math.random() * 8}px`;
    s.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
    s.style.setProperty("--dy", `${Math.sin(angle) * dist - 12}px`);
    s.style.setProperty("--rot", `${Math.random() * 120 - 60}deg`);
    host.appendChild(s);
  }
  document.body.appendChild(host);
  setTimeout(() => host.remove(), 900);
}

// The big one — a project reaches harvest.
export function harvestBloom() {
  if (reduced()) return;
  const x = window.innerWidth / 2;
  const y = window.innerHeight * 0.38;
  petalBurst(x, y, 16, 70);
  const el = document.createElement("div");
  el.className = "gh-harvest";
  const glyph = document.createElement("span");
  glyph.className = "gh-harvest-glyph";
  glyph.textContent = "⚘";
  const word = document.createElement("span");
  word.className = "gh-harvest-word";
  word.textContent = "Harvested";
  el.append(glyph, word);
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1600);
}
