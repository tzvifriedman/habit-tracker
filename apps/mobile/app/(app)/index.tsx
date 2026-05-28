import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../src/lib/theme';
import { useAuth } from '../../src/context/auth';

// Placeholder — replaced in Phase 2 with the real dashboard
export default function DashboardPlaceholder() {
  const { profile, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Hello, <Text style={styles.accent}>{profile?.display_name ?? profile?.username ?? '…'}</Text>
      </Text>
      <Text style={styles.sub}>Dashboard coming in Phase 2.</Text>
      <Text style={styles.link} onPress={signOut}>Sign out</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  title: { fontFamily: Fonts.serif300, fontSize: 28, color: Colors.ink },
  accent: { fontFamily: Fonts.serif300Italic, color: Colors.terracotta },
  sub: { fontFamily: Fonts.sans400, fontSize: 14, color: Colors.inkMuted },
  link: { fontFamily: Fonts.sans500, fontSize: 14, color: Colors.ink, textDecorationLine: 'underline', marginTop: 8 },
});
