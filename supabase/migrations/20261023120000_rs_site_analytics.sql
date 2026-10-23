-- RiverSpend consent-based site dwell and player analytics.
-- Apply with Supabase migrations; the same changes were applied to the connected project.
create table if not exists public.rs_site_analytics_events (
 id bigint generated always as identity primary key,
 session_id text not null check (char_length(session_id) between 12 and 100),
 event_type text not null check (event_type in ('page_view','page_heartbeat','page_exit','video_start','video_heartbeat','video_complete','audio_start','audio_heartbeat','audio_complete','visibility_hidden')),
 page_path text not null default '/',
 duration_seconds integer not null default 0 check (duration_seconds >= 0 and duration_seconds <= 86400),
 device_type text not null default 'unknown' check (device_type in ('mobile','tablet','desktop','unknown')),
 metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create index if not exists rs_site_analytics_created_idx on public.rs_site_analytics_events(created_at desc);
create index if not exists rs_site_analytics_session_created_idx on public.rs_site_analytics_events(session_id,created_at desc);
create index if not exists rs_site_analytics_type_created_idx on public.rs_site_analytics_events(event_type,created_at desc);
alter table public.rs_site_analytics_events enable row level security;
drop policy if exists "CEO reads site analytics" on public.rs_site_analytics_events;
create policy "CEO reads site analytics" on public.rs_site_analytics_events for select to authenticated using (exists(select 1 from public.rs_admin_roles r where r.user_id=auth.uid() and r.role='admin'));
drop policy if exists "Visitors submit site analytics" on public.rs_site_analytics_events;
create policy "Visitors submit site analytics" on public.rs_site_analytics_events for insert to anon, authenticated with check (char_length(session_id) between 12 and 100 and duration_seconds between 0 and 86400 and page_path like '/%' and char_length(page_path)<=200);
grant insert on public.rs_site_analytics_events to anon, authenticated;
grant select on public.rs_site_analytics_events to authenticated;

alter table public.rs_media_analytics_events drop constraint if exists rs_media_analytics_events_module_check;
alter table public.rs_media_analytics_events add constraint rs_media_analytics_events_module_check check (module in ('broadcast','radio','stream','rs_ads','site_video','site_audio'));
drop policy if exists "Visitors submit media playback analytics" on public.rs_media_analytics_events;
create policy "Visitors submit media playback analytics" on public.rs_media_analytics_events for insert to anon, authenticated with check (user_id is null and event_type in ('play_start','play_heartbeat','play_complete') and module in ('broadcast','radio','stream','site_video','site_audio') and duration_seconds between 0 and 86400 and session_id is not null and char_length(session_id) between 12 and 100);
grant insert on public.rs_media_analytics_events to anon, authenticated;
grant select on public.rs_media_analytics_events to authenticated;

comment on table public.rs_site_analytics_events is 'Consent-gated, pseudonymous site traffic and dwell analytics. Page paths exclude query strings; admin-only reads.';
