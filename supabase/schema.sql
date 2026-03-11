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

create table if not exists public.cohorts (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  trainer_user_id uuid references public.users(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cohort_memberships (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  membership_role text not null default 'member' check (membership_role in ('member', 'trainer', 'observer')),
  joined_at timestamptz not null default now(),
  unique (cohort_id, user_id)
);

create table if not exists public.weekly_reports (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  report_week date not null,
  total_members int not null default 0,
  active_members int not null default 0,
  first_scene_completion_rate numeric(5,2) not null default 0,
  scenario_pass_rate numeric(5,2) not null default 0,
  top_weaknesses jsonb not null default '[]'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now(),
  unique (cohort_id, report_week)
);

create index if not exists idx_cohort_memberships_cohort_user
  on public.cohort_memberships(cohort_id, user_id);

create index if not exists idx_cohorts_trainer_user
  on public.cohorts(trainer_user_id)
  where trainer_user_id is not null;

create index if not exists idx_weekly_reports_cohort_week
  on public.weekly_reports(cohort_id, report_week desc);

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
alter table public.cohorts enable row level security;
alter table public.cohort_memberships enable row level security;
alter table public.weekly_reports enable row level security;

drop policy if exists "users_select_own" on public.users;
create policy "users_select_own" on public.users
for select using (auth.uid() = id);
drop policy if exists "users_upsert_own" on public.users;
create policy "users_upsert_own" on public.users
for insert with check (auth.uid() = id);
drop policy if exists "users_update_own" on public.users;
create policy "users_update_own" on public.users
for update using (auth.uid() = id);

drop policy if exists "user_roles_select_own" on public.user_roles;
create policy "user_roles_select_own" on public.user_roles
for select using (auth.uid() = user_id);
drop policy if exists "user_roles_upsert_own" on public.user_roles;
create policy "user_roles_upsert_own" on public.user_roles
for insert with check (auth.uid() = user_id);
drop policy if exists "user_roles_update_own" on public.user_roles;
create policy "user_roles_update_own" on public.user_roles
for update using (auth.uid() = user_id);

drop policy if exists "vocab_progress_select_own" on public.vocab_progress;
create policy "vocab_progress_select_own" on public.vocab_progress
for select using (auth.uid() = user_id);
drop policy if exists "vocab_progress_upsert_own" on public.vocab_progress;
create policy "vocab_progress_upsert_own" on public.vocab_progress
for insert with check (auth.uid() = user_id);
drop policy if exists "vocab_progress_update_own" on public.vocab_progress;
create policy "vocab_progress_update_own" on public.vocab_progress
for update using (auth.uid() = user_id);

drop policy if exists "lesson_progress_select_own" on public.lesson_progress;
create policy "lesson_progress_select_own" on public.lesson_progress
for select using (auth.uid() = user_id);
drop policy if exists "lesson_progress_upsert_own" on public.lesson_progress;
create policy "lesson_progress_upsert_own" on public.lesson_progress
for insert with check (auth.uid() = user_id);
drop policy if exists "lesson_progress_update_own" on public.lesson_progress;
create policy "lesson_progress_update_own" on public.lesson_progress
for update using (auth.uid() = user_id);

drop policy if exists "scenario_attempts_select_own" on public.scenario_attempts;
create policy "scenario_attempts_select_own" on public.scenario_attempts
for select using (auth.uid() = user_id);
drop policy if exists "scenario_attempts_insert_own" on public.scenario_attempts;
create policy "scenario_attempts_insert_own" on public.scenario_attempts
for insert with check (auth.uid() = user_id);

drop policy if exists "cohorts_select_authenticated" on public.cohorts;
drop policy if exists "cohorts_select_assigned_trainer" on public.cohorts;
create policy "cohorts_select_assigned_trainer" on public.cohorts
for select using (trainer_user_id = auth.uid());

drop policy if exists "cohort_memberships_select_own" on public.cohort_memberships;
drop policy if exists "cohort_memberships_insert_own" on public.cohort_memberships;
drop policy if exists "cohort_memberships_update_own" on public.cohort_memberships;
drop policy if exists "cohort_memberships_select_self_or_assigned_trainer" on public.cohort_memberships;
create policy "cohort_memberships_select_self_or_assigned_trainer" on public.cohort_memberships
for select using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.cohorts
    where cohorts.id = cohort_memberships.cohort_id
      and cohorts.trainer_user_id = auth.uid()
  )
);

drop policy if exists "weekly_reports_select_authenticated" on public.weekly_reports;
drop policy if exists "weekly_reports_select_assigned_trainer" on public.weekly_reports;
create policy "weekly_reports_select_assigned_trainer" on public.weekly_reports
for select using (
  exists (
    select 1
    from public.cohorts
    where cohorts.id = weekly_reports.cohort_id
      and cohorts.trainer_user_id = auth.uid()
  )
);
drop policy if exists "weekly_reports_insert_service" on public.weekly_reports;
create policy "weekly_reports_insert_service" on public.weekly_reports
for insert with check (auth.role() = 'service_role');
drop policy if exists "weekly_reports_update_service" on public.weekly_reports;
create policy "weekly_reports_update_service" on public.weekly_reports
for update using (auth.role() = 'service_role');
