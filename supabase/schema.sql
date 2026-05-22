create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  avatar_url text,
  preferred_language text not null default 'es',
  created_at timestamptz not null default now()
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  plan_key text not null default 'free',
  status text not null default 'active',
  ai_quota_limit integer not null default 20,
  ai_quota_window text not null default 'monthly',
  created_at timestamptz not null default now()
);

create table if not exists ai_usage_counters (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  window_key text not null,
  used_queries integer not null default 0,
  updated_at timestamptz not null default now(),
  unique(profile_id, window_key)
);

create table if not exists activity_sources (
  id uuid primary key default gen_random_uuid(),
  source_type text not null unique,
  display_name text not null
);

create table if not exists source_connections (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  source_id uuid not null references activity_sources(id) on delete cascade,
  external_athlete_id text,
  access_token_encrypted text,
  refresh_token_encrypted text,
  status text not null default 'connected',
  created_at timestamptz not null default now()
);

create table if not exists training_blocks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  starts_on date not null,
  ends_on date not null,
  goal text,
  created_at timestamptz not null default now()
);

create table if not exists training_sessions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  block_id uuid references training_blocks(id) on delete set null,
  session_date date not null,
  title text not null,
  sport text not null,
  status text not null default 'planned',
  intensity text,
  duration_minutes integer,
  tss integer,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists imported_activities (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  source_connection_id uuid references source_connections(id) on delete set null,
  external_activity_id text not null,
  source_type text not null,
  activity_date date not null,
  title text not null,
  sport text not null,
  duration_minutes integer,
  distance_km numeric,
  elevation_gain_m integer,
  avg_hr integer,
  max_hr integer,
  zone_breakdown jsonb,
  zone_precision text not null default 'insufficient',
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  unique(source_type, external_activity_id)
);

create table if not exists session_adjustments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references training_sessions(id) on delete cascade,
  requested_by text not null,
  reason text,
  before_snapshot jsonb not null,
  after_snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists pending_ai_actions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  action_type text not null,
  summary text not null,
  reason text,
  impact text,
  payload jsonb not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists ai_preferences (
  profile_id uuid primary key references profiles(id) on delete cascade,
  tone text not null default 'direct',
  equipment text not null default 'heart-rate only',
  autonomy_level text not null default 'proposal-only',
  extra_context text,
  updated_at timestamptz not null default now()
);

create table if not exists ui_preferences (
  profile_id uuid primary key references profiles(id) on delete cascade,
  language text not null default 'es',
  timezone text not null default 'America/Bogota',
  density text not null default 'comfortable',
  updated_at timestamptz not null default now()
);
