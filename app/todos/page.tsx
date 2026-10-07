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
} from "@/components/ui";
import { Todo, UserName } from "@/lib/types";
import { petalBurst } from "@/lib/petals";

export default function TodosPage() {
  const { data, insert, update, remove, user } = useStore();
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState<Todo["assignee"]>("Both");

  const open = data.todos
    .filter((t) => !t.done)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  const done = data.todos
    .filter((t) => t.done)
    .sort((a, b) => (b.done_at ?? "").localeCompare(a.done_at ?? ""));

  function add() {
    if (!title.trim()) return;
    insert("todos", {
      title: title.trim(),
      assignee,
      done: false,
      done_by: null,
      done_at: null,
      created_by: user,
      notes: "",
    });
    setTitle("");
  }

  function toggle(t: Todo) {
    if (t.done) {
      update("todos", t.id, { done: false, done_by: null, done_at: null });
    } else {
      update("todos", t.id, {
        done: true,
        done_by: user,
        done_at: new Date().toISOString(),
      });
    }
  }

  function lane(who: Todo["assignee"]) {
    return open.filter((t) => t.assignee === who);
  }

  const lanes: { who: Todo["assignee"]; title: string }[] = [
    { who: "Phillip", title: "Phillip" },
    { who: "Hank", title: "Hank" },
    { who: "Both", title: "Together" },
  ];

  return (
    <div>
      <PageHeader
        title="To-Dos"
        subtitle="Who's doing what — in real time"
      />

      <Card className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="What needs doing?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <Select
          value={assignee}
          onChange={(e) => setAssignee(e.target.value as Todo["assignee"])}
          className="w-32"
        >
          <option value="Phillip">Phillip</option>
          <option value="Hank">Hank</option>
          <option value="Both">Both</option>
        </Select>
        <Button onClick={add}>Add</Button>
      </Card>

      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        {lanes.map(({ who, title: laneTitle }) => {
          const items = lane(who);
          return (
            <div key={who}>
              <h2 className="mb-3 font-display text-2xl font-semibold">
                {laneTitle}{" "}
                <span className="text-base text-ink/40">{items.length}</span>
              </h2>
              <div className="space-y-2">
                {items.length === 0 ? (
                  <Empty>Clear.</Empty>
                ) : (
                  items.map((t) => (
                    <Card key={t.id} className="group flex items-center gap-3 !p-3">
                      <button
                        onClick={(e) => {
                          petalBurst(e.clientX, e.clientY);
                          toggle(t);
                        }}
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-olive-deep/60 text-xs text-transparent transition-all hover:scale-110 hover:bg-sage hover:text-olive-deep"
                        aria-label="Mark done"
                      >
                        ✓
                      </button>
                      <span className="min-w-0 flex-1 text-sm">{t.title}</span>
                      <span className="text-[11px] text-ink/40">
                        by {t.created_by}
                      </span>
                      <button
                        onClick={() => remove("todos", t.id)}
                        aria-label={`Remove ${t.title}`}
                        className="rounded-full px-2 py-0.5 text-sm text-ink/30 opacity-0 transition-[opacity,color,background-color] duration-200 hover:bg-blush/40 hover:text-red-800 group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </Card>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="mb-3 font-display text-2xl font-semibold">
        Done <span className="text-base text-ink/40">{done.length}</span>
      </h2>
      {done.length === 0 ? (
        <Empty>Nothing finished yet.</Empty>
      ) : (
        <Card>
          <ul className="divide-y divide-earth/15">
            {done.slice(0, 30).map((t, i) => (
              <li
                key={t.id}
                className="gh-row-in flex items-center gap-3 py-2"
                style={{ animationDelay: `${Math.min(i, 10) * 45}ms` }}
              >
                <button
                  onClick={() => toggle(t)}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-olive text-xs text-white"
                  aria-label="Mark not done"
                >
                  ✓
                </button>
                <span className="min-w-0 flex-1 text-sm text-ink/50 line-through decoration-earth/60">
                  {t.title}
                </span>
                <Pill tone="sage">
                  {t.done_by as UserName} ·{" "}
                  {t.done_at
                    ? new Date(t.done_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })
                    : ""}
                </Pill>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
