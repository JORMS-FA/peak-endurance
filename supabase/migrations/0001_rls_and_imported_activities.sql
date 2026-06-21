-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 0001 — RLS hardening + imported_activities helpers
-- Idempotent: safe to run multiple times.
--
-- This migration:
--   1. Enables Row Level Security on all user-owned tables.
--   2. Adds "select / insert / update / delete own" policies bound to auth.uid().
--   3. Adds a couple of helpful indexes for the dashboard queries.
--   4. Ensures imported_activities has a tss column (was already in schema.sql,
--      but the seed environments may have it missing).
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Helper: enable RLS on a table only if not already enabled ───────────────
do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'profiles',
      'subscriptions',
      'ai_usage_counters',
      'source_connections',
      'training_blocks',
      'training_sessions',
      'imported_activities',
      'session_adjustments',
      'pending_ai_actions',
      'ai_preferences',
      'ui_preferences'
    ])
  loop
    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = t) then
      execute format('alter table public.%I enable row level security', t);
    end if;
  end loop;
end$$;

-- ── Make sure imported_activities has the columns the app expects ───────────
alter table if exists public.imported_activities
  add column if not exists tss integer;

create index if not exists idx_imported_activities_profile_date
  on public.imported_activities (profile_id, activity_date desc);

create index if not exists idx_training_sessions_profile_date
  on public.training_sessions (profile_id, session_date);

-- ── Generic helper: drop policy if exists, then create ──────────────────────
-- We wrap each block so reruns are safe.

-- profiles ───────────────────────────────────────────────────────────────────
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- subscriptions ──────────────────────────────────────────────────────────────
drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = profile_id);

-- ai_usage_counters ──────────────────────────────────────────────────────────
drop policy if exists "ai_usage_select_own" on public.ai_usage_counters;
create policy "ai_usage_select_own" on public.ai_usage_counters
  for select using (auth.uid() = profile_id);

-- source_connections ─────────────────────────────────────────────────────────
drop policy if exists "source_conn_select_own" on public.source_connections;
create policy "source_conn_select_own" on public.source_connections
  for select using (auth.uid() = profile_id);

-- training_blocks ────────────────────────────────────────────────────────────
drop policy if exists "blocks_select_own" on public.training_blocks;
create policy "blocks_select_own" on public.training_blocks
  for select using (auth.uid() = profile_id);

drop policy if exists "blocks_insert_own" on public.training_blocks;
create policy "blocks_insert_own" on public.training_blocks
  for insert with check (auth.uid() = profile_id);

drop policy if exists "blocks_update_own" on public.training_blocks;
create policy "blocks_update_own" on public.training_blocks
  for update using (auth.uid() = profile_id);

drop policy if exists "blocks_delete_own" on public.training_blocks;
create policy "blocks_delete_own" on public.training_blocks
  for delete using (auth.uid() = profile_id);

-- training_sessions ──────────────────────────────────────────────────────────
drop policy if exists "sessions_select_own" on public.training_sessions;
create policy "sessions_select_own" on public.training_sessions
  for select using (auth.uid() = profile_id);

drop policy if exists "sessions_insert_own" on public.training_sessions;
create policy "sessions_insert_own" on public.training_sessions
  for insert with check (auth.uid() = profile_id);

drop policy if exists "sessions_update_own" on public.training_sessions;
create policy "sessions_update_own" on public.training_sessions
  for update using (auth.uid() = profile_id);

drop policy if exists "sessions_delete_own" on public.training_sessions;
create policy "sessions_delete_own" on public.training_sessions
  for delete using (auth.uid() = profile_id);

-- imported_activities ────────────────────────────────────────────────────────
drop policy if exists "activities_select_own" on public.imported_activities;
create policy "activities_select_own" on public.imported_activities
  for select using (auth.uid() = profile_id);

-- The strava-sync edge function uses the service_role key, which bypasses RLS.
-- So no insert/update policy is needed here for users.
-- But allow manual insert from the user's own session if ever needed:
drop policy if exists "activities_insert_own" on public.imported_activities;
create policy "activities_insert_own" on public.imported_activities
  for insert with check (auth.uid() = profile_id);

-- session_adjustments ────────────────────────────────────────────────────────
drop policy if exists "sadj_select_own" on public.session_adjustments;
create policy "sadj_select_own" on public.session_adjustments
  for select using (
    exists (
      select 1 from public.training_sessions s
      where s.id = session_adjustments.session_id and s.profile_id = auth.uid()
    )
  );

-- pending_ai_actions ─────────────────────────────────────────────────────────
drop policy if exists "ai_actions_select_own" on public.pending_ai_actions;
create policy "ai_actions_select_own" on public.pending_ai_actions
  for select using (auth.uid() = profile_id);

drop policy if exists "ai_actions_update_own" on public.pending_ai_actions;
create policy "ai_actions_update_own" on public.pending_ai_actions
  for update using (auth.uid() = profile_id);

-- ai_preferences ─────────────────────────────────────────────────────────────
drop policy if exists "ai_pref_select_own" on public.ai_preferences;
create policy "ai_pref_select_own" on public.ai_preferences
  for select using (auth.uid() = profile_id);

drop policy if exists "ai_pref_upsert_own" on public.ai_preferences;
create policy "ai_pref_upsert_own" on public.ai_preferences
  for insert with check (auth.uid() = profile_id);

drop policy if exists "ai_pref_update_own" on public.ai_preferences;
create policy "ai_pref_update_own" on public.ai_preferences
  for update using (auth.uid() = profile_id);

-- ui_preferences ─────────────────────────────────────────────────────────────
drop policy if exists "ui_pref_select_own" on public.ui_preferences;
create policy "ui_pref_select_own" on public.ui_preferences
  for select using (auth.uid() = profile_id);

drop policy if exists "ui_pref_upsert_own" on public.ui_preferences;
create policy "ui_pref_upsert_own" on public.ui_preferences
  for insert with check (auth.uid() = profile_id);

drop policy if exists "ui_pref_update_own" on public.ui_preferences;
create policy "ui_pref_update_own" on public.ui_preferences
  for update using (auth.uid() = profile_id);
