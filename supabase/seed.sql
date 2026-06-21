-- Seed: Strava OAuth
-- Idempotent: safe to run multiple times.
-- Run in Supabase SQL Editor after schema.sql.

-- Table for OAuth states (CSRF protection, short-lived)
create table if not exists strava_oauth_states (
  state text primary key,
  profile_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Table for Strava tokens
create table if not exists strava_tokens (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
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

-- RLS
alter table strava_oauth_states enable row level security;
alter table strava_tokens enable row level security;

-- strava_oauth_states: owner can insert/select/delete
drop policy if exists "sos_insert_own" on strava_oauth_states;
create policy "sos_insert_own"
  on strava_oauth_states for insert
  with check (auth.uid() = profile_id);

drop policy if exists "sos_select_own" on strava_oauth_states;
create policy "sos_select_own"
  on strava_oauth_states for select
  using (auth.uid() = profile_id);

drop policy if exists "sos_delete_own" on strava_oauth_states;
create policy "sos_delete_own"
  on strava_oauth_states for delete
  using (auth.uid() = profile_id);

-- strava_tokens: owner can read; service_role writes (bypasses RLS)
drop policy if exists "st_select_own" on strava_tokens;
create policy "st_select_own"
  on strava_tokens for select
  using (auth.uid() = profile_id);

drop policy if exists "st_insert_own" on strava_tokens;
create policy "st_insert_own"
  on strava_tokens for insert
  with check (auth.uid() = profile_id);

drop policy if exists "st_update_own" on strava_tokens;
create policy "st_update_own"
  on strava_tokens for update
  using (auth.uid() = profile_id);

-- Make sure activity_sources has the Strava row
insert into activity_sources (source_type, display_name)
values ('strava', 'Strava')
on conflict (source_type) do nothing;

-- Clean up expired states (> 10 min)
delete from strava_oauth_states
where created_at < now() - interval '10 minutes';
