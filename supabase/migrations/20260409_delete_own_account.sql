-- Allow authenticated users to delete their own account and all associated data.
-- SECURITY DEFINER so the function can delete from auth.users.
create or replace function delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  -- Delete user data from all tables (order matters for FK constraints)
  delete from public.game_scores   where user_id = uid;
  delete from public.shared_results where user_id = uid;
  delete from public.profiles       where id = uid;

  -- Finally remove the auth user
  delete from auth.users where id = uid;
end;
$$;

-- Only authenticated users can call this
revoke all on function delete_own_account() from public;
grant execute on function delete_own_account() to authenticated;
