import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../lib/theme';
import { WeekDots } from './WeekDots';
import type { FriendBlock, FriendHabit } from '../hooks/useFriendFeed';

const AVATAR_COLORS = [Colors.sage, Colors.terracotta, Colors.gold, '#7A4E6E', Colors.inkSoft];

function avatarColor(username: string): string {
  let hash = 0;
  for (const c of username) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function FriendHabitRow({ habit }: { habit: FriendHabit }) {
  const valueText =
    habit.habit_type === 'numeric'
      ? `${habit.todayValue ?? 0}/${habit.target_value ?? '?'}${habit.target_unit ? ' ' + habit.target_unit : ''}`
      : habit.todayCompleted
      ? '✓'
      : '–';

  return (
    <View style={[styles.habitRow, habit.todayCompleted && styles.habitRowDone]}>
      <View style={[styles.habitDot, habit.todayCompleted && styles.habitDotDone]} />
      <Text
        style={[styles.habitTitle, habit.todayCompleted && styles.habitTitleDone]}
        numberOfLines={1}
      >
        {habit.title}
      </Text>
      <View style={styles.inlineDots}>
        <WeekDots days={habit.weekDots} small />
      </View>
      <Text style={[styles.streak, habit.streak === 0 && styles.streakCold]}>
        {habit.streak > 0 ? `↑${habit.streak}` : '·0'}
      </Text>
      <Text style={styles.habitValue}>{valueText}</Text>
    </View>
  );
}

function FriendBlockView({ friend }: { friend: FriendBlock }) {
  const color = avatarColor(friend.username ?? '');
  const initial = (friend.display_name ?? friend.username ?? '?')[0].toUpperCase();

  return (
    <View style={styles.friendBlock}>
      <View style={styles.friendHead}>
        <View style={[styles.friendAvatar, { backgroundColor: color }]}>
          <Text style={styles.friendAvatarText}>{initial}</Text>
        </View>
        <Text style={styles.friendName} numberOfLines={1}>
          {friend.display_name ?? friend.username}
        </Text>
        <Text style={styles.friendStats}>
          {friend.doneCount}/{friend.habits.length} today
        </Text>
      </View>
      {friend.habits.map((h) => (
        <FriendHabitRow key={h.habit_id} habit={h} />
      ))}
    </View>
  );
}

export function FriendFeedSection({ friends }: { friends: FriendBlock[] }) {
  if (friends.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionLabel}>
        <Text style={styles.sectionTitle}>Friends today</Text>
        <Text style={styles.sectionCount}>{friends.length} friends</Text>
      </View>
      {friends.map((f) => (
        <FriendBlockView key={f.user_id} friend={f} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
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

  friendBlock: {
    marginBottom: 14,
  },
  friendHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  friendAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  friendAvatarText: {
    fontFamily: Fonts.serif400,
    fontSize: 12,
    color: Colors.paper,
  },
  friendName: {
    fontFamily: Fonts.serif400,
    fontSize: 15,
    color: Colors.ink,
    flex: 1,
  },
  friendStats: {
    fontFamily: Fonts.sans400,
    fontSize: 10,
    letterSpacing: 0.5,
    color: Colors.inkMuted,
  },

  habitRow: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardLine,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  habitRowDone: {
    backgroundColor: Colors.sageSoft,
    borderColor: Colors.sage,
  },
  habitDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.inkMuted,
    flexShrink: 0,
  },
  habitDotDone: {
    backgroundColor: Colors.sage,
  },
  habitTitle: {
    flex: 1,
    fontFamily: Fonts.sans400,
    fontSize: 13,
    color: Colors.inkSoft,
  },
  habitTitleDone: {
    color: Colors.ink,
  },
  inlineDots: {
    // WeekDots has marginTop:7 built in; pull it back up so dots sit centered
    marginTop: -7,
  },
  streak: {
    fontFamily: Fonts.sans500,
    fontSize: 11,
    color: Colors.terracotta,
    flexShrink: 0,
    minWidth: 24,
    textAlign: 'right',
  },
  streakCold: {
    color: Colors.inkMuted,
  },
  habitValue: {
    fontFamily: Fonts.sans400,
    fontSize: 11,
    color: Colors.inkMuted,
    flexShrink: 0,
  },
});
