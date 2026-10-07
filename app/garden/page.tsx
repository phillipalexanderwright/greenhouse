"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import {
  Card,
  PageHeader,
  Pill,
  Button,
  Input,
  TextArea,
  Select,
  Empty,
  statusLabel,
} from "@/components/ui";
import { Dinner, Guest } from "@/lib/types";
import { petalBurst } from "@/lib/petals";

const RSVPS: Guest["rsvp"][] = ["invited", "yes", "maybe", "no"];

// Active state of the segmented RSVP control, per answer
const rsvpActive: Record<Guest["rsvp"], string> = {
  invited: "bg-earth/50 text-ink",
  yes: "bg-olive-deep text-cream",
  maybe: "bg-sky text-ink",
  no: "bg-blush text-ink",
};

type SeatState = "yes" | "maybe" | "invited" | "empty";

// Lay the table: confirmed guests sit first, then maybes, then the merely
// invited; every answered guest brings their plus-one to the chair beside
// them. Whatever is left stays an open chair.
function seatPlan(guests: Guest[]): { label: string; state: SeatState }[] {
  const seats: { label: string; state: SeatState }[] = [];
  (["yes", "maybe", "invited"] as const).forEach((r) => {
    guests
      .filter((g) => g.rsvp === r)
      .forEach((g) => {
        seats.push({ label: g.name, state: r });
        if (g.plus_one.trim())
          seats.push({ label: `${g.plus_one.trim()} · with ${g.name}`, state: r });
      });
  });
  while (seats.length < 20) seats.push({ label: "An open chair", state: "empty" });
  return seats.slice(0, 20);
}

const seatCls: Record<SeatState, string> = {
  yes: "border-olive-deep bg-olive-deep text-cream shadow-[0_2px_6px_rgba(107,122,94,0.35)]",
  maybe: "border-sky bg-sky/70 text-ink/60",
  invited: "border-earth/60 bg-earth/25 text-ink/50",
  empty: "border-dashed border-earth/40 bg-transparent",
};

const NUMBER_WORDS = [
  "No",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
  "Twenty",
];

function LongTable({
  guests,
  headcount,
}: {
  guests: Guest[];
  headcount: number;
}) {
  const seats = seatPlan(guests);
  const renderSeat = (
    s: { label: string; state: SeatState },
    i: number,
    row: "top" | "bottom"
  ) => (
    <span
      key={`${row}-${i}`}
      title={s.label}
      className={`gh-seat flex h-5 w-5 items-center justify-center rounded-full border text-[0.6rem] sm:h-7 sm:w-7 sm:text-xs ${seatCls[s.state]}`}
      style={{ animationDelay: `${(row === "top" ? i : i + 10) * 45}ms` }}
    >
      {s.state === "yes" ? "❀" : s.state === "maybe" ? "✶" : ""}
    </span>
  );

  return (
    <Card className="relative mb-6 overflow-hidden">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="label-caps">The table</div>
        <div className="font-display text-sm italic text-ink/55">
          {headcount > 0
            ? `${NUMBER_WORDS[headcount] ?? headcount} of twenty chairs filled`
            : "Twenty chairs, waiting"}{" "}
          · {(NUMBER_WORDS[guests.length] ?? guests.length)
            .toString()
            .toLowerCase()}{" "}
          of ten invitations out
        </div>
      </div>
      <div className="mx-auto mt-5 max-w-xl pb-1">
        <div className="flex justify-between px-1">
          {seats.slice(0, 10).map((s, i) => renderSeat(s, i, "top"))}
        </div>
        <div className="gh-tabletop my-2.5 h-2.5 rounded-full border border-earth/50 bg-gradient-to-r from-earth/35 via-earth/60 to-earth/35" />
        <div className="flex justify-between px-1">
          {seats.slice(10).map((s, i) => renderSeat(s, i, "bottom"))}
        </div>
      </div>
    </Card>
  );
}

export default function GardenPage() {
  const { data, insert, update, remove } = useStore();
  const dinners = [...data.dinners].sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const dinner = dinners.find((d) => d.id === selectedId) ?? dinners[0];
  const months = [...data.months].sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  );

  const guests = dinner
    ? data.guests.filter((g) => g.dinner_id === dinner.id)
    : [];
  const confirmed = guests.filter((g) => g.rsvp === "yes");
  const headcount = confirmed.reduce(
    (n, g) => n + 1 + (g.plus_one.trim() ? 1 : 0),
    0
  );

  const [newGuest, setNewGuest] = useState("");
  const [newPlusOne, setNewPlusOne] = useState("");

  function addDinner() {
    const monthId = months[0]?.id ?? null;
    const id = insert("dinners", {
      month_id: monthId as string,
      title: `The Garden No. ${dinners.length + 1}`,
      date: "",
      venue: "",
      menu: "",
      budget: 0,
      status: "planning",
      recap: "",
    });
    setSelectedId(id);
  }

  function addGuest() {
    if (!newGuest.trim() || !dinner) return;
    insert("guests", {
      dinner_id: dinner.id,
      name: newGuest.trim(),
      plus_one: newPlusOne.trim(),
      rsvp: "invited",
      notes: "",
    });
    // add to People if new
    const exists = data.people.some(
      (p) => p.name.toLowerCase() === newGuest.trim().toLowerCase()
    );
    if (!exists) {
      insert("people", {
        name: newGuest.trim(),
        email: "",
        phone: "",
        tags: "garden guest",
        notes: `First invited to ${dinner.title}`,
      });
    }
    setNewGuest("");
    setNewPlusOne("");
  }

  return (
    <div>
      <PageHeader
        title="The Garden"
        subtitle="Ten invitations, twenty chairs, one long table"
        action={
          <div className="flex items-center gap-2">
            {dinners.length > 0 && (
              <Select
                value={dinner?.id ?? ""}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-48"
              >
                {dinners.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </Select>
            )}
            <Button variant="ghost" onClick={addDinner}>
              + New dinner
            </Button>
          </div>
        }
      />

      {!dinner ? (
        <Empty>No dinners yet. Set the first table.</Empty>
      ) : (
        <>
          <LongTable guests={guests} headcount={headcount} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <Card className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div className="label-caps">Details</div>
                <Pill tone="olive">{statusLabel(dinner.status)}</Pill>
              </div>
              <div>
                <div className="label-caps mb-1">Title</div>
                <Input
                  value={dinner.title}
                  onChange={(e) =>
                    update("dinners", dinner.id, { title: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="label-caps mb-1">Date</div>
                  <Input
                    type="date"
                    value={dinner.date}
                    onChange={(e) =>
                      update("dinners", dinner.id, { date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <div className="label-caps mb-1">Budget ($)</div>
                  <Input
                    type="number"
                    value={dinner.budget || ""}
                    placeholder="0"
                    onChange={(e) =>
                      update("dinners", dinner.id, {
                        budget: Number(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <div className="label-caps mb-1">Venue</div>
                <Input
                  value={dinner.venue}
                  placeholder="Where does the table go?"
                  onChange={(e) =>
                    update("dinners", dinner.id, { venue: e.target.value })
                  }
                />
              </div>
              <div>
                <div className="label-caps mb-1">Status</div>
                <Select
                  value={dinner.status}
                  onChange={(e) =>
                    update("dinners", dinner.id, {
                      status: e.target.value as Dinner["status"],
                    })
                  }
                >
                  {["planning", "invites_out", "confirmed", "complete"].map(
                    (s) => (
                      <option key={s} value={s}>
                        {statusLabel(s)}
                      </option>
                    )
                  )}
                </Select>
              </div>
              <div>
                <div className="label-caps mb-1">Menu / run of show</div>
                <TextArea
                  rows={4}
                  value={dinner.menu}
                  placeholder="Courses, pours, moments…"
                  onChange={(e) =>
                    update("dinners", dinner.id, { menu: e.target.value })
                  }
                />
              </div>
              <div>
                <div className="label-caps mb-1">Recap (after)</div>
                <TextArea
                  rows={3}
                  value={dinner.recap}
                  placeholder="Who connected with whom? What bloomed?"
                  onChange={(e) =>
                    update("dinners", dinner.id, { recap: e.target.value })
                  }
                />
              </div>
            </Card>

            <Card className="lg:col-span-3">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="label-caps">Guest list</div>
                <RsvpLink dinnerId={dinner.id} />
              </div>

              <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                <Input
                  placeholder="Guest name"
                  value={newGuest}
                  onChange={(e) => setNewGuest(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addGuest()}
                />
                <Input
                  placeholder="Plus-one (optional)"
                  value={newPlusOne}
                  onChange={(e) => setNewPlusOne(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addGuest()}
                />
                <Button onClick={addGuest}>Invite</Button>
              </div>

              {guests.length === 0 ? (
                <Empty>No invitations out yet.</Empty>
              ) : (
                <ul>
                  {guests.map((g, i) => (
                    <li
                      key={g.id}
                      className="gh-row-in group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-sage/30"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div className="min-w-0 flex-1 truncate">
                        <span className="text-sm">{g.name}</span>
                        {g.plus_one && (
                          <span className="ml-2 text-xs text-ink/50">
                            + {g.plus_one}
                          </span>
                        )}
                      </div>
                      <div className="flex shrink-0 rounded-full border border-earth/30 bg-cream/70 p-0.5">
                        {RSVPS.map((r) => (
                          <button
                            key={r}
                            onClick={(e) => {
                              if (r === "yes" && g.rsvp !== "yes") {
                                const el = e.currentTarget.getBoundingClientRect();
                                petalBurst(el.left + el.width / 2, el.top);
                              }
                              update("guests", g.id, { rsvp: r });
                            }}
                            className={`gh-press rounded-full px-2.5 py-0.5 text-[11px] tracking-wide transition-colors ${
                              g.rsvp === r
                                ? rsvpActive[r]
                                : "text-ink/40 hover:text-ink"
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => remove("guests", g.id)}
                        aria-label={`Remove ${g.name}`}
                        className="shrink-0 rounded-full px-2 py-0.5 text-sm text-ink/30 opacity-0 transition-[opacity,color,background-color] duration-200 hover:bg-blush/40 hover:text-red-800 group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function RsvpLink({ dinnerId }: { dinnerId: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const url = `${window.location.origin}/rsvp/${dinnerId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="gh-press rounded-full border border-earth/40 px-3 py-1 text-xs transition-colors hover:bg-sage/60"
      title="Copy the public RSVP link — guests confirm themselves"
    >
      {copied ? "Link copied ✓" : "❀ Copy RSVP link"}
    </button>
  );
}
