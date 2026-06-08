-- Returns pending friend requests addressed to the calling user,
-- including the requester's profile. security definer so the profiles
-- join bypasses RLS (the caller is already gated by auth.uid() in the WHERE).
create or replace function public.get_pending_requests()
returns table(
  id          uuid,
  requester_id uuid,
  created_at  timestamptz,
  username    text,
  display_name text
)
language plpgsql security definer set search_path = '' as $$
begin
  return query
  select
    f.id,
    f.requester_id,
    f.created_at,
    p.username,
    p.display_name
  from public.friendships f
  join public.profiles p on p.id = f.requester_id
  where f.addressee_id = auth.uid()
    and f.status = 'pending';
end;
$$;
