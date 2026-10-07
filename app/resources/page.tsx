"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import {
  Card,
  PageHeader,
  Pill,
  Button,
  Input,
  Empty,
} from "@/components/ui";

export default function ResourcesPage() {
  const { data, insert, update, remove, user } = useStore();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");

  const categories = Array.from(
    new Set(data.resources.map((r) => r.category || "Uncategorized"))
  ).sort();

  function add() {
    if (!title.trim()) return;
    insert("resources", {
      title: title.trim(),
      url: url.trim(),
      category: category.trim() || "Uncategorized",
      notes: "",
      added_by: user,
    });
    setTitle("");
    setUrl("");
  }

  return (
    <div>
      <PageHeader
        title="Resources"
        subtitle="Every link, vendor, doc, and reference — one shelf"
      />

      <Card className="mb-8 flex items-center gap-3">
        <Input
          placeholder="Name it…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Input
          placeholder="https://…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Input
          placeholder="Category (Brand, Vendors…)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-52"
          list="resource-categories"
        />
        <datalist id="resource-categories">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <Button onClick={add}>Shelve it</Button>
      </Card>

      {data.resources.length === 0 ? (
        <Empty>The shelf is empty.</Empty>
      ) : (
        <div className="space-y-8">
          {categories.map((cat) => (
            <div key={cat}>
              <h2 className="mb-3 font-display text-2xl font-semibold">
                {cat}
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {data.resources
                  .filter((r) => (r.category || "Uncategorized") === cat)
                  .map((r) => (
                    <Card key={r.id} className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        {r.url ? (
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium underline decoration-olive/50 underline-offset-4 hover:decoration-olive-deep"
                          >
                            {r.title} ↗
                          </a>
                        ) : (
                          <span className="font-medium">{r.title}</span>
                        )}
                        <Button
                          variant="danger"
                          onClick={() => remove("resources", r.id)}
                        >
                          ×
                        </Button>
                      </div>
                      <Input
                        placeholder="Notes…"
                        value={r.notes}
                        onChange={(e) =>
                          update("resources", r.id, { notes: e.target.value })
                        }
                      />
                      <Pill tone="sky">added by {r.added_by}</Pill>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
