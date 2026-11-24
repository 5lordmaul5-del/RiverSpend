-- RiverSpend Product Trust & Traceability foundation
-- Compliance status is workflow metadata, not a certification by RiverSpend.
alter table public.products
  add column if not exists trust_status text not null default 'legacy_unverified'
    check (trust_status in ('legacy_unverified','draft','submitted','under_review','approved','rejected','suspended','recalled')),
  add column if not exists gtin text,
  add column if not exists manufacturer_name text,
  add column if not exists manufacturer_country text,
  add column if not exists responsible_person_name text,
  add column if not exists responsible_person_address text,
  add column if not exists batch_number text,
  add column if not exists serial_number text,
  add column if not exists expiry_date date,
  add column if not exists recycling_instructions text,
  add column if not exists safety_summary text,
  add column if not exists warranty_information text,
  add column if not exists digital_product_passport_url text;

create table if not exists public.product_compliance_profiles (
  product_id text primary key references public.products(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete restrict,
  regulatory_categories text[] not null default '{}',
  destination_markets text[] not null default '{}',
  product_type_code text,
  intended_use text,
  ingredients_materials jsonb not null default '{}'::jsonb,
  hazards_and_warnings jsonb not null default '[]'::jsonb,
  conformity_claims jsonb not null default '[]'::jsonb,
  applicable_standards jsonb not null default '[]'::jsonb,
  public_safety_information jsonb not null default '{}'::jsonb,
  internal_review_notes text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  review_outcome text check (review_outcome is null or review_outcome in ('approved','rejected','needs_changes','suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_supply_chain_parties (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete restrict,
  party_role text not null check (party_role in ('manufacturer','raw_material_supplier','processor','brand_owner','importer','eu_responsible_person','distributor','wholesaler','retailer','warehouse','carrier','other')),
  legal_name text not null,
  country_code char(2),
  address text,
  registration_reference text,
  contact_reference text,
  verification_status text not null default 'unverified' check (verification_status in ('unverified','pending','verified','rejected')),
  verified_at timestamptz,
  verified_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_supply_chain_events (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete restrict,
  party_id uuid references public.product_supply_chain_parties(id) on delete set null,
  event_type text not null check (event_type in ('sourced','manufactured','processed','quality_checked','packed','labelled','exported','customs_cleared','received','stored','dispatched','shipped','delivered','returned','withdrawn','recalled','other')),
  event_time timestamptz not null,
  recorded_at timestamptz not null default now(),
  location_name text,
  country_code char(2),
  facility_reference text,
  lot_number text,
  serial_number text,
  quantity numeric check (quantity is null or quantity >= 0),
  unit text,
  transaction_reference text,
  previous_event_id uuid references public.product_supply_chain_events(id) on delete set null,
  evidence_document_id uuid,
  event_data jsonb not null default '{}'::jsonb,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict
);

create table if not exists public.product_compliance_documents (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete restrict,
  document_type text not null check (document_type in ('eu_declaration_of_conformity','test_report','certificate','technical_file','safety_data_sheet','label','manual','food_traceability','ingredient_list','cosmetic_information','import_customs','supplier_invoice','insurance','warranty','recall_notice','other')),
  document_title text not null,
  storage_path text not null,
  issuer_name text,
  issuing_country char(2),
  reference_number text,
  issued_at date,
  expires_at date,
  verification_status text not null default 'pending' check (verification_status in ('pending','verified','rejected','expired')),
  verified_at timestamptz,
  verified_by uuid references auth.users(id) on delete set null,
  is_public boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.product_quality_checks (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete restrict,
  check_type text not null check (check_type in ('incoming_inspection','sampling','laboratory_test','visual_inspection','packaging_check','label_check','temperature_check','shelf_life_check','other')),
  checked_at timestamptz not null default now(),
  checked_by text,
  lot_number text,
  result text not null check (result in ('passed','failed','conditional','not_applicable')),
  findings text,
  corrective_action text,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.product_safety_recalls (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete restrict,
  created_by uuid not null references auth.users(id) on delete restrict,
  recall_status text not null default 'open' check (recall_status in ('open','investigating','active','resolved','closed')),
  severity text not null default 'unknown' check (severity in ('low','moderate','high','critical','unknown')),
  affected_lots text[] not null default '{}',
  reason text not null,
  authority_reference text,
  started_at timestamptz not null default now(),
  resolved_at timestamptz,
  customer_notice text,
  actions_taken jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_safety_reports (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete restrict,
  reporter_id uuid references auth.users(id) on delete set null,
  report_type text not null check (report_type in ('safety_issue','injury','counterfeit_suspected','misleading_information','missing_documentation','other')),
  description text not null,
  lot_number text,
  order_reference text,
  status text not null default 'open' check (status in ('open','reviewing','action_required','resolved','dismissed')),
  resolution_notes text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists product_supply_chain_events_product_time_idx on public.product_supply_chain_events(product_id,event_time);
create index if not exists product_supply_chain_events_lot_idx on public.product_supply_chain_events(product_id,lot_number);
create index if not exists product_compliance_documents_product_idx on public.product_compliance_documents(product_id,document_type);
create index if not exists product_quality_checks_product_lot_idx on public.product_quality_checks(product_id,lot_number,checked_at desc);
create index if not exists product_safety_recalls_product_idx on public.product_safety_recalls(product_id,recall_status);
create index if not exists product_safety_reports_product_idx on public.product_safety_reports(product_id,status);

alter table public.product_compliance_profiles enable row level security;
alter table public.product_supply_chain_parties enable row level security;
alter table public.product_supply_chain_events enable row level security;
alter table public.product_compliance_documents enable row level security;
alter table public.product_quality_checks enable row level security;
alter table public.product_safety_recalls enable row level security;
alter table public.product_safety_reports enable row level security;

-- Sellers can manage their own product records. RiverSpend admins can review all.
create policy "product_compliance_owner_select" on public.product_compliance_profiles for select to authenticated using (seller_id = (select auth.uid()) or exists(select 1 from public.rs_admin_roles a where a.user_id=(select auth.uid())));
create policy "product_compliance_owner_insert" on public.product_compliance_profiles for insert to authenticated with check (seller_id = (select auth.uid()) and exists(select 1 from public.products p where p.id=product_id and p.seller_id=(select auth.uid())));
create policy "product_compliance_owner_update" on public.product_compliance_profiles for update to authenticated using (seller_id = (select auth.uid()) or exists(select 1 from public.rs_admin_roles a where a.user_id=(select auth.uid()))) with check (seller_id = (select auth.uid()) or exists(select 1 from public.rs_admin_roles a where a.user_id=(select auth.uid())));

create policy "supply_parties_owner_select" on public.product_supply_chain_parties for select to authenticated using (seller_id=(select auth.uid()) or exists(select 1 from public.rs_admin_roles a where a.user_id=(select auth.uid())));
create policy "supply_parties_owner_insert" on public.product_supply_chain_parties for insert to authenticated with check (seller_id=(select auth.uid()) and exists(select 1 from public.products p where p.id=product_id and p.seller_id=(select auth.uid())));
create policy "supply_parties_owner_update" on public.product_supply_chain_parties for update to authenticated using (seller_id=(select auth.uid()) or exists(select 1 from public.rs_admin_roles a where a.user_id=(select auth.uid()))) with check (seller_id=(select auth.uid()) or exists(select 1 from public.rs_admin_roles a where a.user_id=(select auth.uid())));
create policy "supply_parties_owner_delete" on public.product_supply_chain_parties for delete to authenticated using (seller_id=(select auth.uid()) or exists(select 1 from public.rs_admin_roles a where a.user_id=(select auth.uid())));

create policy "supply_events_owner_select" on public.product_supply_chain_events for select to authenticated using (seller_id=(select auth.uid()) or exists(select 1 from public.rs_admin_roles a where a.user_id=(select auth.uid())));
create policy "supply_events_owner_insert" on public.product_supply_chain_events for insert to authenticated with check (seller_id=(select auth.uid()) and exists(select 1 from public.products p where p.id=product_id and p.seller_id=(select auth.uid())));
-- Traceability events are append-only for sellers; no update/delete policies are provided.

create policy "compliance_docs_owner_select" on public.product_compliance_documents for select to authenticated using (seller_id=(select auth.uid()) or exists(select 1 from public.rs_admin_roles a where a.user_id=(select auth.uid())));
create policy "compliance_docs_owner_insert" on public.product_compliance_documents for insert to authenticated with check (seller_id=(select auth.uid()) and exists(select 1 from public.products p where p.id=product_id and p.seller_id=(select auth.uid())));
create policy "compliance_docs_owner_update" on public.product_compliance_documents for update to authenticated using (seller_id=(select auth.uid()) or exists(select 1 from public.rs_admin_roles a where a.user_id=(select auth.uid()))) with check (seller_id=(select auth.uid()) or exists(select 1 from public.rs_admin_roles a where a.user_id=(select auth.uid())));

create policy "quality_checks_owner_select" on public.product_quality_checks for select to authenticated using (seller_id=(select auth.uid()) or exists(select 1 from public.rs_admin_roles a where a.user_id=(select auth.uid())));
create policy "quality_checks_owner_insert" on public.product_quality_checks for insert to authenticated with check (seller_id=(select auth.uid()) and exists(select 1 from public.products p where p.id=product_id and p.seller_id=(select auth.uid())));

create policy "safety_recalls_owner_select" on public.product_safety_recalls for select to authenticated using (exists(select 1 from public.products p where p.id=product_id and p.seller_id=(select auth.uid())) or exists(select 1 from public.rs_admin_roles a where a.user_id=(select auth.uid())));
create policy "safety_recalls_admin_insert" on public.product_safety_recalls for insert to authenticated with check (exists(select 1 from public.rs_admin_roles a where a.user_id=(select auth.uid())) or exists(select 1 from public.products p where p.id=product_id and p.seller_id=(select auth.uid())));
create policy "safety_recalls_admin_update" on public.product_safety_recalls for update to authenticated using (exists(select 1 from public.rs_admin_roles a where a.user_id=(select auth.uid()))) with check (exists(select 1 from public.rs_admin_roles a where a.user_id=(select auth.uid())));

create policy "safety_reports_submit" on public.product_safety_reports for insert to authenticated with check (reporter_id=(select auth.uid()));
create policy "safety_reports_owner_admin_select" on public.product_safety_reports for select to authenticated using (reporter_id=(select auth.uid()) or exists(select 1 from public.products p where p.id=product_id and p.seller_id=(select auth.uid())) or exists(select 1 from public.rs_admin_roles a where a.user_id=(select auth.uid())));
create policy "safety_reports_admin_update" on public.product_safety_reports for update to authenticated using (exists(select 1 from public.rs_admin_roles a where a.user_id=(select auth.uid()))) with check (exists(select 1 from public.rs_admin_roles a where a.user_id=(select auth.uid())));

-- Private bucket: evidence and certificates are never public by default.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('rs-product-trust','rs-product-trust',false,26214400,array['application/pdf','image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "rs_product_trust_upload_own_folder" on storage.objects for insert to authenticated
with check (bucket_id='rs-product-trust' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "rs_product_trust_read_own_folder" on storage.objects for select to authenticated
using (bucket_id='rs-product-trust' and ((storage.foldername(name))[1]=(select auth.uid())::text or exists(select 1 from public.rs_admin_roles a where a.user_id=(select auth.uid()))));
create policy "rs_product_trust_update_own_folder" on storage.objects for update to authenticated
using (bucket_id='rs-product-trust' and (storage.foldername(name))[1]=(select auth.uid())::text)
with check (bucket_id='rs-product-trust' and (storage.foldername(name))[1]=(select auth.uid())::text);

-- Prevent a new product from becoming public until a RiverSpend admin approves its trust workflow.
create or replace function public.rs_enforce_product_trust_publication()
returns trigger language plpgsql set search_path=public as $$
begin
  if new.status='published' and new.trust_status is distinct from 'approved' then
    new.status := 'pending';
  end if;
  if tg_op='UPDATE' and new.trust_status is distinct from old.trust_status
     and new.trust_status='approved'
     and not exists(select 1 from public.rs_admin_roles a where a.user_id=auth.uid()) then
    raise exception 'Only an authorized RiverSpend reviewer can approve product trust status';
  end if;
  if tg_op='UPDATE' and new.trust_status in ('rejected','suspended','recalled')
     and not exists(select 1 from public.rs_admin_roles a where a.user_id=auth.uid()) then
    raise exception 'Only an authorized RiverSpend reviewer can set this trust status';
  end if;
  return new;
end; $$;

drop trigger if exists products_enforce_trust_publication on public.products;
create trigger products_enforce_trust_publication
before insert or update of status,trust_status on public.products
for each row execute function public.rs_enforce_product_trust_publication();

-- Expose only safe, intentionally public fields from an approved product.
create or replace view public.product_trust_public
with (security_invoker=true) as
select p.id as product_id, p.trust_status, p.gtin, p.manufacturer_name,
       p.manufacturer_country, p.responsible_person_name,
       p.responsible_person_address, p.batch_number, p.expiry_date,
       p.safety_summary, p.recycling_instructions, p.warranty_information,
       p.digital_product_passport_url, c.public_safety_information,
       c.regulatory_categories, c.destination_markets
from public.products p
left join public.product_compliance_profiles c on c.product_id=p.id
where p.status='published' and p.trust_status='approved';

grant select on public.product_trust_public to anon, authenticated;
grant select, insert, update, delete on public.product_compliance_profiles, public.product_supply_chain_parties, public.product_supply_chain_events, public.product_compliance_documents, public.product_quality_checks, public.product_safety_recalls, public.product_safety_reports to authenticated;
