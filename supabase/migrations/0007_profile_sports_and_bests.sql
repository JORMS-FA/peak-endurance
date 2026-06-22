-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 0007 — Multi-sport selection + running personal bests
-- Idempotent.
--
-- Onboarding now lets the athlete pick MULTIPLE sports they practise, and (only
-- when running is selected) record personal bests for 5k / 10k / half / marathon.
-- These feed the AI Coach as user context.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.profiles
  add column if not exists sports text[] not null default array['run']::text[],
  add column if not exists running_bests jsonb not null default '{}'::jsonb;
