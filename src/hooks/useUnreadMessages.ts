import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UnreadCounts {
  totalUnread: number;
  dmUnread: number;
  groupUnread: number;
  dmUniqueSenders: number;
  /** unique DM senders per group (by checking if sender is in that group) */
  groupDmSenders: Record<string, number>;
}

export function useUnreadMessages() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<UnreadCounts>({
    totalUnread: 0, dmUnread: 0, groupUnread: 0, dmUniqueSenders: 0, groupDmSenders: {},
  });

  const fetchCounts = useCallback(async () => {
    if (!user) return;

    // Unread DMs: messages in user's conversations, not sent by user, not read
    const { data: convos } = await supabase
      .from('conversations')
      .select('id')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

    const convoIds = convos?.map(c => c.id) || [];
    let dmUnread = 0;
    let dmSenders = new Set<string>();
    let senderConvoMap: Record<string, string[]> = {};

    if (convoIds.length > 0) {
      const { data: unreadDms } = await supabase
        .from('direct_messages')
        .select('id, sender_id, conversation_id')
        .in('conversation_id', convoIds)
        .neq('sender_id', user.id)
        .eq('is_read', false);

      if (unreadDms) {
        dmUnread = unreadDms.length;
        unreadDms.forEach(m => {
          dmSenders.add(m.sender_id);
          if (!senderConvoMap[m.sender_id]) senderConvoMap[m.sender_id] = [];
          if (!senderConvoMap[m.sender_id].includes(m.conversation_id)) {
            senderConvoMap[m.sender_id].push(m.conversation_id);
          }
        });
      }
    }

    // Unread group messages: in groups user is member of, not sent by user
    const { data: memberships } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', user.id);

    const groupIds = memberships?.map(m => m.group_id) || [];
    let groupUnread = 0;

    if (groupIds.length > 0) {
      const { data: unreadGroupMsgs } = await supabase
        .from('group_messages')
        .select('id')
        .in('group_id', groupIds)
        .neq('user_id', user.id)
        .eq('is_read', false);

      groupUnread = unreadGroupMsgs?.length || 0;
    }

    // Per-group DM senders: for each group, count unique DM senders who are also members
    const groupDmSenders: Record<string, number> = {};
    if (dmSenders.size > 0 && groupIds.length > 0) {
      const { data: senderMemberships } = await supabase
        .from('group_members')
        .select('group_id, user_id')
        .in('group_id', groupIds)
        .in('user_id', Array.from(dmSenders));

      if (senderMemberships) {
        senderMemberships.forEach(sm => {
          if (!groupDmSenders[sm.group_id]) groupDmSenders[sm.group_id] = 0;
          groupDmSenders[sm.group_id]++;
        });
      }
    }

    setCounts({
      totalUnread: dmUnread + groupUnread,
      dmUnread,
      groupUnread,
      dmUniqueSenders: dmSenders.size,
      groupDmSenders,
    });
  }, [user]);

  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  // Realtime: re-fetch on new DMs or group messages
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('unread-tracking')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'direct_messages' }, () => fetchCounts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_messages' }, () => fetchCounts())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchCounts]);

  const markDmRead = useCallback(async (conversationId: string) => {
    if (!user) return;
    await supabase
      .from('direct_messages')
      .update({ is_read: true } as any)
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id)
      .eq('is_read', false);
    fetchCounts();
  }, [user, fetchCounts]);

  const markGroupRead = useCallback(async (groupId: string) => {
    if (!user) return;
    await supabase
      .from('group_messages')
      .update({ is_read: true } as any)
      .eq('group_id', groupId)
      .neq('user_id', user.id)
      .eq('is_read', false);
    fetchCounts();
  }, [user, fetchCounts]);

  return { ...counts, markDmRead, markGroupRead, refetch: fetchCounts };
}
