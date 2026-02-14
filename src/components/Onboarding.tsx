import React from 'react';
import { Button } from '@/components/ui/button';
import welcomeIllustration from '@/assets/welcome-illustration.png';

interface OnboardingProps {
  onGetStarted: () => void;
}

const Onboarding = ({ onGetStarted }: OnboardingProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="pt-12 pb-2 px-6 text-center">
        <h1 className="text-4xl font-bold text-foreground tracking-tight">
          Welcome to <span className="text-primary">NRI Connect</span>
        </h1>
      </div>

      {/* Main Content — text left, image right */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-10 px-6 md:px-16 max-w-6xl mx-auto w-full">
        {/* Left — About Us */}
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4 tracking-tight">About Us</h2>
          <p className="text-base text-muted-foreground leading-relaxed max-w-lg">
            NRI Connect is your trusted companion for building a seamless life in India. 
            We bring together essential tools — from discovering ideal housing and connecting 
            with vibrant local communities, to mastering everyday communication — all in one 
            elegant platform. Whether you're relocating, returning, or settling in for the 
            first time, NRI Connect empowers you with the resources, insights, and connections 
            you need to feel at home from day one.
          </p>
          <div className="mt-8">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-6 text-lg rounded-xl shadow-card transition-all duration-300 hover:shadow-floating"
            >
              Get Started
            </Button>
          </div>
        </div>

        {/* Right — Illustration */}
        <div className="flex-1 flex items-center justify-center">
          <img
            src={welcomeIllustration}
            alt="Global NRI community illustration"
            className="w-full max-w-md rounded-2xl shadow-card object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
