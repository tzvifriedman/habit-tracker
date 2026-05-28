-- Username lookup for friend requests.
-- security definer so the caller only sees what we choose to return —
-- no email, no private fields, and you can't look up yourself.
create or replace function public.find_user_by_username(search_username text)
returns json language plpgsql security definer as $$
declare
  result json;
begin
  select json_build_object(
    'id',           p.id,
    'username',     p.username,
    'display_name', p.display_name
  ) into result
  from public.profiles p
  where lower(p.username) = lower(trim(search_username))
    and p.id != auth.uid();   -- can't add yourself

  return result;  -- null if not found
end;
$$;
