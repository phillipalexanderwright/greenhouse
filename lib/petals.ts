// A small petal celebration at (x, y) — for finished to-dos, harvests, yeses.
const GLYPHS = ["❀", "✿", "❁", "✾"];
const COLORS = ["#A7B79D", "#E6C6C3", "#6b7a5e", "#BBAA92"];

export function petalBurst(x: number, y: number) {
  if (typeof document === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const host = document.createElement("div");
  host.className = "gh-petal-burst";
  host.style.left = `${x}px`;
  host.style.top = `${y}px`;
  const count = 8;
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.6;
    const dist = 28 + Math.random() * 26;
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
