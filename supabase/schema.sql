-- Mi English v3.0 Role + Sync schema
-- Execute in Supabase SQL editor

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  app_state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.roles (
  id text primary key,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid primary key references public.users(id) on delete cascade,
  role_id text not null references public.roles(id),
  updated_at timestamptz not null default now()
);

create table if not exists public.vocab_progress (
  user_id uuid not null references public.users(id) on delete cascade,
  vocab_id text not null,
  status text not null check (status in ('mastered', 'shaky', 'unknown')),
  updated_at timestamptz not null default now(),
  primary key (user_id, vocab_id)
);

create table if not exists public.lesson_progress (
  user_id uuid not null references public.users(id) on delete cascade,
  lesson_id text not null,
  mastered_count int not null default 0,
  total_count int not null default 0,
  progress_pct int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table if not exists public.scenario_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  scene_id text not null,
  score int not null default 0,
  total int not null default 0,
  passed boolean not null default false,
  payload jsonb not null default '{}'::jsonb,
  attempted_at timestamptz not null default now()
);

create index if not exists idx_scenario_attempts_user_scene_time
  on public.scenario_attempts(user_id, scene_id, attempted_at desc);

insert into public.roles(id, name, description)
values
  ('retail_store', '零售门店', '门店接待、产品讲解、库存沟通'),
  ('channel_partner', '渠道伙伴', '渠道协同、周会复盘、铺货推进'),
  ('gtm_pitch', 'GTM汇报', '策略汇报、卖点表达、跨文化协同')
on conflict (id) do update
set name = excluded.name,
    description = excluded.description;

alter table public.users enable row level security;
alter table public.user_roles enable row level security;
alter table public.vocab_progress enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.scenario_attempts enable row level security;

create policy if not exists "users_select_own" on public.users
for select using (auth.uid() = id);
create policy if not exists "users_upsert_own" on public.users
for insert with check (auth.uid() = id);
create policy if not exists "users_update_own" on public.users
for update using (auth.uid() = id);

create policy if not exists "user_roles_select_own" on public.user_roles
for select using (auth.uid() = user_id);
create policy if not exists "user_roles_upsert_own" on public.user_roles
for insert with check (auth.uid() = user_id);
create policy if not exists "user_roles_update_own" on public.user_roles
for update using (auth.uid() = user_id);

create policy if not exists "vocab_progress_select_own" on public.vocab_progress
for select using (auth.uid() = user_id);
create policy if not exists "vocab_progress_upsert_own" on public.vocab_progress
for insert with check (auth.uid() = user_id);
create policy if not exists "vocab_progress_update_own" on public.vocab_progress
for update using (auth.uid() = user_id);

create policy if not exists "lesson_progress_select_own" on public.lesson_progress
for select using (auth.uid() = user_id);
create policy if not exists "lesson_progress_upsert_own" on public.lesson_progress
for insert with check (auth.uid() = user_id);
create policy if not exists "lesson_progress_update_own" on public.lesson_progress
for update using (auth.uid() = user_id);

create policy if not exists "scenario_attempts_select_own" on public.scenario_attempts
for select using (auth.uid() = user_id);
create policy if not exists "scenario_attempts_insert_own" on public.scenario_attempts
for insert with check (auth.uid() = user_id);
