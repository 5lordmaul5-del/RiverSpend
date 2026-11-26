-- RiverPay service payment intents and PiggyBank goals (draft, not applied).
-- Real funds are only recognized after a trusted provider webhook/settlement flow.
create table if not exists public.riverpay_service_intents (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null,
 service_code text not null check(service_code in ('signals','streaming','zen','fidelity','piggybank','other')),
 item_code text not null,
 amount_minor bigint not null check(amount_minor > 0),
 currency char(3) not null default 'EUR',
 status text not null default 'pending' check(status in ('pending','paid','failed','cancelled','refunded')),
 idempotency_key text not null unique,
 provider text,
 provider_payment_id text,
 metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists riverpay_service_user_idx on public.riverpay_service_intents(user_id,created_at desc);
create table if not exists public.riverpay_piggybank_goals (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null,
 goal_name text not null,
 target_minor bigint not null check(target_minor > 0),
 currency char(3) not null default 'EUR',
 status text not null default 'active' check(status in ('active','completed','cancelled')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists riverpay_piggybank_user_idx on public.riverpay_piggybank_goals(user_id,created_at desc);
create table if not exists public.riverpay_piggybank_contributions (
 id uuid primary key default gen_random_uuid(),
 goal_id uuid not null references public.riverpay_piggybank_goals(id) on delete restrict,
 user_id uuid not null,
 service_intent_id uuid references public.riverpay_service_intents(id) on delete restrict,
 amount_minor bigint not null check(amount_minor > 0),
 currency char(3) not null default 'EUR',
 status text not null default 'pending' check(status in ('pending','confirmed','failed','refunded')),
 created_at timestamptz not null default now(),
 confirmed_at timestamptz
);
create index if not exists riverpay_piggybank_contrib_idx on public.riverpay_piggybank_contributions(goal_id,created_at desc);
alter table public.riverpay_service_intents enable row level security;
alter table public.riverpay_piggybank_goals enable row level security;
alter table public.riverpay_piggybank_contributions enable row level security;
revoke all on public.riverpay_service_intents from anon,authenticated;
revoke all on public.riverpay_piggybank_goals from anon,authenticated;
revoke all on public.riverpay_piggybank_contributions from anon,authenticated;
