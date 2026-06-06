-- Run this in Supabase Dashboard → SQL Editor

-- 1. Progress table
create table if not exists progress (
  user_id uuid references auth.users(id) on delete cascade primary key,
  subjects jsonb default '[]',
  tasks    jsonb default '[]',
  updated_at timestamptz default now()
);

-- 2. Profiles table (CV analysis)
create table if not exists profiles (
  id           uuid references auth.users(id) on delete cascade primary key,
  cv_filename  text,
  cv_analysis  jsonb,
  updated_at   timestamptz default now()
);

-- 3. Add user preferences column to profiles (deep-dive comments toggle)
alter table profiles add column if not exists preferences jsonb default '{}';

-- 4. Dynamic subject icons: icon is stored per-subject inside progress.subjects JSONB array.
-- Each subject object includes an "icon" field with a Phosphor icon name.
-- No schema change needed — the field is already part of the JSON structure.
-- See src/components/DynamicIcon.jsx for the keyword-to-icon mapping fallback.

-- 5. Guide cache table (cross-device AI content persistence)
create table if not exists guide_cache (
  user_id    uuid references auth.users(id) on delete cascade,
  cache_key  text,
  content    jsonb,
  updated_at timestamptz default now(),
  primary key (user_id, cache_key)
);

-- 6. Row Level Security
alter table progress enable row level security;
alter table profiles enable row level security;
alter table guide_cache enable row level security;

create policy "own_progress" on progress
  for all using (auth.uid() = user_id);

create policy "own_profile" on profiles
  for all using (auth.uid() = id);

create policy "own_guide_cache" on guide_cache
  for all using (auth.uid() = user_id);
