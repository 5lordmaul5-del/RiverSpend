-- Reviewer access to the product queue and explicit document verification.
create policy "products_admin_review_select" on public.products for select to authenticated
using (exists(select 1 from public.rs_admin_roles a where a.user_id=(select auth.uid())));
create policy "products_admin_review_update" on public.products for update to authenticated
using (exists(select 1 from public.rs_admin_roles a where a.user_id=(select auth.uid())))
with check (exists(select 1 from public.rs_admin_roles a where a.user_id=(select auth.uid())));

create policy "product_compliance_admin_insert" on public.product_compliance_profiles for insert to authenticated
with check (exists(select 1 from public.rs_admin_roles a where a.user_id=(select auth.uid())));
create policy "product_compliance_admin_delete" on public.product_compliance_profiles for delete to authenticated
using (exists(select 1 from public.rs_admin_roles a where a.user_id=(select auth.uid())));

create policy "compliance_docs_admin_delete" on public.product_compliance_documents for delete to authenticated
using (exists(select 1 from public.rs_admin_roles a where a.user_id=(select auth.uid())));

create policy "supply_events_admin_select" on public.product_supply_chain_events for select to authenticated
using (exists(select 1 from public.rs_admin_roles a where a.user_id=(select auth.uid())));

create policy "quality_checks_admin_select" on public.product_quality_checks for select to authenticated
using (exists(select 1 from public.rs_admin_roles a where a.user_id=(select auth.uid())));
create policy "quality_checks_admin_insert" on public.product_quality_checks for insert to authenticated
with check (exists(select 1 from public.rs_admin_roles a where a.user_id=(select auth.uid())));

create policy "safety_reports_admin_insert" on public.product_safety_reports for insert to authenticated
with check (exists(select 1 from public.rs_admin_roles a where a.user_id=(select auth.uid())));
