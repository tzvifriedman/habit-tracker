import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useHabits } from '../../src/hooks/useHabits';
import { NavBar } from '../../src/components/NavBar';
import { AddHabitModal } from '../../src/components/AddHabitModal';
import { Colors, Fonts } from '../../src/lib/theme';
import type { HabitWithStatus } from '../../src/hooks/useHabits';

function EditHabitModal({
  habit,
  onClose,
  onSave,
}: {
  habit: HabitWithStatus;
  onClose: () => void;
  onSave: (params: { title?: string; target_value?: number | null; target_unit?: string | null; direction?: 'at_least' | 'at_most' | null }) => Promise<void>;
}) {
  const [title, setTitle] = useState(habit.title);
  const [target, setTarget] = useState(habit.target_value?.toString() ?? '');
  const [unit, setUnit] = useState(habit.target_unit ?? '');
  const [direction, setDirection] = useState<'at_least' | 'at_most'>(
    habit.direction === 'at_most' ? 'at_most' : 'at_least',
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    await onSave({
      title: title.trim(),
      ...(habit.habit_type === 'numeric' && {
        target_value: parseFloat(target) || null,
        target_unit: unit.trim() || null,
        direction,
      }),
    });
    setSaving(false);
    onClose();
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.sheetWrap}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>Edit habit</Text>

          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Habit name"
            placeholderTextColor={Colors.inkMuted}
            autoFocus
          />

          {habit.habit_type === 'numeric' && (
            <>
              <View style={styles.editRow}>
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
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving
                ? <ActivityIndicator color={Colors.paper} />
                : <Text style={styles.saveText}>Save</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function HabitsScreen() {
  const router = useRouter();
  const { habits, loading, refresh, createHabit, archiveHabit, updateHabit } = useHabits();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<HabitWithStatus | null>(null);

  function confirmDelete(habit: HabitWithStatus) {
    Alert.alert(
      'Remove habit',
      `Remove "${habit.title}"? Your check-in history will be kept.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => archiveHabit(habit.id) },
      ],
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={Colors.inkMuted} />}
      >
        <Text style={styles.title}>Habits</Text>

        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Text style={styles.addBtnPlus}>+</Text>
          <Text style={styles.addBtnText}>Add habit</Text>
        </TouchableOpacity>

        {habits.length === 0 && !loading && (
          <Text style={styles.empty}>No habits yet — add one above.</Text>
        )}

        {habits.map((habit) => (
          <View key={habit.id} style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.habitTitle} numberOfLines={1}>{habit.title}</Text>
              <Text style={styles.habitMeta}>
                {habit.habit_type === 'binary'
                  ? 'Yes / No'
                  : `${habit.direction === 'at_most' ? 'At most' : 'At least'} ${habit.target_value ?? '—'} ${habit.target_unit ?? ''}`}
              </Text>
            </View>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setEditing(habit)}>
              <Text style={styles.actionIcon}>✎</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => confirmDelete(habit)}>
              <Text style={[styles.actionIcon, styles.deleteIcon]}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <AddHabitModal
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        onCreate={createHabit}
      />

      {editing && (
        <EditHabitModal
          habit={editing}
          onClose={() => setEditing(null)}
          onSave={(params) => updateHabit(editing.id, params)}
        />
      )}

      <NavBar
        activeTab="habits"
        onTabChange={(tab) => {
          if (tab === 'index') router.push('/(app)/');
          if (tab === 'friends') router.push('/(app)/friends');
          if (tab === 'profile') router.push('/(app)/profile');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.paper },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 108 },
  title: {
    fontFamily: Fonts.serif300,
    fontSize: 36,
    letterSpacing: -1,
    color: Colors.ink,
    marginBottom: 20,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.ink,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 24,
  },
  addBtnPlus: {
    color: Colors.paper,
    fontSize: 22,
    lineHeight: 24,
    fontFamily: Fonts.sans400,
  },
  addBtnText: {
    fontFamily: Fonts.sans500,
    fontSize: 14,
    color: Colors.paper,
    letterSpacing: 0.3,
  },
  empty: {
    fontFamily: Fonts.sans400,
    fontSize: 14,
    color: Colors.inkMuted,
    textAlign: 'center',
    marginTop: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardLine,
    borderRadius: 12,
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 8,
    marginBottom: 8,
    gap: 4,
  },
  rowInfo: { flex: 1, minWidth: 0 },
  habitTitle: {
    fontFamily: Fonts.sans500,
    fontSize: 14,
    color: Colors.ink,
  },
  habitMeta: {
    fontFamily: Fonts.sans400,
    fontSize: 11,
    color: Colors.inkMuted,
    marginTop: 2,
  },
  actionBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 16,
    color: Colors.inkMuted,
  },
  deleteIcon: {
    color: Colors.terracotta,
    fontSize: 14,
  },

  // Edit modal
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
  editRow: { flexDirection: 'row', gap: 10 },
  directionRow: { flexDirection: 'row', gap: 8, marginBottom: 2 },
  dirBtn: {
    flex: 1,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardLine,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  dirBtnActive: { backgroundColor: Colors.inkSoft, borderColor: Colors.inkSoft },
  dirText: { fontFamily: Fonts.sans400, fontSize: 13, color: Colors.inkSoft },
  dirTextActive: { color: Colors.paper },
  actions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.cardLine,
    borderRadius: 100,
    padding: 14,
    alignItems: 'center',
  },
  cancelText: { fontFamily: Fonts.sans400, fontSize: 14, color: Colors.inkSoft },
  saveBtn: { flex: 2, backgroundColor: Colors.ink, borderRadius: 100, padding: 14, alignItems: 'center' },
  saveText: { fontFamily: Fonts.sans500, fontSize: 14, color: Colors.paper },
});
