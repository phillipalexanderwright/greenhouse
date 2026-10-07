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
  Empty,
} from "@/components/ui";

export default function PeoplePage() {
  const { data, insert, update, remove } = useStore();
  const [query, setQuery] = useState("");
  const [newName, setNewName] = useState("");

  const people = [...data.people]
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter(
      (p) =>
        !query ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.tags.toLowerCase().includes(query.toLowerCase())
    );

  function dinnersFor(name: string) {
    const guestRows = data.guests.filter(
      (g) => g.name.toLowerCase() === name.toLowerCase() && g.rsvp === "yes"
    );
    return guestRows
      .map((g) => data.dinners.find((d) => d.id === g.dinner_id)?.title)
      .filter(Boolean) as string[];
  }

  function addPerson() {
    if (!newName.trim()) return;
    insert("people", {
      name: newName.trim(),
      email: "",
      phone: "",
      tags: "",
      notes: "",
    });
    setNewName("");
  }

  return (
    <div>
      <PageHeader
        title="People"
        subtitle="The community — every guest, friend, and collaborator"
        action={
          <div className="flex gap-2">
            <Input
              placeholder="Search people or tags…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-56"
            />
          </div>
        }
      />

      <Card className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Add a person…"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addPerson()}
        />
        <Button onClick={addPerson}>Add</Button>
      </Card>

      {people.length === 0 ? (
        <Empty>No one here yet. Communities start with one name.</Empty>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {people.map((p) => {
            const attended = dinnersFor(p.name);
            return (
              <Card key={p.id} className="group space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-olive/50 bg-sage/50 font-display text-lg font-semibold text-olive-deep">
                      {p.name.trim().charAt(0).toUpperCase() || "?"}
                    </span>
                    <h3 className="font-display text-xl font-semibold">
                      {p.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => remove("people", p.id)}
                    aria-label={`Remove ${p.name}`}
                    className="rounded-full px-2 py-0.5 text-sm text-ink/30 opacity-0 transition-[opacity,color,background-color] duration-200 hover:bg-blush/40 hover:text-red-800 group-hover:opacity-100"
                  >
                    ×
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {p.tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((t) => (
                      <Pill key={t} tone="sage">
                        {t}
                      </Pill>
                    ))}
                  {attended.map((d) => (
                    <Pill key={d} tone="blush">
                      ❀ {d}
                    </Pill>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Email"
                    value={p.email}
                    onChange={(e) =>
                      update("people", p.id, { email: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Phone"
                    value={p.phone}
                    onChange={(e) =>
                      update("people", p.id, { phone: e.target.value })
                    }
                  />
                </div>
                <Input
                  placeholder="Tags (comma separated)"
                  value={p.tags}
                  onChange={(e) =>
                    update("people", p.id, { tags: e.target.value })
                  }
                />
                <TextArea
                  placeholder="Notes — loves ceramics, brought wine, met at…"
                  value={p.notes}
                  onChange={(e) =>
                    update("people", p.id, { notes: e.target.value })
                  }
                />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
