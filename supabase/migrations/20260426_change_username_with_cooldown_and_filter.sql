-- Username change feature: 30-day cooldown, profanity/reserved-name filter,
-- uniqueness check, and a trigger that prevents direct UPDATE of the
-- username column so the validation cannot be bypassed via REST.

-- 1. Track when username was last changed (null = never changed since signup)
alter table public.profiles
  add column if not exists username_changed_at timestamptz;

-- 2. Profanity / reserved-name check.  Returns false if the input matches a
--    bad word (case-insensitive, leetspeak-aware via translate). Marked
--    immutable so it can be used in CHECK constraints/indexes if needed.
create or replace function public.is_username_clean(input text)
returns boolean
language plpgsql
immutable
as $$
declare
  cleaned text;
  bad text;
  bad_words text[] := array[
    -- explicit
    'fuck','shit','bitch','cunt','asshole','fag','faggot','nigger','nigga',
    'retard','spic','kike','chink','whore','slut','twat','pussy','cock',
    'dick','rape','rapist','pedo','pedophile','cum','jizz','wank',
    'tit','tits','arse','bastard','douche','piss','crap',
    -- impersonation / reserved
    'admin','administrator','mod','moderator','staff','support',
    'colorcram','official','system','root','null','undefined','anonymous'
  ];
begin
  if input is null then
    return false;
  end if;
  -- normalize: lowercase, then map common leetspeak chars
  --   0->o, 1->i (most common in profanity bypass), 3->e, 4->a, 5->s,
  --   7->t, 8->b, 9->g, @->a, $->s
  cleaned := lower(input);
  cleaned := translate(cleaned, '01345789@$', 'oieastbgas');
  -- strip remaining non-letters so 'f_u_c_k' or 'f.u.c.k' still matches
  cleaned := regexp_replace(cleaned, '[^a-z]', '', 'g');
  foreach bad in array bad_words loop
    if position(bad in cleaned) > 0 then
      return false;
    end if;
  end loop;
  return true;
end;
$$;

-- 3. Trigger: prevent direct UPDATE of username column.  The RPC sets a
--    transaction-local flag to bypass.  Without the flag, the trigger
--    raises so a malicious anon-key client can't sidestep validation.
create or replace function public.protect_username_column()
returns trigger
language plpgsql
as $$
begin
  if new.username is distinct from old.username then
    if coalesce(current_setting('app.allow_username_change', true), '') <> 'true' then
      raise exception 'Username can only be changed via change_username() RPC'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_username on public.profiles;
create trigger profiles_protect_username
  before update on public.profiles
  for each row execute function public.protect_username_column();

-- 4. The change_username RPC.  Returns a row with status + message so the
--    client can branch the UI without parsing exception text.
--    Status values: 'ok' | 'noop' | 'cooldown' | 'conflict' | 'error'
create or replace function public.change_username(new_username text)
returns table(status text, message text, changed_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  current_username text;
  last_change timestamptz;
  cooldown interval := interval '30 days';
  cleaned text;
  days_left integer;
begin
  if uid is null then
    return query select 'error'::text, 'Not authenticated'::text, null::timestamptz;
    return;
  end if;

  cleaned := trim(coalesce(new_username, ''));

  if char_length(cleaned) < 2 or char_length(cleaned) > 24 then
    return query select 'error'::text, 'Username must be 2-24 characters'::text, null::timestamptz;
    return;
  end if;

  if cleaned !~ '^[A-Za-z0-9_]+$' then
    return query select 'error'::text, 'Letters, numbers, and underscores only'::text, null::timestamptz;
    return;
  end if;

  if not public.is_username_clean(cleaned) then
    return query select 'error'::text, 'Please choose a different username'::text, null::timestamptz;
    return;
  end if;

  select p.username, p.username_changed_at
    into current_username, last_change
    from public.profiles p where p.id = uid;

  if current_username is null then
    return query select 'error'::text, 'Profile not found'::text, null::timestamptz;
    return;
  end if;

  if lower(current_username) = lower(cleaned) then
    return query select 'noop'::text, 'Username unchanged'::text, last_change;
    return;
  end if;

  if last_change is not null and last_change > now() - cooldown then
    days_left := greatest(1, ceil(extract(epoch from (last_change + cooldown - now())) / 86400.0)::integer);
    return query select 'cooldown'::text,
      ('You can change your username in ' || days_left::text ||
       case when days_left = 1 then ' day' else ' days' end)::text,
      last_change;
    return;
  end if;

  if exists (
    select 1 from public.profiles p
    where lower(p.username) = lower(cleaned) and p.id <> uid
  ) then
    return query select 'conflict'::text, 'That username is taken'::text, null::timestamptz;
    return;
  end if;

  -- Allow the trigger to permit the column update for this txn only.
  perform set_config('app.allow_username_change', 'true', true);

  update public.profiles
    set username = cleaned,
        username_changed_at = now()
    where id = uid;

  return query select 'ok'::text, 'Username updated'::text, now();
end;
$$;

revoke all on function public.change_username(text) from public, anon;
grant execute on function public.change_username(text) to authenticated;
revoke all on function public.is_username_clean(text) from public, anon;
grant execute on function public.is_username_clean(text) to authenticated;
