import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UnreadConversation {
  type: 'dm' | 'group';
  id: string; // conversationId or groupId
  name: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  otherUserId?: string; // for DMs
}

interface UnreadCounts {
  totalUnread: number;
  dmUnread: number;
  groupUnread: number;
  dmUniqueSenders: number;
  groupDmSenders: Record<string, number>;
  /** per-sender unread counts: senderId -> count */
  perSenderUnread: Record<string, number>;
  /** unread conversations for bell dropdown */
  unreadConversations: UnreadConversation[];
}

export function useUnreadMessagesInternal() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<UnreadCounts>({
    totalUnread: 0, dmUnread: 0, groupUnread: 0, dmUniqueSenders: 0,
    groupDmSenders: {}, perSenderUnread: {}, unreadConversations: [],
  });

  const fetchCounts = useCallback(async () => {
    if (!user) return;

    // Unread DMs
    const { data: convos } = await supabase
      .from('conversations')
      .select('id, user1_id, user2_id')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

    const convoList = convos || [];
    const convoIds = convoList.map(c => c.id);
    let dmUnread = 0;
    let dmSenders = new Set<string>();
    const perSenderUnread: Record<string, number> = {};
    const dmConversations: UnreadConversation[] = [];

    if (convoIds.length > 0) {
      const { data: unreadDms } = await supabase
        .from('direct_messages')
        .select('id, sender_id, conversation_id, content, created_at')
        .in('conversation_id', convoIds)
        .neq('sender_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (unreadDms) {
        dmUnread = unreadDms.length;
        // Group by conversation
        const convoMap: Record<string, typeof unreadDms> = {};
        unreadDms.forEach(m => {
          dmSenders.add(m.sender_id);
          perSenderUnread[m.sender_id] = (perSenderUnread[m.sender_id] || 0) + 1;
          if (!convoMap[m.conversation_id]) convoMap[m.conversation_id] = [];
          convoMap[m.conversation_id].push(m);
        });

        // Fetch sender profiles for names
        const senderIds = Array.from(dmSenders);
        const { data: profiles } = senderIds.length > 0
          ? await supabase.from('profiles').select('user_id, display_name').in('user_id', senderIds)
          : { data: [] };
        const profileMap: Record<string, string> = {};
        profiles?.forEach(p => { profileMap[p.user_id] = p.display_name || 'User'; });

        for (const [convoId, msgs] of Object.entries(convoMap)) {
          const convo = convoList.find(c => c.id === convoId);
          const otherUserId = convo ? (convo.user1_id === user.id ? convo.user2_id : convo.user1_id) : msgs[0].sender_id;
          dmConversations.push({
            type: 'dm',
            id: convoId,
            name: profileMap[otherUserId] || 'User',
            lastMessage: msgs[0].content,
            lastMessageAt: msgs[0].created_at,
            unreadCount: msgs.length,
            otherUserId,
          });
        }
      }
    }

    // Unread group messages
    const { data: memberships } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', user.id);

    const groupIds = memberships?.map(m => m.group_id) || [];
    let groupUnread = 0;
    const groupConversations: UnreadConversation[] = [];

    if (groupIds.length > 0) {
      const { data: unreadGroupMsgs } = await supabase
        .from('group_messages')
        .select('id, group_id, content, created_at, display_name')
        .in('group_id', groupIds)
        .neq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (unreadGroupMsgs) {
        groupUnread = unreadGroupMsgs.length;
        // Group by group_id
        const grpMap: Record<string, typeof unreadGroupMsgs> = {};
        unreadGroupMsgs.forEach(m => {
          if (!grpMap[m.group_id]) grpMap[m.group_id] = [];
          grpMap[m.group_id].push(m);
        });

        // Fetch group names
        const { data: groupData } = await supabase
          .from('community_groups')
          .select('id, name')
          .in('id', Object.keys(grpMap));
        const groupNameMap: Record<string, string> = {};
        groupData?.forEach(g => { groupNameMap[g.id] = g.name; });

        for (const [grpId, msgs] of Object.entries(grpMap)) {
          groupConversations.push({
            type: 'group',
            id: grpId,
            name: groupNameMap[grpId] || 'Group',
            lastMessage: msgs[0].content,
            lastMessageAt: msgs[0].created_at,
            unreadCount: msgs.length,
          });
        }
      }
    }

    // Per-group DM senders
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

    const allUnreadConvos = [...dmConversations, ...groupConversations]
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

    setCounts({
      totalUnread: dmUnread + groupUnread,
      dmUnread,
      groupUnread,
      dmUniqueSenders: dmSenders.size,
      groupDmSenders,
      perSenderUnread,
      unreadConversations: allUnreadConvos,
    });
  }, [user]);

  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  // Realtime
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('unread-tracking', { config: { private: true } })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'direct_messages' }, () => fetchCounts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_messages' }, () => fetchCounts())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchCounts]);

  const markDmRead = useCallback(async (conversationId: string) => {
    if (!user) return;
    await supabase
      .from('direct_messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id)
      .eq('is_read', false);
    fetchCounts();
  }, [user, fetchCounts]);

  const markGroupRead = useCallback(async (groupId: string) => {
    if (!user) return;
    await supabase
      .from('group_messages')
      .update({ is_read: true })
      .eq('group_id', groupId)
      .neq('user_id', user.id)
      .eq('is_read', false);
    fetchCounts();
  }, [user, fetchCounts]);

  return { ...counts, markDmRead, markGroupRead, refetch: fetchCounts };
}
