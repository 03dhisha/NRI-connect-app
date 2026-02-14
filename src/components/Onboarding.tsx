import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Home, Users, MessageCircle } from 'lucide-react';
import welcomeIllustration from '@/assets/welcome-illustration.png';

interface OnboardingProps {
  onGetStarted: () => void;
}

const Onboarding = ({ onGetStarted }: OnboardingProps) => {
  const features = [
    {
      icon: Home,
      title: 'Housing Navigator',
      description: 'Find perfect rentals with reviews, amenities, and deposit calculators'
    },
    {
      icon: Users,
      title: 'Cultural Bridge',
      description: 'Connect with community groups, events, and discover local food spots'
    },
    {
      icon: MessageCircle,
      title: 'Communication Assistant',
      description: 'Essential phrases in Hindi with audio pronunciation guides'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      {/* Header */}
      <div className="pt-12 pb-4 px-6 text-center">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Welcome to <span className="bg-gradient-primary bg-clip-text text-transparent">NRI Connect</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
          Your companion for seamless living in India
        </p>
      </div>

      {/* Hero Illustration */}
      <div className="px-6 mb-4">
        <div className="rounded-2xl overflow-hidden shadow-card max-w-md mx-auto">
          <img
            src={welcomeIllustration}
            alt="People connecting in a vibrant Indian community"
            className="w-full h-auto object-cover"
          />
        </div>
      </div>

      {/* Features */}
      <div className="flex-1 px-6 pb-6">
        <div className="space-y-4 max-w-md mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="p-5 shadow-card border-0 bg-card/80 backdrop-blur-sm">
              <div className="flex items-start space-x-4">
                <div className="w-11 h-11 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-card-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Get Started Button */}
      <div className="p-6">
        <Button
          onClick={onGetStarted}
          size="lg"
          className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300 text-lg py-6 rounded-2xl border-0 hover:scale-105"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
