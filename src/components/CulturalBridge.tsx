import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Users, Calendar, MapPin, Plus, Clock, Star, ChefHat, ExternalLink, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const CulturalBridge = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('community');

  // Community state
  const [groups, setGroups] = useState<any[]>([]);
  const [joinedGroupIds, setJoinedGroupIds] = useState<Set<string>>(new Set());
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupCategory, setGroupCategory] = useState('General');

  // Events state
  const [events, setEvents] = useState<any[]>([]);
  const [eventsTab, setEventsTab] = useState('upcoming');
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventLink, setEventLink] = useState('');

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

  // Fetch data
  useEffect(() => {
    fetchGroups();
    fetchEvents();
    fetchRestaurants();
    if (user) {
      fetchJoinedGroups();
      fetchUserRestRatings();
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

  const fetchEvents = async () => {
    const { data } = await supabase.from('events').select('*').order('event_date', { ascending: true });
    if (data) setEvents(data);
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
    const { error } = await supabase.from('community_groups').insert({ user_id: user.id, name: groupName, description: groupDesc, category: groupCategory });
    if (error) { toast.error('Failed to create group'); return; }
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
    }
  };

  // Event handlers
  const handleCreateEvent = async () => {
    if (!user || !eventTitle || !eventDate || !eventLocation) { toast.error('Fill required fields'); return; }
    const { error } = await supabase.from('events').insert({
      user_id: user.id, title: eventTitle, description: eventDesc,
      event_date: new Date(eventDate).toISOString(), location: eventLocation, platform_link: eventLink || null,
    });
    if (error) { toast.error('Failed to create event'); return; }
    toast.success('Event created!');
    setIsCreateEventOpen(false);
    setEventTitle(''); setEventDesc(''); setEventDate(''); setEventLocation(''); setEventLink('');
    fetchEvents();
  };

  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.event_date) >= now);
  const pastEvents = events.filter(e => new Date(e.event_date) < now);

  // Restaurant handlers
  const handleAddRestaurant = async () => {
    if (!user || !restName || !restCuisine) { toast.error('Fill required fields'); return; }
    const { error } = await supabase.from('restaurants').insert({
      user_id: user.id, name: restName, cuisine: restCuisine, location: restLocation || null,
      is_veg: restIsVeg, specialty: restSpecialty || null,
      recommended_dishes: restDishes ? restDishes.split(',').map(d => d.trim()) : [],
    });
    if (error) { toast.error('Failed to add restaurant'); return; }
    toast.success('Restaurant added!');
    setIsAddRestOpen(false);
    setRestName(''); setRestCuisine(''); setRestLocation(''); setRestIsVeg(false); setRestSpecialty(''); setRestDishes('');
    fetchRestaurants();
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

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20">
      <div className="pt-12 pb-6 px-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Cultural Bridge</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 rounded-2xl p-1">
            <TabsTrigger value="community" className="rounded-xl">Community</TabsTrigger>
            <TabsTrigger value="events" className="rounded-xl">Events</TabsTrigger>
            <TabsTrigger value="food" className="rounded-xl">Food</TabsTrigger>
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
                      <h3 className="font-semibold text-foreground">{group.name}</h3>
                      <Badge variant="secondary" className="text-xs">{group.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{group.description}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="w-4 h-4 mr-1" />{group.members_count?.toLocaleString() || 1} members
                    </div>
                  </div>
                </div>
                <Button size="sm" variant={joinedGroupIds.has(group.id) ? "outline" : "default"}
                  className={joinedGroupIds.has(group.id) ? "" : "bg-gradient-primary hover:shadow-glow"}
                  onClick={() => handleJoinGroup(group.id)}>
                  {joinedGroupIds.has(group.id) ? 'Joined' : 'Join Group'}
                </Button>
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
                <h3 className="font-semibold text-foreground mb-2">{event.title}</h3>
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
                {event.platform_link && (
                  <a href={event.platform_link} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="text-primary">
                      <ExternalLink className="w-3 h-3 mr-1" /> Details
                    </Button>
                  </a>
                )}
                {!event.platform_link && <Badge variant="secondary">No link provided</Badge>}
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
                  <div><Label>Location</Label><Input value={restLocation} onChange={e => setRestLocation(e.target.value)} placeholder="Address" /></div>
                  <div><Label>Specialty</Label><Input value={restSpecialty} onChange={e => setRestSpecialty(e.target.value)} placeholder="e.g. Biryani" /></div>
                  <div><Label>Recommended Dishes (comma separated)</Label><Input value={restDishes} onChange={e => setRestDishes(e.target.value)} placeholder="Biryani, Kebab" /></div>
                  <div className="flex items-center space-x-3">
                    <Label>Vegetarian?</Label><Switch checked={restIsVeg} onCheckedChange={setRestIsVeg} />
                  </div>
                  <Button onClick={handleAddRestaurant} className="w-full bg-gradient-primary">Add Restaurant</Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Restaurant Detail View */}
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
                  <div className="text-right">
                    <div className="flex items-center mb-1">
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
              <div><Label>Platform / Booking Link</Label><Input value={eventLink} onChange={e => setEventLink(e.target.value)} placeholder="https://..." /></div>
              <Button onClick={handleCreateEvent} className="w-full bg-gradient-primary">Create Event</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CulturalBridge;
