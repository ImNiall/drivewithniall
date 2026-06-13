create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'student' check (role in ('instructor', 'student')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  email text,
  full_name text,
  phone text,
  postcode text,
  licence_stage text,
  notes text,
  lesson_access_status text not null default 'Approved',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.skill_areas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category text not null,
  name text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.lessons add column if not exists student_record_id uuid references public.students(id) on delete set null;
alter table public.lessons add column if not exists covered_topics text[] not null default '{}'::text[];
alter table public.lessons add column if not exists progress_notes text;
alter table public.lessons add column if not exists progress_summary text;
alter table public.lessons add column if not exists readiness_percentage integer check (readiness_percentage between 0 and 100);

create table if not exists public.lesson_skill_ratings (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  skill_area_id uuid not null references public.skill_areas(id) on delete cascade,
  rating text not null check (rating in ('Not introduced', 'Needs work', 'Developing', 'Test standard')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lesson_id, skill_area_id)
);

create table if not exists public.homework_tasks (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  task_text text not null,
  status text not null default 'Assigned' check (status in ('Assigned', 'Completed', 'Skipped')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists students_auth_user_id_idx on public.students(auth_user_id);
create unique index if not exists students_email_lower_idx on public.students(lower(email)) where email is not null;
create index if not exists lessons_student_record_id_idx on public.lessons(student_record_id);
create index if not exists lesson_skill_ratings_student_id_idx on public.lesson_skill_ratings(student_id);
create index if not exists lesson_skill_ratings_skill_area_id_idx on public.lesson_skill_ratings(skill_area_id);
create index if not exists homework_tasks_student_id_idx on public.homework_tasks(student_id);

insert into public.profiles (id, email, full_name, role, created_at, updated_at)
select
  users.id,
  users.email,
  coalesce(
    nullif(users.raw_user_meta_data ->> 'full_name', ''),
    nullif(users.raw_user_meta_data ->> 'name', ''),
    split_part(coalesce(users.email, ''), '@', 1)
  ),
  case
    when lower(coalesce(users.email, '')) in ('niallcullen.business@gmail.com', 'contact@drivewithniall.co.uk') then 'instructor'
    else 'student'
  end,
  coalesce(users.created_at, now()),
  now()
from auth.users as users
on conflict (id) do update
set
  email = excluded.email,
  full_name = coalesce(excluded.full_name, public.profiles.full_name),
  role = excluded.role,
  updated_at = now();

insert into public.students (auth_user_id, email, full_name, lesson_access_status, created_at, updated_at)
select
  student_profiles.student_id,
  coalesce(student_profiles.email, users.email),
  coalesce(
    nullif(student_profiles.full_name, ''),
    nullif(student_profiles.name, ''),
    nullif(public.profiles.full_name, ''),
    split_part(coalesce(student_profiles.email, users.email, ''), '@', 1)
  ),
  coalesce(nullif(student_profiles.lesson_status, ''), 'Approved'),
  coalesce(student_profiles.created_at, now()),
  coalesce(student_profiles.updated_at, now())
from public.student_profiles
left join auth.users as users on users.id = student_profiles.student_id
left join public.profiles on public.profiles.id = student_profiles.student_id
on conflict (auth_user_id) do update
set
  email = excluded.email,
  full_name = excluded.full_name,
  lesson_access_status = excluded.lesson_access_status,
  updated_at = now();

update public.lessons
set student_record_id = public.students.id
from public.students
where public.lessons.student_record_id is null
  and (
    (public.lessons.student_id is not null and public.students.auth_user_id = public.lessons.student_id)
    or (
      public.lessons.student_id is null
      and public.lessons.student_email is not null
      and lower(public.students.email) = lower(public.lessons.student_email)
    )
  );

insert into public.skill_areas (slug, category, name, display_order)
values
  ('cockpit-checks', 'Controls', 'Cockpit checks and ready to drive', 10),
  ('moving-away-stopping', 'Controls', 'Moving away and stopping safely', 20),
  ('steering-control', 'Controls', 'Steering control', 30),
  ('clutch-control', 'Controls', 'Clutch control', 40),
  ('gears', 'Controls', 'Use of gears', 50),
  ('mirrors', 'Observation', 'Use of mirrors', 60),
  ('signals', 'Observation', 'Signalling', 70),
  ('awareness-planning', 'Observation', 'Awareness, anticipation and planning', 80),
  ('junctions', 'Road use', 'Junctions', 90),
  ('roundabouts', 'Road use', 'Roundabouts', 100),
  ('pedestrian-crossings', 'Road use', 'Pedestrian crossings', 110),
  ('meeting-traffic', 'Road use', 'Meeting traffic and clearance', 120),
  ('positioning', 'Road use', 'Road position and lane discipline', 130),
  ('progress-speed', 'Road use', 'Appropriate progress and speed', 140),
  ('manoeuvres', 'Manoeuvres', 'Manoeuvres', 150),
  ('reversing', 'Manoeuvres', 'Reversing', 160),
  ('hill-starts', 'Manoeuvres', 'Hill starts', 170),
  ('dual-carriageways', 'Road use', 'Dual carriageways', 180),
  ('independent-driving', 'Driving skills', 'Independent driving', 190),
  ('sat-nav-following', 'Driving skills', 'Following signs or sat nav', 200)
on conflict (slug) do update
set
  category = excluded.category,
  name = excluded.name,
  display_order = excluded.display_order;

alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.skill_areas enable row level security;
alter table public.lesson_skill_ratings enable row level security;
alter table public.homework_tasks enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_drive_admin());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (id = auth.uid() or public.is_drive_admin())
with check (id = auth.uid() or public.is_drive_admin());

drop policy if exists "Admins can insert profiles" on public.profiles;
create policy "Admins can insert profiles"
on public.profiles for insert
to authenticated
with check (public.is_drive_admin());

drop policy if exists "Admins can delete profiles" on public.profiles;
create policy "Admins can delete profiles"
on public.profiles for delete
to authenticated
using (public.is_drive_admin());

drop policy if exists "Students can view own student record" on public.students;
create policy "Students can view own student record"
on public.students for select
to authenticated
using (auth_user_id = auth.uid() or public.is_drive_admin());

drop policy if exists "Admins can insert students" on public.students;
create policy "Admins can insert students"
on public.students for insert
to authenticated
with check (public.is_drive_admin());

drop policy if exists "Admins can update students" on public.students;
create policy "Admins can update students"
on public.students for update
to authenticated
using (public.is_drive_admin())
with check (public.is_drive_admin());

drop policy if exists "Admins can delete students" on public.students;
create policy "Admins can delete students"
on public.students for delete
to authenticated
using (public.is_drive_admin());

drop policy if exists "Authenticated users can view skill areas" on public.skill_areas;
create policy "Authenticated users can view skill areas"
on public.skill_areas for select
to authenticated
using (true);

drop policy if exists "Admins can manage skill areas" on public.skill_areas;
create policy "Admins can manage skill areas"
on public.skill_areas for all
to authenticated
using (public.is_drive_admin())
with check (public.is_drive_admin());

drop policy if exists "Students can view own lesson skill ratings" on public.lesson_skill_ratings;
create policy "Students can view own lesson skill ratings"
on public.lesson_skill_ratings for select
to authenticated
using (
  public.is_drive_admin()
  or exists (
    select 1
    from public.students
    where public.students.id = lesson_skill_ratings.student_id
      and public.students.auth_user_id = auth.uid()
  )
);

drop policy if exists "Admins can manage lesson skill ratings" on public.lesson_skill_ratings;
create policy "Admins can manage lesson skill ratings"
on public.lesson_skill_ratings for all
to authenticated
using (public.is_drive_admin())
with check (public.is_drive_admin());

drop policy if exists "Students can view own homework tasks" on public.homework_tasks;
create policy "Students can view own homework tasks"
on public.homework_tasks for select
to authenticated
using (
  public.is_drive_admin()
  or exists (
    select 1
    from public.students
    where public.students.id = homework_tasks.student_id
      and public.students.auth_user_id = auth.uid()
  )
);

drop policy if exists "Admins can manage homework tasks" on public.homework_tasks;
create policy "Admins can manage homework tasks"
on public.homework_tasks for all
to authenticated
using (public.is_drive_admin())
with check (public.is_drive_admin());

drop policy if exists "Students can view own lessons" on public.lessons;
create policy "Students can view own lessons"
on public.lessons for select
to authenticated
using (
  public.is_drive_admin()
  or student_id = auth.uid()
  or exists (
    select 1
    from public.students
    where public.students.id = public.lessons.student_record_id
      and public.students.auth_user_id = auth.uid()
  )
);

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.students to authenticated;
grant select, insert, update, delete on public.skill_areas to authenticated;
grant select, insert, update, delete on public.lesson_skill_ratings to authenticated;
grant select, insert, update, delete on public.homework_tasks to authenticated;
