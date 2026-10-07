"use client";

import { ReactNode, useState } from "react";
import { Card, PageHeader, Pill } from "@/components/ui";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Table({
  head,
  rows,
}: {
  head: string[];
  rows: ReactNode[][];
}) {
  return (
    <Card className="overflow-x-auto p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-earth/30 bg-sage/30 text-left">
            {head.map((h) => (
              <th key={h} className="label-caps px-4 py-2.5 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-earth/15 last:border-0">
              {r.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="underline decoration-olive/50 underline-offset-4 hover:decoration-olive-deep"
    >
      {children}
    </a>
  );
}

function Swatch({ name, hex }: { name: string; hex: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="h-16 w-16 rounded-full border border-earth/30 shadow-[0_1px_2px_rgba(65,73,59,0.1)]"
        style={{ backgroundColor: hex }}
      />
      <div className="text-center">
        <div className="text-sm font-medium">{name}</div>
        <div className="text-[11px] uppercase tracking-wide text-ink/50">{hex}</div>
      </div>
    </div>
  );
}

function LogoCard({
  src,
  name,
  usage,
}: {
  src: string;
  name: string;
  usage: string;
}) {
  return (
    <Card className="flex flex-col items-center gap-3 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={name} className="h-40 w-full object-contain" />
      <div>
        <div className="font-display text-lg font-semibold">{name}</div>
        <p className="mt-1 text-sm text-ink/70">{usage}</p>
      </div>
    </Card>
  );
}

function WhoWeAreTab() {
  return (
    <div className="space-y-10">
      <Section title="The Thesis">
        <p className="text-sm leading-relaxed">
          In an ever-digitalizing world, Second Nature reconnects people with
          in-real-life experiences — nature, art, ritual, and community. The
          name is the thesis: connection to nature is in our biology.
          It&rsquo;s second nature.
        </p>
        <p className="text-sm italic text-ink/60">
          2nd Nature — Plants · Spaces · People. &ldquo;A more natural
          tomorrow.&rdquo;
        </p>
      </Section>

      <Section title="Founders">
        <Table
          head={["Who", "Role"]}
          rows={[
            [
              <strong key="p">Phillip</strong>,
              "Logistics, research & development, outreach, product mapping, feasibility",
            ],
            [
              <strong key="h">Hank</strong>,
              "Creative lead. Horticulturist — builds the living side of the product and the community around it",
            ],
          ]}
        />
      </Section>

      <Section title="What We Make">
        <Card>
          <p className="text-sm leading-relaxed">
            <strong>The monthly envelope.</strong> A tangible mailer that makes
            life whimsical again — flash tattoos, embossed postcards, pressed
            flowers, poems, seed packets, a song of the month. It doubles as a
            giftable product.
          </p>
        </Card>
        <Card>
          <p className="text-sm leading-relaxed">
            <strong>The Garden.</strong> Each month culminates in a dinner
            party: 10 invited guests, each with a plus-one — twenty people
            meeting new people, expanding the community organically. Future
            formats: ceramic lessons, wine tastings, other
            get-people-out-and-about experiences.
          </p>
        </Card>
      </Section>

      <Section title="Business Model">
        <Table
          head={["Stream", "Price", "Notes"]}
          rows={[
            [
              <span key="f">
                Founding subscription <Pill tone="blush">first 10</Pill>
              </span>,
              "$15/mo",
              "Locked for year one",
            ],
            ["Standard subscription", "$18/mo", "Opens after the founding 10"],
            ["Annual", "$150/yr", "Two months free; funds tooling up front"],
            ["Gift, 3 months", "$54", "Zero new product work"],
            [
              "Garden dinner seat",
              "$50",
              "Ticketed separately so the dinner funds itself",
            ],
          ]}
        />
        <p className="text-sm leading-relaxed">
          Delivery is hybrid: hand-off at the dinner for attendees, USPS for
          everyone else. Full cost model and vendor pricing live in the
          Feasibility tab.
        </p>
      </Section>

      <Section title="Philosophy">
        <Card>
          <ul className="space-y-2 text-sm">
            {[
              "Not chasing scale — the goal is creation and genuine human connection, not subscriber count.",
              "Community-first, San Diego-rooted.",
              "Everything tangible, crafted, intentional — the opposite of a digital feed.",
            ].map((line) => (
              <li key={line} className="flex gap-2">
                <span className="text-olive-deep">❧</span>
                {line}
              </li>
            ))}
          </ul>
        </Card>
      </Section>
    </div>
  );
}

function BrandTab() {
  return (
    <div className="space-y-10">
      <Section title="Logo Suite">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <LogoCard
            src="/brand/logo-primary-wordmark.png"
            name="Primary wordmark"
            usage="The full lockup — covers, website masthead, the box lid. Anywhere the brand introduces itself."
          />
          <LogoCard
            src="/brand/logo-arch-badge.png"
            name="Arch badge"
            usage="Botanicals in the arch/window frame. Postcards, envelope seals, Garden invitations, avatars."
          />
          <LogoCard
            src="/brand/logo-monogram.png"
            name="Monogram"
            usage="The 2N mark alone — wax seals, embossing, poem-card corners, favicon."
          />
        </div>
        <p className="text-sm italic text-ink/60">
          Watercolor botanicals on cream — never flattened into corporate
          vector-cleanliness. Source files: brand-assets/ in the project
          folder.
        </p>
      </Section>

      <Section title="Palette">
        <Card>
          <div className="flex flex-wrap justify-around gap-6">
            <Swatch name="Sky" hex="#CFE2EE" />
            <Swatch name="Sage" hex="#D8E2D1" />
            <Swatch name="Olive" hex="#A7B79D" />
            <Swatch name="Blush" hex="#E6C6C3" />
            <Swatch name="Cream" hex="#FAF6ED" />
            <Swatch name="Earth" hex="#BBAA92" />
          </div>
        </Card>
      </Section>

      <Section title="Mood & Typography">
        <Card>
          <ul className="space-y-2 text-sm">
            {[
              ["Mood:", "vintage botanical illustration, watercolor texture, cream paper stock, letterpress/embossed feel."],
              ["Type:", "elegant high-contrast serif for the wordmark and display; letterspaced caps for the PLANTS SPACES PEOPLE line."],
              ["Marks:", "circular stamp, arch/window frame, standalone flower, monogram, star ornament."],
            ].map(([lead, rest]) => (
              <li key={lead} className="flex gap-2">
                <span className="text-olive-deep">✶</span>
                <span>
                  <strong>{lead}</strong> {rest}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </Section>

      <Section title="Voice">
        <p className="text-sm leading-relaxed">
          Warm, poetic, unhurried, whimsical — never corporate, never
          &ldquo;growth-hacky.&rdquo; Copy reads like a letter from a friend
          who presses flowers, not a brand that wants your attention.
        </p>
      </Section>
    </div>
  );
}

function FeasibilityTab() {
  return (
    <div className="space-y-10">
        <Section title="The Product">
          <p className="text-sm leading-relaxed">
            One envelope a month, every item in every envelope, culminating in
            The Garden dinner. Delivery is hybrid: hand-off at the dinner for
            attendees, USPS mail for everyone else.
          </p>
          <Card>
            <ul className="grid grid-cols-1 gap-x-8 gap-y-1.5 text-sm md:grid-cols-2">
              {[
                "Flash tattoo of the month (real temporary tattoo)",
                "Poem card on heavy cardstock",
                "Seed packet — seasonal SD natives, curated by Hank",
                "Pressed flowers in glassine, pressed by Hank",
                "Sticker of the month",
                "Embossed San Diego postcard",
                "San Diego newsletter cutout",
                "Playlist / song-of-the-month card",
                "Wax-sealed kraft envelope (A7)",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-olive-deep">❧</span>
                  {item}
                </li>
              ))}
            </ul>
          </Card>
          <p className="text-sm italic text-ink/60">
            Wine of the month and fresh bouquets live at The Garden dinner, not
            in the mail — see Flags.
          </p>
        </Section>

        <Section title="Cost per unit (10 units, month one)">
          <p className="text-sm">
            Landed cost <strong>$7.50–8.50</strong> per mailed envelope, ~$6
            handed off at the dinner. Vendor pricing researched Oct 2026.
          </p>
          <Table
            head={["Item", "Per unit", "Vendor / note"]}
            rows={[
              [
                "Flash tattoo",
                "$0.86–1.70",
                <Ext key="t" href="https://www.stickeryou.com/products/custom-temporary-tattoos/714">
                  StickerYou — $17.24/page of 20
                </Ext>,
              ],
              [
                "Poem card",
                "$0.82–1.22",
                <Ext key="m" href="https://www.moo.com/us/postcards">
                  Moo (Vistaprint $0.60 budget option)
                </Ext>,
              ],
              [
                "Seed packet (DIY)",
                "$0.70–1.00",
                "Blank kraft envelopes + bulk native seed + stamp",
              ],
              ["Newsletter cutout", "$0.30–0.60", "Same print run as poem cards"],
              [
                "Pressed flowers",
                "$0.05–0.10",
                "Glassine sleeve; Hank's labor unpriced",
              ],
              [
                "Sticker",
                "$0.10–2.00",
                <Ext key="s" href="https://www.stickermule.com/products/die-cut-stickers">
                  Sticker Mule — buy on recurring deals ($9/50)
                </Ext>,
              ],
              ["Embossed SD postcard", "$0.82–2.20", "Moo + emboss in-house"],
              ["Playlist card", "$0.10–0.30", "Home print, QR code"],
              ["Envelope (A7 kraft)", "$0.33", "JAM Paper — $33/100"],
              ["Wax seal", "$0.20–0.40", "Wax beads + custom stamp"],
              [
                "Postage",
                "$1.60–1.90",
                "USPS 2 oz nonmachinable; $1.90 flat tier",
              ],
            ]}
          />
          <p className="text-sm">
            One-time tooling, <strong>~$80–115</strong>: custom embosser
            ($27–45), wax seal stamp ($35–49), flower press ($17–25).
          </p>
        </Section>

        <Section title="Pricing (approved)">
          <Table
            head={["Tier", "Price", "Notes"]}
            rows={[
              [
                <span key="f">
                  Founding Member <Pill tone="blush">first 10</Pill>
                </span>,
                "$15/mo",
                "Locked for year one — the evangelists and dinner guests",
              ],
              ["Standard", "$18/mo", "Opens after the founding 10"],
              ["Annual", "$150/yr", "Two months free; cash up front funds tooling"],
              ["Gift, 3 months", "$54", "$18 × 3 — zero new product work"],
              [
                "Garden dinner seat",
                "$50",
                "Launch price; move to $75 once a waitlist forms",
              ],
            ]}
          />
          <p className="text-sm leading-relaxed">
            Market context: envelope mail clubs median{" "}
            <Ext href="https://mailclubhub.com/state-of-mail-clubs/">
              $10/mo, ~$16 ceiling
            </Ext>{" "}
            — only 11% charge over $15. Closest comps:{" "}
            <Ext href="https://hopesteinle.com/products/thewildflowerpost">
              The Wildflower Post
            </Ext>{" "}
            $9–16/mo,{" "}
            <Ext href="https://sandiegoseedcompany.com/product/rare-seeds/seed-of-the-month-vip-club/">
              SD Seed Co. VIP club
            </Ext>{" "}
            $15/mo. $18 sits just above the ceiling — justified by ten items,
            the wax seal, and the attached community. SoCal curated dinner seats
            run $90–250, so $50 is a generous entry.
          </p>
        </Section>

        <Section title="Six-month model (10 founding subs, $15/mo)">
          <p className="text-sm">
            Profitable from month two; <strong>~$380 over six months</strong>{" "}
            (42% margin after tooling). ~$560 at the $18 standard rate. Small on
            purpose — not chasing scale.
          </p>
          <Table
            head={["Line", "Per month", "6 months"]}
            rows={[
              ["Revenue — 10 × $15", "$150", "$900"],
              ["Materials (~$6/envelope)", "−$60", "−$360"],
              ["Postage (hybrid, ~half mailed)", "−$8", "−$50"],
              ["One-time tooling", "—", "−$110"],
              [
                <strong key="p">Envelope profit</strong>,
                <strong key="pm">~$80</strong>,
                <strong key="p6">~$380</strong>,
              ],
            ]}
          />
        </Section>

        <Section title="The Garden — dinner economics">
          <p className="text-sm leading-relaxed">
            Ticketed separately at $50/seat so the dinner funds itself.
            Subscribers get first access; plus-ones pay too. Wine of the month
            is poured here (the only legal home for it) with a tasting card in
            the envelope; fresh bouquets are chair gifts at the table.
          </p>
          <Table
            head={["Line", "Per event"]}
            rows={[
              ["Revenue — 20 seats × $50", "$1,000"],
              ["Food (20 covers)", "−$500 to −$800"],
              ["Wine + incidentals", "−$100 to −$200"],
              [<strong key="n">Net</strong>, <strong key="nv">~$0 to +$400</strong>],
            ]}
          />
          <p className="text-sm italic text-ink/60">
            Margin is thin at $50 — keep pours curated, not endless.
          </p>
        </Section>

        <Section title="Seed calendar — SD natives, curated by Hank">
          <p className="text-sm">
            SoCal natives are mostly fall-sown to germinate with winter rain —
            the packet copy writes itself: &ldquo;plant me before the
            rains.&rdquo;
          </p>
          <Table
            head={["Season", "Seed", "Why"]}
            rows={[
              ["Oct–Dec", "California poppy", "The icon; sow before winter rain"],
              ["Oct–Dec", "Arroyo lupine", "Fast, showy, fixes nitrogen"],
              [
                "Jan–Feb",
                "Desert bluebells",
                "Electric blue, blooms by March",
              ],
              [
                "Feb–Mar",
                "Tidy tips / baby blue eyes",
                "Late-window natives, pollinator magnets",
              ],
              [
                "Apr–Jun",
                "Narrowleaf milkweed",
                "Monarch host plant — newsletter story built in",
              ],
              [
                "Jul–Sep",
                "Chia or culinary herbs",
                "Summer too hot for natives; herbs bridge the gap",
              ],
            ]}
          />
          <p className="text-sm">
            Sourcing:{" "}
            <Ext href="https://sandiegoseedcompany.com/">
              San Diego Seed Company
            </Ext>{" "}
            for local bulk (also a comp and a natural collaborator); Theodore
            Payne Foundation and Larner Seeds for deeper native cuts.
          </p>
        </Section>

        <Section title="Flags & constraints">
          <Card>
            <ul className="space-y-2 text-sm">
              {[
                ["Wine cannot be mailed — full stop.", "USPS prohibits all alcohol; FedEx/UPS ship only for licensed businesses. Wine lives at The Garden."],
                ["Fresh bouquets don't fit an envelope.", "Chair gifts at the dinner; pressed flowers are the mailable version of the gesture."],
                ["Nonmachinable postage.", "Seeds and wax seals make it lumpy — budget $1.60–1.90, never the $0.82 letter rate."],
                ["Hank's labor is unpriced.", "Sweat equity at 10 units; revisit if volume doubles."],
                ["Sticker cost swings 20×.", "Buy on Sticker Mule deals, stock ahead."],
                ["Pre-printed seed packets need a 50-unit minimum.", "DIY kraft route wins until volume grows."],
              ].map(([lead, rest]) => (
                <li key={lead} className="flex gap-2">
                  <span className="text-olive-deep">✶</span>
                  <span>
                    <strong>{lead}</strong> {rest}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </Section>

        <Section title="Next steps — month one">
          <Card>
            <ol className="list-decimal space-y-1.5 pl-5 text-sm">
              <li>Order tooling: embosser, wax seal stamp, flower press (~$110)</li>
              <li>Hank confirms month-one seed pick and sources bulk seed</li>
              <li>Design month one: poem card, postcard, sticker, tattoo, playlist card, newsletter</li>
              <li>Order print run (Moo) and tattoos (StickerYou); watch Sticker Mule deals</li>
              <li>Buy envelopes, kraft seed envelopes, glassine sleeves, wax beads</li>
              <li>Sign the founding 10 at $15/mo; set up payments</li>
              <li>Date, venue, menu for the first Garden dinner; sell 20 seats at $50</li>
              <li>Assembly night: press, stuff, seal, emboss — a ritual, not a chore</li>
            </ol>
          </Card>
        </Section>
    </div>
  );
}

const tabs = [
  { key: "who", label: "Who We Are", node: <WhoWeAreTab /> },
  { key: "brand", label: "Brand", node: <BrandTab /> },
  { key: "feasibility", label: "Feasibility", node: <FeasibilityTab /> },
];

export default function WikiPage() {
  const [tab, setTab] = useState("who");

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Second Nature Wiki"
        subtitle="The company, the brand, the numbers · as of Oct 2026"
      />

      <div className="mb-8 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`gh-press rounded-full px-4 py-1.5 text-sm transition-colors ${
              tab === t.key
                ? "bg-olive-deep text-cream"
                : "border border-earth/40 text-ink hover:bg-sage/50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tabs.find((t) => t.key === tab)?.node}
    </div>
  );
}
