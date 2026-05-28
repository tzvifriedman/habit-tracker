import { createClient } from 'npm:@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body: { check_in_id: string };
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const { check_in_id } = body;
  if (!check_in_id) return new Response('Missing check_in_id', { status: 400 });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Load check-in + habit in one query
  const { data: checkIn } = await supabase
    .from('check_ins')
    .select('id, value, completed, user_id, habit:habits!check_ins_habit_id_fkey(title, habit_type, target_value, target_unit)')
    .eq('id', check_in_id)
    .single();

  if (!checkIn?.completed) {
    return new Response(JSON.stringify({ skipped: true }), { status: 200 });
  }

  const [profileRes, friendshipsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('display_name, username')
      .eq('id', checkIn.user_id)
      .single(),
    supabase
      .from('friendships')
      .select('requester_id, addressee_id')
      .eq('status', 'accepted')
      .or(`requester_id.eq.${checkIn.user_id},addressee_id.eq.${checkIn.user_id}`),
  ]);

  const friendIds = (friendshipsRes.data ?? []).map((f: any) =>
    f.requester_id === checkIn.user_id ? f.addressee_id : f.requester_id,
  );

  if (friendIds.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
  }

  const { data: devices } = await supabase
    .from('devices')
    .select('fcm_token')
    .in('user_id', friendIds);

  const tokens = (devices ?? []).map((d: any) => d.fcm_token);
  if (tokens.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
  }

  const profile = profileRes.data;
  const name = profile?.display_name ?? profile?.username ?? 'Someone';
  const habit = (checkIn as any).habit;

  let notifBody: string;
  if (habit?.habit_type === 'numeric' && checkIn.value != null) {
    const unit = habit.target_unit ? ` ${habit.target_unit}` : '';
    notifBody = `${name} logged ${checkIn.value}${unit} — ${habit.title}`;
  } else {
    notifBody = `${name} completed ${habit?.title ?? 'a habit'} ✓`;
  }

  const messages = tokens.map((token: string) => ({
    to: token,
    title: 'Habits',
    body: notifBody,
    sound: 'default',
    data: { type: 'checkin', check_in_id },
  }));

  await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(messages),
  });

  return new Response(JSON.stringify({ sent: messages.length }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
