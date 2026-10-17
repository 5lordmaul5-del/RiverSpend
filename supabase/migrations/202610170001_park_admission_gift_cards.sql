-- RiverSpend Park admission gift cards (separate from monetary RiverSpendShop gift cards).
-- Draft migration: review and apply to the intended Supabase environment before use.
create table if not exists public.rs_park_gift_products (
  code text primary key,
  name text not null,
  audience text not null check (audience in ('adult','child','mixed','family','multi_adult','multi_child')),
  admission_count integer not null check (admission_count > 0),
  adult_count integer not null default 0 check (adult_count >= 0),
  child_count integer not null default 0 check (child_count >= 0),
  price_cents integer not null check (price_cents > 0),
  list_price_cents integer not null check (list_price_cents >= price_cents),
  validity_months integer not null default 12 check (validity_months between 1 and 36),
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (adult_count + child_count = admission_count or audience in ('multi_adult','multi_child'))
);

create table if not exists public.rs_park_gift_cards (
  id uuid primary key default gen_random_uuid(),
  public_code text not null unique,
  secret_hash text not null,
  product_code text not null references public.rs_park_gift_products(code),
  purchaser_id uuid references auth.users(id),
  recipient_email text,
  admission_count integer not null check (admission_count > 0),
  remaining_admissions integer not null check (remaining_admissions >= 0 and remaining_admissions <= admission_count),
  status text not null default 'pending_payment' check (status in ('pending_payment','active','blocked','exhausted','expired','refunded')),
  order_id uuid references public.orders(id),
  purchased_at timestamptz,
  activated_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rs_park_gift_redemptions (
  id uuid primary key default gen_random_uuid(),
  gift_card_id uuid not null references public.rs_park_gift_cards(id),
  admissions_used integer not null default 1 check (admissions_used > 0),
  idempotency_key text not null unique,
  redeemed_by uuid references auth.users(id),
  redeemed_at timestamptz not null default now(),
  note text
);

create index if not exists rs_park_gift_cards_status_expires_idx
  on public.rs_park_gift_cards(status, expires_at);
create index if not exists rs_park_gift_redemptions_card_idx
  on public.rs_park_gift_redemptions(gift_card_id, redeemed_at);

alter table public.rs_park_gift_products enable row level security;
alter table public.rs_park_gift_cards enable row level security;
alter table public.rs_park_gift_redemptions enable row level security;

-- No direct client write policies: issuance and redemption must go through trusted server-side code.
drop policy if exists "Public can read active Park gift products" on public.rs_park_gift_products;
create policy "Public can read active Park gift products"
  on public.rs_park_gift_products for select
  using (active = true);

-- Prices are seeded as inactive: this creates a catalog draft, not a live offer.
insert into public.rs_park_gift_products
(code,name,audience,admission_count,adult_count,child_count,price_cents,list_price_cents,validity_months,active)
values
('PARK-SINGLE-ADULT','Gift Single Adulto','adult',1,1,0,3000,3000,12,false),
('PARK-SINGLE-CHILD','Gift Single Bambino','child',1,0,1,2000,2000,12,false),
('PARK-DUO-ADULT','Gift Duo Adulti','mixed',2,2,0,5400,6000,12,false),
('PARK-DUO-MIXED','Gift Duo Mista','mixed',2,1,1,4500,5000,12,false),
('PARK-FAMILY-3','Gift Family 3','family',3,2,1,7200,8000,12,false),
('PARK-FAMILY-4','Gift Family 4','family',4,2,2,9000,10000,12,false),
('PARK-FAMILY-5','Gift Family 5','family',5,2,3,10800,12000,12,false),
('PARK-FAMILY-6','Gift Family 6','family',6,2,4,12600,14000,12,false),
('PARK-10-ADULT','Gift 10 ingressi adulti','multi_adult',10,0,0,25500,30000,12,false),
('PARK-10-CHILD','Gift 10 ingressi bambini','multi_child',10,0,0,17000,20000,12,false),
('PARK-20-ADULT','Gift 20 ingressi adulti','multi_adult',20,0,0,51000,60000,12,false),
('PARK-20-CHILD','Gift 20 ingressi bambini','multi_child',20,0,0,34000,40000,12,false)
on conflict (code) do nothing;

-- Atomic redemption: callers must be trusted server-side code using the service role.
create or replace function public.redeem_rs_park_gift_card(
  p_public_code text,
  p_secret_hash text,
  p_admissions_used integer default 1,
  p_idempotency_key text default null,
  p_redeemed_by uuid default null,
  p_note text default null
)
returns table(ok boolean, result_code text, remaining integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_card public.rs_park_gift_cards%rowtype;
begin
  if p_admissions_used is null or p_admissions_used < 1
     or p_idempotency_key is null or length(trim(p_idempotency_key)) < 8 then
    return query select false, 'invalid_request'::text, null::integer;
    return;
  end if;

  select * into v_card
  from public.rs_park_gift_cards
  where public_code = p_public_code
  for update;

  if not found or v_card.secret_hash <> p_secret_hash then
    return query select false, 'invalid_card'::text, null::integer;
    return;
  end if;

  if exists(select 1 from public.rs_park_gift_redemptions r where r.idempotency_key = p_idempotency_key) then
    return query select false, 'already_processed'::text, v_card.remaining_admissions;
    return;
  end if;

  if v_card.status = 'blocked' then
    return query select false, 'blocked'::text, v_card.remaining_admissions;
    return;
  elsif v_card.status = 'expired' or (v_card.expires_at is not null and v_card.expires_at <= now()) then
    update public.rs_park_gift_cards set status = 'expired', updated_at = now() where id = v_card.id;
    return query select false, 'expired'::text, v_card.remaining_admissions;
    return;
  elsif v_card.status <> 'active' then
    return query select false, v_card.status::text, v_card.remaining_admissions;
    return;
  elsif v_card.remaining_admissions < p_admissions_used then
    return query select false, 'insufficient_admissions'::text, v_card.remaining_admissions;
    return;
  end if;

  update public.rs_park_gift_cards
  set remaining_admissions = remaining_admissions - p_admissions_used,
      status = case when remaining_admissions - p_admissions_used = 0 then 'exhausted' else 'active' end,
      updated_at = now()
  where id = v_card.id
  returning * into v_card;

  insert into public.rs_park_gift_redemptions
    (gift_card_id, admissions_used, idempotency_key, redeemed_by, note)
  values
    (v_card.id, p_admissions_used, p_idempotency_key, p_redeemed_by, p_note);

  return query select true, 'redeemed'::text, v_card.remaining_admissions;
end;
$$;

revoke all on function public.redeem_rs_park_gift_card(text,text,integer,text,uuid,text) from public, anon, authenticated;
grant execute on function public.redeem_rs_park_gift_card(text,text,integer,text,uuid,text) to service_role;
