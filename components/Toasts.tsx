"use client";

import { useEffect, useState } from "react";
import { onToast, Toast } from "@/lib/toast";

type Item = Toast & { leaving?: boolean };

export default function Toasts() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    return onToast((t) => {
      setItems((prev) => [...prev.slice(-2), t]);
      setTimeout(
        () =>
          setItems((prev) =>
            prev.map((x) => (x.id === t.id ? { ...x, leaving: true } : x))
          ),
        4200
      );
      setTimeout(
        () => setItems((prev) => prev.filter((x) => x.id !== t.id)),
        4800
      );
    });
  }, []);

  if (items.length === 0) return null;
  return (
    <div className="pointer-events-none fixed bottom-5 right-4 z-[90] flex max-w-[92vw] flex-col items-end gap-2 sm:right-6">
      {items.map((t) => (
        <div
          key={t.id}
          className={`gh-toast flex items-center gap-2.5 rounded-full border border-earth/40 bg-cream/95 py-2 pl-3.5 pr-4 text-sm text-ink shadow-[0_6px_24px_rgba(65,73,59,0.14)] backdrop-blur ${
            t.leaving ? "gh-toast-leaving" : ""
          }`}
        >
          <span className="shrink-0 text-olive-deep">{t.glyph}</span>
          <span className="truncate">{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
