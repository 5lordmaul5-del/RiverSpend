-- RiverPay foundation: internal records only; payment processing remains with a regulated provider.
create table if not exists public.riverpay_transactions (
  id uuid primary key default gen_random_uuid(),
  order_id text not null,
  provider text not null default 'unconfigured',
  provider_payment_id text,
  status text not null default 'pending' check (status in ('pending','authorized','paid','failed','refunded','disputed','cancelled')),
  currency char(3) not null default 'EUR',
  amount_minor bigint not null check (amount_minor > 0),
  fee_minor bigint not null default 0 check (fee_minor >= 0),
  seller_reference text,
  idempotency_key text not null unique,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists riverpay_provider_payment_unique
  on public.riverpay_transactions(provider, provider_payment_id)
  where provider_payment_id is not null;
create index if not exists riverpay_order_idx on public.riverpay_transactions(order_id);
create index if not exists riverpay_status_created_idx on public.riverpay_transactions(status, created_at desc);

create table if not exists public.riverpay_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  transaction_id uuid references public.riverpay_transactions(id) on delete restrict,
  event_type text not null,
  processed_at timestamptz,
  received_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb,
  unique(provider, provider_event_id)
);

-- Both tables are server-side only. Never expose them via client-side direct access.
alter table public.riverpay_transactions enable row level security;
alter table public.riverpay_events enable row level security;
revoke all on public.riverpay_transactions from anon, authenticated;
revoke all on public.riverpay_events from anon, authenticated;
