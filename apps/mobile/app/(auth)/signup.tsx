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

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUp() {
    if (!email || !username || !password) return;

    if (!USERNAME_RE.test(username)) {
      Alert.alert('Invalid username', '3–20 characters, lowercase letters, numbers, and underscores only.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: username.toLowerCase(), display_name: username },
        // Supabase will send verification email; redirect lands on habit-tracker://auth/callback
        emailRedirectTo: 'habit-tracker://auth/callback',
      },
    });
    setLoading(false);

    if (error) {
      Alert.alert("Couldn't create account", error.message);
      return;
    }

    // email confirmations disabled — session is active immediately after signUp
    // AuthProvider's onAuthStateChange will fire and redirect to (app)
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.brandMark}>◐  Habits</Text>

        <Text style={styles.title}>
          {'Create your\n'}<Text style={styles.titleAccent}>account.</Text>
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
            <Text style={styles.fieldLabel}>Username</Text>
            <TextInput
              style={styles.field}
              value={username}
              onChangeText={(t) => setUsername(t.toLowerCase())}
              placeholder="e.g. alex"
              placeholderTextColor={Colors.inkMuted}
              autoCapitalize="none"
              autoComplete="username-new"
              returnKeyType="next"
            />
            <Text style={styles.fieldHint}>3–20 chars, lowercase letters, numbers, underscores</Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Password</Text>
            <TextInput
              style={styles.field}
              value={password}
              onChangeText={setPassword}
              placeholder="8+ characters"
              placeholderTextColor={Colors.inkMuted}
              secureTextEntry
              autoComplete="new-password"
              returnKeyType="done"
              onSubmitEditing={signUp}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={signUp} disabled={loading}>
            {loading
              ? <ActivityIndicator color={Colors.paper} />
              : <Text style={styles.buttonText}>Create account</Text>
            }
          </TouchableOpacity>
        </View>

        <View style={styles.toggleWrap}>
          <Text style={styles.toggleText}>Already have one?{' '}</Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.toggleLink}>Sign in</Text>
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
  fieldHint: {
    fontFamily: Fonts.sans400,
    fontSize: 11,
    color: Colors.inkMuted,
    marginTop: 4,
  },
  button: {
    marginTop: 28,
    backgroundColor: Colors.ink,
    borderRadius: 100,
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: { fontFamily: Fonts.sans500, fontSize: 15, color: Colors.paper, letterSpacing: 0.3 },
  toggleWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 40,
  },
  toggleText: { fontFamily: Fonts.sans400, fontSize: 14, color: Colors.inkSoft },
  toggleLink: { fontFamily: Fonts.sans500, fontSize: 14, color: Colors.ink, textDecorationLine: 'underline' },
});
