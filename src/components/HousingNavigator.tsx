import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Search, MapPin, Star, Wifi, Car, Utensils, Home, Plus, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface HousingListing {
  id: string;
  user_id: string;
  title: string;
  location: string;
  phone_number: string;
  rent_amount: number;
  bedrooms: number;
  description: string | null;
  amenities: string[] | null;
  is_available: boolean;
  average_rating: number;
  total_ratings: number;
}

const HousingNavigator = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState<HousingListing[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRent, setNewRent] = useState('');
  const [newBedrooms, setNewBedrooms] = useState('1');
  const [newDescription, setNewDescription] = useState('');
  const [newAmenities, setNewAmenities] = useState('');

  const fetchListings = async () => {
    const { data } = await supabase.from('housing_listings').select('*').order('created_at', { ascending: false });
    if (data) setListings(data as HousingListing[]);
  };

  const fetchUserRatings = async () => {
    if (!user) return;
    const { data } = await supabase.from('housing_ratings').select('listing_id, rating').eq('user_id', user.id);
    if (data) {
      const map: Record<string, number> = {};
      data.forEach((r: any) => { map[r.listing_id] = r.rating; });
      setUserRatings(map);
    }
  };

  useEffect(() => {
    fetchListings();
    fetchUserRatings();
  }, [user]);

  const handleAddListing = async () => {
    if (!user || !newTitle || !newLocation || !newPhone || !newRent) {
      toast.error('Please fill in all required fields');
      return;
    }
    const { error } = await supabase.from('housing_listings').insert({
      user_id: user.id,
      title: newTitle,
      location: newLocation,
      phone_number: newPhone,
      rent_amount: parseInt(newRent),
      bedrooms: parseInt(newBedrooms),
      description: newDescription || null,
      amenities: newAmenities ? newAmenities.split(',').map(a => a.trim()) : [],
    });
    if (error) { toast.error('Failed to add listing'); return; }
    toast.success('Listing added!');
    setIsAddOpen(false);
    resetForm();
    fetchListings();
  };

  const resetForm = () => {
    setNewTitle(''); setNewLocation(''); setNewPhone(''); setNewRent('');
    setNewBedrooms('1'); setNewDescription(''); setNewAmenities('');
  };

  const handleCopyPhone = (id: string, phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    toast.success('Phone number copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleAvailability = async (listing: HousingListing) => {
    if (listing.user_id !== user?.id) return;
    await supabase.from('housing_listings').update({ is_available: !listing.is_available }).eq('id', listing.id);
    fetchListings();
  };

  const handleRate = async (listingId: string, rating: number) => {
    if (!user) return;
    const { error } = await supabase.from('housing_ratings').upsert(
      { listing_id: listingId, user_id: user.id, rating },
      { onConflict: 'listing_id,user_id' }
    );
    if (!error) {
      setUserRatings(prev => ({ ...prev, [listingId]: rating }));
      // Update average
      const { data } = await supabase.from('housing_ratings').select('rating').eq('listing_id', listingId);
      if (data && data.length > 0) {
        const avg = data.reduce((sum: number, r: any) => sum + r.rating, 0) / data.length;
        await supabase.from('housing_listings').update({ average_rating: avg, total_ratings: data.length }).eq('id', listingId);
        fetchListings();
      }
    }
  };

  const filters = ['All', '1BHK', '2BHK', '3BHK'];

  const filteredListings = listings.filter(l => {
    const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) || l.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || 
      (selectedFilter === 'Studio' && l.bedrooms === 0) ||
      (selectedFilter === '1BHK' && l.bedrooms === 1) ||
      (selectedFilter === '2BHK' && l.bedrooms === 2) ||
      (selectedFilter === '3BHK' && l.bedrooms === 3);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20">
      <div className="pt-12 pb-6 px-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Housing Navigator</h1>
        
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by location or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 rounded-2xl border-0 shadow-card bg-card"
          />
        </div>

        {/* Map Placeholder */}
        <Card className="h-48 mb-6 shadow-card border-0 overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-success/20 flex items-center justify-center relative">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-primary mx-auto mb-2" />
              <p className="text-foreground font-medium">Interactive Map View</p>
              <p className="text-sm text-muted-foreground">Tap pins to view properties</p>
            </div>
            <div className="absolute top-6 left-8 w-4 h-4 bg-primary rounded-full shadow-glow animate-pulse"></div>
            <div className="absolute top-16 right-12 w-4 h-4 bg-accent rounded-full shadow-glow animate-pulse"></div>
            <div className="absolute bottom-8 left-1/3 w-4 h-4 bg-success rounded-full shadow-glow animate-pulse"></div>
          </div>
        </Card>

        {/* Filter Tags + Add Button */}
        <div className="flex items-center space-x-3 mb-6 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <Badge 
              key={filter} 
              variant={selectedFilter === filter ? 'default' : 'secondary'}
              className="whitespace-nowrap px-4 py-2 rounded-xl cursor-pointer"
              onClick={() => setSelectedFilter(filter)}
            >
              {filter}
            </Badge>
          ))}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="whitespace-nowrap bg-gradient-primary rounded-xl ml-auto">
                Add <Plus className="w-4 h-4 ml-1" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Listing</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div><Label>Title *</Label><Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Modern 2BHK Apartment" /></div>
                <div><Label>Location *</Label><Input value={newLocation} onChange={e => setNewLocation(e.target.value)} placeholder="e.g. Koramangala, Bangalore" /></div>
                <div><Label>Phone Number *</Label><Input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="e.g. +91 9876543210" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Rent (₹/month) *</Label><Input type="number" value={newRent} onChange={e => setNewRent(e.target.value)} placeholder="25000" /></div>
                  <div><Label>Bedrooms</Label><Input type="number" value={newBedrooms} onChange={e => setNewBedrooms(e.target.value)} min="0" max="10" /></div>
                </div>
                <div><Label>Description</Label><Input value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="Brief description..." /></div>
                <div><Label>Amenities (comma separated)</Label><Input value={newAmenities} onChange={e => setNewAmenities(e.target.value)} placeholder="WiFi, Parking, Kitchen" /></div>
                <Button onClick={handleAddListing} className="w-full bg-gradient-primary">Add Listing</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Listings */}
        <div className="space-y-4">
          {filteredListings.length === 0 && (
            <div className="text-center py-12">
              <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No listings found. Be the first to add one!</p>
            </div>
          )}
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="p-0 shadow-card border-0 overflow-hidden">
              <div className="flex">
                <div className="w-24 h-full min-h-[120px] bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center relative">
                  <Home className="w-8 h-8 text-muted-foreground" />
                  {!listing.is_available && (
                    <div className="absolute inset-0 bg-destructive/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-destructive bg-background/80 px-2 py-0.5 rounded">Unavailable</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{listing.title}</h3>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />{listing.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">₹{listing.rent_amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">/month</p>
                    </div>
                  </div>

                  {/* Phone with copy */}
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs text-muted-foreground">{listing.phone_number}</span>
                    <button onClick={() => handleCopyPhone(listing.id, listing.phone_number)} className="text-primary hover:text-primary/80">
                      {copiedId === listing.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {/* Average rating */}
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-warning fill-current" />
                        <span className="text-sm font-medium ml-1">{Number(listing.average_rating).toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">({listing.total_ratings})</span>
                      </div>
                      <Badge variant="outline" className="text-xs">{listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms}BHK`}</Badge>
                    </div>

                    {/* User rating stars */}
                    <div className="flex items-center space-x-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => handleRate(listing.id, star)} className="p-0">
                          <Star className={`w-3.5 h-3.5 ${(userRatings[listing.id] || 0) >= star ? 'text-warning fill-current' : 'text-muted-foreground'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Owner controls */}
                  {listing.user_id === user?.id && (
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <span className="text-xs text-muted-foreground">Mark as unavailable</span>
                      <Switch checked={!listing.is_available} onCheckedChange={() => handleToggleAvailability(listing)} />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HousingNavigator;
