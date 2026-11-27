-- RS Scratch prototype schema (PostgreSQL draft; NOT deployed)
-- Campaign / claim / award records and append-only ledger. Review and adapt before production.

create table if not exists rs_scratch_campaigns (
  id uuid primary key,
  name text not null,
  active boolean not null default false,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  max_claims_per_user integer not null check (max_claims_per_user > 0),
  terms_version text not null,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table if not exists rs_scratch_claims (
  id uuid primary key,
  campaign_id uuid not null references rs_scratch_campaigns(id),
  user_id uuid not null,
  idempotency_key text not null,
  status text not null check (status in ('CREATED','ISSUED','REVEALED','AWARD_ISSUED','NO_AWARD','REJECTED')),
  created_at timestamptz not null default now(),
  revealed_at timestamptz,
  unique (campaign_id, user_id, idempotency_key)
);
create index if not exists rs_scratch_claims_user_campaign on rs_scratch_claims(user_id, campaign_id);

create table if not exists rs_scratch_awards (
  id uuid primary key,
  claim_id uuid not null unique references rs_scratch_claims(id),
  user_id uuid not null,
  reward_code text not null,
  status text not null check (status in ('ISSUED','REDEEMED','EXPIRED','VOIDED')),
  issued_at timestamptz not null default now(),
  expires_at timestamptz,
  redeemed_at timestamptz
);

create table if not exists rs_scratch_ledger (
  id bigint generated always as identity primary key,
  event_id uuid not null unique,
  claim_id uuid references rs_scratch_claims(id),
  award_id uuid references rs_scratch_awards(id),
  user_id uuid not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
-- Ledger rows should be append-only: enforce permissions in production, not merely application convention.

-- Atomic claim issuance (illustrative transaction outline):
-- 1) lock campaign row (SELECT ... FOR UPDATE)
-- 2) validate active/date window and per-user cap
-- 3) insert claim; unique idempotency constraint rejects duplicate requests
-- 4) append ledger event; commit
-- Award redemption must likewise lock award row, verify status/expiry, and commit
-- redemption + ledger event atomically.
