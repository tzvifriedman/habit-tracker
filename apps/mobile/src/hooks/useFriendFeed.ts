import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/auth';
import { today, last7Days, computeStreak } from '../lib/date';

export interface FriendHabit {
  habit_id: string;
  title: string;
  habit_type: 'binary' | 'numeric';
  target_value: number | null;
  target_unit: string | null;
  direction: 'at_least' | 'at_most' | 'exactly' | null;
  todayCompleted: boolean;
  todayValue: number | null;
  weekDots: boolean[];
  streak: number;
}

export interface FriendBlock {
  user_id: string;
  username: string;
  display_name: string | null;
  habits: FriendHabit[];
  doneCount: number;
}

function isCompleted(
  habit_type: string,
  direction: string | null,
  target_value: number | null,
  value: number | null,
): boolean {
  if (habit_type === 'binary') return value === 1;
  if (target_value == null || value == null) return false;
  if (direction === 'at_most') return value > 0 && value <= target_value;
  if (direction === 'at_least') return value >= target_value;
  if (direction === 'exactly') return value === target_value;
  return false;
}

export function useFriendFeed() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<FriendBlock[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: friendships } = await supabase
      .from('friendships')
      .select('requester_id, addressee_id')
      .eq('status', 'accepted')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

    const friendIds = (friendships ?? []).map((f: any) =>
      f.requester_id === user.id ? f.addressee_id : f.requester_id,
    );

    if (friendIds.length === 0) {
      setFriends([]);
      setLoading(false);
      return;
    }

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 59);
    const streakStart = sixtyDaysAgo.toLocaleDateString('en-CA');

    const [profilesRes, habitsRes, checkInsRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, username, display_name')
        .in('id', friendIds),
      supabase
        .from('habits')
        .select('id, user_id, title, habit_type, target_value, target_unit, direction')
        .in('user_id', friendIds)
        .is('archived_at', null)
        .order('created_at'),
      supabase
        .from('check_ins')
        .select('habit_id, for_date, value, user_id')
        .in('user_id', friendIds)
        .gte('for_date', streakStart),
    ]);

    const profiles = profilesRes.data ?? [];
    const habits = habitsRes.data ?? [];
    const checkIns = checkInsRes.data ?? [];

    const cisByHabit: Record<string, typeof checkIns> = {};
    for (const ci of checkIns) {
      if (!cisByHabit[ci.habit_id]) cisByHabit[ci.habit_id] = [];
      cisByHabit[ci.habit_id].push(ci);
    }

    const habitsByUser: Record<string, typeof habits> = {};
    for (const h of habits) {
      if (!habitsByUser[h.user_id]) habitsByUser[h.user_id] = [];
      habitsByUser[h.user_id].push(h);
    }

    const week = last7Days();
    const todayStr = today();

    const blocks: FriendBlock[] = friendIds
      .map((uid: string) => {
        const profile = profiles.find((p: any) => p.id === uid);
        const userHabits = habitsByUser[uid] ?? [];

        const friendHabits: FriendHabit[] = userHabits.map((h: any) => {
          const cis = cisByHabit[h.id] ?? [];
          const todayCi = cis.find((ci: any) => ci.for_date === todayStr);
          const todayValue = todayCi?.value ?? null;
          const todayCompleted = isCompleted(h.habit_type, h.direction, h.target_value, todayValue);

          const weekDots = week.map((date) => {
            const ci = cis.find((c: any) => c.for_date === date);
            return ci ? isCompleted(h.habit_type, h.direction, h.target_value, ci.value) : false;
          });

          const completedDates = cis
            .filter((ci: any) => isCompleted(h.habit_type, h.direction, h.target_value, ci.value))
            .map((ci: any) => ci.for_date);
          const streak = computeStreak(completedDates);

          return {
            habit_id: h.id,
            title: h.title,
            habit_type: h.habit_type,
            target_value: h.target_value,
            target_unit: h.target_unit,
            direction: h.direction,
            todayCompleted,
            todayValue,
            weekDots,
            streak,
          };
        });

        return {
          user_id: uid,
          username: profile?.username ?? '',
          display_name: profile?.display_name ?? null,
          habits: friendHabits,
          doneCount: friendHabits.filter((h) => h.todayCompleted).length,
        };
      })
      .filter((b: FriendBlock) => b.habits.length > 0);

    setFriends(blocks);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { friends, loading, refresh };
}
