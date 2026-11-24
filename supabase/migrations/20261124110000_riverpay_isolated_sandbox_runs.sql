create table if not exists public.rs_pay_sandbox_runs (
 id uuid primary key default gen_random_uuid(),
 created_by uuid not null references auth.users(id) on delete restrict,
 item_subtotal numeric(18,2) not null check(item_subtotal>0),
 shipping_total numeric(18,2) not null default 0 check(shipping_total>=0),
 seller_percent numeric(5,2) not null check(seller_percent>=0 and seller_percent<=100),
 river_percent numeric(5,2) not null check(river_percent>=0 and river_percent<=100),
 reserve_percent numeric(5,2) not null check(reserve_percent>=0 and reserve_percent<=100),
 seller_amount numeric(18,2) not null,
 river_amount numeric(18,2) not null,
 reserve_amount numeric(18,2) not null,
 gross_amount numeric(18,2) not null,
 currency text not null default 'EUR',
 label text not null default 'SIMULAZIONE TEST',
 created_at timestamptz not null default now(),
 check(abs(seller_percent+river_percent+reserve_percent-100)<0.01)
);
alter table public.rs_pay_sandbox_runs enable row level security;
drop policy if exists rs_pay_sandbox_admin_read on public.rs_pay_sandbox_runs;
create policy rs_pay_sandbox_admin_read on public.rs_pay_sandbox_runs for select to authenticated using (exists(select 1 from public.rs_admin_roles r where r.user_id=(select auth.uid()) and r.role='admin'));
revoke all on public.rs_pay_sandbox_runs from anon,authenticated;
grant select on public.rs_pay_sandbox_runs to authenticated;
grant all on public.rs_pay_sandbox_runs to service_role;