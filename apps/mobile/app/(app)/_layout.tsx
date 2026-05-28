import { Tabs } from 'expo-router';
import { Colors } from '../../src/lib/theme';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // hidden until Phase 2 builds the real nav bar
        contentStyle: { backgroundColor: Colors.paper },
      }}
    />
  );
}
