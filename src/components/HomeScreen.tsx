import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Home, Users, MessageCircle, Calendar, Shield, Heart } from 'lucide-react';
import nriLogo from '@/assets/nri-logo.png';
import { useAuth } from '@/contexts/AuthContext';
import NotificationBell from '@/components/NotificationBell';
import { supabase } from '@/integrations/supabase/client';


interface HomeScreenProps {
  onNavigate: (tab: string) => void;
  isAdmin?: boolean;
}

const HomeScreen = ({ onNavigate, isAdmin }: HomeScreenProps) => {
  const { user } = useAuth();
  
  const displayName = user?.user_metadata?.display_name || user?.email || 'User';
  const initial = displayName.charAt(0).toUpperCase();
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchActivity = async () => {
      const { data } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (data) setRecentActivity(data);
    };
    fetchActivity();

    const channel = supabase
      .channel('activity-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs', filter: `user_id=eq.${user.id}` }, (payload) => {
        setRecentActivity(prev => [payload.new as any, ...prev].slice(0, 10));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'housing_search': return Home;
      case 'housing_view': return Home;
      case 'event_interest': return Calendar;
      case 'community_join': return Users;
      case 'community_message': return MessageCircle;
      default: return Calendar;
    }
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const quickActions = [
    { id: 'housing', icon: Home, title: 'Find Housing', description: 'Browse available rentals', bgGradient: 'bg-gradient-primary' },
    { id: 'cultural', icon: Users, title: 'Join Community', description: 'Connect with locals', bgGradient: 'bg-gradient-to-br from-success to-success/80' },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20">
      <div className="pt-12 pb-6 px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img src={nriLogo} alt="NRI Connect" className="w-12 h-12 object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Welcome back!</h1>
              <p className="text-muted-foreground">Let's make today productive</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button onClick={() => onNavigate('profile')} className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">{initial}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {quickActions.map((action) => (
            <Card key={action.id} className="border-0 overflow-hidden shadow-card rounded-lg">
              <button onClick={() => onNavigate(action.id)} className="w-full p-6 text-left hover:scale-105 transition-all duration-300 relative">
                <div className={`w-12 h-12 ${action.bgGradient} rounded-md flex items-center justify-center mb-4`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{action.title}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </button>
            </Card>
          ))}
        </div>

        <Card className="p-6 shadow-card border-0 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Your NRI Toolkit</h3>
          <div className="grid grid-cols-3 gap-4">
            <button onClick={() => onNavigate('cultural-events')} className="text-center p-3 rounded-md hover:bg-muted transition-colors">
              <Calendar className="w-6 h-6 text-success mx-auto mb-2" />
              <span className="text-xs font-medium text-muted-foreground">Events</span>
            </button>
            <button onClick={() => onNavigate('favorites')} className="text-center p-3 rounded-md hover:bg-muted transition-colors">
              <Heart className="w-6 h-6 text-destructive mx-auto mb-2" />
              <span className="text-xs font-medium text-muted-foreground">Favorites</span>
            </button>
            <button onClick={() => onNavigate('communication')} className="text-center p-3 rounded-md hover:bg-muted transition-colors">
              <MessageCircle className="w-6 h-6 text-accent mx-auto mb-2" />
              <span className="text-xs font-medium text-muted-foreground">Translate</span>
            </button>
          </div>
        </Card>

        {isAdmin && (
          <Card className="p-4 shadow-card border-0 mb-6 cursor-pointer hover:shadow-floating transition-shadow" onClick={() => onNavigate('admin')}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-destructive/10 rounded-md flex items-center justify-center">
                <Shield className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Admin Dashboard</h3>
                <p className="text-sm text-muted-foreground">View users, analytics & stats</p>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-6 shadow-card border-0">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity yet. Start exploring!</p>
            )}
            {recentActivity.map((activity) => {
              const Icon = getActivityIcon(activity.action_type);
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{activity.action_text}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(activity.created_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HomeScreen;
