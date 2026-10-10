create table if not exists public.rs_ads_campaigns (
  id uuid primary key default gen_random_uuid(),
  advertiser_id uuid references auth.users(id) on delete set null,
  advertiser_name text not null,
  advertiser_type text not null check (advertiser_type in ('privato','azienda')),
  title text not null,
  targeting_mode text not null check (targeting_mode in ('interest','local','business')),
  categories text[] not null default '{}',
  country_code text not null default 'IT',
  region text,
  city text,
  radius_km integer check (radius_km is null or radius_km between 1 and 500),
  budget_eur numeric(12,2) not null default 0 check (budget_eur >= 0),
  status text not null default 'review' check (status in ('draft','review','active','paused','completed','rejected')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists rs_ads_campaigns_status_created_idx on public.rs_ads_campaigns(status, created_at desc);
create index if not exists rs_ads_campaigns_targeting_idx on public.rs_ads_campaigns(targeting_mode, country_code, city);
alter table public.rs_ads_campaigns enable row level security;
drop policy if exists "CEO manages RS Ads campaigns" on public.rs_ads_campaigns;
create policy "CEO manages RS Ads campaigns" on public.rs_ads_campaigns for all to authenticated
using (exists (select 1 from public.rs_admin_roles r where r.user_id = auth.uid() and r.role = 'admin'))
with check (exists (select 1 from public.rs_admin_roles r where r.user_id = auth.uid() and r.role = 'admin'));
drop policy if exists "Advertisers read own RS Ads campaigns" on public.rs_ads_campaigns;
create policy "Advertisers read own RS Ads campaigns" on public.rs_ads_campaigns for select to authenticated using (advertiser_id = auth.uid());
drop policy if exists "Advertisers create own RS Ads campaigns" on public.rs_ads_campaigns;
create policy "Advertisers create own RS Ads campaigns" on public.rs_ads_campaigns for insert to authenticated with check (advertiser_id = auth.uid());
drop policy if exists "Advertisers update own draft campaigns" on public.rs_ads_campaigns;
create policy "Advertisers update own draft campaigns" on public.rs_ads_campaigns for update to authenticated using (advertiser_id = auth.uid() and status in ('draft','review')) with check (advertiser_id = auth.uid() and status in ('draft','review'));
