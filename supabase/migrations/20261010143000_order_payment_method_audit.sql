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
