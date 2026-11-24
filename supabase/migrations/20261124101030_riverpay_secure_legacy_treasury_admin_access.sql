drop policy if exists rs_treasury_accounts_admin_read on public.rs_treasury_accounts;
create policy rs_treasury_accounts_admin_read on public.rs_treasury_accounts
for select to authenticated
using (exists (select 1 from public.rs_admin_roles r where r.user_id = (select auth.uid()) and r.role='admin'));

drop policy if exists rs_treasury_rules_admin_read on public.rs_treasury_allocation_rules;
create policy rs_treasury_rules_admin_read on public.rs_treasury_allocation_rules
for select to authenticated
using (exists (select 1 from public.rs_admin_roles r where r.user_id = (select auth.uid()) and r.role='admin'));

drop policy if exists rs_treasury_rules_admin_insert on public.rs_treasury_allocation_rules;
create policy rs_treasury_rules_admin_insert on public.rs_treasury_allocation_rules
for insert to authenticated
with check (exists (select 1 from public.rs_admin_roles r where r.user_id = (select auth.uid()) and r.role='admin'));

drop policy if exists rs_treasury_rules_admin_update on public.rs_treasury_allocation_rules;
create policy rs_treasury_rules_admin_update on public.rs_treasury_allocation_rules
for update to authenticated
using (exists (select 1 from public.rs_admin_roles r where r.user_id = (select auth.uid()) and r.role='admin'))
with check (exists (select 1 from public.rs_admin_roles r where r.user_id = (select auth.uid()) and r.role='admin'));

drop policy if exists rs_treasury_allocations_admin_read on public.rs_treasury_allocations;
create policy rs_treasury_allocations_admin_read on public.rs_treasury_allocations
for select to authenticated
using (exists (select 1 from public.rs_admin_roles r where r.user_id = (select auth.uid()) and r.role='admin'));

drop policy if exists rs_treasury_movements_admin_read on public.rs_treasury_movements;
create policy rs_treasury_movements_admin_read on public.rs_treasury_movements
for select to authenticated
using (exists (select 1 from public.rs_admin_roles r where r.user_id = (select auth.uid()) and r.role='admin'));

grant select on public.rs_treasury_accounts to authenticated;
grant select, insert, update on public.rs_treasury_allocation_rules to authenticated;
grant select on public.rs_treasury_allocations to authenticated;
grant select on public.rs_treasury_movements to authenticated;
revoke all on public.rs_treasury_accounts from anon;
revoke all on public.rs_treasury_allocation_rules from anon;
revoke all on public.rs_treasury_allocations from anon;
revoke all on public.rs_treasury_movements from anon;
