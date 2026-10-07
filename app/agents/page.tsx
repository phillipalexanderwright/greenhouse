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
import { AgentDef, AgentRun } from "@/lib/types";

const statusTone: Record<AgentDef["status"], "olive" | "earth" | "sky"> = {
  active: "olive",
  paused: "earth",
  idea: "sky",
};

const outcomeTone: Record<AgentRun["outcome"], "sage" | "blush" | "sky"> = {
  success: "sage",
  needs_review: "sky",
  failed: "blush",
};

export default function AgentsPage() {
  const { data, insert, update, remove } = useStore();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [logFor, setLogFor] = useState<string | null>(null);
  const [logSummary, setLogSummary] = useState("");
  const [logOutcome, setLogOutcome] =
    useState<AgentRun["outcome"]>("success");

  function addAgent() {
    if (!name.trim()) return;
    insert("agents", {
      name: name.trim(),
      role: role.trim(),
      cadence: "",
      status: "idea",
      description: "",
    });
    setName("");
    setRole("");
  }

  function logRun(agentId: string) {
    if (!logSummary.trim()) return;
    insert("agent_runs", {
      agent_id: agentId,
      summary: logSummary.trim(),
      outcome: logOutcome,
      run_at: new Date().toISOString(),
    });
    setLogSummary("");
    setLogFor(null);
  }

  return (
    <div>
      <PageHeader
        title="Agents"
        subtitle="The staff of The Greenhouse — who does what, and what they did"
      />

      <Card className="mb-8 flex items-center gap-3">
        <Input
          placeholder="Agent name — e.g. The Botanist"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder="Role — what does it handle?"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
        <Button onClick={addAgent}>Hire</Button>
      </Card>

      {data.agents.length === 0 ? (
        <Empty>No agents yet. Hire your first above.</Empty>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {data.agents.map((a) => {
            const runs = data.agent_runs
              .filter((r) => r.agent_id === a.id)
              .sort((x, y) => y.run_at.localeCompare(x.run_at));
            return (
              <Card key={a.id} className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-2xl font-semibold">
                      {a.name}
                    </h3>
                    <p className="text-sm text-ink/60">{a.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Pill tone={statusTone[a.status]}>{a.status}</Pill>
                    <Button variant="danger" onClick={() => remove("agents", a.id)}>
                      ×
                    </Button>
                  </div>
                </div>

                <TextArea
                  placeholder="Structure & instructions — what this agent does, step by step…"
                  rows={3}
                  value={a.description}
                  onChange={(e) =>
                    update("agents", a.id, { description: e.target.value })
                  }
                />

                <div className="flex items-center gap-2">
                  <Select
                    value={a.status}
                    onChange={(e) =>
                      update("agents", a.id, {
                        status: e.target.value as AgentDef["status"],
                      })
                    }
                    className="w-28"
                  >
                    <option value="idea">idea</option>
                    <option value="active">active</option>
                    <option value="paused">paused</option>
                  </Select>
                  <Input
                    placeholder="Cadence — weekly, monthly…"
                    value={a.cadence}
                    onChange={(e) =>
                      update("agents", a.id, { cadence: e.target.value })
                    }
                    className="w-44"
                  />
                  <Button
                    variant="ghost"
                    onClick={() => setLogFor(logFor === a.id ? null : a.id)}
                  >
                    + Log a run
                  </Button>
                </div>

                {logFor === a.id && (
                  <div className="flex items-center gap-2 rounded-xl bg-sage/40 p-3">
                    <Input
                      placeholder="What did it do?"
                      value={logSummary}
                      onChange={(e) => setLogSummary(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && logRun(a.id)}
                    />
                    <Select
                      value={logOutcome}
                      onChange={(e) =>
                        setLogOutcome(e.target.value as AgentRun["outcome"])
                      }
                      className="w-36"
                    >
                      <option value="success">success</option>
                      <option value="needs_review">needs review</option>
                      <option value="failed">failed</option>
                    </Select>
                    <Button onClick={() => logRun(a.id)}>Log</Button>
                  </div>
                )}

                {runs.length > 0 && (
                  <div>
                    <div className="label-caps mb-2">Run log</div>
                    <ul className="space-y-1.5">
                      {runs.slice(0, 5).map((r) => (
                        <li
                          key={r.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Pill tone={outcomeTone[r.outcome]}>
                            {statusLabel(r.outcome)}
                          </Pill>
                          <span className="min-w-0 flex-1">{r.summary}</span>
                          <span className="text-xs text-ink/40">
                            {new Date(r.run_at).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
