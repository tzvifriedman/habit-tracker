import { useEffect } from 'react';
import { AppState } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/auth';
import { checkForUpdate } from './src/lib/updates';

function RootNavigator() {
  const { session, loading } = useAuth();

  // Check for OTA updates every time app comes to foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkForUpdate();
    });
    return () => sub.remove();
  }, []);

  if (loading) return null;

  // Phase 0: placeholder screens — replaced in Phase 1 with real navigation
  if (!session) {
    return (
      <>
        <StatusBar style="dark" backgroundColor="#F1ECE2" />
        {/* AuthStack added in Phase 1 */}
      </>
    );
  }

  return (
    <>
      <StatusBar style="dark" backgroundColor="#F1ECE2" />
      {/* Main tab navigator added in Phase 2 */}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
