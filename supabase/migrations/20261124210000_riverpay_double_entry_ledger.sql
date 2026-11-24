-- RiverPay internal double-entry accounting foundation (no custody or transfer of funds).
create table if not exists public.riverpay_ledger_accounts (
 id uuid primary key default gen_random_uuid(),
 account_code text not null unique,
 account_name text not null,
 account_type text not null check(account_type in ('asset','liability','equity','revenue','expense')),
 currency char(3) not null default 'EUR',
 owner_reference text,
 created_at timestamptz not null default now()
);
create table if not exists public.riverpay_journals (
 id uuid primary key default gen_random_uuid(),
 transaction_id uuid references public.riverpay_transactions(id) on delete restrict,
 external_reference text,
 description text not null,
 status text not null default 'posted' check(status in ('draft','posted','void')),
 created_at timestamptz not null default now(),
 posted_at timestamptz
);
create table if not exists public.riverpay_ledger_entries (
 id uuid primary key default gen_random_uuid(),
 journal_id uuid not null references public.riverpay_journals(id) on delete restrict,
 account_id uuid not null references public.riverpay_ledger_accounts(id) on delete restrict,
 direction text not null check(direction in ('debit','credit')),
 amount_minor bigint not null check(amount_minor > 0),
 currency char(3) not null,
 memo text,
 created_at timestamptz not null default now()
);
create index if not exists riverpay_entries_journal_idx on public.riverpay_ledger_entries(journal_id);
create index if not exists riverpay_entries_account_idx on public.riverpay_ledger_entries(account_id,created_at desc);
alter table public.riverpay_ledger_accounts enable row level security;
alter table public.riverpay_journals enable row level security;
alter table public.riverpay_ledger_entries enable row level security;
revoke all on public.riverpay_ledger_accounts from anon,authenticated;
revoke all on public.riverpay_journals from anon,authenticated;
revoke all on public.riverpay_ledger_entries from anon,authenticated;
-- Posting must be performed by a trusted server/database function that validates debit-credit balance per currency.
