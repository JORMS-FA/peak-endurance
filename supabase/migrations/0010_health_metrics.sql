-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 0010 — Health metrics (daily sleep / HRV / recovery %)
-- Idempotent. Owns schema + RLS for per-day wellness metrics.
--
-- Populated by health-source syncs (one row per profile per day). The
-- Dashboard reads the latest row to render the real Energy Ring values.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.health_metrics (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  sleep_hours numeric,
  hrv_ms numeric,
  recovery_pct numeric,
  source text,
  created_at timestamptz not null default now(),
  unique(profile_id, date)
);

create index if not exists idx_health_metrics_profile_date
  on public.health_metrics (profile_id, date desc);

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.health_metrics enable row level security;

drop policy if exists "hm_select_own" on public.health_metrics;
create policy "hm_select_own" on public.health_metrics
  for select using (auth.uid() = profile_id);

drop policy if exists "hm_insert_own" on public.health_metrics;
create policy "hm_insert_own" on public.health_metrics
  for insert with check (auth.uid() = profile_id);

drop policy if exists "hm_update_own" on public.health_metrics;
create policy "hm_update_own" on public.health_metrics
  for update using (auth.uid() = profile_id);

drop policy if exists "hm_delete_own" on public.health_metrics;
create policy "hm_delete_own" on public.health_metrics
  for delete using (auth.uid() = profile_id);
