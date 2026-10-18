-- Inventory is deducted only when an order is confirmed/being fulfilled or payment is verified.
-- Pending unpaid requests do not consume stock. Cancelled/refunded orders restore stock once.
create table if not exists public.inventory_stock_deductions (
  order_item_id bigint primary key references public.order_items(id) on delete restrict,
  order_id uuid not null references public.orders(id) on delete restrict,
  product_id text not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  variant_name text,
  product_status_before text not null,
  sold_at_before timestamptz,
  deducted_at timestamptz not null default now(),
  restored_at timestamptz
);

alter table public.inventory_stock_deductions enable row level security;

create or replace function public.rs_apply_order_stock(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  v_order public.orders%rowtype;
  v_item public.order_items%rowtype;
  v_product public.products%rowtype;
  v_variant_stock integer;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then return; end if;

  if v_order.status in ('cancelled', 'refunded') or v_order.payment_status = 'refunded' then
    for v_item in
      select oi.* from public.order_items oi
      join public.inventory_stock_deductions d on d.order_item_id = oi.id
      where oi.order_id = p_order_id and d.restored_at is null
      order by oi.id
    loop
      select * into v_product from public.products where id = v_item.product_id for update;
      if not found then raise exception 'Prodotto % non trovato durante il ripristino magazzino', v_item.product_id; end if;

      if v_item.variant_name is not null and btrim(v_item.variant_name) <> '' then
        update public.products p
        set stock = p.stock + v_item.quantity,
            variants = (
              select jsonb_agg(
                case when entry.variant->>'name' = v_item.variant_name
                  then jsonb_set(entry.variant, '{stock}', to_jsonb(coalesce((entry.variant->>'stock')::integer, 0) + v_item.quantity), true)
                  else entry.variant
                end order by entry.ordinality
              )
              from jsonb_array_elements(coalesce(p.variants, '[]'::jsonb)) with ordinality as entry(variant, ordinality)
            ),
            status = case when p.status = 'sold' and p.stock + v_item.quantity > 0
                          then (select d.product_status_before from public.inventory_stock_deductions d where d.order_item_id = v_item.id)
                          else p.status end,
            sold_at = case when p.status = 'sold' and p.stock + v_item.quantity > 0
                           then (select d.sold_at_before from public.inventory_stock_deductions d where d.order_item_id = v_item.id)
                           else p.sold_at end
        where p.id = v_item.product_id
          and exists (select 1 from jsonb_array_elements(coalesce(p.variants, '[]'::jsonb)) x where x->>'name' = v_item.variant_name);
        if not found then raise exception 'Variante % non trovata durante il ripristino', v_item.variant_name; end if;
      else
        update public.products p
        set stock = p.stock + v_item.quantity,
            status = case when p.status = 'sold' and p.stock + v_item.quantity > 0
                          then (select d.product_status_before from public.inventory_stock_deductions d where d.order_item_id = v_item.id)
                          else p.status end,
            sold_at = case when p.status = 'sold' and p.stock + v_item.quantity > 0
                           then (select d.sold_at_before from public.inventory_stock_deductions d where d.order_item_id = v_item.id)
                           else p.sold_at end
        where p.id = v_item.product_id;
      end if;

      update public.inventory_stock_deductions set restored_at = now()
      where order_item_id = v_item.id and restored_at is null;
    end loop;
    return;
  end if;

  if not (v_order.status in ('confirmed', 'processing', 'shipped', 'delivered') or v_order.payment_status = 'paid') then
    return;
  end if;

  for v_item in
    select oi.* from public.order_items oi where oi.order_id = p_order_id order by oi.id
  loop
    select * into v_product from public.products where id = v_item.product_id for update;
    if not found then raise exception 'Prodotto % non trovato', v_item.product_id; end if;

    if exists (select 1 from public.inventory_stock_deductions d where d.order_item_id = v_item.id and d.restored_at is null) then
      continue;
    end if;

    if v_item.variant_name is not null and btrim(v_item.variant_name) <> '' then
      select coalesce((variant->>'stock')::integer, 0)
        into v_variant_stock
      from jsonb_array_elements(coalesce(v_product.variants, '[]'::jsonb)) variant
      where variant->>'name' = v_item.variant_name
      limit 1;
      if not found or v_variant_stock < v_item.quantity then
        raise exception 'Scorta insufficiente per la variante % del prodotto %', v_item.variant_name, v_item.product_id;
      end if;
      if v_product.stock < v_item.quantity or v_product.status <> 'published' then
        raise exception 'Scorta insufficiente o prodotto non disponibile: %', v_item.product_id;
      end if;

      update public.products p
      set stock = p.stock - v_item.quantity,
          variants = (
            select jsonb_agg(
              case when entry.variant->>'name' = v_item.variant_name
                then jsonb_set(entry.variant, '{stock}', to_jsonb(((entry.variant->>'stock')::integer) - v_item.quantity), true)
                else entry.variant
              end order by entry.ordinality
            )
            from jsonb_array_elements(coalesce(p.variants, '[]'::jsonb)) with ordinality as entry(variant, ordinality)
          )
      where p.id = v_item.product_id;
    else
      update public.products
      set stock = stock - v_item.quantity
      where id = v_item.product_id and stock >= v_item.quantity and status = 'published';
      if not found then raise exception 'Scorta insufficiente o prodotto non disponibile: %', v_item.product_id; end if;
    end if;

    insert into public.inventory_stock_deductions
      (order_item_id, order_id, product_id, quantity, variant_name, product_status_before, sold_at_before)
    values
      (v_item.id, p_order_id, v_item.product_id, v_item.quantity, nullif(v_item.variant_name, ''), v_product.status, v_product.sold_at)
    on conflict (order_item_id) do update set
      deducted_at = now(), restored_at = null,
      quantity = excluded.quantity, variant_name = excluded.variant_name,
      product_status_before = excluded.product_status_before, sold_at_before = excluded.sold_at_before;
  end loop;
end;
$function$;

create or replace function public.rs_order_item_stock_sync()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
begin
  perform public.rs_apply_order_stock(new.order_id);
  return new;
end;
$function$;

create or replace function public.rs_order_stock_sync()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
begin
  if new.status is distinct from old.status or new.payment_status is distinct from old.payment_status then
    perform public.rs_apply_order_stock(new.id);
  end if;
  return new;
end;
$function$;

drop trigger if exists trg_decrement_product_stock_on_order_item on public.order_items;
drop trigger if exists trg_rs_order_item_stock_sync on public.order_items;
create trigger trg_rs_order_item_stock_sync
after insert on public.order_items
for each row execute function public.rs_order_item_stock_sync();

drop trigger if exists trg_rs_order_stock_sync on public.orders;
create trigger trg_rs_order_stock_sync
after update of status, payment_status on public.orders
for each row execute function public.rs_order_stock_sync();
