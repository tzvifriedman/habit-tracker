import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/auth';
import { useHabits } from '../../src/hooks/useHabits';
import { HabitCard } from '../../src/components/HabitCard';
import { AddHabitModal } from '../../src/components/AddHabitModal';
import { NumericCheckInModal } from '../../src/components/NumericCheckInModal';
import { NavBar } from '../../src/components/NavBar';
import { Colors, Fonts } from '../../src/lib/theme';
import { formatDisplayDate } from '../../src/lib/date';
import type { HabitWithStatus } from '../../src/hooks/useHabits';

export default function DashboardScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { habits, loading, refresh, createHabit, checkInBinary, checkInNumeric } = useHabits();

  const [showAddHabit, setShowAddHabit] = useState(false);
  const [numericHabit, setNumericHabit] = useState<HabitWithStatus | null>(null);

  const done = habits.filter((h) => h.todayCheckIn?.completed).length;
  const firstName = profile?.display_name?.split(' ')[0] ?? profile?.username ?? '…';

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={Colors.inkMuted} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerDate}>{formatDisplayDate()}</Text>
            <Text style={styles.headerGreet}>
              Hello,{'\n'}
              <Text style={styles.headerName}>{firstName}.</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => router.push('/(app)/profile')}
          >
            <Text style={styles.avatarText}>
              {(profile?.display_name ?? profile?.username ?? '?')[0].toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Your habits */}
        <View style={styles.section}>
          <View style={styles.sectionLabel}>
            <Text style={styles.sectionTitle}>Your habits</Text>
            <Text style={styles.sectionCount}>{done}/{habits.length} done</Text>
          </View>

          {habits.length === 0 && !loading && (
            <TouchableOpacity style={styles.emptyCard} onPress={() => setShowAddHabit(true)}>
              <Text style={styles.emptyTitle}>No habits yet</Text>
              <Text style={styles.emptySub}>Tap + to create your first habit</Text>
            </TouchableOpacity>
          )}

          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={() => checkInBinary(habit)}
              onNumericPress={() => setNumericHabit(habit)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Modals */}
      <AddHabitModal
        visible={showAddHabit}
        onClose={() => setShowAddHabit(false)}
        onCreate={createHabit}
      />
      <NumericCheckInModal
        habit={numericHabit}
        onClose={() => setNumericHabit(null)}
        onSave={(habit, value) => checkInNumeric(habit, value)}
      />

      {/* Nav bar */}
      <NavBar
        activeTab="index"
        onTabChange={(tab) => {
          if (tab === 'friends') router.push('/(app)/friends');
          if (tab === 'profile') router.push('/(app)/profile');
        }}
        onAddHabit={() => setShowAddHabit(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.paper },
  scroll: { flex: 1 },
  content: { paddingBottom: 108 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerDate: {
    fontFamily: Fonts.sans400,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
    marginBottom: 4,
  },
  headerGreet: {
    fontFamily: Fonts.serif300,
    fontSize: 24,
    lineHeight: 26,
    letterSpacing: -0.5,
    color: Colors.ink,
  },
  headerName: {
    fontFamily: Fonts.serif300Italic,
    color: Colors.terracotta,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Fonts.serif400,
    fontSize: 15,
    color: Colors.paper,
  },
  section: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 4,
  },
  sectionLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardLine,
  },
  sectionTitle: {
    fontFamily: Fonts.sans400,
    fontSize: 10,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
  },
  sectionCount: {
    fontFamily: Fonts.sans500,
    fontSize: 10,
    letterSpacing: 0.5,
    color: Colors.ink,
  },
  emptyCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardLine,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontFamily: Fonts.serif400,
    fontSize: 16,
    color: Colors.ink,
  },
  emptySub: {
    fontFamily: Fonts.sans400,
    fontSize: 13,
    color: Colors.inkMuted,
  },
});
