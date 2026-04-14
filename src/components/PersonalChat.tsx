import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUnreadMessages } from '@/contexts/UnreadMessagesContext';

interface PersonalChatProps {
  otherUserId: string;
  onBack: () => void;
}

const PersonalChat = ({ otherUserId, onBack }: PersonalChatProps) => {
  const { user } = useAuth();
  const { markDmRead } = useUnreadMessages();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherProfile, setOtherProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const init = async () => {
      setLoading(true);
      // Fetch other user's profile
      const { data: profile } = await supabase.from('profiles').select('display_name, avatar_url').eq('user_id', otherUserId).single();
      setOtherProfile(profile);

      // Find or create conversation (ordered pair)
      const [u1, u2] = [user.id, otherUserId].sort();
      let { data: conv } = await supabase
        .from('conversations')
        .select('id')
        .eq('user1_id', u1)
        .eq('user2_id', u2)
        .single();

      if (!conv) {
        const { data: newConv } = await supabase
          .from('conversations')
          .insert({ user1_id: u1, user2_id: u2 })
          .select('id')
          .single();
        conv = newConv;
      }

      if (conv) {
        setConversationId(conv.id);
        const { data: msgs } = await supabase
          .from('direct_messages')
          .select('*')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: true });
        setMessages(msgs || []);
        // Mark messages as read
        markDmRead(conv.id);
      }
      setLoading(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };
    init();
  }, [user, otherUserId]);

  // Realtime subscription
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`dm-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'direct_messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        // Mark as read if sender is not the current user
        if ((payload.new as any).sender_id !== user?.id) {
          markDmRead(conversationId);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  const handleSend = async () => {
    if (!user || !conversationId || !newMessage.trim()) return;
    await supabase.from('direct_messages').insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: newMessage.trim(),
    });
    setNewMessage('');
  };

  const otherName = otherProfile?.display_name || 'User';

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20 flex flex-col">
      <div className="pt-12 pb-4 px-6 flex items-center space-x-3 border-b border-border bg-card">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
            {otherName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h2 className="font-semibold text-foreground">{otherName}</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {loading && <p className="text-center text-muted-foreground py-8">Loading...</p>}
        {!loading && messages.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No messages yet. Say hello!</p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${msg.sender_id === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
              <p className="text-sm">{msg.content}</p>
              <p className="text-[10px] opacity-50 mt-1">
                {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-6 py-3 border-t border-border bg-card flex space-x-2">
        <Input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="flex-1 rounded-xl"
        />
        <Button size="sm" onClick={handleSend} className="bg-gradient-primary rounded-xl">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default PersonalChat;
