alter table public.orders
  add column if not exists payment_method text,
  add column if not exists payment_reference text,
  add column if not exists payment_selected_at timestamptz,
  add column if not exists payment_verified_at timestamptz,
  add column if not exists payment_verified_by uuid,
  add column if not exists payment_verification_note text;

alter table public.orders
  drop constraint if exists orders_payment_method_check;

alter table public.orders
  add constraint orders_payment_method_check
  check (payment_method is null or payment_method in ('cash_on_delivery', 'bank_transfer'));

create table if not exists public.rs_payment_verification_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  actor_user_id uuid not null,
  action text not null check (action in ('payment_method_selected', 'payment_verified', 'payment_verification_rejected')),
  payment_method text not null check (payment_method in ('cash_on_delivery', 'bank_transfer')),
  amount numeric(12,2),
  currency text not null default 'EUR',
  reference text,
  note text,
  created_at timestamptz not null default now()
);

alter table public.rs_payment_verification_events enable row level security;

comment on table public.rs_payment_verification_events is
  'Server-written audit trail for payment method selection and manual payment verification. No direct client policies.';
