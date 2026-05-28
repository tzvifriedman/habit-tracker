-- Enable citext for case-insensitive email uniqueness
create extension if not exists citext;

-- ── Profiles ──────────────────────────────────────────────────────────────────
-- Mirrors auth.users. Created automatically after signup via trigger.
create table public.profiles (
  id                   uuid primary key references auth.users on delete cascade,
  username             text unique not null
                         check (username ~ '^[a-z0-9_]{3,20}$'),
  display_name         text,
  quiet_hours_start    time,
  quiet_hours_end      time,
  created_at           timestamptz default now()
);

-- Auto-create a profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    new.raw_user_meta_data->>'display_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Devices ───────────────────────────────────────────────────────────────────
create table public.devices (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.profiles on delete cascade,
  fcm_token       text not null,
  platform        text check (platform in ('ios', 'android', 'web')),
  last_seen_at    timestamptz,
  unique (user_id, fcm_token)
);

-- ── Habits ────────────────────────────────────────────────────────────────────
create table public.habits (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.profiles on delete cascade,
  title           text not null,
  habit_type      text check (habit_type in ('binary', 'numeric')) not null,
  target_value    numeric,
  target_unit     text,
  direction       text check (direction in ('at_least', 'at_most', 'exactly')),
  frequency       text default 'daily',
  archived_at     timestamptz,
  created_at      timestamptz default now()
);

-- ── Check-ins ─────────────────────────────────────────────────────────────────
create table public.check_ins (
  id              uuid primary key default gen_random_uuid(),
  habit_id        uuid references public.habits on delete cascade,
  user_id         uuid references public.profiles on delete cascade,
  for_date        date not null,
  value           numeric,
  completed       boolean,
  note            text,
  created_at      timestamptz default now(),
  unique (habit_id, for_date)
);

-- ── Friendships ───────────────────────────────────────────────────────────────
create table public.friendships (
  id              uuid primary key default gen_random_uuid(),
  requester_id    uuid references public.profiles on delete cascade,
  addressee_id    uuid references public.profiles on delete cascade,
  status          text check (status in ('pending', 'accepted', 'blocked'))
                    default 'pending',
  created_at      timestamptz default now(),
  responded_at    timestamptz,
  unique (requester_id, addressee_id)
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index on public.check_ins (user_id, for_date desc);
create index on public.friendships (addressee_id, status);
create index on public.habits (user_id) where archived_at is null;

-- ── Feed view ─────────────────────────────────────────────────────────────────
-- One row per habit, with last 7 days of check-ins aggregated.
-- The app uses this to render the dashboard in a single round trip.
create or replace view public.feed_view as
select
  h.id            as habit_id,
  h.user_id,
  p.username,
  p.display_name,
  h.title,
  h.habit_type,
  h.target_value,
  h.target_unit,
  h.direction,
  json_agg(
    json_build_object(
      'for_date',  ci.for_date,
      'completed', ci.completed,
      'value',     ci.value
    )
    order by ci.for_date desc
  ) filter (where ci.id is not null) as recent_checkins
from public.habits h
join public.profiles p on p.id = h.user_id
left join public.check_ins ci
  on  ci.habit_id = h.id
  and ci.for_date >= current_date - interval '6 days'
where h.archived_at is null
group by
  h.id, h.user_id, p.username, p.display_name,
  h.title, h.habit_type, h.target_value, h.target_unit, h.direction;

-- ── Row Level Security ────────────────────────────────────────────────────────

alter table public.profiles   enable row level security;
alter table public.devices     enable row level security;
alter table public.habits      enable row level security;
alter table public.check_ins   enable row level security;
alter table public.friendships enable row level security;

-- Helper: returns true if two users are accepted friends
create or replace function public.are_friends(a uuid, b uuid)
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.friendships
    where status = 'accepted'
      and ((requester_id = a and addressee_id = b)
        or (requester_id = b and addressee_id = a))
  );
$$;

-- Profiles
create policy "profiles: own full access"
  on public.profiles for all using (auth.uid() = id);

create policy "profiles: friends can read"
  on public.profiles for select
  using (id = auth.uid() or public.are_friends(auth.uid(), id));

-- Devices: own only
create policy "devices: own"
  on public.devices for all using (auth.uid() = user_id);

-- Habits
create policy "habits: own full access"
  on public.habits for all using (auth.uid() = user_id);

create policy "habits: friends can read"
  on public.habits for select
  using (auth.uid() = user_id or public.are_friends(auth.uid(), user_id));

-- Check-ins
create policy "check_ins: own full access"
  on public.check_ins for all using (auth.uid() = user_id);

create policy "check_ins: friends can read"
  on public.check_ins for select
  using (auth.uid() = user_id or public.are_friends(auth.uid(), user_id));

-- Friendships: both parties can see and manage
create policy "friendships: parties only"
  on public.friendships for all
  using (auth.uid() = requester_id or auth.uid() = addressee_id);
