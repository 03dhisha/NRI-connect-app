import React, { useState } from 'react';
import Onboarding from '@/components/Onboarding';
import HomeScreen from '@/components/HomeScreen';
import HousingNavigator from '@/components/HousingNavigator';
import CulturalBridge from '@/components/CulturalBridge';
import CommunicationAssistant from '@/components/CommunicationAssistant';
import ProfileSettings from '@/components/ProfileSettings';
import BottomNavigation from '@/components/BottomNavigation';
import LoginPage from '@/components/LoginPage';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user, isLoading } = useAuth();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [culturalDefaultTab, setCulturalDefaultTab] = useState<string | undefined>();

  const handleGetStarted = () => {
    setHasSeenOnboarding(true);
    setActiveTab('home');
  };

  const handleNavigate = (tab: string) => {
    if (tab === 'cultural-events') {
      setCulturalDefaultTab('events');
      setActiveTab('cultural');
    } else {
      setCulturalDefaultTab(undefined);
      setActiveTab(tab);
    }
  };

  const handleLoginSuccess = () => {
    setActiveTab('home');
  };

  const handleLogout = () => {
    setHasSeenOnboarding(false);
    setActiveTab('home');
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show login page if user is not authenticated
  if (!user) {
    return <LoginPage onSuccess={handleLoginSuccess} />;
  }

  // Show onboarding after login
  if (!hasSeenOnboarding) {
    return <Onboarding onGetStarted={handleGetStarted} />;
  }

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen onNavigate={handleNavigate} />;
      case 'housing':
        return <HousingNavigator />;
      case 'cultural':
        return <CulturalBridge defaultTab={culturalDefaultTab} />;
      case 'communication':
        return <CommunicationAssistant />;
      case 'profile':
        return <ProfileSettings onLogout={handleLogout} />;
      default:
        return <HomeScreen onNavigate={handleNavigate} />;
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
