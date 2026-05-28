-- Make handle_new_user robust against username conflicts and invalid usernames.
-- Without this, a duplicate username causes the entire auth.users INSERT to roll back,
-- showing "Couldn't create your account" even though the email/password are fine.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  desired_username text;
  fallback_username text;
begin
  desired_username := lower(trim(coalesce(new.raw_user_meta_data->>'username', '')));
  fallback_username := 'user_' || substr(replace(new.id::text, '-', ''), 1, 8);

  -- Fall back if username doesn't pass the check constraint
  if desired_username !~ '^[a-z0-9_]{3,20}$' then
    desired_username := fallback_username;
  end if;

  -- Try desired username; on unique conflict use fallback
  begin
    insert into public.profiles (id, username, display_name)
    values (
      new.id,
      desired_username,
      new.raw_user_meta_data->>'display_name'
    );
  exception
    when unique_violation then
      insert into public.profiles (id, username, display_name)
      values (
        new.id,
        fallback_username,
        new.raw_user_meta_data->>'display_name'
      )
      on conflict (id) do nothing;
  end;

  return new;
end;
$$;
