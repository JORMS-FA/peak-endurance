-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 0014 — Social: @username, follow graph, public profile lookup
-- Idempotent: safe to run multiple times.
--
-- Adds:
--   * profiles.username  — unique, lowercased, optional but recommended.
--                          Format: [a-z0-9_]{3,20} (e.g. "@jorman_fagua").
--   * profiles.username_set_at — when the user first claimed their handle.
--   * follows / follow_edges table for follower/following counts.
--   * social_links for connected providers (Facebook, Instagram, Strava…).
--
-- Username rules:
--   * 3–20 characters
--   * lowercase letters, digits, underscores
--   * first character must be a letter
--   * reserved words cannot be used (admin, app, login, signup, settings, …)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Username on profiles ────────────────────────────────────────────────────
alter table profiles
  add column if not exists username text,
  add column if not exists username_set_at timestamptz;

-- Use a citext extension if available, otherwise normalise to lowercase in
-- a generated column and put the unique constraint there.
do $$
begin
  -- Try to enable citext for case-insensitive uniqueness.
  begin
    create extension if not exists citext;
  exception when others then
    -- citext not available — fall back to a lowercased text column.
    null;
  end;
end $$;

-- Lowercased generated column — works even without citext.
alter table profiles
  drop column if exists username_lc;
alter table profiles
  add column username_lc text generated always as (
    case
      when username is null then null
      else lower(username)
    end
  ) stored;

create unique index if not exists profiles_username_lc_uidx
  on profiles (username_lc)
  where username_lc is not null;

-- Username format check: ^[a-z][a-z0-9_]{2,19}$ (case-insensitive at insert).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_username_format_chk'
  ) then
    alter table profiles
      add constraint profiles_username_format_chk
      check (
        username is null
        or username ~ '^[A-Za-z][A-Za-z0-9_]{2,19}$'
      );
  end if;
end $$;

-- Block reserved handles from being claimed.
create table if not exists reserved_usernames (
  username_lc text primary key,
  reason text
);
insert into reserved_usernames (username_lc, reason) values
  ('admin','reserved'),
  ('app','reserved'),
  ('login','reserved'),
  ('signup','reserved'),
  ('logout','reserved'),
  ('settings','reserved'),
  ('profile','reserved'),
  ('perfil','reserved'),
  ('strava','brand'),
  ('peakendurance','brand'),
  ('peak_endurance','brand'),
  ('support','reserved'),
  ('help','reserved'),
  ('root','reserved'),
  ('system','reserved'),
  ('official','reserved')
on conflict (username_lc) do nothing;

create or replace function public.check_username_not_reserved()
returns trigger
language plpgsql
as $$
begin
  if new.username_lc is not null then
    if exists (
      select 1 from reserved_usernames where username_lc = new.username_lc
    ) then
      raise exception 'Username % is reserved', new.username using errcode = '22023';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_profiles_username_reserved on profiles;
create trigger trg_profiles_username_reserved
  before insert or update of username on profiles
  for each row execute function public.check_username_not_reserved();

-- Auto-fill username_set_at on first claim.
create or replace function public.set_username_set_at()
returns trigger
language plpgsql
as $$
begin
  if new.username is not null and (old.username is null or old.username <> new.username) then
    new.username_set_at := coalesce(new.username_set_at, now());
  end if;
  return new;
end $$;

drop trigger if exists trg_profiles_username_set_at on profiles;
create trigger trg_profiles_username_set_at
  before insert or update of username on profiles
  for each row execute function public.set_username_set_at();

-- ── Follow graph ────────────────────────────────────────────────────────────
create table if not exists follows (
  follower_id uuid not null references profiles(id) on delete cascade,
  followee_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);

create index if not exists follows_followee_idx on follows (followee_id);
create index if not exists follows_follower_idx on follows (follower_id);

alter table follows enable row level security;

drop policy if exists follows_select_all on follows;
create policy follows_select_all on follows
  for select using (true);

drop policy if exists follows_insert_self on follows;
create policy follows_insert_self on follows
  for insert with check (auth.uid() = follower_id);

drop policy if exists follows_delete_self on follows;
create policy follows_delete_self on follows
  for delete using (auth.uid() = follower_id);

-- ── Social / external provider links ────────────────────────────────────────
create table if not exists social_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  provider text not null check (provider in ('facebook', 'instagram', 'strava', 'twitter', 'tiktok')),
  external_user_id text,
  external_username text,
  display_name text,
  avatar_url text,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  friends_synced_at timestamptz,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, provider)
);

create index if not exists social_links_profile_idx on social_links (profile_id);

alter table social_links enable row level security;

drop policy if exists social_links_select_self on social_links;
create policy social_links_select_self on social_links
  for select using (auth.uid() = profile_id);

drop policy if exists social_links_modify_self on social_links;
create policy social_links_modify_self on social_links
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- ── Search helper: profile lookup by username prefix ────────────────────────
create or replace function public.search_profiles_by_username(query text, max_results int default 10)
returns table (
  id uuid,
  username text,
  display_name text,
  avatar_url text,
  followers_count bigint,
  following_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with q as (
    select lower(coalesce(query, '')) as needle
  )
  select
    p.id,
    p.username,
    p.display_name,
    p.avatar_url,
    coalesce((select count(*) from follows f where f.followee_id = p.id), 0) as followers_count,
    coalesce((select count(*) from follows f where f.follower_id = p.id), 0) as following_count
  from profiles p, q
  where
    q.needle <> ''
    and p.username_lc is not null
    and (
      p.username_lc like q.needle || '%'
      or p.username_lc like '%' || q.needle || '%'
      or p.display_name ilike '%' || q.needle || '%'
    )
  order by
    case when p.username_lc like q.needle || '%' then 0 else 1 end,
    case when p.username_lc = q.needle then 0 else 1 end,
    p.username_lc
  limit greatest(1, least(coalesce(max_results, 10), 50));
$$;

grant execute on function public.search_profiles_by_username(text, int) to anon, authenticated;

-- ── Public profile view (excludes PII like email) ──────────────────────────
create or replace view public.public_profiles as
  select
    p.id,
    p.username,
    p.display_name,
    p.avatar_url,
    p.location,
    p.bio,
    p.subscription_tier,
    p.created_at,
    coalesce((select count(*) from follows f where f.followee_id = p.id), 0) as followers_count,
    coalesce((select count(*) from follows f where f.follower_id = p.id), 0) as following_count,
    coalesce((select count(*) from imported_activities a where a.profile_id = p.id), 0) as activities_count
  from profiles p;

grant select on public.public_profiles to anon, authenticated;