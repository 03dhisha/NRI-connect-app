import React, { useState, useEffect } from 'react';
import Onboarding from '@/components/Onboarding';
import HomeScreen from '@/components/HomeScreen';
import HousingNavigator from '@/components/HousingNavigator';
import CulturalBridge from '@/components/CulturalBridge';
import CommunicationAssistant from '@/components/CommunicationAssistant';
import ProfileSettings from '@/components/ProfileSettings';
import BottomNavigation from '@/components/BottomNavigation';
import LoginPage from '@/components/LoginPage';
import AdminDashboard from '@/components/AdminDashboard';
import FavoritesPage from '@/components/FavoritesPage';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { user, isLoading } = useAuth();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [culturalDefaultTab, setCulturalDefaultTab] = useState<string | undefined>();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminDash, setShowAdminDash] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [pendingChat, setPendingChat] = useState<{ type: 'dm' | 'group'; id: string; otherUserId?: string } | null>(null);

  useEffect(() => {
    if (user) {
      supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').then(({ data }) => {
        setIsAdmin(data && data.length > 0 ? true : false);
      });
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const handleGetStarted = () => {
    setHasSeenOnboarding(true);
    setActiveTab('home');
  };

  const handleNavigate = (tab: string) => {
    if (tab === 'cultural-events') {
      setCulturalDefaultTab('events');
      setActiveTab('cultural');
      setShowAdminDash(false);
      setShowFavorites(false);
    } else if (tab === 'admin') {
      setShowAdminDash(true);
      setShowFavorites(false);
    } else if (tab === 'favorites') {
      setShowFavorites(true);
      setShowAdminDash(false);
    } else {
      setCulturalDefaultTab(undefined);
      setActiveTab(tab);
      setShowAdminDash(false);
      setShowFavorites(false);
    }
  };

  const handleLoginSuccess = () => {
    setActiveTab('home');
  };

  const handleLogout = () => {
    setHasSeenOnboarding(false);
    setActiveTab('home');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage onSuccess={handleLoginSuccess} />;
  }

  if (!hasSeenOnboarding) {
    return <Onboarding onGetStarted={handleGetStarted} />;
  }

  if (showAdminDash) {
    return (
      <>
        <AdminDashboard onBack={() => setShowAdminDash(false)} />
        <BottomNavigation activeTab={activeTab} onTabChange={(tab) => { setShowAdminDash(false); setActiveTab(tab); }} />
      </>
    );
  }

  if (showFavorites) {
    return (
      <>
        <FavoritesPage onBack={() => { setShowFavorites(false); setActiveTab('home'); }} />
        <BottomNavigation activeTab={activeTab} onTabChange={(tab) => { setShowFavorites(false); setActiveTab(tab); }} />
      </>
    );
  }

  const handleOpenChat = (type: 'dm' | 'group', id: string, otherUserId?: string) => {
    setPendingChat({ type, id, otherUserId });
    setCulturalDefaultTab('community');
    setActiveTab('cultural');
    setShowAdminDash(false);
    setShowFavorites(false);
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen onNavigate={handleNavigate} isAdmin={isAdmin} onOpenChat={handleOpenChat} />;
      case 'housing':
        return <HousingNavigator />;
      case 'cultural':
        return <CulturalBridge defaultTab={culturalDefaultTab} pendingChat={pendingChat} onChatOpened={() => setPendingChat(null)} />;
      case 'communication':
        return <CommunicationAssistant />;
      case 'profile':
        return <ProfileSettings onLogout={handleLogout} />;
      default:
        return <HomeScreen onNavigate={handleNavigate} isAdmin={isAdmin} onOpenChat={handleOpenChat} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderActiveScreen()}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
