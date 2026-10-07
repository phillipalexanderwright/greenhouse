// Tiny pub/sub for garden toasts — no deps, no context.
export interface Toast {
  id: number;
  msg: string;
  glyph: string;
}

type Listener = (t: Toast) => void;
let listeners: Listener[] = [];
let nextId = 1;

export function toast(msg: string, glyph = "❧") {
  const t = { id: nextId++, msg, glyph };
  listeners.forEach((l) => l(t));
}

export function onToast(l: Listener) {
  listeners.push(l);
  return () => {
    listeners = listeners.filter((x) => x !== l);
  };
}
