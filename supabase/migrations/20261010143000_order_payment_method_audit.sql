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

-- A bank reference used to verify a real transfer must not be assigned to two orders.
create unique index if not exists rs_payment_verified_reference_unique
  on public.rs_payment_verification_events (lower(btrim(reference)))
  where action = 'payment_verified' and reference is not null and btrim(reference) <> '';

create or replace function public.rs_select_order_payment_method(
  p_order_id uuid,
  p_actor_user_id uuid,
  p_payment_method text
)
returns table(order_id uuid, payment_method text, payment_reference text, payment_status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_reference text;
begin
  if p_actor_user_id is null then
    raise exception 'Sessione RiverSpend non valida';
  end if;
  if p_payment_method not in ('cash_on_delivery', 'bank_transfer') then
    raise exception 'Metodo di pagamento non supportato';
  end if;

  select * into v_order
  from public.orders
  where id = p_order_id and buyer_id = p_actor_user_id
  for update;

  if not found then
    raise exception 'Ordine non trovato per questo account';
  end if;
  if v_order.status is distinct from 'pending'
     or lower(coalesce(v_order.payment_status, '')) not in ('unpaid', 'pending') then
    raise exception 'Il metodo può essere scelto solo per un ordine in attesa e non pagato';
  end if;

  v_reference := case when p_payment_method = 'bank_transfer' then v_order.id::text else null end;

  update public.orders
  set payment_method = p_payment_method,
      payment_reference = v_reference,
      payment_selected_at = now(),
      payment_status = 'unpaid',
      updated_at = now()
  where id = v_order.id;

  insert into public.rs_payment_verification_events (
    order_id, actor_user_id, action, payment_method, amount, currency, reference
  ) values (
    v_order.id, p_actor_user_id, 'payment_method_selected', p_payment_method,
    coalesce(v_order.total, 0), coalesce(v_order.currency, 'EUR'), v_reference
  );

  return query select v_order.id, p_payment_method, v_reference, 'unpaid'::text;
end;
$$;

revoke all on function public.rs_select_order_payment_method(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.rs_select_order_payment_method(uuid, uuid, text) to service_role;

create or replace function public.rs_verify_bank_transfer(
  p_order_id uuid,
  p_actor_user_id uuid,
  p_confirmed_amount numeric,
  p_confirmed_currency text,
  p_bank_reference text,
  p_note text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
begin
  if p_actor_user_id is null or nullif(trim(p_bank_reference), '') is null or nullif(trim(p_note), '') is null then
    raise exception 'Dati di verifica obbligatori mancanti';
  end if;

  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Ordine non trovato';
  end if;

  if v_order.payment_method is distinct from 'bank_transfer'
     or v_order.status is distinct from 'pending'
     or v_order.payment_status is distinct from 'unpaid' then
    raise exception 'Ordine non in attesa di un bonifico non pagato';
  end if;

  if upper(coalesce(v_order.currency, 'EUR')) <> upper(coalesce(p_confirmed_currency, '')) then
    raise exception 'La valuta non coincide con quella dell’ordine';
  end if;

  if p_confirmed_amount is null or p_confirmed_amount <= 0
     or round(p_confirmed_amount, 2) <> round(coalesce(v_order.total, 0), 2) then
    raise exception 'L’importo accreditato non coincide con il totale dell’ordine';
  end if;

  if exists (
    select 1
    from public.rs_payment_verification_events e
    where e.action = 'payment_verified'
      and e.reference is not null
      and lower(btrim(e.reference)) = lower(btrim(p_bank_reference))
  ) then
    raise exception 'Questo riferimento bancario è già stato associato a un pagamento verificato';
  end if;

  update public.orders
  set payment_status = 'paid',
      status = 'confirmed',
      payment_verified_at = now(),
      payment_verified_by = p_actor_user_id,
      payment_verification_note = trim(p_note),
      updated_at = now()
  where id = p_order_id;

  insert into public.rs_payment_verification_events (
    order_id, actor_user_id, action, payment_method, amount, currency, reference, note
  ) values (
    p_order_id, p_actor_user_id, 'payment_verified', 'bank_transfer',
    p_confirmed_amount, upper(coalesce(v_order.currency, 'EUR')),
    trim(p_bank_reference), trim(p_note)
  );

  return p_order_id;
end;
$$;

revoke all on function public.rs_verify_bank_transfer(uuid, uuid, numeric, text, text, text) from public, anon, authenticated;
grant execute on function public.rs_verify_bank_transfer(uuid, uuid, numeric, text, text, text) to service_role;
