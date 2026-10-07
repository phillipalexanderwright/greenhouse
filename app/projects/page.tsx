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

const LANES: { key: Project["status"]; title: string }[] = [
  { key: "seed", title: "Seed" },
  { key: "growing", title: "Growing" },
  { key: "blooming", title: "Blooming" },
  { key: "done", title: "Harvested" },
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

      <Card className="mb-6 flex items-center gap-3">
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
                    <Card key={p.id} className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium">{p.title}</span>
                        <Button
                          variant="danger"
                          onClick={() => remove("projects", p.id)}
                        >
                          ×
                        </Button>
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
                          onChange={(e) =>
                            update("projects", p.id, {
                              status: e.target.value as Project["status"],
                            })
                          }
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
