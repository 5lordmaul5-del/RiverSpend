-- RiverPay Global: provider-neutral payout orchestration and settlement audit.
-- No bank account numbers, card data, or provider secrets are stored here.

create table if not exists public.rs_financial_payouts (
  id uuid primary key default gen_random_uuid(),
  payout_kind text not null check (payout_kind in ('seller','carrier','platform_settlement')),
  beneficiary_user_id uuid null references auth.users(id) on delete restrict,
  beneficiary_label text not null,
  order_reference text null,
  source_allocation_id uuid null references public.rs_treasury_allocations(id) on delete restrict,
  provider_code text null,
  provider_account_ref text null,
  provider_payout_id text null,
  amount numeric(18,2) not null check (amount > 0),
  currency text not null default 'EUR' check (currency ~ '^[A-Z]{3}$'),
  status text not null default 'pending_release'
    check (status in ('pending_release','eligible','submitted','paid','held','failed','cancelled','reversed')),
  schedule_code text not null default 'provider_default'
    check (schedule_code in ('provider_default','weekly','monthly','manual')),
  eligible_at timestamptz null,
  fulfilment_confirmed_at timestamptz null,
  submitted_at timestamptz null,
  paid_at timestamptz null,
  idempotency_key text not null unique,
  failure_code text null,
  notes text null,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rs_financial_payout_paid_timestamp check (status <> 'paid' or paid_at is not null),
  constraint rs_financial_payout_carrier_fulfilment check (
    payout_kind <> 'carrier' or status not in ('eligible','submitted','paid') or fulfilment_confirmed_at is not null
  )
);

create unique index if not exists rs_financial_payout_provider_ref_uidx
  on public.rs_financial_payouts(provider_code, provider_payout_id)
  where provider_payout_id is not null;
create index if not exists rs_financial_payout_status_created_idx
  on public.rs_financial_payouts(status, created_at desc);
create index if not exists rs_financial_payout_beneficiary_idx
  on public.rs_financial_payouts(beneficiary_user_id, created_at desc);
create index if not exists rs_financial_payout_order_idx
  on public.rs_financial_payouts(order_reference);

create table if not exists public.rs_financial_settlement_batches (
  id uuid primary key default gen_random_uuid(),
  settlement_kind text not null check (settlement_kind in ('seller','carrier','platform_settlement')),
  provider_code text null,
  period_start date not null,
  period_end date not null,
  currency text not null default 'EUR' check (currency ~ '^[A-Z]{3}$'),
  total_amount numeric(18,2) not null default 0 check (total_amount >= 0),
  payout_count integer not null default 0 check (payout_count >= 0),
  status text not null default 'draft'
    check (status in ('draft','ready','submitted','paid','partially_paid','failed','cancelled')),
  provider_batch_ref text null,
  idempotency_key text not null unique,
  submitted_at timestamptz null,
  settled_at timestamptz null,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rs_financial_batch_period_check check (period_end >= period_start)
);

create unique index if not exists rs_financial_batch_provider_ref_uidx
  on public.rs_financial_settlement_batches(provider_code, provider_batch_ref)
  where provider_batch_ref is not null;
create index if not exists rs_financial_batch_status_period_idx
  on public.rs_financial_settlement_batches(status, period_end desc);

create table if not exists public.rs_financial_payout_events (
  id uuid primary key default gen_random_uuid(),
  payout_id uuid not null references public.rs_financial_payouts(id) on delete restrict,
  provider_code text null,
  provider_event_id text null,
  event_type text not null,
  previous_status text null,
  new_status text null,
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(provider_code, provider_event_id)
);

create index if not exists rs_financial_payout_events_payout_idx
  on public.rs_financial_payout_events(payout_id, created_at desc);

alter table public.rs_financial_payouts enable row level security;
alter table public.rs_financial_settlement_batches enable row level security;
alter table public.rs_financial_payout_events enable row level security;

drop policy if exists rs_financial_payouts_admin_select on public.rs_financial_payouts;
create policy rs_financial_payouts_admin_select on public.rs_financial_payouts
  for select to authenticated
  using (exists (select 1 from public.rs_admin_roles r where r.user_id = (select auth.uid()) and r.role = 'admin'));

drop policy if exists rs_financial_payouts_admin_insert on public.rs_financial_payouts;
create policy rs_financial_payouts_admin_insert on public.rs_financial_payouts
  for insert to authenticated
  with check (exists (select 1 from public.rs_admin_roles r where r.user_id = (select auth.uid()) and r.role = 'admin'));

drop policy if exists rs_financial_payouts_admin_update on public.rs_financial_payouts;
create policy rs_financial_payouts_admin_update on public.rs_financial_payouts
  for update to authenticated
  using (exists (select 1 from public.rs_admin_roles r where r.user_id = (select auth.uid()) and r.role = 'admin'))
  with check (exists (select 1 from public.rs_admin_roles r where r.user_id = (select auth.uid()) and r.role = 'admin'));

drop policy if exists rs_financial_batches_admin_select on public.rs_financial_settlement_batches;
create policy rs_financial_batches_admin_select on public.rs_financial_settlement_batches
  for select to authenticated
  using (exists (select 1 from public.rs_admin_roles r where r.user_id = (select auth.uid()) and r.role = 'admin'));

drop policy if exists rs_financial_batches_admin_insert on public.rs_financial_settlement_batches;
create policy rs_financial_batches_admin_insert on public.rs_financial_settlement_batches
  for insert to authenticated
  with check (exists (select 1 from public.rs_admin_roles r where r.user_id = (select auth.uid()) and r.role = 'admin'));

drop policy if exists rs_financial_batches_admin_update on public.rs_financial_settlement_batches;
create policy rs_financial_batches_admin_update on public.rs_financial_settlement_batches
  for update to authenticated
  using (exists (select 1 from public.rs_admin_roles r where r.user_id = (select auth.uid()) and r.role = 'admin'))
  with check (exists (select 1 from public.rs_admin_roles r where r.user_id = (select auth.uid()) and r.role = 'admin'));

drop policy if exists rs_financial_payout_events_admin_select on public.rs_financial_payout_events;
create policy rs_financial_payout_events_admin_select on public.rs_financial_payout_events
  for select to authenticated
  using (exists (select 1 from public.rs_admin_roles r where r.user_id = (select auth.uid()) and r.role = 'admin'));

drop policy if exists rs_financial_payout_events_admin_insert on public.rs_financial_payout_events;
create policy rs_financial_payout_events_admin_insert on public.rs_financial_payout_events
  for insert to authenticated
  with check (exists (select 1 from public.rs_admin_roles r where r.user_id = (select auth.uid()) and r.role = 'admin'));

revoke all on public.rs_financial_payouts from anon;
revoke all on public.rs_financial_settlement_batches from anon;
revoke all on public.rs_financial_payout_events from anon;
grant select, insert, update on public.rs_financial_payouts to authenticated;
grant select, insert, update on public.rs_financial_settlement_batches to authenticated;
grant select, insert on public.rs_financial_payout_events to authenticated;
grant all on public.rs_financial_payouts to service_role;
grant all on public.rs_financial_settlement_batches to service_role;
grant all on public.rs_financial_payout_events to service_role;

revoke execute on function public.rs_create_treasury_allocation(text,text,numeric,text,uuid,text) from public, anon, authenticated;
grant execute on function public.rs_create_treasury_allocation(text,text,numeric,text,uuid,text) to service_role;
