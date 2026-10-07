# The Greenhouse — 2nd Nature studio tool

Shared HQ for Phillip & Hank: the monthly box, The Garden dinners, people,
projects, to-dos, resources, ideas, and agents. Built with Next.js + Supabase.

## Run locally

```bash
npm install
npm run dev
```

Without Supabase env vars the app runs in **demo mode** — data is saved in the
browser (localStorage) only. Fine for trying it out; not shared between people.

## Go live (shared, real-time)

1. Create a project at [supabase.com](https://supabase.com).
2. In the Supabase dashboard, open **SQL Editor** and run the contents of
   `supabase/schema.sql`.
3. Copy `.env.local.example` to `.env.local` and fill in your project URL and
   anon key (Dashboard → Settings → API).
4. Restart `npm run dev` — the sidebar should read "Live — synced via Supabase".

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` under
   Project → Settings → Environment Variables.
4. Deploy. Both of you open the same URL, pick "Working as" Phillip or Hank in
   the sidebar, and edits sync in real time.

> Note: the current RLS policies allow anyone with the anon key to read/write.
> For a private two-person tool that's acceptable short-term, but before
> sharing the URL widely, add Supabase Auth accounts and tighten the policies
> in `supabase/schema.sql`.
