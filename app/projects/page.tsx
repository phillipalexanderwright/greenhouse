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
} from "@/components/ui";
import { Project } from "@/lib/types";
import { harvestBloom } from "@/lib/petals";

const LANES: { key: Project["status"]; title: string; mark: string }[] = [
  { key: "seed", title: "Seed", mark: "·" },
  { key: "growing", title: "Growing", mark: "⚘" },
  { key: "blooming", title: "Blooming", mark: "❀" },
  { key: "done", title: "Harvested", mark: "❧" },
];

export default function ProjectsPage() {
  const { data, insert, update, remove, user } = useStore();
  const [title, setTitle] = useState("");

  function add() {
    if (!title.trim()) return;
    insert("projects", {
      title: title.trim(),
      status: "seed",
      owner: user,
      description: "",
      due: "",
    });
    setTitle("");
  }

  return (
    <div>
      <PageHeader
        title="Projects"
        subtitle="Everything growing that isn't the box or a dinner"
      />

      <Card className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Plant a new project…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <Button onClick={add}>Plant</Button>
      </Card>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {LANES.map((lane) => {
          const projects = data.projects.filter((p) => p.status === lane.key);
          return (
            <div key={lane.key}>
              <h2 className="mb-3 font-display text-2xl font-semibold">
                <span className="mr-1.5 text-lg text-olive/80">{lane.mark}</span>
                {lane.title}{" "}
                <span className="text-base text-ink/40">
                  {projects.length}
                </span>
              </h2>
              <div className="space-y-3">
                {projects.length === 0 ? (
                  <Empty>—</Empty>
                ) : (
                  projects.map((p) => (
                    <Card key={p.id} className="group space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium">{p.title}</span>
                        <button
                          onClick={() => remove("projects", p.id)}
                          aria-label={`Remove ${p.title}`}
                          className="rounded-full px-2 py-0.5 text-sm text-ink/30 opacity-0 transition-[opacity,color,background-color] duration-200 hover:bg-blush/40 hover:text-red-800 group-hover:opacity-100"
                        >
                          ×
                        </button>
                      </div>
                      <TextArea
                        placeholder="What is this?"
                        value={p.description}
                        onChange={(e) =>
                          update("projects", p.id, {
                            description: e.target.value,
                          })
                        }
                      />
                      <div className="flex items-center gap-2">
                        <Select
                          value={p.owner}
                          onChange={(e) =>
                            update("projects", p.id, {
                              owner: e.target.value as Project["owner"],
                            })
                          }
                          className="w-28"
                        >
                          <option value="Phillip">Phillip</option>
                          <option value="Hank">Hank</option>
                          <option value="Both">Both</option>
                        </Select>
                        <Input
                          type="date"
                          value={p.due}
                          onChange={(e) =>
                            update("projects", p.id, { due: e.target.value })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Pill tone="sky">{p.owner}</Pill>
                        <Select
                          value={p.status}
                          onChange={(e) => {
                            const next = e.target.value as Project["status"];
                            if (next === "done" && p.status !== "done")
                              harvestBloom();
                            update("projects", p.id, { status: next });
                          }}
                          className="w-32"
                        >
                          {LANES.map((l) => (
                            <option key={l.key} value={l.key}>
                              {l.title}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
