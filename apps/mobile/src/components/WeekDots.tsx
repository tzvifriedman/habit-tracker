import { View, StyleSheet } from 'react-native';
import { Colors } from '../lib/theme';

interface Props {
  days: boolean[]; // 7 booleans, index 6 = today
  small?: boolean;
}

export function WeekDots({ days, small }: Props) {
  const size = small ? 6 : 8;
  const gap = small ? 3 : 4;

  return (
    <View style={[styles.row, { gap }]}>
      {days.map((done, i) => {
        const isToday = i === 6;
        return (
          <View
            key={i}
            style={[
              styles.dot,
              { width: size, height: size, borderRadius: size / 2 },
              done ? styles.dotDone : styles.dotEmpty,
              isToday && styles.dotToday,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },
  dot: {
    borderWidth: 1,
  },
  dotEmpty: {
    backgroundColor: Colors.paperDeep,
    borderColor: Colors.cardLine,
  },
  dotDone: {
    backgroundColor: Colors.sage,
    borderColor: Colors.sage,
  },
  dotToday: {
    // Rendered via outline — simulate with a wrapper shadow ring
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 0,
    elevation: 0,
    borderWidth: 1.5,
    borderColor: Colors.ink,
  },
});
