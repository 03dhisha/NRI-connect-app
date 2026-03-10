import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Home, ChefHat, Calendar, MapPin, Star, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/PageHeader';

interface FavoritesPageProps {
  onBack: () => void;
}

const FavoritesPage = ({ onBack }: FavoritesPageProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('housing');
  const [favHousings, setFavHousings] = useState<any[]>([]);
  const [favRestaurants, setFavRestaurants] = useState<any[]>([]);
  const [favEvents, setFavEvents] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchFavItems('housing', 'housing_listings', setFavHousings);
      fetchFavItems('restaurant', 'restaurants', setFavRestaurants);
      fetchFavItems('event', 'events', setFavEvents);
    }
  }, [user]);

  const fetchFavItems = async (itemType: string, table: string, setter: (d: any[]) => void) => {
    if (!user) return;
    const { data: favs } = await supabase
      .from('favorites')
      .select('item_id')
      .eq('user_id', user.id)
      .eq('item_type', itemType);
    if (favs && favs.length > 0) {
      const ids = favs.map((f: any) => f.item_id);
      const { data } = await supabase.from(table as any).select('*').in('id', ids);
      if (data) setter(data);
    } else {
      setter([]);
    }
  };

  const removeFav = async (itemType: string, itemId: string) => {
    if (!user) return;
    await supabase.from('favorites').delete()
      .eq('user_id', user.id).eq('item_type', itemType).eq('item_id', itemId);
    if (itemType === 'housing') setFavHousings(prev => prev.filter(x => x.id !== itemId));
    if (itemType === 'restaurant') setFavRestaurants(prev => prev.filter(x => x.id !== itemId));
    if (itemType === 'event') setFavEvents(prev => prev.filter(x => x.id !== itemId));
  };

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20">
      <div className="pt-12 pb-6 px-6">
        <div className="flex items-center space-x-3 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
          <h1 className="text-2xl font-bold text-foreground">My Favorites</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 rounded-lg p-1">
            <TabsTrigger value="housing" className="rounded-md text-xs">Housing</TabsTrigger>
            <TabsTrigger value="restaurant" className="rounded-md text-xs">Restaurants</TabsTrigger>
            <TabsTrigger value="event" className="rounded-md text-xs">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="housing" className="space-y-4">
            {favHousings.length === 0 && <p className="text-center text-muted-foreground py-8">No favorite housing listings yet.</p>}
            {favHousings.map(listing => (
              <Card key={listing.id} className="p-4 shadow-card border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-foreground">{listing.title}</h3>
                    <p className="text-sm text-muted-foreground flex items-center mt-1"><MapPin className="w-3 h-3 mr-1" />{listing.location}</p>
                    <p className="text-lg font-bold text-primary mt-1">₹{listing.rent_amount?.toLocaleString()}/mo</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms}BHK`}</Badge>
                      <div className="flex items-center"><Star className="w-3 h-3 text-warning fill-current" /><span className="text-xs ml-0.5">{Number(listing.average_rating).toFixed(1)}</span></div>
                    </div>
                  </div>
                  <button onClick={() => removeFav('housing', listing.id)} className="text-destructive hover:text-destructive/80 p-1">
                    <Heart className="w-5 h-5 fill-current" />
                  </button>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="restaurant" className="space-y-4">
            {favRestaurants.length === 0 && <p className="text-center text-muted-foreground py-8">No favorite restaurants yet.</p>}
            {favRestaurants.map(rest => (
              <Card key={rest.id} className="p-4 shadow-card border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{rest.name}</h3>
                      <div className={`w-2.5 h-2.5 rounded-full ${rest.is_veg ? 'bg-green-500' : 'bg-red-500'}`} />
                    </div>
                    <p className="text-sm text-muted-foreground">{rest.cuisine}{rest.specialty ? ` • ${rest.specialty}` : ''}</p>
                    <div className="flex items-center mt-1"><Star className="w-3 h-3 text-warning fill-current" /><span className="text-xs ml-0.5">{Number(rest.average_rating).toFixed(1)}</span></div>
                  </div>
                  <button onClick={() => removeFav('restaurant', rest.id)} className="text-destructive hover:text-destructive/80 p-1">
                    <Heart className="w-5 h-5 fill-current" />
                  </button>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="event" className="space-y-4">
            {favEvents.length === 0 && <p className="text-center text-muted-foreground py-8">No favorite events yet.</p>}
            {favEvents.map(event => (
              <Card key={event.id} className="p-4 shadow-card border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-foreground">{event.title}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(event.event_date).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center mt-0.5"><MapPin className="w-3 h-3 mr-1" />{event.location}</p>
                  </div>
                  <button onClick={() => removeFav('event', event.id)} className="text-destructive hover:text-destructive/80 p-1">
                    <Heart className="w-5 h-5 fill-current" />
                  </button>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FavoritesPage;
