"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Dinner, Guest } from "@/lib/types";

function prettyDate(d: string) {
  if (!d) return "date to follow";
  const dt = new Date(d + "T00:00:00");
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function RsvpPage() {
  const { id } = useParams<{ id: string }>();
  const [dinner, setDinner] = useState<Dinner | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [state, setState] = useState<"loading" | "form" | "done" | "missing">(
    "loading"
  );
  const [name, setName] = useState("");
  const [rsvp, setRsvp] = useState<"yes" | "no">("yes");
  const [plusOne, setPlusOne] = useState("");
  const [saving, setSaving] = useState(false);
  const [answered, setAnswered] = useState<"yes" | "no">("yes");

  useEffect(() => {
    if (!supabase || !id) {
      setState("missing");
      return;
    }
    (async () => {
      const [{ data: d }, { data: g }] = await Promise.all([
        supabase!.from("dinners").select("*").eq("id", id).maybeSingle(),
        supabase!.from("guests").select("*").eq("dinner_id", id),
      ]);
      if (!d) {
        setState("missing");
        return;
      }
      setDinner(d as Dinner);
      setGuests((g ?? []) as Guest[]);
      setState("form");
    })();
  }, [id]);

  const submit = async () => {
    if (!supabase || !dinner || !name.trim()) return;
    setSaving(true);
    const clean = name.trim();
    const existing = guests.find(
      (g) => g.name.trim().toLowerCase() === clean.toLowerCase()
    );
    if (existing) {
      await supabase
        .from("guests")
        .update({ rsvp, plus_one: rsvp === "yes" ? plusOne.trim() : "" })
        .eq("id", existing.id);
    } else {
      await supabase.from("guests").insert({
        dinner_id: dinner.id,
        name: clean,
        plus_one: rsvp === "yes" ? plusOne.trim() : "",
        rsvp,
        notes: "RSVP’d via garden gate",
      });
    }
    setAnswered(rsvp);
    setSaving(false);
    setState("done");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-10">
      <div className="w-full max-w-md">
        <div className="arch border border-earth/40 bg-white/70 px-7 pb-10 pt-12 text-center shadow-sm sm:px-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="2N botanical monogram"
            className="mx-auto h-20 w-20 object-contain"
          />
          <div className="label-caps mt-4">The Garden · a 2nd Nature dinner</div>

          {state === "loading" && (
            <p className="mt-8 text-sm text-ink/50">opening the gate…</p>
          )}

          {state === "missing" && (
            <p className="mt-8 font-display text-xl italic text-ink/70">
              This invitation seems to have drifted off with the wind. Check
              the link with your host.
            </p>
          )}

          {state === "form" && dinner && (
            <>
              <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight">
                {dinner.title}
              </h1>
              <p className="mt-2 font-display text-lg italic text-ink/75">
                {prettyDate(dinner.date)}
                {dinner.venue ? ` · ${dinner.venue}` : ""}
              </p>
              <div className="mx-auto mt-5 h-px w-24 bg-earth/50" />
              <p className="mt-5 text-sm leading-relaxed text-ink/70">
                Ten guests, each with a plus-one. Dinner, flowers, and good
                company — bring your second nature.
              </p>

              <div className="mt-7 space-y-3 text-left">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="your name"
                  className="w-full rounded-lg border border-earth/40 bg-white/80 px-3 py-2 text-sm outline-none placeholder:text-ink/35 focus:border-olive-deep"
                />
                <div className="flex rounded-full border border-earth/40 bg-cream p-1">
                  {(["yes", "no"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRsvp(r)}
                      className={`flex-1 rounded-full py-1.5 text-sm transition-colors ${
                        rsvp === r
                          ? "bg-olive-deep text-cream"
                          : "hover:bg-sage/60"
                      }`}
                    >
                      {r === "yes" ? "Joyfully yes ❀" : "Sadly, no"}
                    </button>
                  ))}
                </div>
                {rsvp === "yes" && (
                  <input
                    value={plusOne}
                    onChange={(e) => setPlusOne(e.target.value)}
                    placeholder="plus-one's name (optional)"
                    className="w-full rounded-lg border border-earth/40 bg-white/80 px-3 py-2 text-sm outline-none placeholder:text-ink/35 focus:border-olive-deep"
                  />
                )}
                <button
                  onClick={submit}
                  disabled={saving || !name.trim()}
                  className="w-full rounded-full bg-olive-deep py-2 text-sm text-cream transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Sending…" : "Send my reply"}
                </button>
              </div>
            </>
          )}

          {state === "done" && (
            <>
              <h1 className="mt-6 font-display text-3xl font-semibold">
                {answered === "yes"
                  ? "You're in the garden."
                  : "We'll miss you."}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">
                {answered === "yes"
                  ? "A seat is set. Details will come from your host — until then, keep an evening free and an appetite ready."
                  : "Thank you for telling us. The garden will bloom again next month — we'll save you a seat then."}
              </p>
              <div className="mt-6 text-2xl text-olive">❀</div>
            </>
          )}
        </div>
        <p className="mt-4 text-center text-[10px] tracking-widest text-ink/35">
          2ND NATURE · PLANTS · SPACES · PEOPLE
        </p>
      </div>
    </div>
  );
}
