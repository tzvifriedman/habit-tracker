import { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, Fonts } from '../lib/theme';
import type { HabitWithStatus } from '../hooks/useHabits';

interface Props {
  habit: HabitWithStatus | null;
  onClose: () => void;
  onSave: (habit: HabitWithStatus, value: number) => void;
}

export function NumericCheckInModal({ habit, onClose, onSave }: Props) {
  const [input, setInput] = useState('');

  useEffect(() => {
    if (habit) {
      setInput(habit.todayCheckIn?.value?.toString() ?? '');
    }
  }, [habit]);

  if (!habit) return null;

  const targetLabel = habit.direction === 'at_most'
    ? `Target · under ${habit.target_value} ${habit.target_unit ?? ''}`
    : `Target · ${habit.target_value} ${habit.target_unit ?? ''}`;

  function handleSave() {
    const v = parseFloat(input);
    if (!isNaN(v) && habit) {
      onSave(habit, v);
      onClose();
    }
  }

  return (
    <Modal visible={!!habit} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.sheetWrap}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title} numberOfLines={1}>{habit.title}</Text>
          <Text style={styles.targetLabel}>{targetLabel}</Text>

          <TextInput
            style={styles.bigInput}
            value={input}
            onChangeText={setInput}
            keyboardType="decimal-pad"
            autoFocus
            placeholder="0"
            placeholderTextColor={Colors.inkMuted}
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(26,26,26,0.4)' },
  sheetWrap: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  sheet: {
    backgroundColor: Colors.paper,
    borderRadius: 32,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.cardLine,
    alignSelf: 'center', marginBottom: 20,
  },
  title: {
    fontFamily: Fonts.serif300,
    fontSize: 22,
    color: Colors.ink,
    marginBottom: 4,
  },
  targetLabel: {
    fontFamily: Fonts.sans400,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
    marginBottom: 16,
  },
  bigInput: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardLine,
    borderRadius: 16,
    padding: 24,
    textAlign: 'center',
    fontFamily: Fonts.serif300,
    fontSize: 48,
    color: Colors.ink,
    marginBottom: 16,
  },
  actions: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1, borderWidth: 1, borderColor: Colors.cardLine,
    borderRadius: 100, padding: 14, alignItems: 'center',
  },
  cancelText: { fontFamily: Fonts.sans400, fontSize: 14, color: Colors.inkSoft },
  saveBtn: {
    flex: 2, backgroundColor: Colors.ink,
    borderRadius: 100, padding: 14, alignItems: 'center',
  },
  saveText: { fontFamily: Fonts.sans500, fontSize: 14, color: Colors.paper },
});
