// Turns a remote database change into a garden-voiced toast, or null for silence.
import { TableName } from "./types";

type Row = Record<string, unknown>;

export function describeChange(
  table: TableName,
  event: string,
  row: Row,
  old: Row | undefined
): { msg: string; glyph: string } | null {
  const by = (row.done_by ??
    row.created_by ??
    row.added_by ??
    row.owner ??
    "Someone") as string;

  switch (table) {
    case "todos":
      if (event === "UPDATE" && row.done && !(old && old.done))
        return {
          msg: `${row.done_by ?? "Someone"} watered the to-dos — "${row.title}" is done`,
          glyph: "✓",
        };
      if (event === "INSERT")
        return { msg: `${by} planted a to-do: "${row.title}"`, glyph: "⚘" };
      return null;
    case "guests":
      if (row.rsvp === "yes" && !(old && old.rsvp === "yes"))
        return {
          msg: `${row.name ?? "A guest"} said yes to The Garden`,
          glyph: "❀",
        };
      if (event === "INSERT")
        return { msg: "The guest list grew", glyph: "☙" };
      return null;
    case "ideas":
      if (event === "INSERT")
        return {
          msg: `${by} tossed "${row.title}" on the Compost Pile`,
          glyph: "✿",
        };
      return null;
    case "projects":
      if (event === "UPDATE" && row.status === "done" && old?.status !== "done")
        return { msg: `"${row.title}" was harvested`, glyph: "⚘" };
      if (event === "INSERT")
        return { msg: `${by} planted a project: "${row.title}"`, glyph: "⚘" };
      return null;
    case "box_items":
      return event === "DELETE"
        ? null
        : { msg: "The Box was tended", glyph: "✉" };
    case "dinners":
      return event === "DELETE"
        ? null
        : { msg: "The Garden was tended", glyph: "❀" };
    case "digests":
      return event === "INSERT"
        ? { msg: "This week's Almanac was written", glyph: "✒" }
        : null;
    case "people":
      return event === "INSERT"
        ? { msg: `${row.name ?? "Someone new"} joined People`, glyph: "☙" }
        : null;
    case "social_posts":
    case "social_snapshots":
      return event === "DELETE"
        ? null
        : { msg: "New signal in Pollinate", glyph: "✺" };
    default:
      return null;
  }
}
