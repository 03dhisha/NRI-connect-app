import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Home, Users, MessageCircle } from 'lucide-react';

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
      <div className="pt-16 pb-8 px-6 text-center">
        <div className="w-20 h-20 bg-gradient-primary rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-glow">
          <Home className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Welcome to <span className="bg-gradient-primary bg-clip-text text-transparent">NRI Connect</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-md mx-auto leading-relaxed">
          Your companion for seamless living in India. Housing, community, and communication - all in one place.
        </p>
      </div>

      {/* Features */}
      <div className="flex-1 px-6 pb-8">
        <div className="space-y-6 max-w-md mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 shadow-card border-0 bg-card/80 backdrop-blur-sm">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
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