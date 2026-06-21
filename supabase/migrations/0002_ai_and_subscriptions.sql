-- Migration 0002: AI Coach tables + Subscription enhancements
-- Adds: user_api_keys, ai_coach_history, ai_usage_counters improvements,
--        subscription columns for Stripe, and RPC for incrementing usage.

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. User API Keys (BYOK for free tier)
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists user_api_keys (
  profile_id uuid primary key references profiles(id) on delete cascade,
  provider text not null default 'google_ai',
  encrypted_key text not null,
  key_hint text,
  status text not null default 'active',
  last_validated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table user_api_keys enable row level security;

drop policy if exists "uak_select_own" on user_api_keys;
create policy "uak_select_own" on user_api_keys for select
  using (auth.uid() = profile_id);

drop policy if exists "uak_insert_own" on user_api_keys;
create policy "uak_insert_own" on user_api_keys for insert
  with check (auth.uid() = profile_id);

drop policy if exists "uak_update_own" on user_api_keys;
create policy "uak_update_own" on user_api_keys for update
  using (auth.uid() = profile_id);

drop policy if exists "uak_delete_own" on user_api_keys;
create policy "uak_delete_own" on user_api_keys for delete
  using (auth.uid() = profile_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. AI Coach History (stores AI responses for auditing and display)
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists ai_coach_history (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  action_type text not null,
  request_context jsonb,
  response jsonb,
  status text not null default 'completed',
  created_at timestamptz not null default now()
);

alter table ai_coach_history enable row level security;

drop policy if exists "ach_select_own" on ai_coach_history;
create policy "ach_select_own" on ai_coach_history for select
  using (auth.uid() = profile_id);

drop policy if exists "ach_insert_own" on ai_coach_history;
create policy "ach_insert_own" on ai_coach_history for insert
  with check (auth.uid() = profile_id);

create index if not exists idx_ach_profile_created
  on ai_coach_history(profile_id, created_at desc);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. AI Usage Counters (ensure table exists with proper columns)
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists ai_usage_counters (
  profile_id uuid primary key references profiles(id) on delete cascade,
  used_queries integer not null default 0,
  window_start date not null default (date_trunc('month', now())::date),
  updated_at timestamptz not null default now()
);

alter table ai_usage_counters enable row level security;

drop policy if exists "auc_select_own" on ai_usage_counters;
create policy "auc_select_own" on ai_usage_counters for select
  using (auth.uid() = profile_id);

drop policy if exists "auc_insert_own" on ai_usage_counters;
create policy "auc_insert_own" on ai_usage_counters for insert
  with check (auth.uid() = profile_id);

drop policy if exists "auc_update_own" on ai_usage_counters;
create policy "auc_update_own" on ai_usage_counters for update
  using (auth.uid() = profile_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. RPC: increment_ai_usage (atomic, creates row if not exists)
-- ═══════════════════════════════════════════════════════════════════════════════

create or replace function increment_ai_usage(p_profile_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  insert into ai_usage_counters (profile_id, used_queries, window_start, updated_at)
  values (p_profile_id, 1, date_trunc('month', now())::date, now())
  on conflict (profile_id) do update
  set
    used_queries = case
      when ai_usage_counters.window_start < date_trunc('month', now())::date
      then 1
      else ai_usage_counters.used_queries + 1
    end,
    window_start = date_trunc('month', now())::date,
    updated_at = now();
end;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. Subscriptions table enhancement (Stripe columns)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Ensure subscriptions table exists
create table if not exists subscriptions (
  profile_id uuid primary key references profiles(id) on delete cascade,
  tier text not null default 'free',
  status text not null default 'active',
  ai_quota_limit integer not null default 20,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add Stripe columns if they don't exist
alter table subscriptions
  add column if not exists stripe_customer_id text unique,
  add column if not exists stripe_subscription_id text unique,
  add column if not exists stripe_price_id text,
  add column if not exists current_period_start timestamptz,
  add column if not exists current_period_end timestamptz,
  add column if not exists cancel_at_period_end boolean default false;

alter table subscriptions enable row level security;

drop policy if exists "sub_select_own" on subscriptions;
create policy "sub_select_own" on subscriptions for select
  using (auth.uid() = profile_id);

drop policy if exists "sub_insert_own" on subscriptions;
create policy "sub_insert_own" on subscriptions for insert
  with check (auth.uid() = profile_id);

drop policy if exists "sub_update_own" on subscriptions;
create policy "sub_update_own" on subscriptions for update
  using (auth.uid() = profile_id);

create index if not exists idx_subs_stripe_customer
  on subscriptions(stripe_customer_id);
create index if not exists idx_subs_stripe_subscription
  on subscriptions(stripe_subscription_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. Ensure subscription row for every new user (trigger)
-- ═══════════════════════════════════════════════════════════════════════════════

create or replace function create_default_subscription()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into subscriptions (profile_id, tier, status, ai_quota_limit)
  values (NEW.id, 'free', 'active', 20)
  on conflict (profile_id) do nothing;
  return NEW;
end;
$$;

drop trigger if exists on_profile_created_sub on profiles;
create trigger on_profile_created_sub
  after insert on profiles
  for each row execute function create_default_subscription();
