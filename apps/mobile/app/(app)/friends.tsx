import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { NavBar } from '../../src/components/NavBar';
import { Colors, Fonts } from '../../src/lib/theme';

// Placeholder — replaced in Phase 3 with the real friends screen
export default function FriendsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>Friends</Text>
        <Text style={styles.sub}>Coming in Phase 3.</Text>
      </View>
      <NavBar
        activeTab="friends"
        onTabChange={(tab) => {
          if (tab === 'index') router.push('/(app)/');
          if (tab === 'profile') router.push('/(app)/profile');
        }}
        onAddHabit={() => router.push('/(app)/')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.paper },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { fontFamily: Fonts.serif300, fontSize: 32, color: Colors.ink },
  sub: { fontFamily: Fonts.sans400, fontSize: 14, color: Colors.inkMuted },
});
