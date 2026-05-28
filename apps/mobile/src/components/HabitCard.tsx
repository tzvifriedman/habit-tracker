import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { WeekDots } from './WeekDots';
import { Colors, Fonts } from '../lib/theme';
import type { HabitWithStatus } from '../hooks/useHabits';

interface Props {
  habit: HabitWithStatus;
  onToggle: () => void;        // binary tap
  onNumericPress: () => void;  // opens numeric modal
}

export function HabitCard({ habit, onToggle, onNumericPress }: Props) {
  const done = habit.todayCheckIn?.completed ?? false;
  const value = habit.todayCheckIn?.value;

  function handlePress() {
    if (habit.habit_type === 'binary') onToggle();
    else onNumericPress();
  }

  const metaText = habit.habit_type === 'binary'
    ? (done ? '✓ Done today' : 'Tap to check in')
    : (habit.direction === 'at_most' ? 'Stay below target' : 'Reach target');

  return (
    <TouchableOpacity
      style={[styles.card, done && styles.cardDone]}
      onPress={handlePress}
      activeOpacity={0.75}
    >
      <View style={[styles.check, done && styles.checkDone]}>
        {done && (
          <Text style={styles.checkMark}>✓</Text>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{habit.title}</Text>
        <Text style={[styles.meta, done && styles.metaDone]}>{metaText}</Text>
        <WeekDots days={habit.weekDots} />
      </View>

      {habit.habit_type === 'numeric' && (
        <View style={styles.valueWrap}>
          <Text style={styles.value}>
            {value ?? 0}
          </Text>
          <Text style={styles.valueUnit}>
            /{habit.target_value} {habit.target_unit}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardLine,
    borderRadius: 12,
    padding: 10,
    paddingHorizontal: 14,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardDone: {
    backgroundColor: Colors.sageSoft,
    borderColor: Colors.sage,
  },
  check: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.inkMuted,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkDone: {
    backgroundColor: Colors.sage,
    borderColor: Colors.sage,
  },
  checkMark: {
    color: '#fff',
    fontSize: 10,
    fontFamily: Fonts.sans500,
    lineHeight: 13,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: Fonts.sans500,
    fontSize: 14,
    color: Colors.ink,
    lineHeight: 18,
  },
  meta: {
    fontFamily: Fonts.sans400,
    fontSize: 10,
    letterSpacing: 0.3,
    color: Colors.inkMuted,
    marginTop: 1,
  },
  metaDone: {
    color: Colors.sage,
  },
  valueWrap: {
    alignItems: 'flex-end',
  },
  value: {
    fontFamily: Fonts.serif400,
    fontSize: 17,
    color: Colors.ink,
    lineHeight: 20,
  },
  valueUnit: {
    fontFamily: Fonts.sans400,
    fontSize: 10,
    color: Colors.inkMuted,
    letterSpacing: 0.2,
  },
});
