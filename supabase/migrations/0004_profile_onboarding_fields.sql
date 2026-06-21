-- Migration 0004: Add onboarding and athlete profile fields to profiles

alter table profiles
  add column if not exists avatar_url text,
  add column if not exists onboarding_completed boolean not null default false,
  add column if not exists weight_kg numeric,
  add column if not exists height_cm numeric,
  add column if not exists age integer,
  add column if not exists resting_hr integer,
  add column if not exists max_hr integer,
  add column if not exists pace_10k text,
  add column if not exists primary_sport text default 'run',
  add column if not exists experience_level text default 'intermediate',
  add column if not exists weekly_hours numeric;
