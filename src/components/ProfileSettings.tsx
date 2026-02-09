import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  User, 
  Calendar, 
  Settings, 
  Globe, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  Moon,
  Bell,
  Shield
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileSettingsProps {
  onLogout: () => void;
}

const ProfileSettings = ({ onLogout }: ProfileSettingsProps) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDarkMode = theme === 'dark' || (theme === 'system' && resolvedTheme === 'dark');

  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    onLogout();
  };
  const menuItems = [
    {
      id: 'bookings',
      icon: Calendar,
      title: 'My Bookings',
      description: 'View your housing reservations',
      hasArrow: true
    },
    {
      id: 'events',
      icon: Calendar,
      title: 'My Events',
      description: 'Events you\'re attending',
      hasArrow: true
    },
    {
      id: 'language',
      icon: Globe,
      title: 'Language Preferences',
      description: 'Choose your preferred language',
      hasArrow: true
    },
    {
      id: 'notifications',
      icon: Bell,
      title: 'Notifications',
      description: 'Manage your notifications',
      hasArrow: true
    },
    {
      id: 'privacy',
      icon: Shield,
      title: 'Privacy & Security',
      description: 'Manage your privacy settings',
      hasArrow: true
    },
    {
      id: 'help',
      icon: HelpCircle,
      title: 'Help & Support',
      description: 'Get help and contact support',
      hasArrow: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20">
      {/* Header */}
      <div className="pt-12 pb-6 px-6">
        <h1 className="text-2xl font-bold text-foreground mb-8">Profile & Settings</h1>
        
        {/* User Profile Section */}
        <Card className="p-6 shadow-card border-0 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground">
                {user?.user_metadata?.display_name || 'User'}
              </h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <p className="text-sm text-muted-foreground">
                Member since {new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl">
              Edit
            </Button>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 text-center shadow-card border-0">
            <div className="text-2xl font-bold text-primary mb-1">3</div>
            <div className="text-xs text-muted-foreground">Bookings</div>
          </Card>
          <Card className="p-4 text-center shadow-card border-0">
            <div className="text-2xl font-bold text-success mb-1">12</div>
            <div className="text-xs text-muted-foreground">Events</div>
          </Card>
          <Card className="p-4 text-center shadow-card border-0">
            <div className="text-2xl font-bold text-accent mb-1">89</div>
            <div className="text-xs text-muted-foreground">Phrases</div>
          </Card>
        </div>

        {/* Settings */}
        <Card className="shadow-card border-0 mb-6">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Preferences</h3>
          </div>
          
          {/* Dark Mode Toggle */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                <Moon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Switch to dark theme</p>
              </div>
            </div>
            <Switch checked={isDarkMode} onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} />
          </div>
        </Card>

        {/* Menu Items */}
        <Card className="shadow-card border-0 mb-6">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Account</h3>
          </div>
          
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`w-full p-4 flex items-center space-x-3 hover:bg-muted/50 transition-colors ${
                  index !== menuItems.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                {item.hasArrow && (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
            );
          })}
        </Card>

        {/* Logout Button */}
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center space-x-2 text-destructive border-destructive/20 hover:bg-destructive/10 rounded-2xl py-6"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  );
};

export default ProfileSettings;