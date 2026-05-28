import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Colors, Fonts } from '../lib/theme';

interface Props {
  activeTab: 'index' | 'friends' | 'profile';
  onTabChange: (tab: 'index' | 'friends' | 'profile') => void;
  onAddHabit: () => void;
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <Text style={{ fontSize: 20, color: active ? Colors.ink : Colors.inkMuted }}>⌂</Text>
  );
}

function FriendsIcon({ active }: { active: boolean }) {
  return (
    <Text style={{ fontSize: 18, color: active ? Colors.ink : Colors.inkMuted }}>◎</Text>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <Text style={{ fontSize: 18, color: active ? Colors.ink : Colors.inkMuted }}>◉</Text>
  );
}

const TABS = [
  { id: 'index' as const, label: 'Today', Icon: HomeIcon },
  { id: 'friends' as const, label: 'Friends', Icon: FriendsIcon },
] as const;

const RIGHT_TABS = [
  { id: 'profile' as const, label: 'You', Icon: ProfileIcon },
] as const;

export function NavBar({ activeTab, onTabChange, onAddHabit }: Props) {
  return (
    <View style={styles.bar}>
      {TABS.map(({ id, label, Icon }) => (
        <TouchableOpacity key={id} style={styles.tab} onPress={() => onTabChange(id)}>
          <Icon active={activeTab === id} />
          <Text style={[styles.label, activeTab === id && styles.labelActive]}>{label}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.fab} onPress={onAddHabit} activeOpacity={0.8}>
        <Text style={styles.fabPlus}>+</Text>
      </TouchableOpacity>

      {RIGHT_TABS.map(({ id, label, Icon }) => (
        <TouchableOpacity key={id} style={styles.tab} onPress={() => onTabChange(id)}>
          <Icon active={activeTab === id} />
          <Text style={[styles.label, activeTab === id && styles.labelActive]}>{label}</Text>
        </TouchableOpacity>
      ))}

      {/* Spacer tab to balance layout */}
      <View style={styles.tab} />
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
    backgroundColor: 'rgba(241,236,226,0.92)',
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
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -10,
  },
  fabPlus: {
    color: Colors.paper,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '300',
  },
});
