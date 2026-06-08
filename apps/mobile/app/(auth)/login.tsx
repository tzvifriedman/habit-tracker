import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { Colors, Fonts } from '../../src/lib/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function signIn() {
    if (!email || !password) return;
    setErrorMsg(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setErrorMsg(error.message);
    // On success the AuthProvider session change redirects automatically
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.brandMark}>◐  Habits</Text>

        <Text style={styles.title}>
          {'Build it\n'}<Text style={styles.titleAccent}>together.</Text>
        </Text>
        <Text style={styles.subtitle}>
          Track your daily habits with friends. See everyone's progress in one place.
        </Text>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={styles.field}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={Colors.inkMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              returnKeyType="next"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Password</Text>
            <TextInput
              style={styles.field}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={Colors.inkMuted}
              secureTextEntry
              autoComplete="current-password"
              returnKeyType="done"
              onSubmitEditing={signIn}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={signIn} disabled={loading}>
            {loading
              ? <ActivityIndicator color={Colors.paper} />
              : <Text style={styles.buttonText}>Sign in</Text>
            }
          </TouchableOpacity>

          {errorMsg && (
            <Text style={styles.errorText}>{errorMsg}</Text>
          )}

          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity style={styles.forgotWrap}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.toggleWrap}>
          <Text style={styles.toggleText}>New here?{' '}</Text>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity>
              <Text style={styles.toggleLink}>Create an account</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  inner: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingTop: 48,
    paddingBottom: 40,
  },
  brandMark: {
    fontFamily: Fonts.serif400,
    fontSize: 13,
    letterSpacing: 4,
    textTransform: 'uppercase',
    color: Colors.inkSoft,
    marginBottom: 72,
  },
  title: {
    fontFamily: Fonts.serif300,
    fontSize: 52,
    lineHeight: 52,
    letterSpacing: -1.5,
    color: Colors.ink,
    marginBottom: 16,
  },
  titleAccent: {
    fontFamily: Fonts.serif300Italic,
    color: Colors.terracotta,
  },
  subtitle: {
    fontFamily: Fonts.sans400,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.inkSoft,
    marginBottom: 44,
    maxWidth: 280,
  },
  form: {
    gap: 6,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontFamily: Fonts.sans500,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
    marginBottom: 6,
  },
  field: {
    fontFamily: Fonts.sans400,
    fontSize: 17,
    color: Colors.ink,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.ink,
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  button: {
    marginTop: 28,
    backgroundColor: Colors.ink,
    borderRadius: 100,
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: Fonts.sans500,
    fontSize: 15,
    color: Colors.paper,
    letterSpacing: 0.3,
  },
  errorText: {
    fontFamily: Fonts.sans400,
    fontSize: 13,
    color: Colors.terracotta,
    textAlign: 'center',
    marginTop: 12,
  },
  forgotWrap: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotText: {
    fontFamily: Fonts.sans400,
    fontSize: 13,
    color: Colors.inkMuted,
  },
  toggleWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 40,
  },
  toggleText: {
    fontFamily: Fonts.sans400,
    fontSize: 14,
    color: Colors.inkSoft,
  },
  toggleLink: {
    fontFamily: Fonts.sans500,
    fontSize: 14,
    color: Colors.ink,
    textDecorationLine: 'underline',
  },
});
