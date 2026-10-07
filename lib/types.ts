export type UserName = "Phillip" | "Hank";

export interface Month {
  id: string;
  name: string;
  theme: string;
  status: "planning" | "in_production" | "shipped" | "complete";
  song: string;
  notes: string;
  created_at: string;
}

export type BoxItemKind =
  | "postcard"
  | "flash_tattoo"
  | "dried_flowers"
  | "poem"
  | "song"
  | "prompt"
  | "other";

export type BoxItemStatus =
  | "idea"
  | "sourcing"
  | "in_production"
  | "assembled"
  | "shipped";

export interface BoxItem {
  id: string;
  month_id: string;
  title: string;
  kind: BoxItemKind;
  status: BoxItemStatus;
  owner: UserName | "";
  cost: number;
  notes: string;
  created_at: string;
}

export interface Dinner {
  id: string;
  month_id: string;
  title: string;
  date: string;
  venue: string;
  menu: string;
  budget: number;
  status: "planning" | "invites_out" | "confirmed" | "complete";
  recap: string;
  created_at: string;
}

export interface Guest {
  id: string;
  dinner_id: string;
  name: string;
  plus_one: string;
  rsvp: "invited" | "yes" | "no" | "maybe";
  notes: string;
  created_at: string;
}

export interface Person {
  id: string;
  name: string;
  email: string;
  phone: string;
  tags: string;
  notes: string;
  created_at: string;
}

export interface Idea {
  id: string;
  title: string;
  kind: string;
  added_by: UserName;
  notes: string;
  status: "compost" | "sprouting" | "used";
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  status: "seed" | "growing" | "blooming" | "done";
  owner: UserName | "Both";
  description: string;
  due: string;
  created_at: string;
}

export interface Todo {
  id: string;
  title: string;
  assignee: UserName | "Both";
  done: boolean;
  done_by: UserName | null;
  done_at: string | null;
  created_by: UserName;
  notes: string;
  created_at: string;
}

export interface Resource {
  id: string;
  title: string;
  url: string;
  category: string;
  notes: string;
  added_by: UserName;
  created_at: string;
}

export interface AgentDef {
  id: string;
  name: string;
  role: string;
  cadence: string;
  status: "active" | "paused" | "idea";
  description: string;
  created_at: string;
}

export interface AgentRun {
  id: string;
  agent_id: string;
  summary: string;
  outcome: "success" | "needs_review" | "failed";
  run_at: string;
  created_at: string;
}

export type Platform = "instagram" | "tiktok";

export interface SocialSnapshot {
  id: string;
  platform: Platform;
  date: string; // YYYY-MM-DD
  followers: number;
  views: number;
  profile_visits: number;
  link_clicks: number;
  notes: string;
  entered_by: UserName;
  created_at: string;
}

export type PostFormat =
  | "reel"
  | "carousel"
  | "photo"
  | "story"
  | "video"
  | "other";

export interface SocialPost {
  id: string;
  platform: Platform;
  format: PostFormat;
  pillar: string;
  title: string;
  url: string;
  date: string; // YYYY-MM-DD — planned or posted
  status: "planned" | "posted";
  owner: UserName | "Both";
  views: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  notes: string;
  created_at: string;
}

export interface Experiment {
  id: string;
  title: string;
  hypothesis: string;
  status: "running" | "proven" | "disproven" | "abandoned";
  result: string;
  created_by: UserName;
  created_at: string;
}

export interface Digest {
  id: string;
  week_of: string; // YYYY-MM-DD (Monday of the week)
  body: string;
  created_by: UserName;
  created_at: string;
}

export interface Tables {
  months: Month[];
  box_items: BoxItem[];
  dinners: Dinner[];
  guests: Guest[];
  people: Person[];
  ideas: Idea[];
  projects: Project[];
  todos: Todo[];
  resources: Resource[];
  agents: AgentDef[];
  agent_runs: AgentRun[];
  social_snapshots: SocialSnapshot[];
  social_posts: SocialPost[];
  experiments: Experiment[];
  digests: Digest[];
}

export type TableName = keyof Tables;
export type Row<T extends TableName> = Tables[T][number];

export const TABLE_NAMES: TableName[] = [
  "months",
  "box_items",
  "dinners",
  "guests",
  "people",
  "ideas",
  "projects",
  "todos",
  "resources",
  "agents",
  "agent_runs",
  "social_snapshots",
  "social_posts",
  "experiments",
  "digests",
];
