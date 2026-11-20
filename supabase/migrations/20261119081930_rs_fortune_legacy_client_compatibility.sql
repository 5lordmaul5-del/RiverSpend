create or replace function public.rs_fortune_credit(
  p_reward_type text,
  p_reward_label text,
  p_rivermoney numeric default 0,
  p_rsp bigint default 0,
  p_metadata jsonb default '{}'::jsonb
)
returns table(reward_id uuid,rivermoney_balance numeric,rsp_balance bigint,is_admin boolean,reward_type text,reward_label text,wheel_index integer)
language plpgsql security definer set search_path=public as $function$
declare
  v_user uuid := auth.uid(); v_is_admin boolean := false; v_reward_id uuid;
  v_rm numeric; v_rsp bigint; v_index integer; v_reward_type text; v_reward_label text;
  v_rivermoney numeric := 0; v_rsp_amount bigint := 0; v_metadata jsonb;
begin
  if v_user is null then raise exception 'AUTH_REQUIRED'; end if;
  select exists(select 1 from public.rs_admin_roles where user_id=v_user and role='admin') into v_is_admin;
  if not v_is_admin then
    perform pg_advisory_xact_lock(pg_catalog.hashtextextended(v_user::text,0));
    if exists(select 1 from public.rs_rewards where user_id=v_user and source='rs_fortune') then raise exception 'FORTUNE_ALREADY_PLAYED'; end if;
  else
    delete from public.rs_rewards where user_id=v_user and source='rs_fortune';
  end if;
  if coalesce(p_metadata->>'server_random','false')='true' then
    v_index:=floor(random()*8)::integer;
  elsif p_metadata ? 'wheel_index' then
    if jsonb_typeof(p_metadata->'wheel_index')<>'number' then raise exception 'INVALID_FORTUNE_RESULT'; end if;
    v_index:=(p_metadata->>'wheel_index')::integer;
    if v_index<0 or v_index>7 then raise exception 'INVALID_FORTUNE_RESULT'; end if;
  else
    v_index:=floor(random()*8)::integer;
  end if;
  case v_index
    when 0 then v_reward_type:='rivermoney'; v_reward_label:='💰 +5 RiverMoney (€0,50)'; v_rivermoney:=5;
    when 1 then v_reward_type:='rivermoney'; v_reward_label:='💰 +10 RiverMoney (€1)'; v_rivermoney:=10;
    when 2 then v_reward_type:='rivermoney'; v_reward_label:='💰 +20 RiverMoney (€2)'; v_rivermoney:=20;
    when 3 then v_reward_type:='shipping'; v_reward_label:='🚚 Spedizione gratuita';
    when 4 then v_reward_type:='discount'; v_reward_label:='🏷️ Sconto 5%';
    when 5 then v_reward_type:='booster'; v_reward_label:='🔥 RS Booster';
    when 6 then v_reward_type:='surprise'; v_reward_label:='🎁 Premio sorpresa';
    when 7 then v_reward_type:='rsp'; v_reward_label:='⭐ +500 RSP'; v_rsp_amount:=500;
  end case;
  v_metadata:=jsonb_build_object('wheel_index',v_index,'source','server_random','issued_at',now());
  insert into public.rs_wallets(user_id) values(v_user) on conflict(user_id) do nothing;
  insert into public.rs_rewards(user_id,reward_type,reward_label,rivermoney,rsp,status,source,metadata)
  values(v_user,v_reward_type,v_reward_label,v_rivermoney,v_rsp_amount,'credited','rs_fortune',v_metadata) returning id into v_reward_id;
  update public.rs_wallets set rivermoney=rivermoney+v_rivermoney,rsp=rsp+v_rsp_amount,updated_at=now()
  where user_id=v_user returning rivermoney,rsp into v_rm,v_rsp;
  if v_rivermoney<>0 then insert into public.rs_wallet_transactions(user_id,currency,amount,balance_after,reason,source,reference_id,metadata) values(v_user,'RIVERMONEY',v_rivermoney,v_rm,v_reward_label,'rs_fortune',v_reward_id,v_metadata); end if;
  if v_rsp_amount<>0 then insert into public.rs_wallet_transactions(user_id,currency,amount,balance_after,reason,source,reference_id,metadata) values(v_user,'RSP',v_rsp_amount,v_rsp,v_reward_label,'rs_fortune',v_reward_id,v_metadata); end if;
  return query select v_reward_id,v_rm,v_rsp,v_is_admin,v_reward_type,v_reward_label,v_index;
end; $function$;