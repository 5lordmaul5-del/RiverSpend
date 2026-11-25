-- Service entitlements activated only by trusted provider webhook.
create table if not exists public.riverpay_service_entitlements (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null,
 service_code text not null,
 item_code text not null,
 service_intent_id uuid not null unique references public.riverpay_service_intents(id) on delete restrict,
 status text not null default 'active' check(status in ('active','cancelled','expired','refunded')),
 activated_at timestamptz not null default now(),
 expires_at timestamptz,
 metadata jsonb not null default '{}'::jsonb
);
alter table public.riverpay_service_entitlements enable row level security;
revoke all on public.riverpay_service_entitlements from anon,authenticated;
