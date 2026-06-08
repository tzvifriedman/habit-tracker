import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/auth';
import { useHabits } from '../../src/hooks/useHabits';
import { NavBar } from '../../src/components/NavBar';
import { Colors, Fonts } from '../../src/lib/theme';
import { supabase } from '../../src/lib/supabase';
import { today, computeStreak } from '../../src/lib/date';

function useProfileStats(userId: string | undefined) {
  const [streak, setStreak] = useState(0);
  const [friendCount, setFriendCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const since = oneYearAgo.toLocaleDateString('en-CA');

    Promise.all([
      supabase
        .from('check_ins')
        .select('for_date')
        .eq('user_id', userId)
        .eq('completed', true)
        .gte('for_date', since),
      supabase
        .from('friendships')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'accepted')
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`),
    ]).then(([checkInsRes, friendsRes]) => {
      if (!checkInsRes.error) {
        const uniqueDates = [...new Set((checkInsRes.data ?? []).map((r: any) => r.for_date))];
        setStreak(computeStreak(uniqueDates, today()));
      }
      if (!friendsRes.error) {
        setFriendCount(friendsRes.count ?? 0);
      }
    });
  }, [userId]);

  return { streak, friendCount };
}

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, user, signOut } = useAuth();
  const { habits } = useHabits();
  const { streak, friendCount } = useProfileStats(user?.id);

  const initial = (profile?.display_name ?? profile?.username ?? '?')[0].toUpperCase();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        {/* Avatar + name */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.name}>{profile?.display_name ?? profile?.username}</Text>
          <Text style={styles.handle}>@{profile?.username}</Text>
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{streak}</Text>
            <Text style={styles.statLabel}>Day streak</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{habits.length}</Text>
            <Text style={styles.statLabel}>Habits</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{friendCount}</Text>
            <Text style={styles.statLabel}>Friends</Text>
          </View>
        </View>

        {/* Settings */}
        <TouchableOpacity style={styles.row} onPress={signOut}>
          <Text style={[styles.rowLabel, { color: Colors.terracotta }]}>Sign out</Text>
          <Text style={styles.rowChev}>→</Text>
        </TouchableOpacity>
      </ScrollView>

      <NavBar
        activeTab="profile"
        onTabChange={(tab) => {
          if (tab === 'index') router.push('/(app)/');
          if (tab === 'friends') router.push('/(app)/friends');
          if (tab === 'habits') router.push('/(app)/habits');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.paper },
  inner: { paddingHorizontal: 28, paddingTop: 32, paddingBottom: 108 },
  avatarWrap: { alignItems: 'center', paddingVertical: 24, marginBottom: 24 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.ink,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: { fontFamily: Fonts.serif400, fontSize: 36, color: Colors.paper },
  name: { fontFamily: Fonts.serif300, fontSize: 28, color: Colors.ink },
  handle: { fontFamily: Fonts.sans400, fontSize: 12, color: Colors.inkMuted, letterSpacing: 0.5, marginTop: 4 },
  stats: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  stat: {
    flex: 1, backgroundColor: Colors.card,
    borderWidth: 1, borderColor: Colors.cardLine,
    borderRadius: 14, padding: 18, alignItems: 'center',
  },
  statNum: { fontFamily: Fonts.serif300, fontSize: 32, color: Colors.ink, lineHeight: 36 },
  statLabel: { fontFamily: Fonts.sans400, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: Colors.inkMuted, marginTop: 8 },
  row: {
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardLine,
    borderRadius: 12, padding: 14, paddingHorizontal: 16,
    marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  rowLabel: { fontFamily: Fonts.sans400, fontSize: 14, color: Colors.ink },
  rowChev: { fontFamily: Fonts.sans400, fontSize: 14, color: Colors.inkMuted },
});
