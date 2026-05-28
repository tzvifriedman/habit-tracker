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

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function sendReset() {
    if (!email) return;
    setLoading(true);
    // Always returns success — don't leak whether the email exists
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'habit-tracker://auth/callback?type=recovery',
    });
    setLoading(false);
    setSent(true);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.brandMark}>◐  Habits</Text>

        <Text style={styles.title}>
          {'Reset your\n'}<Text style={styles.titleAccent}>password.</Text>
        </Text>

        {sent ? (
          <View style={styles.sentBox}>
            <Text style={styles.sentTitle}>Check your email</Text>
            <Text style={styles.sentBody}>
              If an account exists for {email}, we sent a reset link. It expires in 30 minutes.
            </Text>
          </View>
        ) : (
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
                returnKeyType="done"
                onSubmitEditing={sendReset}
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={sendReset} disabled={loading}>
              {loading
                ? <ActivityIndicator color={Colors.paper} />
                : <Text style={styles.buttonText}>Send reset link</Text>
              }
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.toggleWrap}>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.toggleLink}>Back to sign in</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.paper },
  inner: { flexGrow: 1, paddingHorizontal: 32, paddingTop: 48, paddingBottom: 40 },
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
    marginBottom: 36,
  },
  titleAccent: { fontFamily: Fonts.serif300Italic, color: Colors.terracotta },
  form: { gap: 6 },
  fieldGroup: { marginBottom: 18 },
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
  buttonText: { fontFamily: Fonts.sans500, fontSize: 15, color: Colors.paper, letterSpacing: 0.3 },
  sentBox: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardLine,
    borderRadius: 16,
    padding: 24,
  },
  sentTitle: {
    fontFamily: Fonts.serif400,
    fontSize: 20,
    color: Colors.ink,
    marginBottom: 8,
  },
  sentBody: {
    fontFamily: Fonts.sans400,
    fontSize: 14,
    lineHeight: 21,
    color: Colors.inkSoft,
  },
  toggleWrap: { alignItems: 'center', marginTop: 'auto', paddingTop: 40 },
  toggleLink: {
    fontFamily: Fonts.sans500,
    fontSize: 14,
    color: Colors.ink,
    textDecorationLine: 'underline',
  },
});
