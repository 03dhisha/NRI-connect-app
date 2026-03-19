import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, Calendar, Globe, HelpCircle, LogOut, ChevronRight, Moon, Bell, Shield, ArrowLeft, MessageCircle, Lock, Home
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';

interface ProfileSettingsProps {
  onLogout: () => void;
}

const ProfileSettings = ({ onLogout }: ProfileSettingsProps) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDarkMode = theme === 'dark' || (theme === 'system' && resolvedTheme === 'dark');
  const { user, signOut } = useAuth();

  const [eventsCount, setEventsCount] = useState(0);
  const [housingFavCount, setHousingFavCount] = useState(0);
  const [interestedEvents, setInterestedEvents] = useState<any[]>([]);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const [feedbackText, setFeedbackText] = useState('');

  useEffect(() => {
    if (user) {
      fetchEventCount();
      fetchInterestedEvents();
      fetchHousingFavCount();
      setEditName(user.user_metadata?.display_name || '');
    }
  }, [user]);

  const fetchEventCount = async () => {
    if (!user) return;
    const { count } = await supabase.from('event_attendees').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    setEventsCount(count || 0);
  };

  const fetchHousingFavCount = async () => {
    if (!user) return;
    const { count } = await supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('item_type', 'housing');
    setHousingFavCount(count || 0);
  };

  const fetchInterestedEvents = async () => {
    if (!user) return;
    const { data: attendeeData } = await supabase.from('event_attendees').select('event_id').eq('user_id', user.id);
    if (attendeeData && attendeeData.length > 0) {
      const eventIds = attendeeData.map((a: any) => a.event_id);
      const { data: eventsData } = await supabase.from('events').select('*').in('id', eventIds).order('event_date', { ascending: true });
      if (eventsData) setInterestedEvents(eventsData);
    } else {
      setInterestedEvents([]);
    }
  };

  const handleLogout = async () => {
    await signOut();
    onLogout();
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    const { error } = await supabase.auth.updateUser({ data: { display_name: editName } });
    if (error) { toast.error('Failed to update profile'); return; }
    await supabase.from('profiles').update({ display_name: editName }).eq('user_id', user.id);
    toast.success('Profile updated!');
    setIsEditOpen(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword) { toast.error('Please enter your current password'); return; }
    if (newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('New passwords do not match'); return; }

    setChangingPassword(true);
    // Verify current password by re-authenticating
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email || '',
      password: currentPassword,
    });
    if (signInError) {
      setChangingPassword(false);
      toast.error('Current password is incorrect');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Password changed successfully!');
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    setActiveSection(null);
  };

  const handleSubmitFeedback = () => {
    if (!feedbackText.trim()) { toast.error('Please enter feedback'); return; }
    toast.success('Feedback submitted! Thank you.');
    setFeedbackText('');
  };

  if (activeSection === 'events') {
    return (
      <div className="min-h-screen bg-gradient-subtle pb-20">
        <div className="pt-12 pb-6 px-6">
          <div className="flex items-center space-x-3 mb-6">
            <Button variant="ghost" size="sm" onClick={() => setActiveSection(null)}><ArrowLeft className="w-5 h-5" /></Button>
            <h1 className="text-2xl font-bold text-foreground">My Events</h1>
          </div>
          {interestedEvents.length === 0 && <p className="text-center text-muted-foreground py-8">No events marked as interested yet.</p>}
          {interestedEvents.map((event) => (
            <Card key={event.id} className="p-6 shadow-card border-0 mb-4">
              <h3 className="font-semibold text-foreground mb-2">{event.title}</h3>
              {event.description && <p className="text-sm text-muted-foreground mb-2">{event.description}</p>}
              <div className="flex items-center text-sm text-muted-foreground mb-1">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(event.event_date).toLocaleDateString('en-US', { dateStyle: 'medium' })}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Globe className="w-4 h-4 mr-2" />{event.location}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (activeSection === 'language') {
    return (
      <div className="min-h-screen bg-gradient-subtle pb-20">
        <div className="pt-12 pb-6 px-6">
          <div className="flex items-center space-x-3 mb-6">
            <Button variant="ghost" size="sm" onClick={() => setActiveSection(null)}><ArrowLeft className="w-5 h-5" /></Button>
            <h1 className="text-2xl font-bold text-foreground">Language Preferences</h1>
          </div>
          <Card className="p-6 shadow-card border-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">English</span>
              </div>
              <Badge variant="default" className="bg-gradient-primary">Selected</Badge>
            </div>
          </Card>
          <p className="text-sm text-muted-foreground mt-4 text-center">More languages coming soon!</p>
        </div>
      </div>
    );
  }

  if (activeSection === 'notifications') {
    return (
      <div className="min-h-screen bg-gradient-subtle pb-20">
        <div className="pt-12 pb-6 px-6">
          <div className="flex items-center space-x-3 mb-6">
            <Button variant="ghost" size="sm" onClick={() => setActiveSection(null)}><ArrowLeft className="w-5 h-5" /></Button>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          </div>
          <Card className="shadow-card border-0">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Group Messages</p>
                  <p className="text-sm text-muted-foreground">Get notified for new messages in your groups</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="p-4 border-t border-border flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-success" />
                <div>
                  <p className="font-medium text-foreground">Event Reminders</p>
                  <p className="text-sm text-muted-foreground">Reminders for events you're interested in</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (activeSection === 'privacy') {
    return (
      <div className="min-h-screen bg-gradient-subtle pb-20">
        <div className="pt-12 pb-6 px-6">
          <div className="flex items-center space-x-3 mb-6">
            <Button variant="ghost" size="sm" onClick={() => setActiveSection(null)}><ArrowLeft className="w-5 h-5" /></Button>
            <h1 className="text-2xl font-bold text-foreground">Privacy & Security</h1>
          </div>
          <Card className="p-6 shadow-card border-0">
            <h3 className="font-semibold text-foreground mb-4 flex items-center">
              <Lock className="w-5 h-5 mr-2" /> Change Password
            </h3>
            <div className="space-y-4">
              <div>
                <Label>Current Password</Label>
                <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
              </div>
              <div>
                <Label>New Password</Label>
                <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" />
              </div>
              <div>
                <Label>Confirm New Password</Label>
                <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" />
              </div>
              <Button onClick={handleChangePassword} disabled={changingPassword} className="w-full bg-gradient-primary">
                {changingPassword ? 'Verifying...' : 'Change Password'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (activeSection === 'help') {
    return (
      <div className="min-h-screen bg-gradient-subtle pb-20">
        <div className="pt-12 pb-6 px-6">
          <div className="flex items-center space-x-3 mb-6">
            <Button variant="ghost" size="sm" onClick={() => setActiveSection(null)}><ArrowLeft className="w-5 h-5" /></Button>
            <h1 className="text-2xl font-bold text-foreground">Help & Feedback</h1>
          </div>
          <Card className="p-6 shadow-card border-0 mb-4">
            <h3 className="font-semibold text-foreground mb-3">FAQs</h3>
            <div className="space-y-3">
              <div><p className="text-sm font-medium text-foreground">How do I join a community group?</p><p className="text-sm text-muted-foreground">Go to Cultural Bridge → Community tab and tap "Join Group" on any group.</p></div>
              <div><p className="text-sm font-medium text-foreground">How do I add a housing listing?</p><p className="text-sm text-muted-foreground">Go to Housing Navigator and tap the "Add +" button to create a new listing.</p></div>
              <div><p className="text-sm font-medium text-foreground">How do I mark interest in an event?</p><p className="text-sm text-muted-foreground">Go to Events tab and tap "Mark Interested" on any event.</p></div>
            </div>
          </Card>
          <Card className="p-6 shadow-card border-0 mb-4">
            <h3 className="font-semibold text-foreground mb-3">Contact Support</h3>
            <p className="text-sm text-muted-foreground">Email: support@nriconnect.app</p>
          </Card>
          <Card className="p-6 shadow-card border-0 mb-4">
            <h3 className="font-semibold text-foreground mb-3">Submit Feedback / Report an Issue</h3>
            <Textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)} placeholder="Tell us what you think or report an issue..." className="mb-3" />
            <Button onClick={handleSubmitFeedback} className="w-full bg-gradient-primary">Submit</Button>
          </Card>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'events', icon: Calendar, title: 'My Events', description: 'Events you\'re interested in', hasArrow: true },
    { id: 'language', icon: Globe, title: 'Language Preferences', description: 'Choose your preferred language', hasArrow: true },
    { id: 'notifications', icon: Bell, title: 'Notifications', description: 'Manage your notifications', hasArrow: true },
    { id: 'privacy', icon: Shield, title: 'Privacy & Security', description: 'Change password & settings', hasArrow: true },
    { id: 'help', icon: HelpCircle, title: 'Help & Feedback', description: 'FAQs, support, and feedback', hasArrow: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20">
      <div className="pt-12 pb-6 px-6">
        <PageHeader title="Profile & Settings" className="mb-8" />
        
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
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setIsEditOpen(true)}>Edit</Button>
          </div>
        </Card>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Profile</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Display Name</Label>
                <Input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Your name" />
              </div>
              <Button onClick={handleUpdateProfile} className="w-full bg-gradient-primary">Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4 text-center shadow-card border-0">
            <div className="text-2xl font-bold text-success mb-1">{eventsCount}</div>
            <div className="text-xs text-muted-foreground">Events</div>
          </Card>
          <Card className="p-4 text-center shadow-card border-0">
            <div className="text-2xl font-bold text-primary mb-1">{housingFavCount}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Home className="w-3 h-3" /> Housing</div>
          </Card>
        </div>

        <Card className="shadow-card border-0 mb-6">
          <div className="p-4 border-b border-border"><h3 className="font-semibold text-foreground">Preferences</h3></div>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center"><Moon className="w-5 h-5 text-muted-foreground" /></div>
              <div>
                <p className="font-medium text-foreground">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Switch to dark theme</p>
              </div>
            </div>
            <Switch checked={isDarkMode} onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} />
          </div>
        </Card>

        <Card className="shadow-card border-0 mb-6">
          <div className="p-4 border-b border-border"><h3 className="font-semibold text-foreground">Account</h3></div>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => setActiveSection(item.id)}
                className={`w-full p-4 flex items-center space-x-3 hover:bg-muted/50 transition-colors ${index !== menuItems.length - 1 ? 'border-b border-border' : ''}`}>
                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center"><Icon className="w-5 h-5 text-muted-foreground" /></div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                {item.hasArrow && <ChevronRight className="w-5 h-5 text-muted-foreground" />}
              </button>
            );
          })}
        </Card>

        <Button variant="outline" className="w-full flex items-center justify-center space-x-2 text-destructive border-destructive/20 hover:bg-destructive/10 rounded-2xl py-6" onClick={handleLogout}>
          <LogOut className="w-5 h-5" /><span>Sign Out</span>
        </Button>
      </div>
    </div>
  );
};

export default ProfileSettings;
