create or replace function public.rs_admin_shop_customers()
returns table (
  user_id uuid,
  email text,
  display_name text,
  seller_type text,
  registered_at timestamptz,
  last_sign_in_at timestamptz,
  order_count bigint,
  paid_order_count bigint,
  total_spent numeric,
  last_order_at timestamptz,
  net_items_count bigint,
  product_views bigint,
  searches bigint
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not exists (
    select 1 from public.rs_admin_roles r
    where r.user_id = auth.uid() and r.role = 'admin'
  ) then
    raise exception 'Not authorized';
  end if;

  return query
  select
    u.id,
    u.email::text,
    coalesce(p.display_name, u.raw_user_meta_data->>'display_name', u.raw_user_meta_data->>'full_name')::text,
    coalesce(p.seller_type, 'Privato')::text,
    u.created_at,
    u.last_sign_in_at,
    coalesce(o.order_count, 0)::bigint,
    coalesce(o.paid_order_count, 0)::bigint,
    coalesce(o.total_spent, 0)::numeric,
    o.last_order_at,
    coalesce(n.net_items_count, 0)::bigint,
    coalesce(a.product_views, 0)::bigint,
    coalesce(a.searches, 0)::bigint
  from auth.users u
  left join public.profiles p on p.id = u.id
  left join lateral (
    select count(*) as order_count,
           count(*) filter (where ord.payment_status = 'paid') as paid_order_count,
           coalesce(sum(ord.total) filter (where ord.payment_status = 'paid'), 0) as total_spent,
           max(ord.created_at) as last_order_at
    from public.orders ord where ord.buyer_id = u.id
  ) o on true
  left join lateral (
    select count(*) as net_items_count from public.river_net_items ni where ni.user_id = u.id
  ) n on true
  left join lateral (
    select count(*) filter (where ev.event_type = 'product_view') as product_views,
           count(*) filter (where ev.event_type = 'search') as searches
    from public.rs_analytics_events ev where ev.user_id = u.id
  ) a on true
  where coalesce(u.is_anonymous, false) = false
  order by u.created_at desc limit 500;
end;
$$;
revoke all on function public.rs_admin_shop_customers() from public, anon;
grant execute on function public.rs_admin_shop_customers() to authenticated;
