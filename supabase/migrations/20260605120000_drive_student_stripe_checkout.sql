-- Stripe Checkout event ledger for Drive with Niall.
-- Checkout buttons create pending rows. The Stripe webhook marks completed rows
-- and credits the student's lesson balance after Stripe confirms payment.

create table if not exists public.student_payment_events (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users(id) on delete set null,
  student_email text,
  event_type text not null,
  event_status text not null default 'pending',
  plan_key text,
  hours_delta numeric not null default 0,
  amount_pence integer not null default 0,
  currency text not null default 'gbp',
  stripe_customer_id text,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.student_payment_events add column if not exists student_id uuid references auth.users(id) on delete set null;
alter table public.student_payment_events add column if not exists student_email text;
alter table public.student_payment_events add column if not exists event_type text not null default 'checkout_session_created';
alter table public.student_payment_events add column if not exists event_status text not null default 'pending';
alter table public.student_payment_events add column if not exists plan_key text;
alter table public.student_payment_events add column if not exists hours_delta numeric not null default 0;
alter table public.student_payment_events add column if not exists amount_pence integer not null default 0;
alter table public.student_payment_events add column if not exists currency text not null default 'gbp';
alter table public.student_payment_events add column if not exists stripe_customer_id text;
alter table public.student_payment_events add column if not exists stripe_checkout_session_id text;
alter table public.student_payment_events add column if not exists stripe_payment_intent_id text;
alter table public.student_payment_events add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.student_payment_events add column if not exists created_at timestamptz not null default now();
alter table public.student_payment_events add column if not exists updated_at timestamptz not null default now();

drop index if exists public.student_payment_events_checkout_session_id_key;
create unique index student_payment_events_checkout_session_id_key
on public.student_payment_events (stripe_checkout_session_id);

create index if not exists student_payment_events_student_id_idx
on public.student_payment_events (student_id);

alter table public.student_payment_events enable row level security;

drop policy if exists "Students can view own payment events" on public.student_payment_events;
create policy "Students can view own payment events"
on public.student_payment_events for select
to authenticated
using (student_id = auth.uid() or public.is_drive_admin());

drop policy if exists "Admins can manage payment events" on public.student_payment_events;
create policy "Admins can manage payment events"
on public.student_payment_events for all
to authenticated
using (public.is_drive_admin())
with check (public.is_drive_admin());

grant select, insert, update, delete on public.student_payment_events to authenticated;
