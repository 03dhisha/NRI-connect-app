import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Calendar, MapPin, Plus, Clock, Star, ChefHat } from 'lucide-react';

const CulturalBridge = () => {
  const [activeTab, setActiveTab] = useState('community');

  const communityGroups = [
    {
      id: '1',
      name: 'Bangalore NRIs',
      members: 1247,
      category: 'General',
      description: 'Connect with fellow NRIs in Bangalore for networking and support',
      isJoined: false
    },
    {
      id: '2',
      name: 'Delhi Food Lovers',
      members: 892,
      category: 'Food',
      description: 'Discover authentic local cuisine and restaurant recommendations',
      isJoined: true
    },
    {
      id: '3',
      name: 'Mumbai Professionals',
      members: 2156,
      category: 'Career',
      description: 'Professional networking for career growth and opportunities',
      isJoined: false
    }
  ];

  const events = [
    {
      id: '1',
      title: 'Diwali Celebration 2024',
      date: 'Nov 15, 2024',
      time: '6:00 PM',
      location: 'Community Center, Koramangala',
      attendees: 156,
      isRSVP: true
    },
    {
      id: '2',
      title: 'Hindi Language Workshop',
      date: 'Nov 20, 2024',
      time: '10:00 AM',
      location: 'Cultural Center, Indiranagar',
      attendees: 42,
      isRSVP: false
    },
    {
      id: '3',
      title: 'Traditional Cooking Class',
      date: 'Nov 25, 2024',
      time: '3:00 PM',
      location: 'Cooking Studio, Whitefield',
      attendees: 28,
      isRSVP: false
    }
  ];

  const restaurants = [
    {
      id: '1',
      name: 'Authentic Biryani House',
      cuisine: 'North Indian',
      rating: 4.6,
      priceRange: '₹₹',
      distance: '2.3 km',
      specialty: 'Hyderabadi Biryani'
    },
    {
      id: '2',
      name: 'South Spice Corner',
      cuisine: 'South Indian',
      rating: 4.4,
      priceRange: '₹',
      distance: '1.8 km',
      specialty: 'Dosa & Idli'
    },
    {
      id: '3',
      name: 'Gujarati Thali Express',
      cuisine: 'Gujarati',
      rating: 4.7,
      priceRange: '₹₹',
      distance: '3.1 km',
      specialty: 'Traditional Thali'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20">
      {/* Header */}
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
            {communityGroups.map((group) => (
              <Card key={group.id} className="p-6 shadow-card border-0">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-foreground">{group.name}</h3>
                      <Badge variant="secondary" className="text-xs">{group.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{group.description}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="w-4 h-4 mr-1" />
                      {group.members.toLocaleString()} members
                    </div>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant={group.isJoined ? "outline" : "default"}
                  className={group.isJoined ? "" : "bg-gradient-primary hover:shadow-glow"}
                >
                  {group.isJoined ? 'Joined' : 'Join Group'}
                </Button>
              </Card>
            ))}
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-4">
            {events.map((event) => (
              <Card key={event.id} className="p-6 shadow-card border-0">
                <h3 className="font-semibold text-foreground mb-2">{event.title}</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    {event.date} at {event.time}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    {event.attendees} attending
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant={event.isRSVP ? "outline" : "default"}
                  className={event.isRSVP ? "" : "bg-gradient-primary hover:shadow-glow"}
                >
                  {event.isRSVP ? 'RSVP\'d' : 'RSVP'}
                </Button>
              </Card>
            ))}
          </TabsContent>

          {/* Food Tab */}
          <TabsContent value="food" className="space-y-4">
            {restaurants.map((restaurant) => (
              <Card key={restaurant.id} className="p-6 shadow-card border-0">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{restaurant.name}</h3>
                    <p className="text-sm text-muted-foreground">{restaurant.cuisine} • {restaurant.specialty}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center mb-1">
                      <Star className="w-4 h-4 text-warning fill-current mr-1" />
                      <span className="text-sm font-medium">{restaurant.rating}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{restaurant.distance}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{restaurant.priceRange}</Badge>
                    <div className="flex items-center">
                      <ChefHat className="w-3 h-3 text-muted-foreground mr-1" />
                      <span className="text-xs text-muted-foreground">{restaurant.cuisine}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="text-primary">
                    View Menu
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Create Event Button */}
      {activeTab === 'events' && (
        <Button className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-gradient-primary shadow-floating hover:shadow-glow hover:scale-110 transition-all duration-300">
          <Plus className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
};

export default CulturalBridge;