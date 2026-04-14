import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Users, Calendar, MapPin, Plus, Clock, Star, ChefHat, ExternalLink, Send, ArrowLeft, Heart, User, Trash2, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import { useFavorites } from '@/hooks/useFavorites';
import { useActivityLog } from '@/hooks/useActivityLog';
import MemberProfile from '@/components/MemberProfile';
import PersonalChat from '@/components/PersonalChat';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';

interface CulturalBridgeProps {
  defaultTab?: string;
}

const CulturalBridge = ({ defaultTab }: CulturalBridgeProps) => {
  const { user } = useAuth();
  const { logActivity } = useActivityLog();
  const { groupDmSenders, markGroupRead, markDmRead, perSenderUnread } = useUnreadMessages();
  const [activeTab, setActiveTab] = useState(defaultTab || 'community');
  const restFavorites = useFavorites('restaurant');
  const eventFavorites = useFavorites('event');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').then(({ data }) => {
        setIsAdmin(!!(data && data.length > 0));
      });
    }
  }, [user]);

  useEffect(() => {
    if (defaultTab) setActiveTab(defaultTab);
  }, [defaultTab]);

  // Community state
  const [groups, setGroups] = useState<any[]>([]);
  const [joinedGroupIds, setJoinedGroupIds] = useState<Set<string>>(new Set());
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupCategory, setGroupCategory] = useState('General');

  // Group members state
  const [viewingMembersGroup, setViewingMembersGroup] = useState<any | null>(null);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Member profile & personal chat state
  const [viewingProfileUserId, setViewingProfileUserId] = useState<string | null>(null);
  const [personalChatUserId, setPersonalChatUserId] = useState<string | null>(null);

  // Group chat state
  const [openGroupChat, setOpenGroupChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Events state
  const [events, setEvents] = useState<any[]>([]);
  const [eventsTab, setEventsTab] = useState('upcoming');
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventLink, setEventLink] = useState('');
  const [interestedEventIds, setInterestedEventIds] = useState<Set<string>>(new Set());

  // Food state
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [userRestRatings, setUserRestRatings] = useState<Record<string, number>>({});
  const [isAddRestOpen, setIsAddRestOpen] = useState(false);
  const [restName, setRestName] = useState('');
  const [restCuisine, setRestCuisine] = useState('');
  const [restLocation, setRestLocation] = useState('');
  const [restIsVeg, setRestIsVeg] = useState(false);
  const [restSpecialty, setRestSpecialty] = useState('');
  const [restDishes, setRestDishes] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<any | null>(null);

  useEffect(() => {
    fetchGroups();
    fetchEvents();
    fetchRestaurants();
    if (user) {
      fetchJoinedGroups();
      fetchUserRestRatings();
      fetchInterestedEvents();
    }
  }, [user]);

  const fetchGroups = async () => {
    const { data } = await supabase.from('community_groups').select('*').order('created_at', { ascending: false });
    if (data) setGroups(data);
  };

  const fetchJoinedGroups = async () => {
    if (!user) return;
    const { data } = await supabase.from('group_members').select('group_id').eq('user_id', user.id);
    if (data) setJoinedGroupIds(new Set(data.map((d: any) => d.group_id)));
  };

  const fetchGroupMembers = async (groupId: string) => {
    setLoadingMembers(true);
    const { data } = await supabase
      .from('group_members')
      .select('user_id, joined_at')
      .eq('group_id', groupId)
      .order('joined_at', { ascending: true });
    if (data) {
      // Fetch profiles for these users
      const userIds = data.map((m: any) => m.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);
      // Check which users are admins (group creators)
      const group = groups.find(g => g.id === groupId);
      const membersWithProfiles = data.map((m: any) => {
        const profile = profiles?.find((p: any) => p.user_id === m.user_id);
        return {
          ...m,
          display_name: profile?.display_name || 'User',
          avatar_url: profile?.avatar_url || null,
          is_creator: group?.user_id === m.user_id,
        };
      });
      setGroupMembers(membersWithProfiles);
    }
    setLoadingMembers(false);
  };

  const openMembers = async (group: any) => {
    setViewingMembersGroup(group);
    await fetchGroupMembers(group.id);
  };

  const fetchEvents = async () => {
    const { data } = await supabase.from('events').select('*').order('event_date', { ascending: true });
    if (data) setEvents(data);
  };

  const fetchInterestedEvents = async () => {
    if (!user) return;
    const { data } = await supabase.from('event_attendees').select('event_id').eq('user_id', user.id);
    if (data) setInterestedEventIds(new Set(data.map((d: any) => d.event_id)));
  };

  const fetchRestaurants = async () => {
    const { data } = await supabase.from('restaurants').select('*').order('created_at', { ascending: false });
    if (data) setRestaurants(data);
  };

  const fetchUserRestRatings = async () => {
    if (!user) return;
    const { data } = await supabase.from('restaurant_ratings').select('restaurant_id, rating, feedback').eq('user_id', user.id);
    if (data) {
      const map: Record<string, number> = {};
      data.forEach((r: any) => { map[r.restaurant_id] = r.rating; });
      setUserRestRatings(map);
    }
  };

  // Community handlers
  const handleCreateGroup = async () => {
    if (!user || !groupName || !groupCategory) { toast.error('Fill required fields'); return; }
    const { data, error } = await supabase.from('community_groups').insert({ user_id: user.id, name: groupName, description: groupDesc, category: groupCategory }).select().single();
    if (error) { toast.error('Failed to create group'); return; }
    // Auto-join creator
    if (data) {
      await supabase.from('group_members').insert({ group_id: data.id, user_id: user.id });
      setJoinedGroupIds(prev => new Set(prev).add(data.id));
    }
    toast.success('Group created!');
    setIsCreateGroupOpen(false);
    setGroupName(''); setGroupDesc(''); setGroupCategory('General');
    fetchGroups();
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!user) return;
    if (joinedGroupIds.has(groupId)) {
      await supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', user.id);
      setJoinedGroupIds(prev => { const n = new Set(prev); n.delete(groupId); return n; });
    } else {
      await supabase.from('group_members').insert({ group_id: groupId, user_id: user.id });
      setJoinedGroupIds(prev => new Set(prev).add(groupId));
      const group = groups.find(g => g.id === groupId);
      logActivity('community_join', `Joined community: ${group?.name || 'Unknown'}`);
    }
  };

  // Group Chat handlers
  const openChat = async (group: any) => {
    setOpenGroupChat(group);
    await fetchMessages(group.id);
    markGroupRead(group.id);
  };

  const fetchMessages = async (groupId: string) => {
    const { data } = await supabase.from('group_messages').select('*').eq('group_id', groupId).order('created_at', { ascending: true });
    if (data) setMessages(data);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  // Realtime subscription for group messages
  useEffect(() => {
    if (!openGroupChat) return;
    const channel = supabase
      .channel(`group-messages-${openGroupChat.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'group_messages', filter: `group_id=eq.${openGroupChat.id}` }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [openGroupChat]);

  const handleSendMessage = async () => {
    if (!user || !openGroupChat || !newMessage.trim()) return;
    const displayName = user.user_metadata?.display_name || user.email || 'User';
    await supabase.from('group_messages').insert({
      group_id: openGroupChat.id,
      user_id: user.id,
      display_name: displayName,
      content: newMessage.trim(),
    });
    setNewMessage('');
  };

  // Event handlers
  const handleCreateEvent = async () => {
    if (!user || !eventTitle || !eventDate || !eventLocation || !eventLink) { toast.error('Please fill in all required fields including Platform/Booking Link'); return; }
    const { error } = await supabase.from('events').insert({
      user_id: user.id, title: eventTitle, description: eventDesc,
      event_date: new Date(eventDate).toISOString(), location: eventLocation, platform_link: eventLink,
    });
    if (error) { toast.error('Failed to create event'); return; }
    toast.success('Event created!');
    setIsCreateEventOpen(false);
    setEventTitle(''); setEventDesc(''); setEventDate(''); setEventLocation(''); setEventLink('');
    await fetchEvents();
    setActiveTab('events');
  };

  const handleToggleInterested = async (eventId: string) => {
    if (!user) return;
    if (interestedEventIds.has(eventId)) {
      await supabase.from('event_attendees').delete().eq('event_id', eventId).eq('user_id', user.id);
      setInterestedEventIds(prev => { const n = new Set(prev); n.delete(eventId); return n; });
    } else {
      await supabase.from('event_attendees').insert({ event_id: eventId, user_id: user.id });
      setInterestedEventIds(prev => new Set(prev).add(eventId));
      const event = events.find(e => e.id === eventId);
      logActivity('event_interest', `Marked interest in event: ${event?.title || 'Unknown'}`);
    }
  };

  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.event_date) >= now);
  const pastEvents = events.filter(e => new Date(e.event_date) < now);

  // Dynamic member count component
  const MemberCount = ({ groupId }: { groupId: string }) => {
    const [count, setCount] = useState<number | null>(null);
    useEffect(() => {
      supabase.from('group_members').select('id', { count: 'exact', head: true }).eq('group_id', groupId)
        .then(({ count: c }) => setCount(c ?? 0));
    }, [groupId, joinedGroupIds]);
    return (
      <div className="flex items-center text-sm text-muted-foreground">
        <Users className="w-4 h-4 mr-1" />{count ?? '...'} members
      </div>
    );
  };

  // Restaurant handlers
  const handleAddRestaurant = async () => {
    if (!user || !restName || !restCuisine || !restLocation) { toast.error('Please fill in Name, Cuisine, and Location'); return; }
    const { error } = await supabase.from('restaurants').insert({
      user_id: user.id, name: restName, cuisine: restCuisine, location: restLocation,
      is_veg: restIsVeg, specialty: restSpecialty || null,
      recommended_dishes: restDishes ? restDishes.split(',').map(d => d.trim()) : [],
    });
    if (error) { toast.error('Failed to add restaurant'); return; }
    toast.success('Restaurant added!');
    setIsAddRestOpen(false);
    setRestName(''); setRestCuisine(''); setRestLocation(''); setRestIsVeg(false); setRestSpecialty(''); setRestDishes('');
    await fetchRestaurants();
    setActiveTab('food');
  };

  const handleRateRestaurant = async (restaurantId: string, rating: number) => {
    if (!user) return;
    await supabase.from('restaurant_ratings').upsert(
      { restaurant_id: restaurantId, user_id: user.id, rating },
      { onConflict: 'restaurant_id,user_id' }
    );
    setUserRestRatings(prev => ({ ...prev, [restaurantId]: rating }));
    const { data } = await supabase.from('restaurant_ratings').select('rating').eq('restaurant_id', restaurantId);
    if (data && data.length > 0) {
      const avg = data.reduce((sum: number, r: any) => sum + r.rating, 0) / data.length;
      await supabase.from('restaurants').update({ average_rating: avg, total_ratings: data.length }).eq('id', restaurantId);
      fetchRestaurants();
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (error) { toast.error('Failed to delete event'); return; }
    setEvents(prev => prev.filter(e => e.id !== eventId));
    toast.success('Event deleted');
  };

  const handleDeleteRestaurant = async (restaurantId: string) => {
    const { error } = await supabase.from('restaurants').delete().eq('id', restaurantId);
    if (error) { toast.error('Failed to delete restaurant'); return; }
    setRestaurants(prev => prev.filter(r => r.id !== restaurantId));
    toast.success('Restaurant deleted');
  };

  // Personal Chat View
  if (personalChatUserId) {
    return (
      <PersonalChat
        otherUserId={personalChatUserId}
        onBack={() => setPersonalChatUserId(null)}
      />
    );
  }

  // Member Profile View
  if (viewingProfileUserId) {
    return (
      <MemberProfile
        userId={viewingProfileUserId}
        onBack={() => setViewingProfileUserId(null)}
        onStartChat={(uid) => {
          setViewingProfileUserId(null);
          setPersonalChatUserId(uid);
        }}
      />
    );
  }

  // Group Members View
  if (viewingMembersGroup) {
    return (
      <div className="min-h-screen bg-gradient-subtle pb-20">
        <div className="pt-12 pb-4 px-6 flex items-center space-x-3 border-b border-border bg-card">
          <Button variant="ghost" size="sm" onClick={() => setViewingMembersGroup(null)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="font-semibold text-foreground">{viewingMembersGroup.name}</h2>
            <p className="text-xs text-muted-foreground">{groupMembers.length} Members</p>
          </div>
        </div>
        <div className="px-6 py-4 space-y-3">
          {loadingMembers && <p className="text-center text-muted-foreground py-8">Loading members...</p>}
          {!loadingMembers && groupMembers.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No members yet.</p>
          )}
          {groupMembers.map((member) => (
            <Card key={member.user_id} className="p-4 shadow-card border-0 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => setViewingProfileUserId(member.user_id)}>
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {member.display_name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{member.display_name}</p>
                    {member.is_creator && (
                      <Badge variant="default" className="text-[10px] px-1.5 py-0">Admin</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Joined {new Date(member.joined_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                  </p>
                </div>
                {user?.id !== member.user_id && (
                  <div className="relative">
                    <Button size="sm" variant="ghost" className="text-primary"
                      onClick={(e) => { e.stopPropagation(); setPersonalChatUserId(member.user_id); }}>
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    {(perSenderUnread[member.user_id] || 0) > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                        {perSenderUnread[member.user_id] > 9 ? '9+' : perSenderUnread[member.user_id]}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Group Chat View
  if (openGroupChat) {
    return (
      <div className="min-h-screen bg-gradient-subtle pb-20 flex flex-col">
        <div className="pt-12 pb-4 px-6 flex items-center space-x-3 border-b border-border bg-card">
          <Button variant="ghost" size="sm" onClick={() => setOpenGroupChat(null)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="font-semibold text-foreground">{openGroupChat.name}</h2>
            <p className="text-xs text-muted-foreground">{openGroupChat.category}</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {messages.length === 0 && <p className="text-center text-muted-foreground py-8">No messages yet. Start the conversation!</p>}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.user_id === user?.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${msg.user_id === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                {msg.user_id !== user?.id && (
                  <p className="text-xs font-medium mb-1 opacity-70">{msg.display_name || 'User'}</p>
                )}
                <p className="text-sm">{msg.content}</p>
                <p className="text-[10px] opacity-50 mt-1">{new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="px-6 py-3 border-t border-border bg-card flex space-x-2">
          <Input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 rounded-xl"
          />
          <Button size="sm" onClick={handleSendMessage} className="bg-gradient-primary rounded-xl">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20">
      <div className="pt-12 pb-6 px-6">
        <PageHeader title="Cultural Bridge" className="mb-6" />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 rounded-lg p-1">
            <TabsTrigger value="community" className="rounded-md">Community</TabsTrigger>
            <TabsTrigger value="events" className="rounded-md">Events</TabsTrigger>
            <TabsTrigger value="food" className="rounded-md">Food</TabsTrigger>
          </TabsList>

          {/* Community Tab */}
          <TabsContent value="community" className="space-y-4">
            <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-gradient-primary rounded-xl"><Plus className="w-4 h-4 mr-2" />Create Group</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create New Group</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-4">
                  <div><Label>Group Name *</Label><Input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="e.g. Bangalore NRIs" /></div>
                  <div><Label>Description</Label><Input value={groupDesc} onChange={e => setGroupDesc(e.target.value)} placeholder="Brief description..." /></div>
                  <div><Label>Category *</Label>
                    <select value={groupCategory} onChange={e => setGroupCategory(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                      <option value="General">General</option><option value="Food">Food</option><option value="Career">Career</option><option value="Sports">Sports</option><option value="Culture">Culture</option>
                    </select>
                  </div>
                  <Button onClick={handleCreateGroup} className="w-full bg-gradient-primary">Create Group</Button>
                </div>
              </DialogContent>
            </Dialog>

            {groups.length === 0 && <p className="text-center text-muted-foreground py-8">No groups yet. Create one!</p>}
            {groups.map((group) => (
              <Card key={group.id} className="p-6 shadow-card border-0">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className={`font-semibold text-foreground ${joinedGroupIds.has(group.id) ? 'cursor-pointer hover:text-primary transition-colors' : ''}`}
                        onClick={() => joinedGroupIds.has(group.id) && openChat(group)}>
                        {group.name}
                      </h3>
                      <Badge variant="secondary" className="text-xs">{group.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{group.description}</p>
                    <MemberCount groupId={group.id} />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant={joinedGroupIds.has(group.id) ? "outline" : "default"}
                    className={joinedGroupIds.has(group.id) ? "" : "bg-gradient-primary hover:shadow-glow"}
                    onClick={() => handleJoinGroup(group.id)}>
                    {joinedGroupIds.has(group.id) ? 'Joined' : 'Join Group'}
                  </Button>
                   {joinedGroupIds.has(group.id) && (
                    <Button size="sm" variant="ghost" className="text-muted-foreground relative" onClick={() => openMembers(group)}>
                      <User className="w-4 h-4 mr-1" />Members
                      {(groupDmSenders[group.id] || 0) > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                          {groupDmSenders[group.id] > 9 ? '9+' : groupDmSenders[group.id]}
                        </span>
                      )}
                    </Button>
                   )}
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-4">
            <div className="flex space-x-2 mb-4">
              <Button size="sm" variant={eventsTab === 'upcoming' ? 'default' : 'outline'} onClick={() => setEventsTab('upcoming')} className="rounded-xl">Upcoming</Button>
              <Button size="sm" variant={eventsTab === 'history' ? 'default' : 'outline'} onClick={() => setEventsTab('history')} className="rounded-xl">History</Button>
            </div>

            {eventsTab === 'upcoming' && upcomingEvents.length === 0 && <p className="text-center text-muted-foreground py-8">No upcoming events.</p>}
            {eventsTab === 'history' && pastEvents.length === 0 && <p className="text-center text-muted-foreground py-8">No past events.</p>}

            {(eventsTab === 'upcoming' ? upcomingEvents : pastEvents).map((event) => (
              <Card key={event.id} className="p-6 shadow-card border-0">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-foreground">{event.title}</h3>
                  <div className="flex items-center gap-1">
                    <button onClick={() => eventFavorites.toggleFavorite(event.id)} className="p-1">
                      <Heart className={`w-4 h-4 ${eventFavorites.isFavorite(event.id) ? 'text-destructive fill-current' : 'text-muted-foreground'}`} />
                    </button>
                    {(user?.id === event.user_id || isAdmin) && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Event</AlertDialogTitle>
                            <AlertDialogDescription>Are you sure you want to delete this event? This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteEvent(event.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
                {event.description && <p className="text-sm text-muted-foreground mb-3">{event.description}</p>}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(event.event_date).toLocaleDateString('en-US', { dateStyle: 'medium' })} at {new Date(event.event_date).toLocaleTimeString('en-US', { timeStyle: 'short' })}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />{event.location}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant={interestedEventIds.has(event.id) ? "default" : "outline"}
                    className={interestedEventIds.has(event.id) ? "bg-gradient-primary" : ""}
                    onClick={() => handleToggleInterested(event.id)}
                  >
                    <Heart className={`w-3.5 h-3.5 mr-1 ${interestedEventIds.has(event.id) ? 'fill-current' : ''}`} />
                    {interestedEventIds.has(event.id) ? 'Interested' : 'Mark Interested'}
                  </Button>
                  {event.platform_link && (
                    <a href={event.platform_link} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="text-primary">
                        <ExternalLink className="w-3 h-3 mr-1" /> Details
                      </Button>
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Food Tab */}
          <TabsContent value="food" className="space-y-4">
            <Dialog open={isAddRestOpen} onOpenChange={setIsAddRestOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-gradient-primary rounded-xl"><Plus className="w-4 h-4 mr-2" />Add Restaurant</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[85vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Add Restaurant</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-4">
                  <div><Label>Name *</Label><Input value={restName} onChange={e => setRestName(e.target.value)} placeholder="Restaurant name" /></div>
                  <div><Label>Cuisine *</Label><Input value={restCuisine} onChange={e => setRestCuisine(e.target.value)} placeholder="e.g. North Indian" /></div>
                  <div><Label>Location *</Label><Input value={restLocation} onChange={e => setRestLocation(e.target.value)} placeholder="Address (required)" /></div>
                  <div><Label>Specialty</Label><Input value={restSpecialty} onChange={e => setRestSpecialty(e.target.value)} placeholder="e.g. Biryani" /></div>
                  <div><Label>Recommended Dishes (comma separated)</Label><Input value={restDishes} onChange={e => setRestDishes(e.target.value)} placeholder="Biryani, Kebab" /></div>
                  <div className="flex items-center space-x-3">
                    <Label>Vegetarian?</Label><Switch checked={restIsVeg} onCheckedChange={setRestIsVeg} />
                  </div>
                  <Button onClick={handleAddRestaurant} className="w-full bg-gradient-primary">Add Restaurant</Button>
                </div>
              </DialogContent>
            </Dialog>

            {selectedRestaurant && (
              <Dialog open={!!selectedRestaurant} onOpenChange={() => setSelectedRestaurant(null)}>
                <DialogContent>
                  <DialogHeader><DialogTitle>{selectedRestaurant.name}</DialogTitle></DialogHeader>
                  <div className="space-y-3 pt-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${selectedRestaurant.is_veg ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-sm">{selectedRestaurant.is_veg ? 'Vegetarian' : 'Non-Vegetarian'}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedRestaurant.cuisine} • {selectedRestaurant.specialty}</p>
                    {selectedRestaurant.location && <p className="text-sm flex items-center"><MapPin className="w-3 h-3 mr-1" />{selectedRestaurant.location}</p>}
                    {selectedRestaurant.recommended_dishes?.length > 0 && (
                      <div>
                        <p className="font-medium text-sm mb-1">Recommended Dishes</p>
                        <div className="flex flex-wrap gap-2">{selectedRestaurant.recommended_dishes.map((d: string) => <Badge key={d} variant="secondary">{d}</Badge>)}</div>
                      </div>
                    )}
                    <div className="flex items-center"><Star className="w-4 h-4 text-warning fill-current mr-1" /><span>{Number(selectedRestaurant.average_rating).toFixed(1)} ({selectedRestaurant.total_ratings} ratings)</span></div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {restaurants.length === 0 && <p className="text-center text-muted-foreground py-8">No restaurants yet. Add one!</p>}
            {restaurants.map((restaurant) => (
              <Card key={restaurant.id} className="p-6 shadow-card border-0">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-foreground">{restaurant.name}</h3>
                      <div className={`w-2.5 h-2.5 rounded-full ${restaurant.is_veg ? 'bg-green-500' : 'bg-red-500'}`} />
                    </div>
                    <p className="text-sm text-muted-foreground">{restaurant.cuisine} • {restaurant.specialty}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => restFavorites.toggleFavorite(restaurant.id)} className="p-1">
                      <Heart className={`w-4 h-4 ${restFavorites.isFavorite(restaurant.id) ? 'text-destructive fill-current' : 'text-muted-foreground'}`} />
                    </button>
                    {(user?.id === restaurant.user_id || isAdmin) && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Restaurant</AlertDialogTitle>
                            <AlertDialogDescription>Are you sure you want to delete this restaurant? This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteRestaurant(restaurant.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-warning fill-current mr-1" />
                      <span className="text-sm font-medium">{Number(restaurant.average_rating).toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} onClick={() => handleRateRestaurant(restaurant.id, star)}>
                        <Star className={`w-3.5 h-3.5 ${(userRestRatings[restaurant.id] || 0) >= star ? 'text-warning fill-current' : 'text-muted-foreground'}`} />
                      </button>
                    ))}
                  </div>
                  <Button size="sm" variant="ghost" className="text-primary" onClick={() => setSelectedRestaurant(restaurant)}>
                    Know More
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Create Event Button */}
      {activeTab === 'events' && (
        <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
          <DialogTrigger asChild>
            <Button className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-gradient-primary shadow-floating hover:shadow-glow hover:scale-110 transition-all duration-300">
              <Plus className="w-6 h-6" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Event</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div><Label>Title *</Label><Input value={eventTitle} onChange={e => setEventTitle(e.target.value)} placeholder="Event title" /></div>
              <div><Label>Description</Label><Input value={eventDesc} onChange={e => setEventDesc(e.target.value)} placeholder="Brief description" /></div>
              <div><Label>Date & Time *</Label><Input type="datetime-local" value={eventDate} onChange={e => setEventDate(e.target.value)} /></div>
              <div><Label>Location *</Label><Input value={eventLocation} onChange={e => setEventLocation(e.target.value)} placeholder="Venue or address" /></div>
              <div><Label>Platform / Booking Link *</Label><Input value={eventLink} onChange={e => setEventLink(e.target.value)} placeholder="https://..." /></div>
              <Button onClick={handleCreateEvent} className="w-full bg-gradient-primary">Create Event</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CulturalBridge;
