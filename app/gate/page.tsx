"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GatePage() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [state, setState] = useState<"idle" | "checking" | "wrong">("idle");

  const unlock = async () => {
    if (!key.trim()) return;
    setState("checking");
    const res = await fetch("/api/gate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: key.trim() }),
    });
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setState("wrong");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="arch border border-earth/40 bg-white/70 px-7 pb-10 pt-12 text-center shadow-sm sm:px-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="2N botanical monogram"
            className="mx-auto h-20 w-20 object-contain"
          />
          <p className="label-caps mt-4">The studio door</p>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">
            Who goes there?
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink/70">
            The Greenhouse is where we tend the work. If you have the
            passphrase, come in.
          </p>
          <div className="mt-7 space-y-3 text-left">
            <input
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                if (state === "wrong") setState("idle");
              }}
              onKeyDown={(e) => e.key === "Enter" && unlock()}
              type="password"
              placeholder="passphrase"
              autoFocus
              className="w-full rounded-lg border border-earth/40 bg-white/80 px-3 py-2 text-sm outline-none placeholder:text-ink/35 focus:border-olive-deep"
            />
            <button
              onClick={unlock}
              disabled={state === "checking" || !key.trim()}
              className="gh-press w-full rounded-full bg-olive-deep py-2 text-sm text-cream transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-50"
            >
              {state === "checking" ? "Opening…" : "Open the door"}
            </button>
            {state === "wrong" && (
              <p className="text-center text-xs text-ink/60">
                That key doesn&rsquo;t fit this door.
              </p>
            )}
          </div>
        </div>
        <p className="mt-4 text-center text-[10px] tracking-widest text-ink/35">
          <a href="/welcome" className="hover:text-olive-deep">
            ← BACK TO THE MEADOW
          </a>
        </p>
      </div>
    </div>
  );
}
