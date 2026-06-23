-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 0008 — Support "Sign in with Strava"
-- Idempotent.
--
-- The OAuth state row is also used for a login flow where there is no profile
-- yet, so profile_id must be nullable and we tag the row with a purpose.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.strava_oauth_states
  alter column profile_id drop not null;

alter table public.strava_oauth_states
  add column if not exists purpose text not null default 'connect';

-- Allow inserting login states from the edge function (service role bypasses
-- RLS anyway; this policy just keeps owner-connect inserts working).
drop policy if exists "sos_insert_login" on public.strava_oauth_states;
create policy "sos_insert_login" on public.strava_oauth_states
  for insert with check (purpose = 'login' or auth.uid() = profile_id);
