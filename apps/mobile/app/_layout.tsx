import 'react-native-url-polyfill/auto';
import { useEffect } from 'react';
import { AppState, View } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { setupNotificationHandler } from '../src/lib/notifications';

if (Platform.OS !== 'web') setupNotificationHandler();
import {
  useFonts,
  Fraunces_300Light,
  Fraunces_300Light_Italic,
  Fraunces_400Regular,
} from '@expo-google-fonts/fraunces';
import {
  Geist_400Regular,
  Geist_500Medium,
} from '@expo-google-fonts/geist';
import { AuthProvider, useAuth } from '../src/context/auth';
import { checkForUpdate } from '../src/lib/updates';

if (Platform.OS !== 'web') SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAuthCallback = segments[0] === 'auth';

    if (!session && !inAuthGroup && !inAuthCallback) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/(app)/');
    }
  }, [session, loading, segments]);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkForUpdate();
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      router.push('/(app)/');
    });
    return () => sub.remove();
  }, []);

  return <Slot />;
}

function SafeAreaTop() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <RootNavigator />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fraunces_300Light,
    Fraunces_300Light_Italic,
    Fraunces_400Regular,
    Geist_400Regular,
    Geist_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded && Platform.OS !== 'web') SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" backgroundColor="#F1ECE2" />
        <SafeAreaTop />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
