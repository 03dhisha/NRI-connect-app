import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, MessageCircle, Calendar, Users, Home, UtensilsCrossed } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MemberProfileProps {
  userId: string;
  onBack: () => void;
  onStartChat: (userId: string) => void;
}

const MemberProfile = ({ userId, onBack, onStartChat }: MemberProfileProps) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ groups: 0, events: 0, listings: 0, restaurants: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [profileRes, groupsRes, eventsRes, listingsRes, restaurantsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', userId).single(),
        supabase.from('group_members').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('event_attendees').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('housing_listings').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('restaurants').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      ]);
      setProfile(profileRes.data);
      setStats({
        groups: groupsRes.count ?? 0,
        events: eventsRes.count ?? 0,
        listings: listingsRes.count ?? 0,
        restaurants: restaurantsRes.count ?? 0,
      });
      setLoading(false);
    };
    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = profile?.display_name || 'User';
  const isOwnProfile = user?.id === userId;

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20">
      <div className="pt-12 pb-4 px-6 flex items-center space-x-3 border-b border-border bg-card">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="font-semibold text-foreground">Member Profile</h2>
      </div>

      <div className="px-6 py-6 space-y-4">
        <Card className="p-6 shadow-card border-0 flex flex-col items-center">
          <Avatar className="w-20 h-20 mb-3">
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h3 className="text-lg font-semibold text-foreground">{displayName}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Member since {new Date(profile?.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
          {!isOwnProfile && (
            <Button className="mt-4 bg-gradient-primary rounded-xl" size="sm" onClick={() => onStartChat(userId)}>
              <MessageCircle className="w-4 h-4 mr-2" /> Send Message
            </Button>
          )}
        </Card>

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Users, label: 'Communities', value: stats.groups },
            { icon: Calendar, label: 'Events', value: stats.events },
            { icon: Home, label: 'Listings', value: stats.listings },
            { icon: UtensilsCrossed, label: 'Restaurants', value: stats.restaurants },
          ].map(s => (
            <Card key={s.label} className="p-4 shadow-card border-0 text-center">
              <s.icon className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemberProfile;
