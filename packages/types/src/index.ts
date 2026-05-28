// Database row types — mirrors the Supabase schema exactly

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  quiet_hours_start: string | null; // "HH:MM:SS"
  quiet_hours_end: string | null;
  created_at: string;
}

export interface Device {
  id: string;
  user_id: string;
  fcm_token: string;
  platform: 'ios' | 'android' | 'web';
  last_seen_at: string | null;
}

export type HabitType = 'binary' | 'numeric';
export type HabitDirection = 'at_least' | 'at_most' | 'exactly';

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  habit_type: HabitType;
  target_value: number | null;
  target_unit: string | null;
  direction: HabitDirection | null;
  frequency: string;
  archived_at: string | null;
  created_at: string;
}

export interface CheckIn {
  id: string;
  habit_id: string;
  user_id: string;
  for_date: string; // "YYYY-MM-DD"
  value: number | null;
  completed: boolean | null;
  note: string | null;
  created_at: string;
}

export type FriendshipStatus = 'pending' | 'accepted' | 'blocked';

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  responded_at: string | null;
}

// Feed shape returned by feed_view
export interface FeedHabit extends Habit {
  username: string;
  display_name: string | null;
  recent_checkins: Array<{
    for_date: string;
    completed: boolean | null;
    value: number | null;
  }> | null;
}

// Computed streak — pure function, no DB
export function computeStreak(
  checkins: Array<{ for_date: string; completed: boolean | null }>,
  today: string // "YYYY-MM-DD"
): number {
  const sorted = [...checkins]
    .filter((c) => c.completed)
    .map((c) => c.for_date)
    .sort()
    .reverse();

  if (sorted.length === 0) return 0;

  let streak = 0;
  let cursor = today;

  for (const date of sorted) {
    if (date === cursor) {
      streak++;
      cursor = offsetDate(cursor, -1);
    } else if (date === offsetDate(cursor, -1) && streak === 0) {
      // yesterday counts if today not yet checked in
      streak++;
      cursor = offsetDate(date, -1);
    } else {
      break;
    }
  }

  return streak;
}

function offsetDate(date: string, days: number): string {
  const d = new Date(date + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
