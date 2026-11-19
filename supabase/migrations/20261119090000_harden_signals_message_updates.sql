-- Restrict Signals message updates to the fields each participant needs.
-- Senders may finalize their own attachment upload (attachment_path/metadata).
-- Recipients may only set the read receipt (read_at), never rewrite incoming content.
create or replace function public.rs_guard_signals_message_update()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if auth.uid() = old.sender_id then
    if (to_jsonb(new) - array['attachment_path', 'metadata'])
       is distinct from
       (to_jsonb(old) - array['attachment_path', 'metadata']) then
      raise exception 'A sender may only finalize attachment metadata after sending a message';
    end if;
  else
    if (to_jsonb(new) - 'read_at') is distinct from (to_jsonb(old) - 'read_at') then
      raise exception 'A recipient may only update the read receipt of a message';
    end if;
    if old.read_at is not null and new.read_at is distinct from old.read_at then
      raise exception 'A message read receipt cannot be cleared or rewritten';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_rs_guard_signals_message_update on public.rs_chat_messages;
create trigger trg_rs_guard_signals_message_update
before update on public.rs_chat_messages
for each row execute function public.rs_guard_signals_message_update();
