-- The Greenhouse — 2nd Nature studio tool
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query).

create table months (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  theme text not null default '',
  status text not null default 'planning',
  song text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table box_items (
  id uuid primary key default gen_random_uuid(),
  month_id uuid references months(id) on delete cascade,
  title text not null,
  kind text not null default 'other',
  status text not null default 'idea',
  owner text not null default '',
  cost numeric not null default 0,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table dinners (
  id uuid primary key default gen_random_uuid(),
  month_id uuid references months(id) on delete cascade,
  title text not null,
  date text not null default '',
  venue text not null default '',
  menu text not null default '',
  budget numeric not null default 0,
  status text not null default 'planning',
  recap text not null default '',
  created_at timestamptz not null default now()
);

create table guests (
  id uuid primary key default gen_random_uuid(),
  dinner_id uuid references dinners(id) on delete cascade,
  name text not null,
  plus_one text not null default '',
  rsvp text not null default 'invited',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table people (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null default '',
  phone text not null default '',
  tags text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table ideas (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  kind text not null default '',
  added_by text not null default 'Phillip',
  notes text not null default '',
  status text not null default 'compost',
  created_at timestamptz not null default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status text not null default 'seed',
  owner text not null default 'Both',
  description text not null default '',
  due text not null default '',
  created_at timestamptz not null default now()
);

create table todos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  assignee text not null default 'Both',
  done boolean not null default false,
  done_by text,
  done_at timestamptz,
  created_by text not null default 'Phillip',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null default '',
  category text not null default '',
  notes text not null default '',
  added_by text not null default 'Phillip',
  created_at timestamptz not null default now()
);

create table agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null default '',
  cadence text not null default '',
  status text not null default 'idea',
  description text not null default '',
  created_at timestamptz not null default now()
);

create table agent_runs (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references agents(id) on delete cascade,
  summary text not null default '',
  outcome text not null default 'success',
  run_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Pollinate — social marketing module (Instagram & TikTok)
create table social_snapshots (
  id uuid primary key default gen_random_uuid(),
  platform text not null default 'instagram',
  date text not null default '',
  followers numeric not null default 0,
  views numeric not null default 0,
  profile_visits numeric not null default 0,
  link_clicks numeric not null default 0,
  notes text not null default '',
  entered_by text not null default 'Phillip',
  created_at timestamptz not null default now()
);

create table social_posts (
  id uuid primary key default gen_random_uuid(),
  platform text not null default 'instagram',
  format text not null default 'reel',
  pillar text not null default '',
  title text not null,
  url text not null default '',
  date text not null default '',
  status text not null default 'planned',
  owner text not null default 'Both',
  views numeric not null default 0,
  likes numeric not null default 0,
  comments numeric not null default 0,
  saves numeric not null default 0,
  shares numeric not null default 0,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table experiments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  hypothesis text not null default '',
  status text not null default 'running',
  result text not null default '',
  created_by text not null default 'Phillip',
  created_at timestamptz not null default now()
);

-- The Almanac — weekly AI digests, shared between founders
create table digests (
  id uuid primary key default gen_random_uuid(),
  week_of text not null default '',
  body text not null default '',
  created_by text not null default 'Phillip',
  created_at timestamptz not null default now()
);

-- Realtime: broadcast all changes on these tables
alter publication supabase_realtime add table
  months, box_items, dinners, guests, people, ideas,
  projects, todos, resources, agents, agent_runs,
  social_snapshots, social_posts, experiments, digests;

-- RLS: for a two-person private tool, require authenticated users.
-- (Create accounts for Phillip and Hank under Authentication → Users,
-- or temporarily use the permissive anon policies below while piloting.)
alter table months enable row level security;
alter table box_items enable row level security;
alter table dinners enable row level security;
alter table guests enable row level security;
alter table people enable row level security;
alter table ideas enable row level security;
alter table projects enable row level security;
alter table todos enable row level security;
alter table resources enable row level security;
alter table agents enable row level security;
alter table agent_runs enable row level security;
alter table social_snapshots enable row level security;
alter table social_posts enable row level security;
alter table experiments enable row level security;
alter table digests enable row level security;

do $$
declare t text;
begin
  foreach t in array array[
    'months','box_items','dinners','guests','people','ideas',
    'projects','todos','resources','agents','agent_runs',
    'social_snapshots','social_posts','experiments','digests'
  ] loop
    execute format(
      'create policy "founders_all" on %I for all to anon, authenticated using (true) with check (true);',
      t
    );
  end loop;
end $$;
