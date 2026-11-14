create table if not exists public.river_ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Nuova conversazione',
  messages jsonb not null default '[]'::jsonb,
  is_archived boolean not null default false,
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint river_ai_conversations_messages_array check (jsonb_typeof(messages) = 'array'),
  constraint river_ai_conversations_title_length check (char_length(title) <= 120)
);
create index if not exists river_ai_conversations_user_updated_idx
  on public.river_ai_conversations(user_id, updated_at desc);
alter table public.river_ai_conversations enable row level security;
create policy "Users can read their own RiverSSAI conversations"
  on public.river_ai_conversations for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Users can create their own RiverSSAI conversations"
  on public.river_ai_conversations for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Users can update their own RiverSSAI conversations"
  on public.river_ai_conversations for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users can delete their own RiverSSAI conversations"
  on public.river_ai_conversations for delete to authenticated
  using ((select auth.uid()) = user_id);
grant select, insert, update, delete on public.river_ai_conversations to authenticated;
grant all on public.river_ai_conversations to service_role;
