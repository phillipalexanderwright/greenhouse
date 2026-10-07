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
import { Idea } from "@/lib/types";

const LANES: { key: Idea["status"]; title: string; blurb: string }[] = [
  { key: "compost", title: "Compost", blurb: "Raw — toss anything in" },
  { key: "sprouting", title: "Sprouting", blurb: "Worth developing" },
  { key: "used", title: "Bloomed", blurb: "Made it into the world" },
];

export default function IdeasPage() {
  const { data, insert, update, remove, user } = useStore();
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("box");

  function add() {
    if (!title.trim()) return;
    insert("ideas", {
      title: title.trim(),
      kind,
      added_by: user,
      notes: "",
      status: "compost",
    });
    setTitle("");
  }

  return (
    <div>
      <PageHeader
        title="The Compost Pile"
        subtitle="Every idea is organic matter — nothing is wasted"
      />

      <Card className="mb-6 flex items-center gap-3">
        <Input
          placeholder="Toss in an idea — a song, a format, a flower, a feeling…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <Select
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          className="w-36"
        >
          <option value="box">box</option>
          <option value="event">event</option>
          <option value="brand">brand</option>
          <option value="song">song</option>
          <option value="other">other</option>
        </Select>
        <Button onClick={add}>Compost it</Button>
      </Card>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {LANES.map((lane) => {
          const ideas = data.ideas.filter((i) => i.status === lane.key);
          return (
            <div key={lane.key}>
              <div className="mb-3">
                <h2 className="font-display text-2xl font-semibold">
                  {lane.title}
                </h2>
                <p className="label-caps">{lane.blurb}</p>
              </div>
              <div className="space-y-3">
                {ideas.length === 0 ? (
                  <Empty>—</Empty>
                ) : (
                  ideas.map((i) => (
                    <Card key={i.id} className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm">{i.title}</span>
                        <Button variant="danger" onClick={() => remove("ideas", i.id)}>
                          ×
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1.5">
                          <Pill tone="earth">{i.kind}</Pill>
                          <Pill tone="sky">{i.added_by}</Pill>
                        </div>
                        <Select
                          value={i.status}
                          onChange={(e) =>
                            update("ideas", i.id, {
                              status: e.target.value as Idea["status"],
                            })
                          }
                          className="w-28"
                        >
                          <option value="compost">compost</option>
                          <option value="sprouting">sprouting</option>
                          <option value="used">bloomed</option>
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
