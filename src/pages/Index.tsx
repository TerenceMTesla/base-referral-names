import { useState } from 'react';
import { DynamicAuth } from '@/components/DynamicAuth';
import { Dashboard } from '@/components/Dashboard';
import { DemoModeToggle } from '@/components/DemoModeToggle';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { isAuthenticated, loading } = useAuth();
  const [isDemoMode, setIsDemoMode] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading application...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated || isDemoMode) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {isDemoMode && (
            <DemoModeToggle 
              isDemoMode={isDemoMode} 
              onToggle={setIsDemoMode} 
            />
          )}
          <Dashboard isDemoMode={isDemoMode} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-10 animate-pulse"></div>
        <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-16">
          <div className="text-center space-y-8">
            {/* Main Headline */}
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-bold gradient-text leading-tight">
                Earn Exclusive ENS Subnames
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                Join the future of decentralized identity. Refer friends and unlock 
                <span className="text-primary font-semibold"> premium ENS subnames as NFT rewards</span>
              </p>
            </div>

            {/* Value Propositions */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16 animate-slide-up">
              <div className="card-hover p-6 rounded-xl bg-card/50 backdrop-blur border">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Earn Real NFT Rewards</h3>
                <p className="text-sm text-muted-foreground">
                  Get valuable ENS subnames minted as NFTs for successful referrals
                </p>
              </div>

              <div className="card-hover p-6 rounded-xl bg-card/50 backdrop-blur border">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Build Your Network</h3>
                <p className="text-sm text-muted-foreground">
                  Share your unique referral links and grow the ENS ecosystem
                </p>
              </div>

              <div className="card-hover p-6 rounded-xl bg-card/50 backdrop-blur border">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Track Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor your referrals and achievements with real-time analytics
                </p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="mt-16 space-y-6 animate-scale-in">
              {/* Demo Mode Toggle */}
              <div className="max-w-md mx-auto mb-6">
                <DemoModeToggle 
                  isDemoMode={isDemoMode} 
                  onToggle={setIsDemoMode} 
                />
              </div>
              
              <div className="max-w-md mx-auto">
                <DynamicAuth />
              </div>
              <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Free to join
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  No fees
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Instant rewards
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
