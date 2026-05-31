-- Drive with Niall admin dashboard setup
-- Run this in Supabase SQL Editor if the admin panel reports missing tables or permissions.
-- It keeps student data private and only allows the configured admin email addresses to manage all rows.

create table if not exists public.student_profiles (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null unique references auth.users(id) on delete cascade,
  email text,
  name text,
  full_name text,
  lesson_status text not null default 'Pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.student_profiles add column if not exists student_id uuid references auth.users(id) on delete cascade;
alter table public.student_profiles add column if not exists email text;
alter table public.student_profiles add column if not exists name text;
alter table public.student_profiles add column if not exists full_name text;
alter table public.student_profiles add column if not exists lesson_status text not null default 'Pending';
alter table public.student_profiles add column if not exists created_at timestamptz not null default now();
alter table public.student_profiles add column if not exists updated_at timestamptz not null default now();

create table if not exists public.lesson_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users(id) on delete set null,
  name text,
  email text,
  phone text,
  addresses text,
  postcode text,
  lesson_type text,
  current_stage text,
  theory_status text,
  practical_test_date text,
  availability text,
  notes text,
  availability_status text,
  status text not null default 'Submitted',
  created_at timestamptz not null default now()
);

alter table public.lesson_requests add column if not exists student_id uuid references auth.users(id) on delete set null;
alter table public.lesson_requests add column if not exists name text;
alter table public.lesson_requests add column if not exists email text;
alter table public.lesson_requests add column if not exists phone text;
alter table public.lesson_requests add column if not exists addresses text;
alter table public.lesson_requests add column if not exists postcode text;
alter table public.lesson_requests add column if not exists lesson_type text;
alter table public.lesson_requests add column if not exists current_stage text;
alter table public.lesson_requests add column if not exists theory_status text;
alter table public.lesson_requests add column if not exists practical_test_date text;
alter table public.lesson_requests add column if not exists availability text;
alter table public.lesson_requests add column if not exists notes text;
alter table public.lesson_requests add column if not exists availability_status text;
alter table public.lesson_requests add column if not exists status text not null default 'Submitted';
alter table public.lesson_requests add column if not exists created_at timestamptz not null default now();

create table if not exists public.lesson_slot_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users(id) on delete set null,
  student_email text,
  requested_slot text,
  requested_label text,
  status text not null default 'Requested',
  created_at timestamptz not null default now()
);

alter table public.lesson_slot_requests add column if not exists student_id uuid references auth.users(id) on delete set null;
alter table public.lesson_slot_requests add column if not exists student_email text;
alter table public.lesson_slot_requests add column if not exists requested_slot text;
alter table public.lesson_slot_requests add column if not exists requested_label text;
alter table public.lesson_slot_requests add column if not exists status text not null default 'Requested';
alter table public.lesson_slot_requests add column if not exists created_at timestamptz not null default now();

create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users(id) on delete set null,
  support_option text,
  name text,
  email text,
  phone text,
  current_stage text,
  recent_test_fail text,
  regular_instructor_lessons text,
  private_practice text,
  theory_test_status text,
  practical_test_status text,
  topic text,
  availability text,
  status text not null default 'Submitted',
  created_at timestamptz not null default now()
);

alter table public.support_requests add column if not exists student_id uuid references auth.users(id) on delete set null;
alter table public.support_requests add column if not exists support_option text;
alter table public.support_requests add column if not exists name text;
alter table public.support_requests add column if not exists email text;
alter table public.support_requests add column if not exists phone text;
alter table public.support_requests add column if not exists current_stage text;
alter table public.support_requests add column if not exists recent_test_fail text;
alter table public.support_requests add column if not exists regular_instructor_lessons text;
alter table public.support_requests add column if not exists private_practice text;
alter table public.support_requests add column if not exists theory_test_status text;
alter table public.support_requests add column if not exists practical_test_status text;
alter table public.support_requests add column if not exists topic text;
alter table public.support_requests add column if not exists availability text;
alter table public.support_requests add column if not exists status text not null default 'Submitted';
alter table public.support_requests add column if not exists created_at timestamptz not null default now();

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users(id) on delete set null,
  student_email text,
  starts_at text,
  lesson_date text,
  hours numeric not null default 2,
  duration_hours numeric,
  topic text,
  focus text,
  lesson_type text,
  notes text,
  summary text,
  status text not null default 'Confirmed',
  created_at timestamptz not null default now()
);

alter table public.lessons add column if not exists student_id uuid references auth.users(id) on delete set null;
alter table public.lessons add column if not exists student_email text;
alter table public.lessons add column if not exists starts_at text;
alter table public.lessons add column if not exists lesson_date text;
alter table public.lessons add column if not exists hours numeric not null default 2;
alter table public.lessons add column if not exists duration_hours numeric;
alter table public.lessons add column if not exists topic text;
alter table public.lessons add column if not exists focus text;
alter table public.lessons add column if not exists lesson_type text;
alter table public.lessons add column if not exists notes text;
alter table public.lessons add column if not exists summary text;
alter table public.lessons add column if not exists status text not null default 'Confirmed';
alter table public.lessons add column if not exists created_at timestamptz not null default now();

alter table public.student_profiles enable row level security;
alter table public.lesson_requests enable row level security;
alter table public.lesson_slot_requests enable row level security;
alter table public.support_requests enable row level security;
alter table public.lessons enable row level security;

create or replace function public.is_drive_admin()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) in (
    'niallcullen.business@gmail.com',
    'contact@drivewithniall.co.uk'
  );
$$;

drop policy if exists "Students can view own profile" on public.student_profiles;
create policy "Students can view own profile"
on public.student_profiles for select
to authenticated
using (student_id = auth.uid() or public.is_drive_admin());

drop policy if exists "Admins can manage student profiles" on public.student_profiles;
create policy "Admins can manage student profiles"
on public.student_profiles for all
to authenticated
using (public.is_drive_admin())
with check (public.is_drive_admin());

drop policy if exists "Students can create own lesson requests" on public.lesson_requests;
create policy "Students can create own lesson requests"
on public.lesson_requests for insert
to authenticated
with check (student_id = auth.uid());

drop policy if exists "Students can view own lesson requests" on public.lesson_requests;
create policy "Students can view own lesson requests"
on public.lesson_requests for select
to authenticated
using (student_id = auth.uid() or public.is_drive_admin());

drop policy if exists "Admins can manage lesson requests" on public.lesson_requests;
create policy "Admins can manage lesson requests"
on public.lesson_requests for all
to authenticated
using (public.is_drive_admin())
with check (public.is_drive_admin());

drop policy if exists "Students can create own slot requests" on public.lesson_slot_requests;
create policy "Students can create own slot requests"
on public.lesson_slot_requests for insert
to authenticated
with check (student_id = auth.uid());

drop policy if exists "Students can view own slot requests" on public.lesson_slot_requests;
create policy "Students can view own slot requests"
on public.lesson_slot_requests for select
to authenticated
using (student_id = auth.uid() or public.is_drive_admin());

drop policy if exists "Admins can manage slot requests" on public.lesson_slot_requests;
create policy "Admins can manage slot requests"
on public.lesson_slot_requests for all
to authenticated
using (public.is_drive_admin())
with check (public.is_drive_admin());

drop policy if exists "Students can create own support requests" on public.support_requests;
create policy "Students can create own support requests"
on public.support_requests for insert
to authenticated
with check (student_id = auth.uid());

drop policy if exists "Students can view own support requests" on public.support_requests;
create policy "Students can view own support requests"
on public.support_requests for select
to authenticated
using (student_id = auth.uid() or public.is_drive_admin());

drop policy if exists "Admins can manage support requests" on public.support_requests;
create policy "Admins can manage support requests"
on public.support_requests for all
to authenticated
using (public.is_drive_admin())
with check (public.is_drive_admin());

drop policy if exists "Students can view own lessons" on public.lessons;
create policy "Students can view own lessons"
on public.lessons for select
to authenticated
using (student_id = auth.uid() or public.is_drive_admin());

drop policy if exists "Admins can manage lessons" on public.lessons;
create policy "Admins can manage lessons"
on public.lessons for all
to authenticated
using (public.is_drive_admin())
with check (public.is_drive_admin());

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.student_profiles to authenticated;
grant select, insert, update, delete on public.lesson_requests to authenticated;
grant select, insert, update, delete on public.lesson_slot_requests to authenticated;
grant select, insert, update, delete on public.support_requests to authenticated;
grant select, insert, update, delete on public.lessons to authenticated;
grant execute on function public.is_drive_admin() to authenticated;
