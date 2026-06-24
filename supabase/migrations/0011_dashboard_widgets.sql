-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 0011 — Dashboard widgets (personalizable layout per profile)
-- Idempotent. Owns schema + RLS for the user's dashboard widget order/visibility.
--
-- widget_key ∈ { 'coach', 'recovery', 'pmc_chart', 'weekly_load',
--                'sport_distribution', 'level', 'connect_banner' }
-- The frontend falls back to a default ordered layout when no rows exist.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.dashboard_widgets (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  widget_key text not null,
  position int not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  unique(profile_id, widget_key)
);

create index if not exists idx_dashboard_widgets_profile_pos
  on public.dashboard_widgets (profile_id, position);

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.dashboard_widgets enable row level security;

drop policy if exists "dw_select_own" on public.dashboard_widgets;
create policy "dw_select_own" on public.dashboard_widgets
  for select using (auth.uid() = profile_id);

drop policy if exists "dw_insert_own" on public.dashboard_widgets;
create policy "dw_insert_own" on public.dashboard_widgets
  for insert with check (auth.uid() = profile_id);

drop policy if exists "dw_update_own" on public.dashboard_widgets;
create policy "dw_update_own" on public.dashboard_widgets
  for update using (auth.uid() = profile_id);

drop policy if exists "dw_delete_own" on public.dashboard_widgets;
create policy "dw_delete_own" on public.dashboard_widgets
  for delete using (auth.uid() = profile_id);
