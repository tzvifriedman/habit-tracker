// Deno edge function — invoked by a Postgres trigger on check_ins insert
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const FCM_PROJECT_ID = Deno.env.get('FCM_PROJECT_ID')!;
const FCM_SERVER_KEY = Deno.env.get('FCM_SERVER_KEY')!;

Deno.serve(async (req) => {
  const { habit_id, user_id } = await req.json();

  // 1. Fetch the habit title and actor's display name
  const [{ data: habit }, { data: actor }] = await Promise.all([
    supabaseAdmin.from('habits').select('title').eq('id', habit_id).single(),
    supabaseAdmin.from('profiles').select('display_name, username').eq('id', user_id).single(),
  ]);

  const actorName = actor?.display_name ?? actor?.username ?? 'Someone';
  const body = `${actorName} logged: ${habit?.title}`;

  // 2. Find accepted friends who have registered devices
  const { data: friendships } = await supabaseAdmin
    .from('friendships')
    .select('requester_id, addressee_id')
    .eq('status', 'accepted')
    .or(`requester_id.eq.${user_id},addressee_id.eq.${user_id}`);

  if (!friendships?.length) return new Response('no friends', { status: 200 });

  const friendIds = friendships.map((f) =>
    f.requester_id === user_id ? f.addressee_id : f.requester_id
  );

  const { data: devices } = await supabaseAdmin
    .from('devices')
    .select('fcm_token')
    .in('user_id', friendIds);

  if (!devices?.length) return new Response('no devices', { status: 200 });

  // 3. Send via FCM HTTP v1 — batch up to 500 tokens
  const tokens = devices.map((d) => d.fcm_token);
  await fetch(
    `https://fcm.googleapis.com/v1/projects/${FCM_PROJECT_ID}/messages:send`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${FCM_SERVER_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          notification: { title: 'Habits', body },
          tokens,
        },
      }),
    },
  );

  return new Response('ok', { status: 200 });
});
