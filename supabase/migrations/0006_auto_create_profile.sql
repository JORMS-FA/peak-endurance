-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 0006 — Auto-create a profile row for every auth user
-- Idempotent: safe to run multiple times.
--
-- Root cause this fixes:
--   Users created via OAuth (e.g. Google) never got a row in `public.profiles`
--   because nothing created one — there was no DB trigger and the client-side
--   `ensureProfile` could be skipped. Since `strava_oauth_states.profile_id`
--   (and other tables) have a FK to `profiles(id)`, the very first INSERT during
--   "Conectar Strava" failed with:
--     violates foreign key constraint "strava_oauth_states_profile_id_fkey"
--   surfaced in the UI as "Edge Function returned a non-2xx status code".
--
--   This installs the standard Supabase pattern: a SECURITY DEFINER trigger on
--   auth.users that inserts the matching profile, plus a one-time backfill for
--   users that already exist.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Trigger function ─────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      nullif(split_part(coalesce(new.email, ''), '@', 1), '')
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ── Trigger on auth.users ────────────────────────────────────────────────────
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Ensure one-subscription-per-profile (enables ON CONFLICT) ───────────────
-- `create_default_subscription()` and the billing webhooks upsert with
-- `on conflict (profile_id)`, but no matching unique constraint existed, so the
-- insert raised "no unique or exclusion constraint matching the ON CONFLICT
-- specification". Add it (table currently has no duplicate profile_ids).
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.subscriptions'::regclass
      and conname = 'subscriptions_profile_id_key'
  ) then
    alter table public.subscriptions
      add constraint subscriptions_profile_id_key unique (profile_id);
  end if;
end$$;

-- ── Fix the pre-existing default-subscription trigger ───────────────────────
-- `public.create_default_subscription()` (trigger `on_profile_created_sub`)
-- still referenced the old `subscriptions.tier` column, which was renamed to
-- `plan_key` in migration 0002. Because the function was never updated, EVERY
-- insert into `profiles` aborted with:
--   column "tier" of relation "subscriptions" does not exist
-- That silently blocked profile creation, which is what left users without a
-- profile row in the first place. Recreate it with the correct column.
create or replace function public.create_default_subscription()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.subscriptions (profile_id, plan_key, status, ai_quota_limit)
  values (NEW.id, 'free', 'active', 20)
  on conflict (profile_id) do nothing;
  return NEW;
end;
$$;

-- ── Backfill: create profiles for any existing users that lack one ───────────
insert into public.profiles (id, email, display_name, avatar_url)
select
  u.id,
  u.email,
  coalesce(
    u.raw_user_meta_data ->> 'full_name',
    u.raw_user_meta_data ->> 'name',
    nullif(split_part(coalesce(u.email, ''), '@', 1), '')
  ),
  u.raw_user_meta_data ->> 'avatar_url'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;
