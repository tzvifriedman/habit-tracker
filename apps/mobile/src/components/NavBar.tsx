import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Colors, Fonts } from '../lib/theme';

type Tab = 'index' | 'friends' | 'habits' | 'profile';

interface Props {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'index',   label: 'Today',   icon: '⌂' },
  { id: 'friends', label: 'Friends', icon: '◎' },
  { id: 'habits',  label: 'Habits',  icon: '▦' },
  { id: 'profile', label: 'You',     icon: '◉' },
];

export function NavBar({ activeTab, onTabChange }: Props) {
  return (
    <View style={styles.bar}>
      {TABS.map(({ id, label, icon }) => {
        const active = activeTab === id;
        return (
          <TouchableOpacity key={id} style={styles.tab} onPress={() => onTabChange(id)}>
            <Text style={[styles.icon, active && styles.iconActive]}>{icon}</Text>
            <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 88 : 72,
    backgroundColor: 'rgba(241,236,226,0.96)',
    borderTopWidth: 1,
    borderTopColor: Colors.cardLine,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  icon: {
    fontSize: 19,
    color: Colors.inkMuted,
  },
  iconActive: {
    color: Colors.ink,
  },
  label: {
    fontFamily: Fonts.sans400,
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
  },
  labelActive: {
    color: Colors.ink,
  },
});
