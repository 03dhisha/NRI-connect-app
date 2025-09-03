import React, { useState } from 'react';
import Onboarding from '@/components/Onboarding';
import HomeScreen from '@/components/HomeScreen';
import HousingNavigator from '@/components/HousingNavigator';
import CulturalBridge from '@/components/CulturalBridge';
import CommunicationAssistant from '@/components/CommunicationAssistant';
import ProfileSettings from '@/components/ProfileSettings';
import BottomNavigation from '@/components/BottomNavigation';

const Index = () => {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const handleGetStarted = () => {
    setHasSeenOnboarding(true);
    setActiveTab('home');
  };

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
  };

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
        return <CulturalBridge />;
      case 'communication':
        return <CommunicationAssistant />;
      case 'profile':
        return <ProfileSettings />;
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
