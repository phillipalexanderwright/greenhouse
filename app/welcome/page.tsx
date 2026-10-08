"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

// Drift lanes for the hero petals — same bones as the studio intro.
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
const GLYPHS = ["✿", "❀", "⚘", "❁", "❧", "✾", "☙", "✺"];
const PETAL_COLORS = ["#A7B79D", "#E6C6C3", "#6b7a5e", "#BBAA92"];

const NAV = [
  { href: "#nature", label: "Our Nature" },
  { href: "#box", label: "The Box" },
  { href: "#garden", label: "The Garden" },
];

const PILLARS = [
  {
    mark: "❀",
    title: "Plants",
    copy: "Living things in your hands — dried blooms, seeds of ideas, the slow rhythm of things that grow.",
  },
  {
    mark: "⚘",
    title: "Spaces",
    copy: "Rooms and tables worth lingering in. Candlelight, paper, clay — places that ask you to stay a while.",
  },
  {
    mark: "☙",
    title: "People",
    copy: "Ten strangers become dinner companions. Community built the old way: in person, on purpose.",
  },
];

const BOX_ITEMS = [
  { mark: "✉", title: "Embossed postcards", copy: "Hand-drawn, pressed into cream paper — made to be mailed." },
  { mark: "✿", title: "Dried flowers", copy: "A small bouquet from the season, preserved at its best." },
  { mark: "✒", title: "A poem", copy: "Something short enough to memorize, good enough to want to." },
  { mark: "♪", title: "Song of the month", copy: "One song, one playlist — the month's soundtrack." },
  { mark: "✺", title: "Flash tattoo ideas", copy: "Whimsical little designs, in case you're feeling brave." },
  { mark: "⚘", title: "Prompts to create", copy: "Invitations to draw, write, plant, and make with your hands." },
];

type FormState = "idle" | "saving" | "done" | "error";

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add("ld-visible");
            io.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`ld-reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState<"box" | "garden" | "both">("both");
  const [note, setNote] = useState("");
  const [form, setForm] = useState<FormState>("idle");

  const submit = async () => {
    if (!name.trim() || !email.trim()) return;
    if (!supabase) {
      setForm("error");
      return;
    }
    setForm("saving");
    const interestLabel =
      interest === "both" ? "the box + the garden" : `the ${interest}`;
    const { error } = await supabase.from("people").insert({
      name: name.trim(),
      email: email.trim(),
      phone: "",
      tags: `landing, interest: ${interestLabel}`,
      notes: note.trim()
        ? `Via landing page — "${note.trim()}"`
        : "Via landing page",
    });
    setForm(error ? "error" : "done");
  };

  return (
    <div className="bg-cream text-ink">
      {/* ——— Nav ——— */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-earth/25 bg-cream/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-5 py-3">
          <a href="#top" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="2N botanical monogram"
              className="h-9 w-9 object-contain"
            />
            <span className="font-display text-lg font-semibold tracking-[0.18em]">
              SECOND NATURE
            </span>
          </a>
          <nav className="ml-auto hidden items-center gap-6 text-sm sm:flex">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="text-ink/70 transition-colors hover:text-olive-deep"
              >
                {n.label}
              </a>
            ))}
          </nav>
          <a
            href="#rsvp"
            className="gh-press ml-auto rounded-full bg-olive-deep px-5 py-1.5 text-sm text-cream transition-colors hover:bg-ink sm:ml-0"
          >
            RSVP
          </a>
        </div>
      </header>

      {/* ——— Hero ——— */}
      <section
        id="top"
        className="ld-hero relative flex min-h-screen items-center justify-center overflow-hidden px-6"
      >
        {LANES.map((p, i) => (
          <span
            key={i}
            className="intro-petal"
            style={
              {
                left: p.left,
                fontSize: p.size,
                color: PETAL_COLORS[i % PETAL_COLORS.length],
                "--petal-dur": p.dur,
                "--petal-delay": p.delay,
                "--petal-opacity": p.o,
              } as React.CSSProperties
            }
          >
            {GLYPHS[i % GLYPHS.length]}
          </span>
        ))}

        <div className="relative mx-auto max-w-2xl pb-16 pt-28 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="2N botanical monogram"
            className="ld-in-1 mx-auto h-28 w-28 object-contain sm:h-36 sm:w-36"
          />
          <p className="ld-in-2 label-caps mt-7">
            Plants · Spaces · People
          </p>
          <h1 className="ld-in-3 mt-4 font-display text-5xl font-semibold tracking-tight sm:text-7xl">
            A more natural
            <br />
            tomorrow
          </h1>
          <div className="ld-in-rule mx-auto mt-7 h-px w-40 bg-earth/60 sm:w-56" />
          <p className="ld-in-4 mx-auto mt-7 max-w-md font-display text-xl italic leading-relaxed text-ink/75 sm:text-2xl">
            A San Diego studio reconnecting people with real life — nature,
            art, ritual, and one another.
          </p>
          <div className="ld-in-5 mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#rsvp"
              className="gh-press rounded-full bg-olive-deep px-7 py-2.5 text-sm text-cream transition-colors hover:bg-ink"
            >
              Save me a seat ❀
            </a>
            <a
              href="#nature"
              className="gh-press rounded-full border border-earth/50 bg-white/50 px-7 py-2.5 text-sm transition-colors hover:border-olive-deep hover:text-olive-deep"
            >
              Learn more
            </a>
          </div>
        </div>

        <a
          href="#nature"
          aria-label="Scroll to learn more"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xl text-ink/30 transition-colors hover:text-olive-deep"
        >
          ↓
        </a>
      </section>

      {/* ——— Our Nature ——— */}
      <section id="nature" className="scroll-mt-20 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="label-caps">Our Nature</p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Connection to nature isn&rsquo;t a trend.
              <br />
              It&rsquo;s in your biology.
            </h2>
            <p className="mx-auto mt-6 max-w-xl leading-relaxed text-ink/70">
              In an ever-digitalizing world, Second Nature is a quiet
              counterweight — tangible things made by hand, evenings spent at
              long tables, and small rituals that make life whimsical again.
              It&rsquo;s not an app. It arrives in the mail, and it ends at
              dinner.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-5 sm:grid-cols-3">
            {PILLARS.map((p, i) => (
              <Reveal key={p.title} delay={i * 120}>
                <div className="arch h-full border border-earth/40 bg-white/60 px-6 pb-8 pt-10 shadow-sm">
                  <div className="gh-sway text-3xl text-olive">{p.mark}</div>
                  <h3 className="mt-4 font-display text-2xl font-semibold">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink/70">
                    {p.copy}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ——— The Box ——— */}
      <section
        id="box"
        className="scroll-mt-20 bg-sage/40 px-6 py-24 sm:py-32"
      >
        <div className="mx-auto max-w-4xl">
          <Reveal className="text-center">
            <p className="label-caps">The Box</p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              A monthly mailer that makes
              <br />
              life whimsical again
            </h2>
            <p className="mx-auto mt-6 max-w-xl leading-relaxed text-ink/70">
              Each month carries a theme, and each box carries it to your door
              — printed, pressed, dried, and hand-assembled. No two months are
              the same.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BOX_ITEMS.map((item, i) => (
              <Reveal key={item.title} delay={(i % 3) * 100}>
                <div className="gh-card h-full rounded-2xl border border-earth/35 bg-cream px-5 py-6">
                  <div className="text-2xl text-olive-deep">{item.mark}</div>
                  <h3 className="mt-3 font-display text-xl font-semibold">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/65">
                    {item.copy}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-12 text-center">
            <p className="font-display text-lg italic text-ink/70">
              It also makes a lovely gift — a box that says
              <span className="text-olive-deep">
                {" "}
                &ldquo;go outside, make something.&rdquo;
              </span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ——— The Garden ——— */}
      <section id="garden" className="scroll-mt-20 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="label-caps">The Garden</p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Every month ends
              <br />
              at a long table
            </h2>
          </Reveal>

          <Reveal className="mt-12">
            <div className="mx-auto max-w-md">
              <div className="flex items-end justify-center gap-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <span
                    key={i}
                    className="gh-seat inline-block h-3.5 w-3.5 rounded-full border border-olive-deep/60 bg-sage"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  />
                ))}
              </div>
              <div className="gh-tabletop mx-auto mt-2 h-1 w-full rounded-full bg-earth/50" />
            </div>
          </Reveal>

          <Reveal delay={150}>
            <p className="mx-auto mt-10 max-w-xl leading-relaxed text-ink/70">
              The Garden is our monthly dinner party — ten invited guests, each
              with a plus-one. Twenty people, flowers down the table, a menu
              built around the month&rsquo;s theme. You arrive knowing one
              person and leave knowing twenty.
            </p>
            <p className="mx-auto mt-5 max-w-xl leading-relaxed text-ink/70">
              And it&rsquo;s only the beginning — ceramics lessons, wine
              tastings, and other excuses to be somewhere real are on the way.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ——— RSVP ——— */}
      <section
        id="rsvp"
        className="ld-hero scroll-mt-20 px-6 pb-28 pt-24 sm:pt-32"
      >
        <div className="mx-auto w-full max-w-md">
          <Reveal>
            <div className="arch border border-earth/40 bg-white/70 px-7 pb-10 pt-12 text-center shadow-sm sm:px-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="2N botanical monogram"
                className="mx-auto h-16 w-16 object-contain"
              />
              <p className="label-caps mt-4">Join us</p>

              {form === "done" ? (
                <>
                  <h2 className="mt-5 font-display text-3xl font-semibold">
                    You&rsquo;re on the list.
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-ink/70">
                    We&rsquo;ll write soon — on paper, probably. Until then,
                    keep an evening free and an appetite ready.
                  </p>
                  <div className="mt-6 text-2xl text-olive">❀</div>
                </>
              ) : (
                <>
                  <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight">
                    Save your seat
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-ink/70">
                    Tell us who you are and what calls to you. We&rsquo;ll be
                    in touch about the next box and the next table.
                  </p>

                  <div className="mt-7 space-y-3 text-left">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="your name"
                      className="w-full rounded-lg border border-earth/40 bg-white/80 px-3 py-2 text-sm outline-none placeholder:text-ink/35 focus:border-olive-deep"
                    />
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      placeholder="your email"
                      className="w-full rounded-lg border border-earth/40 bg-white/80 px-3 py-2 text-sm outline-none placeholder:text-ink/35 focus:border-olive-deep"
                    />
                    <div className="flex rounded-full border border-earth/40 bg-cream p-1">
                      {(
                        [
                          ["box", "The Box"],
                          ["garden", "The Garden"],
                          ["both", "Both ❀"],
                        ] as const
                      ).map(([val, label]) => (
                        <button
                          key={val}
                          onClick={() => setInterest(val)}
                          className={`flex-1 rounded-full py-1.5 text-sm transition-colors ${
                            interest === val
                              ? "bg-olive-deep text-cream"
                              : "hover:bg-sage/60"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="anything you'd like us to know (optional)"
                      rows={3}
                      className="w-full resize-none rounded-lg border border-earth/40 bg-white/80 px-3 py-2 text-sm outline-none placeholder:text-ink/35 focus:border-olive-deep"
                    />
                    <button
                      onClick={submit}
                      disabled={
                        form === "saving" || !name.trim() || !email.trim()
                      }
                      className="gh-press w-full rounded-full bg-olive-deep py-2.5 text-sm text-cream transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {form === "saving" ? "Planting…" : "Count me in"}
                    </button>
                    {form === "error" && (
                      <p className="text-center text-xs text-ink/60">
                        Something wilted — please try again, or write to us
                        directly.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ——— Footer ——— */}
      <footer className="border-t border-earth/25 px-6 py-10 text-center">
        <p className="font-display text-lg italic text-ink/70">
          a more natural tomorrow
        </p>
        <p className="label-caps mt-3">
          Second Nature · San Diego · Plants · Spaces · People
        </p>
        <a
          href="/gate"
          aria-label="Studio door"
          className="mt-5 inline-block text-sm text-ink/25 transition-colors hover:text-olive-deep"
        >
          ✳
        </a>
      </footer>
    </div>
  );
}
