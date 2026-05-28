-- Allow the addressee of a pending friend request to read the requester's profile.
-- Without this, the profiles join in useFriends returns null for pending requests
-- (are_friends only matches accepted rows), so the incoming list is always empty.
create policy "profiles: pending requester visible to addressee"
  on public.profiles for select
  using (
    exists (
      select 1 from public.friendships
      where requester_id = id
        and addressee_id = auth.uid()
        and status = 'pending'
    )
  );
