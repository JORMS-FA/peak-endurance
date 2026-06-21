-- Migration 0003: Multi-provider BYOK + pending AI actions + cron jobs
-- Extends user_api_keys for multi-provider support, adds pending_ai_actions table,
-- and configures cron jobs for quota reset and cleanup.

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. Extend user_api_keys for multi-provider support
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add model_preference column
alter table user_api_keys
  add column if not exists model_preference text;

-- Change primary key to support multiple providers per user
-- Drop old PK constraint and add composite unique
alter table user_api_keys
  drop constraint if exists user_api_keys_pkey;

-- Add id column if not exists (to use as new PK)
alter table user_api_keys
  add column if not exists id uuid default gen_random_uuid();

-- If the table was profile_id-based PK, make id the new PK
-- This is safe with IF NOT EXISTS pattern
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'user_api_keys_pkey_id'
  ) then
    -- Add a unique constraint on (profile_id, provider)
    begin
      alter table user_api_keys
        add constraint user_api_keys_profile_provider_unique unique(profile_id, provider);
    exception when duplicate_table then null;
    end;
  end if;
end$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. Extend ai_usage_counters with quota_limit
-- ═══════════════════════════════════════════════════════════════════════════════

alter table ai_usage_counters
  add column if not exists quota_limit integer not null default 500;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. Add canceled_at to subscriptions
-- ═══════════════════════════════════════════════════════════════════════════════

alter table subscriptions
  add column if not exists canceled_at timestamptz;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. Pending AI actions table
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists pending_ai_actions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  action_type text not null,
  summary text,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

alter table pending_ai_actions enable row level security;

drop policy if exists "pai_select_own" on pending_ai_actions;
create policy "pai_select_own" on pending_ai_actions for select
  using (auth.uid() = profile_id);

drop policy if exists "pai_insert_own" on pending_ai_actions;
create policy "pai_insert_own" on pending_ai_actions for insert
  with check (auth.uid() = profile_id);

drop policy if exists "pai_update_own" on pending_ai_actions;
create policy "pai_update_own" on pending_ai_actions for update
  using (auth.uid() = profile_id);

create index if not exists idx_pai_profile_status
  on pending_ai_actions(profile_id, status);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. Cron jobs (configure manually in Supabase Dashboard → Database → Cron)
-- ═══════════════════════════════════════════════════════════════════════════════
-- NOTE: pg_cron must be enabled from Supabase Dashboard → Database → Extensions
-- Once enabled, run these manually in the SQL Editor:
--
-- Reset AI quota monthly (1st of each month):
-- select cron.schedule('reset-ai-quota', '0 0 1 * *',
--   $$ update ai_usage_counters set used_queries = 0, window_start = date_trunc('month', now())::date; $$);
--
-- Clean expired oauth states (hourly):
-- select cron.schedule('clean-oauth-states', '0 * * * *',
--   $$ delete from strava_oauth_states where created_at < now() - interval '15 minutes'; $$);
--
-- Expire old pending AI actions (daily):
-- select cron.schedule('expire-ai-actions', '0 3 * * *',
--   $$ update pending_ai_actions set status = 'expired' where status = 'pending' and created_at < now() - interval '7 days'; $$);
