import { Stack } from 'expo-router';
import { Colors } from '../../src/lib/theme';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.paper },
        animation: 'fade',
      }}
    />
  );
}
