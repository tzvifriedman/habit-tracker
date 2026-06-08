import { useEffect, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/auth';

export interface FriendProfile {
  id: string;
  username: string;
  display_name: string | null;
}

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  friend: FriendProfile;
}

export function useFriends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [incoming, setIncoming] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [acceptedRes, pendingRes] = await Promise.all([
      supabase
        .from('friendships')
        .select(`
          id, requester_id, addressee_id, status, created_at,
          requester:profiles!requester_id(id, username, display_name),
          addressee:profiles!addressee_id(id, username, display_name)
        `)
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`),

      supabase
        .from('friendships')
        .select('id, requester_id, addressee_id, status, created_at')
        .eq('addressee_id', user.id)
        .eq('status', 'pending'),
    ]);

    if (!acceptedRes.error) {
      const enriched = (acceptedRes.data ?? [])
        .map((f: any) => ({
          ...f,
          friend: f.requester_id === user.id ? f.addressee : f.requester,
        }))
        .filter((f: any) => f.friend != null);
      setFriends(enriched);
    }

    if (pendingRes.error) {
      setDebugInfo(`pending query error: ${pendingRes.error.message}`);
      setIncoming([]);
    } else {
      const pendingRows = pendingRes.data ?? [];
      setDebugInfo(`pending rows: ${pendingRows.length}, user: ${user.id}`);
      if (pendingRows.length > 0) {
        const requesterIds = pendingRows.map((f: any) => f.requester_id);
        const { data: profileRows, error: profileErr } = await supabase
          .from('profiles')
          .select('id, username, display_name')
          .in('id', requesterIds);
        if (profileErr) setDebugInfo(`profile fetch error: ${profileErr.message}`);
        const profileMap: Record<string, FriendProfile> = {};
        for (const p of profileRows ?? []) profileMap[p.id] = p;
        const enriched = pendingRows
          .map((f: any) => ({ ...f, friend: profileMap[f.requester_id] ?? null }))
          .filter((f: any) => f.friend != null);
        setIncoming(enriched);
      } else {
        setIncoming([]);
      }
    }

    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  async function sendRequest(username: string): Promise<'sent' | 'not_found' | 'already_friends' | 'error'> {
    if (!user) return 'error';

    const { data: found, error: rpcError } = await supabase
      .rpc('find_user_by_username', { search_username: username.replace(/^@/, '') });

    if (rpcError || !found) return 'not_found';

    // If they've already sent us a request, accept it instead
    const { data: theirRequest } = await supabase
      .from('friendships')
      .select('id')
      .eq('requester_id', found.id)
      .eq('addressee_id', user.id)
      .eq('status', 'pending')
      .single();

    if (theirRequest) {
      await supabase
        .from('friendships')
        .update({ status: 'accepted', responded_at: new Date().toISOString() })
        .eq('id', theirRequest.id);
      refresh();
      return 'sent';
    }

    const { error } = await supabase.from('friendships').insert({
      requester_id: user.id,
      addressee_id: found.id,
      status: 'pending',
    });

    if (error?.code === '23505') return 'already_friends';
    if (error) return 'error';

    refresh();
    return 'sent';
  }

  async function respond(friendshipId: string, action: 'accept' | 'decline') {
    // Optimistic: remove from incoming list immediately
    setIncoming((prev) => prev.filter((f) => f.id !== friendshipId));

    if (action === 'accept') {
      const { data, error } = await supabase
        .from('friendships')
        .update({ status: 'accepted', responded_at: new Date().toISOString() })
        .eq('id', friendshipId)
        .select('id');
      if (error || !data?.length) {
        Alert.alert('Could not accept request', error?.message ?? 'No matching row — check RLS');
        refresh();
        return;
      }
    } else {
      const { error } = await supabase.from('friendships').delete().eq('id', friendshipId);
      if (error) {
        Alert.alert('Could not decline request', error.message);
        refresh();
        return;
      }
    }
    refresh();
  }

  async function removeFriend(friendshipId: string) {
    await supabase.from('friendships').delete().eq('id', friendshipId);
    refresh();
  }

  return { friends, incoming, loading, debugInfo, refresh, sendRequest, respond, removeFriend };
}
