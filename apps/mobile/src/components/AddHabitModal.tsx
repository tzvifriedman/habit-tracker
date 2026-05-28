import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Colors, Fonts } from '../lib/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreate: (params: {
    title: string;
    habit_type: 'binary' | 'numeric';
    target_value?: number;
    target_unit?: string;
    direction?: 'at_least' | 'at_most';
  }) => Promise<boolean>;
}

export function AddHabitModal({ visible, onClose, onCreate }: Props) {
  const [type, setType] = useState<'binary' | 'numeric'>('binary');
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [unit, setUnit] = useState('');
  const [direction, setDirection] = useState<'at_least' | 'at_most'>('at_least');
  const [saving, setSaving] = useState(false);

  function reset() {
    setType('binary');
    setTitle('');
    setTarget('');
    setUnit('');
    setDirection('at_least');
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    const ok = await onCreate({
      title: title.trim(),
      habit_type: type,
      ...(type === 'numeric' && {
        target_value: parseFloat(target) || 1,
        target_unit: unit.trim() || undefined,
        direction,
      }),
    });
    setSaving(false);
    if (ok) { reset(); onClose(); }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.sheetWrap}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>New habit</Text>

          {/* Type pills */}
          <View style={styles.pills}>
            {(['binary', 'numeric'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.pill, type === t && styles.pillActive]}
                onPress={() => setType(t)}
              >
                <Text style={[styles.pillText, type === t && styles.pillTextActive]}>
                  {t === 'binary' ? 'Yes / No' : 'With target'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder={type === 'binary' ? 'e.g. Worked out today' : 'e.g. Eat under 2000 calories'}
            placeholderTextColor={Colors.inkMuted}
            returnKeyType="done"
          />

          {type === 'numeric' && (
            <>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={target}
                  onChangeText={setTarget}
                  placeholder="Target"
                  placeholderTextColor={Colors.inkMuted}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.input, { flex: 1.4 }]}
                  value={unit}
                  onChangeText={setUnit}
                  placeholder="Unit (kcal, min…)"
                  placeholderTextColor={Colors.inkMuted}
                />
              </View>

              <View style={styles.directionRow}>
                {(['at_least', 'at_most'] as const).map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.dirBtn, direction === d && styles.dirBtnActive]}
                    onPress={() => setDirection(d)}
                  >
                    <Text style={[styles.dirText, direction === d && styles.dirTextActive]}>
                      {d === 'at_least' ? 'At least' : 'At most'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving
                ? <ActivityIndicator color={Colors.paper} />
                : <Text style={styles.saveText}>Save habit</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(26,26,26,0.4)',
  },
  sheetWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheet: {
    backgroundColor: Colors.paper,
    borderRadius: 32,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.cardLine,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontFamily: Fonts.serif300,
    fontSize: 28,
    letterSpacing: -0.5,
    color: Colors.ink,
    marginBottom: 20,
  },
  pills: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  pill: {
    flex: 1,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardLine,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  pillActive: {
    backgroundColor: Colors.ink,
    borderColor: Colors.ink,
  },
  pillText: {
    fontFamily: Fonts.sans500,
    fontSize: 13,
    color: Colors.inkSoft,
  },
  pillTextActive: {
    color: Colors.paper,
  },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardLine,
    borderRadius: 12,
    padding: 14,
    fontFamily: Fonts.sans400,
    fontSize: 15,
    color: Colors.ink,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  directionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 2,
  },
  dirBtn: {
    flex: 1,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardLine,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  dirBtnActive: {
    backgroundColor: Colors.inkSoft,
    borderColor: Colors.inkSoft,
  },
  dirText: {
    fontFamily: Fonts.sans400,
    fontSize: 13,
    color: Colors.inkSoft,
  },
  dirTextActive: {
    color: Colors.paper,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.cardLine,
    borderRadius: 100,
    padding: 14,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: Fonts.sans400,
    fontSize: 14,
    color: Colors.inkSoft,
  },
  saveBtn: {
    flex: 2,
    backgroundColor: Colors.ink,
    borderRadius: 100,
    padding: 14,
    alignItems: 'center',
  },
  saveText: {
    fontFamily: Fonts.sans500,
    fontSize: 14,
    color: Colors.paper,
  },
});
