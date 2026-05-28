import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { today, last7Days } from '../lib/date';
import { useAuth } from '../context/auth';

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  habit_type: 'binary' | 'numeric';
  target_value: number | null;
  target_unit: string | null;
  direction: 'at_least' | 'at_most' | 'exactly' | null;
  archived_at: string | null;
  created_at: string;
}

export interface CheckIn {
  id: string;
  habit_id: string;
  for_date: string;
  value: number | null;
  completed: boolean | null;
}

export interface HabitWithStatus extends Habit {
  todayCheckIn: CheckIn | null;
  weekDots: boolean[]; // 7 booleans, index 0 = 6 days ago, index 6 = today
}

function isCompleted(habit: Habit, value: number | null): boolean {
  if (habit.habit_type === 'binary') return value === 1;
  if (habit.target_value == null || value == null) return false;
  if (habit.direction === 'at_most') return value > 0 && value <= habit.target_value;
  if (habit.direction === 'at_least') return value >= habit.target_value;
  if (habit.direction === 'exactly') return value === habit.target_value;
  return false;
}

export function useHabits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<HabitWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const week = last7Days();
    const weekStart = week[0];

    const [habitsRes, checkInsRes] = await Promise.all([
      supabase
        .from('habits')
        .select('*')
        .is('archived_at', null)
        .order('created_at'),
      supabase
        .from('check_ins')
        .select('*')
        .gte('for_date', weekStart),
    ]);

    if (habitsRes.error || checkInsRes.error) {
      setError('Failed to load habits.');
      setLoading(false);
      return;
    }

    const checkInsByHabit: Record<string, CheckIn[]> = {};
    for (const ci of checkInsRes.data ?? []) {
      if (!checkInsByHabit[ci.habit_id]) checkInsByHabit[ci.habit_id] = [];
      checkInsByHabit[ci.habit_id].push(ci);
    }

    const enriched: HabitWithStatus[] = (habitsRes.data ?? []).map((h) => {
      const cis = checkInsByHabit[h.id] ?? [];
      const todayCheckIn = cis.find((c) => c.for_date === today()) ?? null;
      const weekDots = week.map((date) => {
        const ci = cis.find((c) => c.for_date === date);
        return ci ? isCompleted(h, ci.value) : false;
      });
      return { ...h, todayCheckIn, weekDots };
    });

    setHabits(enriched);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  async function createHabit(params: {
    title: string;
    habit_type: 'binary' | 'numeric';
    target_value?: number;
    target_unit?: string;
    direction?: 'at_least' | 'at_most';
  }) {
    if (!user) return;

    const optimistic: HabitWithStatus = {
      id: `temp-${Date.now()}`,
      user_id: user.id,
      title: params.title,
      habit_type: params.habit_type,
      target_value: params.target_value ?? null,
      target_unit: params.target_unit ?? null,
      direction: params.direction ?? null,
      archived_at: null,
      created_at: new Date().toISOString(),
      todayCheckIn: null,
      weekDots: [false, false, false, false, false, false, false],
    };

    setHabits((prev) => [...prev, optimistic]);

    const { error } = await supabase.from('habits').insert({
      user_id: user.id,
      title: params.title,
      habit_type: params.habit_type,
      target_value: params.target_value ?? null,
      target_unit: params.target_unit ?? null,
      direction: params.direction ?? null,
    });

    if (error) {
      setHabits((prev) => prev.filter((h) => h.id !== optimistic.id));
      return false;
    }

    refresh();
    return true;
  }

  async function checkInBinary(habit: HabitWithStatus) {
    if (!user) return;
    const done = !isCompleted(habit, habit.todayCheckIn?.value ?? null);

    // Optimistic update
    setHabits((prev) =>
      prev.map((h) =>
        h.id !== habit.id
          ? h
          : {
              ...h,
              todayCheckIn: {
                id: h.todayCheckIn?.id ?? `temp-${Date.now()}`,
                habit_id: h.id,
                for_date: today(),
                value: done ? 1 : 0,
                completed: done,
              },
              weekDots: h.weekDots.map((v, i) => (i === 6 ? done : v)),
            },
      ),
    );

    await supabase.from('check_ins').upsert(
      {
        habit_id: habit.id,
        user_id: user.id,
        for_date: today(),
        value: done ? 1 : 0,
        completed: done,
      },
      { onConflict: 'habit_id,for_date' },
    );
  }

  async function checkInNumeric(habit: HabitWithStatus, value: number) {
    if (!user) return;
    const completed = isCompleted(habit, value);

    setHabits((prev) =>
      prev.map((h) =>
        h.id !== habit.id
          ? h
          : {
              ...h,
              todayCheckIn: {
                id: h.todayCheckIn?.id ?? `temp-${Date.now()}`,
                habit_id: h.id,
                for_date: today(),
                value,
                completed,
              },
              weekDots: h.weekDots.map((v, i) => (i === 6 ? completed : v)),
            },
      ),
    );

    await supabase.from('check_ins').upsert(
      {
        habit_id: habit.id,
        user_id: user.id,
        for_date: today(),
        value,
        completed,
      },
      { onConflict: 'habit_id,for_date' },
    );
  }

  return { habits, loading, error, refresh, createHabit, checkInBinary, checkInNumeric };
}
