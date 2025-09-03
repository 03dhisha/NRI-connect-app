import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Star, Wifi, Car, Utensils, ArrowRight, Home } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  rent: number;
  location: string;
  rating: number;
  reviews: number;
  image: string;
  amenities: string[];
  type: string;
}

const HousingNavigator = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const properties: Property[] = [
    {
      id: '1',
      title: 'Modern 2BHK Apartment',
      rent: 25000,
      location: 'Koramangala, Bangalore',
      rating: 4.5,
      reviews: 128,
      image: '/placeholder.svg',
      amenities: ['WiFi', 'Parking', 'Kitchen'],
      type: '2BHK'
    },
    {
      id: '2', 
      title: 'Cozy Studio Near Metro',
      rent: 18000,
      location: 'Gurgaon Sector 29',
      rating: 4.2,
      reviews: 89,
      image: '/placeholder.svg',
      amenities: ['WiFi', 'Metro Access'],
      type: 'Studio'
    },
    {
      id: '3',
      title: 'Luxury 3BHK Villa',
      rent: 45000,
      location: 'Powai, Mumbai',
      rating: 4.8,
      reviews: 67,
      image: '/placeholder.svg',
      amenities: ['WiFi', 'Parking', 'Kitchen', 'Garden'],
      type: '3BHK'
    }
  ];

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case 'WiFi': return Wifi;
      case 'Parking': return Car;
      case 'Kitchen': return Utensils;
      default: return MapPin;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20">
      {/* Header */}
      <div className="pt-12 pb-6 px-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Housing Navigator</h1>
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by location, type, or budget..."
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
            {/* Mock map pins */}
            <div className="absolute top-6 left-8 w-4 h-4 bg-primary rounded-full shadow-glow animate-pulse"></div>
            <div className="absolute top-16 right-12 w-4 h-4 bg-accent rounded-full shadow-glow animate-pulse"></div>
            <div className="absolute bottom-8 left-1/3 w-4 h-4 bg-success rounded-full shadow-glow animate-pulse"></div>
          </div>
        </Card>

        {/* Filter Tags */}
        <div className="flex space-x-3 mb-6 overflow-x-auto pb-2">
          {['All', '1BHK', '2BHK', '3BHK', 'Studio', 'Under ₹20k', 'Pet Friendly'].map((filter) => (
            <Badge 
              key={filter} 
              variant={filter === 'All' ? 'default' : 'secondary'}
              className="whitespace-nowrap px-4 py-2 rounded-xl"
            >
              {filter}
            </Badge>
          ))}
        </div>

        {/* Properties List */}
        <div className="space-y-4">
          {properties.map((property) => (
            <Card key={property.id} className="p-0 shadow-card border-0 overflow-hidden">
              <div className="flex">
                {/* Property Image */}
                <div className="w-24 h-24 bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center">
                  <Home className="w-8 h-8 text-muted-foreground" />
                </div>
                
                {/* Property Details */}
                <div className="flex-1 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{property.title}</h3>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {property.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">₹{property.rent.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">/month</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-warning fill-current" />
                        <span className="text-sm font-medium ml-1">{property.rating}</span>
                        <span className="text-sm text-muted-foreground">({property.reviews})</span>
                      </div>
                      
                      <div className="flex space-x-1">
                        {property.amenities.slice(0, 3).map((amenity) => {
                          const Icon = getAmenityIcon(amenity);
                          return (
                            <div key={amenity} className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                              <Icon className="w-3 h-3 text-muted-foreground" />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <Button size="sm" variant="ghost" className="text-primary">
                      View <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
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