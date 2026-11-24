-- Final hardening: sellers cannot self-approve or attach evidence to another product.
create or replace function public.rs_enforce_product_trust_publication()
returns trigger language plpgsql set search_path=public as $$
declare
  is_reviewer boolean;
begin
  select exists(select 1 from public.rs_admin_roles a where a.user_id=auth.uid()) into is_reviewer;
  if not is_reviewer and new.trust_status in ('approved','rejected','suspended','recalled') then
    raise exception 'Only an authorized RiverSpend reviewer can set this trust status';
  end if;
  if new.status='published' and new.trust_status is distinct from 'approved' then
    new.status := 'pending';
  end if;
  return new;
end; $$;

create or replace function public.rs_guard_product_trust_review_fields()
returns trigger language plpgsql set search_path=public as $$
declare
  is_reviewer boolean;
begin
  select exists(select 1 from public.rs_admin_roles a where a.user_id=auth.uid()) into is_reviewer;
  if not is_reviewer then
    if tg_table_name='product_compliance_profiles' and (
      new.reviewed_at is not null or new.reviewed_by is not null or
      new.review_outcome is not null or new.internal_review_notes is not null
    ) then raise exception 'Only authorized RiverSpend reviewers can set compliance review fields'; end if;
    if tg_table_name='product_compliance_documents' and (
      new.verification_status <> 'pending' or new.verified_at is not null or new.verified_by is not null
    ) then raise exception 'Only authorized RiverSpend reviewers can verify compliance documents'; end if;
    if tg_table_name='product_supply_chain_parties' and (
      new.verification_status <> 'unverified' or new.verified_at is not null or new.verified_by is not null
    ) then raise exception 'Only authorized RiverSpend reviewers can verify supply-chain parties'; end if;
  end if;
  return new;
end; $$;

drop trigger if exists product_compliance_review_fields_guard on public.product_compliance_profiles;
create trigger product_compliance_review_fields_guard before insert or update on public.product_compliance_profiles
for each row execute function public.rs_guard_product_trust_review_fields();
drop trigger if exists product_compliance_document_review_guard on public.product_compliance_documents;
create trigger product_compliance_document_review_guard before insert or update on public.product_compliance_documents
for each row execute function public.rs_guard_product_trust_review_fields();
drop trigger if exists product_supply_party_review_guard on public.product_supply_chain_parties;
create trigger product_supply_party_review_guard before insert or update on public.product_supply_chain_parties
for each row execute function public.rs_guard_product_trust_review_fields();

drop policy if exists "product_compliance_owner_update" on public.product_compliance_profiles;
create policy "product_compliance_owner_update" on public.product_compliance_profiles for update to authenticated
using (seller_id=(select auth.uid()) or exists(select 1 from public.rs_admin_roles a where a.user_id=(select auth.uid())))
with check (
  exists(select 1 from public.rs_admin_roles a where a.user_id=(select auth.uid()))
  or (seller_id=(select auth.uid()) and exists(select 1 from public.products p where p.id=product_id and p.seller_id=(select auth.uid())))
);
drop policy if exists "supply_parties_owner_update" on public.product_supply_chain_parties;
create policy "supply_parties_owner_update" on public.product_supply_chain_parties for update to authenticated
using (seller_id=(select auth.uid()) or exists(select 1 from public.rs_admin_roles a where a.user_id=(select auth.uid())))
with check (
  exists(select 1 from public.rs_admin_roles a where a.user_id=(select auth.uid()))
  or (seller_id=(select auth.uid()) and exists(select 1 from public.products p where p.id=product_id and p.seller_id=(select auth.uid())))
);
drop policy if exists "compliance_docs_owner_update" on public.product_compliance_documents;
create policy "compliance_docs_owner_update" on public.product_compliance_documents for update to authenticated
using (seller_id=(select auth.uid()) or exists(select 1 from public.rs_admin_roles a where a.user_id=(select auth.uid())))
with check (
  exists(select 1 from public.rs_admin_roles a where a.user_id=(select auth.uid()))
  or (seller_id=(select auth.uid()) and exists(select 1 from public.products p where p.id=product_id and p.seller_id=(select auth.uid())))
);

create or replace function public.rs_validate_product_trace_event_links()
returns trigger language plpgsql set search_path=public as $$
begin
  if new.party_id is not null and not exists (
    select 1 from public.product_supply_chain_parties p
    where p.id=new.party_id and p.product_id=new.product_id and p.seller_id=new.seller_id
  ) then raise exception 'Supply-chain party must belong to the same product and seller'; end if;
  if new.evidence_document_id is not null and not exists (
    select 1 from public.product_compliance_documents d
    where d.id=new.evidence_document_id and d.product_id=new.product_id and d.seller_id=new.seller_id
  ) then raise exception 'Evidence document must belong to the same product and seller'; end if;
  return new;
end; $$;
drop trigger if exists product_trace_event_validate_links on public.product_supply_chain_events;
create trigger product_trace_event_validate_links before insert on public.product_supply_chain_events
for each row execute function public.rs_validate_product_trace_event_links();
