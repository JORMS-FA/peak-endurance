-- Migration 0012: Promo codes + subscription tier enhancements
-- Adds: promo_codes table, subscription tier columns to profiles, premium tier support

-- ═════════════════════════════════════════════════════════════════════════════════
-- 1. Promo Codes Table
-- ═════════════════════════════════════════════════════════════════════════════════

create table if not exists promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  tier text not null check (tier in ('pro', 'premium')),
  duration_months integer not null default 1,
  max_uses integer not null default 1,
  used_count integer not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table promo_codes enable row level security;

-- Admin can see all codes (users with peakendurance.app email)
drop policy if exists "promo_select_admin" on promo_codes;
create policy "promo_select_admin" on promo_codes for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and (email = 'admin@peakendurance.app' or email like '%@peakendurance.app')
    )
  );

-- Seed a test promo code: PEAK-GIFT-3M → premium, 3 months, 100 uses
insert into promo_codes (code, tier, duration_months, max_uses, used_count, expires_at)
values (
  'PEAK-GIFT-3M',
  'premium',
  3,
  100,
  0,
  now() + interval '1 year'
)
on conflict (code) do update set
  tier = excluded.tier,
  duration_months = excluded.duration_months,
  max_uses = excluded.max_uses,
  expires_at = excluded.expires_at,
  updated_at = now();

-- ═════════════════════════════════════════════════════════════════════════════════
-- 2. Add subscription columns to profiles for quick access
-- ═════════════════════════════════════════════════════════════════════════════════

alter table profiles
  add column if not exists subscription_tier text default 'free' check (subscription_tier in ('free', 'pro', 'premium')),
  add column if not exists subscription_expires_at timestamptz,
  add column if not exists subscription_status text default 'active' check (subscription_status in ('active', 'canceled', 'past_due', 'trialing'));

-- ═════════════════════════════════════════════════════════════════════════════════
-- 3. RPC: validate_and_redeem_promo_code
-- ═════════════════════════════════════════════════════════════════════════════════

create or replace function validate_and_redeem_promo_code(p_code text, p_profile_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_code record;
  v_existing_sub record;
  v_new_expires_at timestamptz;
  v_ai_quota_limit integer;
begin
  -- Normalize code
  p_code := upper(trim(p_code));
  
  -- Find the promo code
  select * into v_code
  from promo_codes
  where code = p_code
  limit 1;
  
  if not found then
    return jsonb_build_object(
      'success', false,
      'error', 'Código no encontrado'
    );
  end if;
  
  -- Check expiration
  if v_code.expires_at is not null and v_code.expires_at < now() then
    return jsonb_build_object(
      'success', false,
      'error', 'Código expirado'
    );
  end if;
  
  -- Check usage limit
  if v_code.used_count >= v_code.max_uses then
    return jsonb_build_object(
      'success', false,
      'error', 'Código agotado'
    );
  end if;
  
  -- Get current subscription
  select * into v_existing_sub
  from subscriptions
  where profile_id = p_profile_id
  limit 1;
  
  -- Calculate new expiration
  v_new_expires_at := case
    when v_existing_sub.current_period_end is not null and v_existing_sub.current_period_end > now()
    then v_existing_sub.current_period_end + (v_code.duration_months || ' months')::interval
    else now() + (v_code.duration_months || ' months')::interval
  end;
  
  -- Determine AI quota limit based on tier
  v_ai_quota_limit := case v_code.tier 
    when 'pro' then 500 
    when 'premium' then 10000 
    else 20 
  end;
  
  -- Update subscription tier and period
  update subscriptions
  set
    tier = v_code.tier,
    status = 'active',
    current_period_end = v_new_expires_at,
    cancel_at_period_end = false,
    ai_quota_limit = v_ai_quota_limit,
    updated_at = now()
  where profile_id = p_profile_id;
  
  -- If no subscription row exists, create one
  if not found then
    insert into subscriptions (profile_id, tier, status, current_period_end, ai_quota_limit)
    values (p_profile_id, v_code.tier, 'active', v_new_expires_at, v_ai_quota_limit);
  end if;
  
  -- Update profiles table for quick access
  update profiles
  set
    subscription_tier = v_code.tier,
    subscription_expires_at = v_new_expires_at,
    subscription_status = 'active',
    onboarding_completed = true
  where id = p_profile_id;
  
  -- Increment promo code usage
  update promo_codes
  set
    used_count = used_count + 1,
    updated_at = now()
  where id = v_code.id;
  
  return jsonb_build_object(
    'success', true,
    'tier', v_code.tier,
    'duration_months', v_code.duration_months,
    'expires_at', v_new_expires_at,
    'message', '¡Premium activado por ' || v_code.duration_months || ' meses!'
  );
end;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════════
-- 4. RPC: validate_promo_code (check without redeeming)
-- ═══════════════════════════════════════════════════════════════════════════════════

create or replace function validate_promo_code(p_code text)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_code record;
begin
  p_code := upper(trim(p_code));
  
  select * into v_code
  from promo_codes
  where code = p_code
  limit 1;
  
  if not found then
    return jsonb_build_object(
      'valid', false,
      'error', 'Código no encontrado'
    );
  end if;
  
  if v_code.expires_at is not null and v_code.expires_at < now() then
    return jsonb_build_object(
      'valid', false,
      'error', 'Código expirado'
    );
  end if;
  
  if v_code.used_count >= v_code.max_uses then
    return jsonb_build_object(
      'valid', false,
      'error', 'Código agotado'
    );
  end if;
  
  return jsonb_build_object(
    'valid', true,
    'tier', v_code.tier,
    'duration_months', v_code.duration_months,
    'remaining_uses', v_code.max_uses - v_code.used_count
  );
end;
$$;