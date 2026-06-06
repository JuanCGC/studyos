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

-- 6. Pomodoro sessions table (auto-logged focus blocks)
create table if not exists pomodoro_sessions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  subject_id      text,
  chapter_name    text,
  duration_minutes integer not null default 25,
  completed_at    timestamptz default now()
);

create index if not exists idx_pomo_user on pomodoro_sessions(user_id);
create index if not exists idx_pomo_subject on pomodoro_sessions(user_id, subject_id);

-- 7. Interview flashcards table (active recall system)
create table if not exists interview_flashcards (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  subject_id      text not null,
  question        text not null,
  answer          text not null,
  difficulty      text not null default 'medium',
  mastered        boolean not null default false,
  review_count    integer not null default 0,
  last_reviewed   timestamptz
);

create index if not exists idx_flash_user on interview_flashcards(user_id);
create index if not exists idx_flash_subject on interview_flashcards(user_id, subject_id);

-- 8. Subscriptions table (dLocal payment webhook target)
-- Migration (si creaste la tabla antes del rename):
--   alter table subscriptions rename column stripe_subscription_id to payment_id;
create table if not exists subscriptions (
  user_id                uuid references auth.users(id) on delete cascade primary key,
  plan_type              text not null default 'free',
  subject_limit          integer not null default 3,
  status                 text not null default 'active',
  payment_id text,
  updated_at             timestamptz default now()
);

alter table subscriptions enable row level security;

create policy "own_subscription" on subscriptions
  for all using (auth.uid() = user_id);

-- 9. Row Level Security
alter table progress enable row level security;
alter table profiles enable row level security;
alter table guide_cache enable row level security;
alter table pomodoro_sessions enable row level security;

create policy "own_progress" on progress
  for all using (auth.uid() = user_id);

create policy "own_profile" on profiles
  for all using (auth.uid() = id);

create policy "own_guide_cache" on guide_cache
  for all using (auth.uid() = user_id);

create policy "own_pomo_sessions" on pomodoro_sessions
  for all using (auth.uid() = user_id);

alter table interview_flashcards enable row level security;

create policy "own_flashcards" on interview_flashcards
  for all using (auth.uid() = user_id);
