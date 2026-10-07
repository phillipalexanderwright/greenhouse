"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import {
  Card,
  PageHeader,
  Pill,
  Button,
  Input,
  Select,
  Empty,
  statusLabel,
} from "@/components/ui";
import { BoxItemKind, BoxItemStatus, Month } from "@/lib/types";

const KINDS: BoxItemKind[] = [
  "postcard",
  "flash_tattoo",
  "dried_flowers",
  "poem",
  "song",
  "prompt",
  "other",
];

const STATUSES: BoxItemStatus[] = [
  "idea",
  "sourcing",
  "in_production",
  "assembled",
  "shipped",
];

// Each stage of the making gets its own shade, worn as a small dot
const statusDot: Record<BoxItemStatus, string> = {
  idea: "bg-earth/70",
  sourcing: "bg-sky",
  in_production: "bg-blush",
  assembled: "bg-sage",
  shipped: "bg-olive-deep",
};

export default function BoxPage() {
  const { data, insert, update, remove, user } = useStore();
  const months = [...data.months].sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const month: Month | undefined =
    months.find((m) => m.id === selectedId) ?? months[0];

  const [newItem, setNewItem] = useState("");
  const [newKind, setNewKind] = useState<BoxItemKind>("other");
  const [newMonthName, setNewMonthName] = useState("");
  const [showNewMonth, setShowNewMonth] = useState(false);

  const items = month
    ? data.box_items.filter((i) => i.month_id === month.id)
    : [];
  const totalCost = items.reduce((s, i) => s + (Number(i.cost) || 0), 0);

  function addMonth() {
    if (!newMonthName.trim()) return;
    const id = insert("months", {
      name: newMonthName.trim(),
      theme: "",
      status: "planning",
      song: "",
      notes: "",
    });
    setSelectedId(id);
    setNewMonthName("");
    setShowNewMonth(false);
  }

  function addItem() {
    if (!newItem.trim() || !month) return;
    insert("box_items", {
      month_id: month.id,
      title: newItem.trim(),
      kind: newKind,
      status: "idea",
      owner: user,
      cost: 0,
      notes: "",
    });
    setNewItem("");
  }

  return (
    <div>
      <PageHeader
        title="The Box"
        subtitle="The monthly mailer — whimsy, assembled"
        action={
          <div className="flex items-center gap-2">
            {months.length > 0 && (
              <Select
                value={month?.id ?? ""}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-44"
              >
                {months.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </Select>
            )}
            <Button variant="ghost" onClick={() => setShowNewMonth(!showNewMonth)}>
              + New month
            </Button>
          </div>
        }
      />

      {showNewMonth && (
        <Card className="mb-6 flex items-center gap-3">
          <Input
            placeholder="e.g. November 2026"
            value={newMonthName}
            onChange={(e) => setNewMonthName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addMonth()}
          />
          <Button onClick={addMonth}>Plant it</Button>
        </Card>
      )}

      {!month ? (
        <Empty>No months yet — plant one above.</Empty>
      ) : (
        <div className="space-y-6">
          <Card>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <div className="label-caps mb-1">Theme</div>
                <Input
                  value={month.theme}
                  placeholder="What is this month about?"
                  onChange={(e) =>
                    update("months", month.id, { theme: e.target.value })
                  }
                />
              </div>
              <div>
                <div className="label-caps mb-1">Song of the month</div>
                <Input
                  value={month.song}
                  placeholder="Song — Artist"
                  onChange={(e) =>
                    update("months", month.id, { song: e.target.value })
                  }
                />
              </div>
              <div>
                <div className="label-caps mb-1">Status</div>
                <Select
                  value={month.status}
                  onChange={(e) =>
                    update("months", month.id, {
                      status: e.target.value as Month["status"],
                    })
                  }
                >
                  {["planning", "in_production", "shipped", "complete"].map(
                    (s) => (
                      <option key={s} value={s}>
                        {statusLabel(s)}
                      </option>
                    )
                  )}
                </Select>
              </div>
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex items-center justify-between">
              <div className="label-caps">Contents</div>
              <div className="font-display text-sm italic text-ink/55">
                about ${totalCost.toFixed(2)} a box, so far
              </div>
            </div>

            <div className="mb-4 flex flex-col gap-2 sm:flex-row">
              <Input
                placeholder="Add something to the box…"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addItem()}
              />
              <Select
                value={newKind}
                onChange={(e) => setNewKind(e.target.value as BoxItemKind)}
                className="w-40"
              >
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {statusLabel(k)}
                  </option>
                ))}
              </Select>
              <Button onClick={addItem}>Add</Button>
            </div>

            {items.length === 0 ? (
              <Empty>The box is empty. What goes in first?</Empty>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="label-caps border-b border-earth/30 text-left">
                    <th className="pb-2 font-normal">Item</th>
                    <th className="pb-2 font-normal">Kind</th>
                    <th className="pb-2 font-normal">Status</th>
                    <th className="pb-2 font-normal">Owner</th>
                    <th className="pb-2 font-normal">Cost</th>
                    <th className="pb-2" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((i, idx) => (
                    <tr
                      key={i.id}
                      className="gh-row-in group border-b border-earth/15 transition-colors hover:bg-sage/20"
                      style={{ animationDelay: `${idx * 45}ms` }}
                    >
                      <td className="py-2.5 pr-3">{i.title}</td>
                      <td className="py-2.5 pr-3">
                        <Pill tone="earth">{statusLabel(i.kind)}</Pill>
                      </td>
                      <td className="py-2.5 pr-3">
                        <span
                          className={`mr-2 inline-block h-2 w-2 rounded-full align-middle transition-colors duration-300 ${statusDot[i.status]}`}
                        />
                        <Select
                          value={i.status}
                          onChange={(e) =>
                            update("box_items", i.id, {
                              status: e.target.value as BoxItemStatus,
                            })
                          }
                          className="w-36"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {statusLabel(s)}
                            </option>
                          ))}
                        </Select>
                      </td>
                      <td className="py-2.5 pr-3">
                        <Select
                          value={i.owner}
                          onChange={(e) =>
                            update("box_items", i.id, {
                              owner: e.target.value as typeof i.owner,
                            })
                          }
                          className="w-28"
                        >
                          <option value="">—</option>
                          <option value="Phillip">Phillip</option>
                          <option value="Hank">Hank</option>
                        </Select>
                      </td>
                      <td className="py-2.5 pr-3">
                        <Input
                          type="number"
                          value={i.cost || ""}
                          placeholder="0"
                          className="w-20"
                          onChange={(e) =>
                            update("box_items", i.id, {
                              cost: Number(e.target.value) || 0,
                            })
                          }
                        />
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => remove("box_items", i.id)}
                          aria-label={`Remove ${i.title}`}
                          className="rounded-full px-2 py-0.5 text-sm text-ink/30 opacity-0 transition-[opacity,color,background-color] duration-200 hover:bg-blush/40 hover:text-red-800 group-hover:opacity-100"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
