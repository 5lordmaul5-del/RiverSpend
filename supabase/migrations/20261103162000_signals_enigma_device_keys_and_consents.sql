create table if not exists public.rs_chat_device_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id text not null,
  public_key jsonb not null,
  key_version integer not null default 1 check (key_version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, device_id)
);

alter table public.rs_chat_device_keys enable row level security;

drop policy if exists "Authenticated users can read Signals public device keys" on public.rs_chat_device_keys;
create policy "Authenticated users can read Signals public device keys"
  on public.rs_chat_device_keys for select to authenticated
  using (true);

drop policy if exists "Users manage their own Signals device keys" on public.rs_chat_device_keys;
create policy "Users manage their own Signals device keys"
  on public.rs_chat_device_keys for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users update their own Signals device keys" on public.rs_chat_device_keys;
create policy "Users update their own Signals device keys"
  on public.rs_chat_device_keys for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users delete their own Signals device keys" on public.rs_chat_device_keys;
create policy "Users delete their own Signals device keys"
  on public.rs_chat_device_keys for delete to authenticated
  using (auth.uid() = user_id);

create table if not exists public.rs_chat_enigma_consents (
  conversation_id uuid not null references public.rs_chat_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  accepted_at timestamptz not null default now(),
  revoked_at timestamptz,
  primary key (conversation_id, user_id)
);

alter table public.rs_chat_enigma_consents enable row level security;

drop policy if exists "Conversation participants can read Enigma consent" on public.rs_chat_enigma_consents;
create policy "Conversation participants can read Enigma consent"
  on public.rs_chat_enigma_consents for select to authenticated
  using (
    exists (
      select 1 from public.rs_chat_conversations c
      where c.id = conversation_id
        and auth.uid() in (c.participant_one, c.participant_two)
    )
  );

drop policy if exists "Participants can set their own Enigma consent" on public.rs_chat_enigma_consents;
create policy "Participants can set their own Enigma consent"
  on public.rs_chat_enigma_consents for insert to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.rs_chat_conversations c
      where c.id = conversation_id
        and auth.uid() in (c.participant_one, c.participant_two)
    )
  );

drop policy if exists "Participants can change their own Enigma consent" on public.rs_chat_enigma_consents;
create policy "Participants can change their own Enigma consent"
  on public.rs_chat_enigma_consents for update to authenticated
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.rs_chat_conversations c
      where c.id = conversation_id
        and auth.uid() in (c.participant_one, c.participant_two)
    )
  )
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.rs_chat_conversations c
      where c.id = conversation_id
        and auth.uid() in (c.participant_one, c.participant_two)
    )
  );

grant select, insert, update, delete on public.rs_chat_device_keys to authenticated;
grant select, insert, update on public.rs_chat_enigma_consents to authenticated;
