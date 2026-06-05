-- Drive with Niall student payment tracking.
-- Use this table to show learners their paid lesson balance while Stripe handles checkout.

create table if not exists public.student_payment_balances (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null unique references auth.users(id) on delete cascade,
  student_email text,
  stripe_customer_id text,
  purchased_hours numeric not null default 0,
  used_hours numeric not null default 0,
  account_balance_pence integer not null default 0,
  last_payment_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.student_payment_balances add column if not exists student_id uuid references auth.users(id) on delete cascade;
alter table public.student_payment_balances add column if not exists student_email text;
alter table public.student_payment_balances add column if not exists stripe_customer_id text;
alter table public.student_payment_balances add column if not exists purchased_hours numeric not null default 0;
alter table public.student_payment_balances add column if not exists used_hours numeric not null default 0;
alter table public.student_payment_balances add column if not exists account_balance_pence integer not null default 0;
alter table public.student_payment_balances add column if not exists last_payment_at timestamptz;
alter table public.student_payment_balances add column if not exists notes text;
alter table public.student_payment_balances add column if not exists created_at timestamptz not null default now();
alter table public.student_payment_balances add column if not exists updated_at timestamptz not null default now();

alter table public.student_payment_balances enable row level security;

drop policy if exists "Students can view own payment balance" on public.student_payment_balances;
create policy "Students can view own payment balance"
on public.student_payment_balances for select
to authenticated
using (student_id = auth.uid() or public.is_drive_admin());

drop policy if exists "Admins can manage payment balances" on public.student_payment_balances;
create policy "Admins can manage payment balances"
on public.student_payment_balances for all
to authenticated
using (public.is_drive_admin())
with check (public.is_drive_admin());

grant select, insert, update, delete on public.student_payment_balances to authenticated;
