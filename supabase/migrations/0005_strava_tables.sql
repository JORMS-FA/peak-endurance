-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 0005 — Strava OAuth tables (promoted from seed.sql)
-- Idempotent: safe to run multiple times.
--
-- Previously `strava_oauth_states` and `strava_tokens` lived only in
-- `supabase/seed.sql`. That meant a fresh deploy that ran only the numbered
-- migrations (`supabase db push`) never created these tables, and the
-- `strava-auth` edge function returned a 500 ("Failed to initiate OAuth")
-- on the first INSERT into `strava_oauth_states`. Hence the user-facing
-- "Edge Function returned a non-2xx status code" error in the Connections
-- page.
--
-- This migration owns the schema and policies for those tables. `seed.sql`
-- can stay as-is (its `if not exists` makes it a no-op once this migration
-- has run).
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Tables ──────────────────────────────────────────────────────────────────
create table if not exists public.strava_oauth_states (
  state text primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.strava_tokens (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  athlete_id text not null,
  athlete_name text,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  scopes text not null default 'read,activity:read',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(profile_id)
);

-- ── Index for the periodic cleanup job ─────────────────────────────────────
create index if not exists idx_strava_oauth_states_created_at
  on public.strava_oauth_states (created_at);

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.strava_oauth_states enable row level security;
alter table public.strava_tokens enable row level security;

-- ── Policies on strava_oauth_states (owner only; service_role bypasses) ────
drop policy if exists "sos_insert_own" on public.strava_oauth_states;
create policy "sos_insert_own" on public.strava_oauth_states
  for insert with check (auth.uid() = profile_id);

drop policy if exists "sos_select_own" on public.strava_oauth_states;
create policy "sos_select_own" on public.strava_oauth_states
  for select using (auth.uid() = profile_id);

drop policy if exists "sos_delete_own" on public.strava_oauth_states;
create policy "sos_delete_own" on public.strava_oauth_states
  for delete using (auth.uid() = profile_id);

-- ── Policies on strava_tokens (owner reads; service_role writes) ───────────
drop policy if exists "st_select_own" on public.strava_tokens;
create policy "st_select_own" on public.strava_tokens
  for select using (auth.uid() = profile_id);

drop policy if exists "st_insert_own" on public.strava_tokens;
create policy "st_insert_own" on public.strava_tokens
  for insert with check (auth.uid() = profile_id);

drop policy if exists "st_update_own" on public.strava_tokens;
create policy "st_update_own" on public.strava_tokens
  for update using (auth.uid() = profile_id);

drop policy if exists "st_delete_own" on public.strava_tokens;
create policy "st_delete_own" on public.strava_tokens
  for delete using (auth.uid() = profile_id);

-- ── Make sure the activity_sources catalog has the Strava row ──────────────
insert into public.activity_sources (source_type, display_name)
values ('strava', 'Strava')
on conflict (source_type) do nothing;
