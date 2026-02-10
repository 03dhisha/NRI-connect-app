-- Create housing_listings table
CREATE TABLE public.housing_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  rent_amount INTEGER NOT NULL,
  bedrooms INTEGER NOT NULL,
  description TEXT,
  amenities TEXT[],
  is_available BOOLEAN NOT NULL DEFAULT true,
  average_rating NUMERIC(3,2) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create housing_ratings table
CREATE TABLE public.housing_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.housing_listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(listing_id, user_id)
);

-- Create community_groups table
CREATE TABLE public.community_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  members_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group_members table
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  platform_link TEXT,
  attendees_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event_attendees table
CREATE TABLE public.event_attendees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Create restaurants table
CREATE TABLE public.restaurants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  cuisine TEXT NOT NULL,
  location TEXT,
  is_veg BOOLEAN NOT NULL DEFAULT false,
  specialty TEXT,
  recommended_dishes TEXT[],
  average_rating NUMERIC(3,2) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create restaurant_ratings table
CREATE TABLE public.restaurant_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id, user_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.housing_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.housing_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_ratings ENABLE ROW LEVEL SECURITY;

-- Housing Listings RLS Policies
CREATE POLICY "Anyone can view available housing listings" 
ON public.housing_listings 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create housing listings" 
ON public.housing_listings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings" 
ON public.housing_listings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings" 
ON public.housing_listings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Housing Ratings RLS Policies
CREATE POLICY "Anyone can view housing ratings" 
ON public.housing_ratings 
FOR SELECT 
USING (true);

CREATE POLICY "Users can rate listings" 
ON public.housing_ratings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" 
ON public.housing_ratings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Community Groups RLS Policies
CREATE POLICY "Anyone can view community groups" 
ON public.community_groups 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create groups" 
ON public.community_groups 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Creators can update their groups" 
ON public.community_groups 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Creators can delete their groups" 
ON public.community_groups 
FOR DELETE 
USING (auth.uid() = user_id);

-- Group Members RLS Policies
CREATE POLICY "Anyone can view group members" 
ON public.group_members 
FOR SELECT 
USING (true);

CREATE POLICY "Users can join groups" 
ON public.group_members 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups" 
ON public.group_members 
FOR DELETE 
USING (auth.uid() = user_id);

-- Events RLS Policies
CREATE POLICY "Anyone can view events" 
ON public.events 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create events" 
ON public.events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Creators can update their events" 
ON public.events 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Creators can delete their events" 
ON public.events 
FOR DELETE 
USING (auth.uid() = user_id);

-- Event Attendees RLS Policies
CREATE POLICY "Anyone can view event attendees" 
ON public.event_attendees 
FOR SELECT 
USING (true);

CREATE POLICY "Users can register for events" 
ON public.event_attendees 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unregister from events" 
ON public.event_attendees 
FOR DELETE 
USING (auth.uid() = user_id);

-- Restaurants RLS Policies
CREATE POLICY "Anyone can view restaurants" 
ON public.restaurants 
FOR SELECT 
USING (true);

CREATE POLICY "Users can add restaurants" 
ON public.restaurants 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their restaurant entries" 
ON public.restaurants 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their restaurant entries" 
ON public.restaurants 
FOR DELETE 
USING (auth.uid() = user_id);

-- Restaurant Ratings RLS Policies
CREATE POLICY "Anyone can view restaurant ratings" 
ON public.restaurant_ratings 
FOR SELECT 
USING (true);

CREATE POLICY "Users can rate restaurants" 
ON public.restaurant_ratings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own restaurant ratings" 
ON public.restaurant_ratings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create updated_at trigger for new tables
CREATE TRIGGER update_housing_listings_updated_at
BEFORE UPDATE ON public.housing_listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_groups_updated_at
BEFORE UPDATE ON public.community_groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at
BEFORE UPDATE ON public.restaurants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();