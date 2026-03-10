import React from 'react';
import { Card } from '@/components/ui/card';
import { Home, Users, MessageCircle, Calendar, MapPin, Shield, Heart } from 'lucide-react';
import nriLogo from '@/assets/nri-logo.png';
import { useAuth } from '@/contexts/AuthContext';
import NotificationBell from '@/components/NotificationBell';

interface HomeScreenProps {
  onNavigate: (tab: string) => void;
  isAdmin?: boolean;
}

const HomeScreen = ({ onNavigate, isAdmin }: HomeScreenProps) => {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.display_name || user?.email || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  const quickActions = [
    {
      id: 'housing',
      icon: Home,
      title: 'Find Housing',
      description: 'Browse available rentals',
      bgGradient: 'bg-gradient-primary'
    },
    {
      id: 'cultural',
      icon: Users,
      title: 'Join Community',
      description: 'Connect with locals',
      bgGradient: 'bg-gradient-to-br from-success to-success/80'
    }
  ];

  const recentActivity = [
    { icon: Calendar, text: "RSVP'd to Diwali celebration event", time: '1 day ago' },
    { icon: MessageCircle, text: 'Learned 5 new Hindi phrases', time: '2 days ago' }
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
            <button
              onClick={() => onNavigate('profile')}
              className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center"
            >
              <span className="text-white font-semibold text-sm">{initial}</span>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {quickActions.map((action) => (
            <Card key={action.id} className="border-0 overflow-hidden shadow-card rounded-lg">
              <button 
                onClick={() => onNavigate(action.id)}
                className="w-full p-6 text-left hover:scale-105 transition-all duration-300"
              >
                <div className={`w-12 h-12 ${action.bgGradient} rounded-md flex items-center justify-center mb-4`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{action.title}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </button>
            </Card>
          ))}
        </div>

        {/* Feature Overview - Removed Housing, kept Events and Translate */}
        <Card className="p-6 shadow-card border-0 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Your NRI Toolkit</h3>
          <div className="grid grid-cols-3 gap-4">
            <button 
              onClick={() => onNavigate('cultural-events')}
              className="text-center p-3 rounded-md hover:bg-muted transition-colors"
            >
              <Calendar className="w-6 h-6 text-success mx-auto mb-2" />
              <span className="text-xs font-medium text-muted-foreground">Events</span>
            </button>
            <button 
              onClick={() => onNavigate('favorites')}
              className="text-center p-3 rounded-md hover:bg-muted transition-colors"
            >
              <Heart className="w-6 h-6 text-destructive mx-auto mb-2" />
              <span className="text-xs font-medium text-muted-foreground">Favorites</span>
            </button>
            <button 
              onClick={() => onNavigate('communication')}
              className="text-center p-3 rounded-md hover:bg-muted transition-colors"
            >
              <MessageCircle className="w-6 h-6 text-accent mx-auto mb-2" />
              <span className="text-xs font-medium text-muted-foreground">Translate</span>
            </button>
          </div>
        </Card>

        {/* Admin Access */}
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

        {/* Recent Activity */}
        <Card className="p-6 shadow-card border-0">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                  <activity.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{activity.text}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HomeScreen;
