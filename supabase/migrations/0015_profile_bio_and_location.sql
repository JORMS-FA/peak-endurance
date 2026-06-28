-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 0015 — Profile bio & location columns
-- Idempotent: safe to run multiple times.
--
-- Adds editable profile fields consumed by the public profile page and the
-- in-app profile editor:
--   * profiles.bio         — free-text user description (max ~280 chars).
--   * profiles.location    — short location string (max ~80 chars).
--   * profiles.bio_set_at  — audit timestamp for first bio write.
-- ─────────────────────────────────────────────────────────────────────────────

alter table profiles
  add column if not exists bio text,
  add column if not exists location text,
  add column if not exists bio_set_at timestamptz;

-- Light length checks to avoid abuse; nulls allowed.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_bio_length_chk'
  ) then
    alter table profiles
      add constraint profiles_bio_length_chk
      check (bio is null or char_length(bio) <= 280);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'profiles_location_length_chk'
  ) then
    alter table profiles
      add constraint profiles_location_length_chk
      check (location is null or char_length(location) <= 80);
  end if;
end $$;

-- Track when bio was first written (audit / privacy).
create or replace function public.set_profile_bio_set_at()
returns trigger
language plpgsql
as $$
begin
  if new.bio is not null and (old.bio is null or old.bio <> new.bio) then
    new.bio_set_at := coalesce(new.bio_set_at, now());
  end if;
  return new;
end $$;

drop trigger if exists trg_profiles_bio_set_at on profiles;
create trigger trg_profiles_bio_set_at
  before insert or update of bio on profiles
  for each row execute function public.set_profile_bio_set_at();

-- Refresh public_profiles view so bio & location become visible to anon/authenticated.
-- (Migration 0014 added defensive column detection; we just need to re-run it now
-- that the columns actually exist.)
--
-- NOTE: `create or replace view` cannot reorder existing columns (Postgres
-- throws "cannot change name of view column X to Y"). We must DROP first
-- if the existing view's column list doesn't already include bio+location.
do $$
declare
  has_location boolean := exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'location'
  );
  has_bio boolean := exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'bio'
  );
  has_subscription_tier boolean := exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'subscription_tier'
  );
  has_imported_activities boolean := exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'imported_activities'
  );
  has_bio_in_view boolean := exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'public_profiles' and column_name = 'bio'
  );
  has_location_in_view boolean := exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'public_profiles' and column_name = 'location'
  );
  needs_recreate boolean := (has_bio and not has_bio_in_view)
                           or (has_location and not has_location_in_view);
  sql_text text;
begin
  if needs_recreate then
    execute 'drop view if exists public.public_profiles';
  end if;

  sql_text := 'create or replace view public.public_profiles as
    select
      p.id,
      p.username,
      p.username_set_at,
      p.display_name,
      p.avatar_url';
  if has_location then
    sql_text := sql_text || ', p.location';
  end if;
  if has_bio then
    sql_text := sql_text || ', p.bio';
  end if;
  if has_subscription_tier then
    sql_text := sql_text || ', p.subscription_tier';
  end if;
  sql_text := sql_text || ', p.created_at,
      coalesce((select count(*) from follows f where f.followee_id = p.id), 0) as followers_count,
      coalesce((select count(*) from follows f where f.follower_id = p.id), 0) as following_count';
  if has_imported_activities then
    sql_text := sql_text || ',
      coalesce((select count(*) from imported_activities a where a.profile_id = p.id), 0) as activities_count';
  end if;
  sql_text := sql_text || '
    from profiles p';

  execute sql_text;
end $$;

-- Re-grant access to the view (drop+recreate strips privileges).
grant select on public.public_profiles to anon, authenticated;

grant select on public.public_profiles to anon, authenticated;