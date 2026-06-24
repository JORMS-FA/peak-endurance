-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 0009 — Health sources (Oura / Garmin / Whoop / Apple Health / ...)
-- Idempotent. Owns schema + RLS for the health_sources catalog per profile.
--
-- A row here represents a connected health/wellness provider for a user.
-- The Dashboard "Energy / Readiness Ring" is gated on the existence of at
-- least one row for the current profile: no rows → locked state (no fake
-- numbers), rows but no today's metric → "Sincronizando...".
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.health_sources (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  source_type text not null, -- 'oura' | 'garmin' | 'whoop' | 'apple_health' | 'google_fit'
  connected_at timestamptz not null default now(),
  last_sync_at timestamptz,
  unique(profile_id, source_type)
);

create index if not exists idx_health_sources_profile
  on public.health_sources (profile_id);

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.health_sources enable row level security;

drop policy if exists "hs_select_own" on public.health_sources;
create policy "hs_select_own" on public.health_sources
  for select using (auth.uid() = profile_id);

drop policy if exists "hs_insert_own" on public.health_sources;
create policy "hs_insert_own" on public.health_sources
  for insert with check (auth.uid() = profile_id);

drop policy if exists "hs_update_own" on public.health_sources;
create policy "hs_update_own" on public.health_sources
  for update using (auth.uid() = profile_id);

drop policy if exists "hs_delete_own" on public.health_sources;
create policy "hs_delete_own" on public.health_sources
  for delete using (auth.uid() = profile_id);
