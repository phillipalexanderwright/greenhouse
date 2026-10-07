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
const rsvpTone: Record<Guest["rsvp"], "earth" | "olive" | "sky" | "blush"> = {
  invited: "earth",
  yes: "olive",
  maybe: "sky",
  no: "blush",
};

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
              <div className="flex items-center gap-3">
                <RsvpLink dinnerId={dinner.id} />
                <div className="text-sm text-ink/60">
                  {headcount} / 20 seats confirmed · {guests.length} / 10
                  invites
                </div>
              </div>
            </div>

            <div className="mb-4 flex gap-2">
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
              <ul className="divide-y divide-earth/15">
                {guests.map((g) => (
                  <li key={g.id} className="flex items-center gap-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <span className="text-sm">{g.name}</span>
                      {g.plus_one && (
                        <span className="ml-2 text-xs text-ink/50">
                          +1: {g.plus_one}
                        </span>
                      )}
                    </div>
                    <Select
                      value={g.rsvp}
                      onChange={(e) => {
                        const next = e.target.value as Guest["rsvp"];
                        if (next === "yes") {
                          const r = e.target.getBoundingClientRect();
                          petalBurst(r.left + r.width / 2, r.top);
                        }
                        update("guests", g.id, { rsvp: next });
                      }}
                      className="w-28"
                    >
                      {RSVPS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </Select>
                    <Pill tone={rsvpTone[g.rsvp]}>{g.rsvp}</Pill>
                    <Button variant="danger" onClick={() => remove("guests", g.id)}>
                      ×
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
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
      className="rounded-full border border-earth/40 px-3 py-1 text-xs transition-colors hover:bg-sage/60"
      title="Copy the public RSVP link — guests confirm themselves"
    >
      {copied ? "Link copied ✓" : "❀ Copy RSVP link"}
    </button>
  );
}
