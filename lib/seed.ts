import { Tables } from "./types";

const now = new Date().toISOString();
const id = () => crypto.randomUUID();

const octoberId = id();
const dinnerId = id();
const botanistId = id();
const scribeId = id();

export const seedData: Tables = {
  months: [
    {
      id: octoberId,
      name: "October 2026",
      theme: "Harvest & Ember — the slow turn of the season",
      status: "planning",
      song: "Harvest Moon — Neil Young",
      notes: "First full cycle in The Greenhouse.",
      created_at: now,
    },
  ],
  box_items: [
    {
      id: id(),
      month_id: octoberId,
      title: "Embossed postcard — pressed marigold motif",
      kind: "postcard",
      status: "idea",
      owner: "Hank",
      cost: 0,
      notes: "",
      created_at: now,
    },
    {
      id: id(),
      month_id: octoberId,
      title: "Dried bouquet — strawflower + eucalyptus",
      kind: "dried_flowers",
      status: "sourcing",
      owner: "Hank",
      cost: 0,
      notes: "",
      created_at: now,
    },
    {
      id: id(),
      month_id: octoberId,
      title: "Poem of the month",
      kind: "poem",
      status: "idea",
      owner: "Phillip",
      cost: 0,
      notes: "",
      created_at: now,
    },
  ],
  dinners: [
    {
      id: dinnerId,
      month_id: octoberId,
      title: "The Garden No. 1",
      date: "",
      venue: "TBD — San Diego",
      menu: "",
      budget: 0,
      status: "planning",
      recap: "",
      created_at: now,
    },
  ],
  guests: [],
  people: [
    {
      id: id(),
      name: "Phillip Wright",
      email: "phillipalexanderwright@gmail.com",
      phone: "",
      tags: "founder",
      notes: "Logistics, R&D, outreach, product mapping, feasibility.",
      created_at: now,
    },
    {
      id: id(),
      name: "Hank",
      email: "",
      phone: "",
      tags: "founder, horticulturist",
      notes: "Creative lead. Builds the living side of the product.",
      created_at: now,
    },
  ],
  ideas: [
    {
      id: id(),
      title: "Ceramic lesson night as a Garden format",
      kind: "event",
      added_by: "Phillip",
      notes: "",
      status: "compost",
      created_at: now,
    },
    {
      id: id(),
      title: "Seed-paper insert that grows wildflowers",
      kind: "box",
      added_by: "Hank",
      notes: "Plantable paper — the box literally grows.",
      status: "sprouting",
      created_at: now,
    },
  ],
  projects: [
    {
      id: id(),
      title: "Launch The Greenhouse (this tool)",
      status: "growing",
      owner: "Both",
      description: "Shared studio HQ on Supabase + Vercel.",
      due: "",
      created_at: now,
    },
  ],
  todos: [
    {
      id: id(),
      title: "Set the October box theme together",
      assignee: "Both",
      done: false,
      done_by: null,
      done_at: null,
      created_by: "Phillip",
      notes: "",
      created_at: now,
    },
  ],
  resources: [
    {
      id: id(),
      title: "2nd Nature brand brief",
      url: "",
      category: "Brand",
      notes: "Palette, logo system, voice. Lives in the project folder.",
      added_by: "Phillip",
      created_at: now,
    },
  ],
  agents: [
    {
      id: botanistId,
      name: "The Botanist",
      role: "Sourcing scout — finds flowers, paper stock, vendors, pricing",
      cadence: "Weekly",
      status: "idea",
      description:
        "Research agent that hunts seasonal flower availability and local San Diego suppliers before each box cycle.",
      created_at: now,
    },
    {
      id: scribeId,
      name: "The Scribe",
      role: "Writes first drafts — poems, invites, postcard copy",
      cadence: "Monthly",
      status: "idea",
      description:
        "Drafts the month's poem and Garden invitations in brand voice for Phillip & Hank to edit.",
      created_at: now,
    },
  ],
  agent_runs: [],
  social_snapshots: [],
  social_posts: [
    {
      id: id(),
      platform: "instagram",
      format: "reel",
      pillar: "Box reveal",
      title: "October box — slow unboxing over pressed marigolds",
      url: "",
      date: "",
      status: "planned",
      owner: "Both",
      views: 0,
      likes: 0,
      comments: 0,
      saves: 0,
      shares: 0,
      notes: "",
      created_at: now,
    },
  ],
  experiments: [
    {
      id: id(),
      title: "Do Garden recaps outperform box content?",
      hypothesis:
        "Candlelit dinner recaps will earn more saves than product shots — people save what they want to feel.",
      status: "running",
      result: "",
      created_by: "Phillip",
      created_at: now,
    },
  ],
  digests: [],
};
