-- Allow sellers to update their own factual submission without changing reviewer-only fields.
create or replace function public.rs_guard_product_trust_review_fields()
returns trigger language plpgsql set search_path=public as $$
declare
  is_reviewer boolean;
begin
  select exists(select 1 from public.rs_admin_roles a where a.user_id=auth.uid()) into is_reviewer;
  if not is_reviewer then
    if tg_table_name='product_compliance_profiles' and (
      (tg_op='INSERT' and (new.reviewed_at is not null or new.reviewed_by is not null or new.review_outcome is not null or new.internal_review_notes is not null))
      or (tg_op='UPDATE' and (
        new.reviewed_at is distinct from old.reviewed_at or new.reviewed_by is distinct from old.reviewed_by or
        new.review_outcome is distinct from old.review_outcome or new.internal_review_notes is distinct from old.internal_review_notes
      ))
    ) then raise exception 'Only authorized RiverSpend reviewers can change compliance review fields'; end if;
    if tg_table_name='product_compliance_documents' and (
      (tg_op='INSERT' and (new.verification_status <> 'pending' or new.verified_at is not null or new.verified_by is not null))
      or (tg_op='UPDATE' and (
        new.verification_status is distinct from old.verification_status or new.verified_at is distinct from old.verified_at or new.verified_by is distinct from old.verified_by
      ))
    ) then raise exception 'Only authorized RiverSpend reviewers can verify compliance documents'; end if;
    if tg_table_name='product_supply_chain_parties' and (
      (tg_op='INSERT' and (new.verification_status <> 'unverified' or new.verified_at is not null or new.verified_by is not null))
      or (tg_op='UPDATE' and (
        new.verification_status is distinct from old.verification_status or new.verified_at is distinct from old.verified_at or new.verified_by is distinct from old.verified_by
      ))
    ) then raise exception 'Only authorized RiverSpend reviewers can verify supply-chain parties'; end if;
  end if;
  return new;
end; $$;
