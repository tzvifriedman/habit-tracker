import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { Colors, Fonts } from '../../src/lib/theme';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token_hash?: string; type?: string }>();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');

  useEffect(() => {
    handleCallback();
  }, []);

  async function handleCallback() {
    const { token_hash, type } = params;

    if (!token_hash || !type) {
      setStatus('error');
      return;
    }

    if (type === 'recovery') {
      // Password reset — verify the token, then send to reset screen
      const { error } = await supabase.auth.verifyOtp({ token_hash, type: 'recovery' });
      if (error) {
        Alert.alert('Link expired', 'This reset link is no longer valid. Please request a new one.');
        router.replace('/(auth)/forgot-password');
      } else {
        router.replace('/auth/reset-password');
      }
      return;
    }

    // Email verification (type === 'signup' or 'email')
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'signup' | 'email',
    });

    if (error) {
      setStatus('error');
      Alert.alert('Verification failed', 'This link may have expired. Sign in to request a new one.');
      router.replace('/(auth)/login');
    } else {
      // Session is now active — root navigator will redirect to (app)/
      router.replace('/(app)/');
    }
  }

  return (
    <View style={styles.container}>
      {status === 'loading' && (
        <>
          <ActivityIndicator size="large" color={Colors.ink} />
          <Text style={styles.label}>Verifying…</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  label: {
    fontFamily: Fonts.sans400,
    fontSize: 15,
    color: Colors.inkMuted,
  },
});
