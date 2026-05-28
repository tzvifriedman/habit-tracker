import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { Profile, Habit, CheckIn, Friendship, FeedHabit } from '@habit-tracker/types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Secure token storage: SecureStore on native, localStorage on web
const SecureStoreAdapter = {
  getItem: (key: string) =>
    Platform.OS === 'web'
      ? Promise.resolve(localStorage.getItem(key))
      : SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) =>
    Platform.OS === 'web'
      ? Promise.resolve(localStorage.setItem(key, value))
      : SecureStore.setItemAsync(key, value),
  removeItem: (key: string) =>
    Platform.OS === 'web'
      ? Promise.resolve(localStorage.removeItem(key))
      : SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Typed query helpers
export const db = {
  profiles: () => supabase.from<'profiles', Profile>('profiles'),
  habits: () => supabase.from<'habits', Habit>('habits'),
  checkIns: () => supabase.from<'check_ins', CheckIn>('check_ins'),
  friendships: () => supabase.from<'friendships', Friendship>('friendships'),
  feed: () => supabase.from<'feed_view', FeedHabit>('feed_view'),
};
