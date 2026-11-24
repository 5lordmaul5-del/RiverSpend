-- Harden reviewer-only fields and attach traceability evidence.
alter table public.product_supply_chain_events
  add constraint product_supply_chain_events_evidence_document_fk
  foreign key (evidence_document_id) references public.product_compliance_documents(id) on delete set null;

create or replace function public.rs_guard_product_trust_review_fields()
returns trigger language plpgsql set search_path=public as $$
declare
  is_reviewer boolean;
begin
  select exists(select 1 from public.rs_admin_roles a where a.user_id=auth.uid()) into is_reviewer;
  if tg_table_name='product_compliance_profiles' then
    if not is_reviewer and (
      new.reviewed_at is distinct from old.reviewed_at or
      new.reviewed_by is distinct from old.reviewed_by or
      new.review_outcome is distinct from old.review_outcome or
      new.internal_review_notes is distinct from old.internal_review_notes
    ) then raise exception 'Only authorized RiverSpend reviewers can change compliance review fields'; end if;
  elsif tg_table_name='product_compliance_documents' then
    if not is_reviewer and (
      new.verification_status is distinct from old.verification_status or
      new.verified_at is distinct from old.verified_at or
      new.verified_by is distinct from old.verified_by
    ) then raise exception 'Only authorized RiverSpend reviewers can verify compliance documents'; end if;
  elsif tg_table_name='product_supply_chain_parties' then
    if not is_reviewer and (
      new.verification_status is distinct from old.verification_status or
      new.verified_at is distinct from old.verified_at or
      new.verified_by is distinct from old.verified_by
    ) then raise exception 'Only authorized RiverSpend reviewers can verify supply-chain parties'; end if;
  end if;
  return new;
end; $$;

drop trigger if exists product_compliance_review_fields_guard on public.product_compliance_profiles;
create trigger product_compliance_review_fields_guard before update on public.product_compliance_profiles
for each row execute function public.rs_guard_product_trust_review_fields();
drop trigger if exists product_compliance_document_review_guard on public.product_compliance_documents;
create trigger product_compliance_document_review_guard before update on public.product_compliance_documents
for each row execute function public.rs_guard_product_trust_review_fields();
drop trigger if exists product_supply_party_review_guard on public.product_supply_chain_parties;
create trigger product_supply_party_review_guard before update on public.product_supply_chain_parties
for each row execute function public.rs_guard_product_trust_review_fields();

create policy "rs_product_trust_delete_own_folder" on storage.objects for delete to authenticated
using (bucket_id='rs-product-trust' and (storage.foldername(name))[1]=(select auth.uid())::text);
