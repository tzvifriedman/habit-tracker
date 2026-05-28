-- pg_net ships with every Supabase project; this is a safety net
create extension if not exists pg_net;

-- Fires the notify-checkin edge function whenever a check-in flips to completed=true.
-- Uses fire-and-forget (net.http_post returns a request ID we don't need to track).
create or replace function public.notify_friends_on_checkin()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.completed = true and (old is null or old.completed is not true) then
    perform net.http_post(
      url     := 'https://npgblfxnjvyvcijmtnpc.supabase.co/functions/v1/notify-checkin',
      headers := '{"Content-Type":"application/json"}'::jsonb,
      body    := jsonb_build_object('check_in_id', new.id::text)
    );
  end if;
  return new;
end;
$$;

create trigger on_checkin_completed
  after insert or update of completed on public.check_ins
  for each row execute function public.notify_friends_on_checkin();
