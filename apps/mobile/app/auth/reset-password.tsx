import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { Colors, Fonts } from '../../src/lib/theme';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  async function updatePassword() {
    if (password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Passwords do not match');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      Alert.alert('Update failed', 'Please try again or request a new reset link.');
      return;
    }

    Alert.alert('Password updated', 'You are now signed in.');
    router.replace('/(app)/');
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Text style={styles.brandMark}>◐  Habits</Text>
        <Text style={styles.title}>
          {'Choose a new\n'}<Text style={styles.titleAccent}>password.</Text>
        </Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>New password</Text>
          <TextInput
            style={styles.field}
            value={password}
            onChangeText={setPassword}
            placeholder="8+ characters"
            placeholderTextColor={Colors.inkMuted}
            secureTextEntry
            autoComplete="new-password"
            returnKeyType="next"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Confirm password</Text>
          <TextInput
            style={styles.field}
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Same as above"
            placeholderTextColor={Colors.inkMuted}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={updatePassword}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={updatePassword} disabled={loading}>
          {loading
            ? <ActivityIndicator color={Colors.paper} />
            : <Text style={styles.buttonText}>Update password</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.paper },
  inner: { flex: 1, paddingHorizontal: 32, paddingTop: 48 },
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
});
