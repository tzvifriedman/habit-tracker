import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFriends, type Friendship } from '../../src/hooks/useFriends';
import { NavBar } from '../../src/components/NavBar';
import { Colors, Fonts } from '../../src/lib/theme';

const AVATAR_COLORS = [Colors.sage, Colors.terracotta, Colors.gold, '#7A4E6E', Colors.inkSoft];

function avatarColor(username: string): string {
  let hash = 0;
  for (const c of username) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function Avatar({ username, size = 44 }: { username: string; size?: number }) {
  const letter = username?.[0]?.toUpperCase() ?? '?';
  return (
    <View style={[
      styles.avatar,
      { width: size, height: size, borderRadius: size / 2, backgroundColor: avatarColor(username ?? '') }
    ]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.4 }]}>{letter}</Text>
    </View>
  );
}

function FriendRow({ item, onRemove }: { item: Friendship; onRemove: () => void }) {
  return (
    <TouchableOpacity
      style={styles.friendCard}
      onLongPress={() =>
        Alert.alert('Remove friend', `Remove ${item.friend.username}?`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: onRemove },
        ])
      }
    >
      <Avatar username={item.friend.username} />
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>
          {item.friend.display_name ?? item.friend.username}
        </Text>
        <Text style={styles.friendHandle}>@{item.friend.username}</Text>
      </View>
    </TouchableOpacity>
  );
}

function RequestRow({
  item,
  onAccept,
  onDecline,
}: {
  item: Friendship;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <View style={styles.requestCard}>
      <Avatar username={item.friend.username} size={36} />
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>
          {item.friend.display_name ?? item.friend.username}
        </Text>
        <Text style={styles.friendHandle}>@{item.friend.username}</Text>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity style={styles.declineBtn} onPress={onDecline}>
          <Text style={styles.declineText}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.acceptBtn} onPress={onAccept}>
          <Text style={styles.acceptText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function FriendsScreen() {
  const router = useRouter();
  const { friends, incoming, loading, debugInfo, refresh, sendRequest, respond, removeFriend } = useFriends();
  const [username, setUsername] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSend() {
    const trimmed = username.trim();
    if (!trimmed) return;
    setSending(true);
    const result = await sendRequest(trimmed);
    setSending(false);

    if (result === 'sent') {
      setUsername('');
      Alert.alert('Request sent', `Friend request sent to @${trimmed.replace(/^@/, '')}.`);
    } else if (result === 'not_found') {
      Alert.alert('Not found', `No user found with that username.`);
    } else if (result === 'already_friends') {
      Alert.alert('Already connected', `You're already friends or have a pending request.`);
    } else {
      Alert.alert('Something went wrong', 'Please try again.');
    }
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={Colors.inkMuted} />
        }
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Friends</Text>
            <Text style={styles.sub}>Add by username — they'll see your habits too.</Text>

            {/* Add friend input */}
            <View style={styles.addRow}>
              <TextInput
                style={styles.addInput}
                value={username}
                onChangeText={setUsername}
                placeholder="@username"
                placeholderTextColor={Colors.inkMuted}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="send"
                onSubmitEditing={handleSend}
              />
              <TouchableOpacity
                style={[styles.sendBtn, (!username.trim() || sending) && styles.sendBtnDisabled]}
                onPress={handleSend}
                disabled={!username.trim() || sending}
              >
                {sending
                  ? <ActivityIndicator color={Colors.paper} size="small" />
                  : <Text style={styles.sendText}>Send</Text>
                }
              </TouchableOpacity>
            </View>

            {/* Incoming requests */}
            {incoming.length > 0 && (
              <>
                <View style={styles.sectionLabel}>
                  <Text style={styles.sectionTitle}>Requests</Text>
                  <Text style={styles.sectionCount}>{incoming.length}</Text>
                </View>
                {incoming.map((req) => (
                  <RequestRow
                    key={req.id}
                    item={req}
                    onAccept={() => respond(req.id, 'accept')}
                    onDecline={() => respond(req.id, 'decline')}
                  />
                ))}
              </>
            )}

            {/* Friends header */}
            {friends.length > 0 && (
              <View style={styles.sectionLabel}>
                <Text style={styles.sectionTitle}>Friends</Text>
                <Text style={styles.sectionCount}>{friends.length}</Text>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => (
          <FriendRow
            item={item}
            onRemove={() => removeFriend(item.id)}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No friends yet</Text>
              <Text style={styles.emptySub}>Enter a username above to send your first request</Text>
            </View>
          ) : null
        }
      />

      <NavBar
        activeTab="friends"
        onTabChange={(tab) => {
          if (tab === 'index') router.push('/(app)/');
          if (tab === 'profile') router.push('/(app)/profile');
        }}
        onAddHabit={() => router.push('/(app)/')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.paper },
  list: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 108 },
  title: {
    fontFamily: Fonts.serif300,
    fontSize: 36,
    letterSpacing: -1,
    color: Colors.ink,
    marginBottom: 6,
  },
  sub: {
    fontFamily: Fonts.sans400,
    fontSize: 14,
    color: Colors.inkSoft,
    marginBottom: 24,
  },

  addRow: { flexDirection: 'row', gap: 8, marginBottom: 28 },
  addInput: {
    flex: 1,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardLine,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: Fonts.sans400,
    fontSize: 14,
    color: Colors.ink,
  },
  sendBtn: {
    backgroundColor: Colors.ink,
    borderRadius: 12,
    paddingHorizontal: 18,
    justifyContent: 'center',
    minWidth: 70,
    alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendText: { fontFamily: Fonts.sans500, fontSize: 13, color: Colors.paper },

  sectionLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardLine,
    paddingBottom: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: Fonts.sans400,
    fontSize: 10,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
  },
  sectionCount: {
    fontFamily: Fonts.sans500,
    fontSize: 10,
    color: Colors.ink,
  },

  friendCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardLine,
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  requestCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardLine,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Colors.paper, fontFamily: Fonts.serif400 },
  friendInfo: { flex: 1 },
  friendName: {
    fontFamily: Fonts.serif400,
    fontSize: 17,
    color: Colors.ink,
  },
  friendHandle: {
    fontFamily: Fonts.sans400,
    fontSize: 11,
    color: Colors.inkMuted,
    letterSpacing: 0.3,
    marginTop: 2,
  },

  requestActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  declineBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardLine,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineText: { fontFamily: Fonts.sans400, fontSize: 12, color: Colors.inkMuted },
  acceptBtn: {
    backgroundColor: Colors.ink,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  acceptText: { fontFamily: Fonts.sans500, fontSize: 13, color: Colors.paper },

  empty: { alignItems: 'center', paddingTop: 40, gap: 8 },
  emptyTitle: { fontFamily: Fonts.serif400, fontSize: 16, color: Colors.ink },
  emptySub: { fontFamily: Fonts.sans400, fontSize: 13, color: Colors.inkMuted, textAlign: 'center' },
});
