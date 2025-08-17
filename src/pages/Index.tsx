import { useState, useEffect } from 'react';
import { DynamicAuth } from '@/components/DynamicAuth';
import { Dashboard } from '@/components/Dashboard';
import { DemoModeToggle } from '@/components/DemoModeToggle';
import { ENSLogo } from '@/components/ENSLogo';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { isAuthenticated, loading } = useAuth();
  const [isDemoMode, setIsDemoMode] = useState(isAuthenticated);

  useEffect(() => {
    if(loading) return;
    setIsDemoMode(true);
  },[loading])

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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10">
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with ENS Logo */}
          <header className="text-center mb-8 md:mb-12 animate-fade-in">
            <div className="flex items-center justify-center gap-2 md:gap-4 mb-4 md:mb-6">
              <ENSLogo className="w-12 h-12 md:w-16 md:h-16" />
              <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight">
                EZ ENS Referrals
              </h1>
            </div>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
              Earn exclusive ENS subname NFTs and custom rewards by referring friends to the Ethereum Name Service ecosystem
            </p>
          </header>

          {/* Connect Account Section - Moved here */}
          <div className="text-center mb-8 md:mb-12 space-y-4 md:space-y-6 animate-scale-in px-4">
            {/* Demo Mode Toggle */}
            <div className="max-w-md mx-auto mb-4 md:mb-6">
              <DemoModeToggle 
                isDemoMode={isDemoMode} 
                onToggle={setIsDemoMode} 
              />
            </div>
            
            <div className="max-w-md mx-auto">
              <DynamicAuth />
            </div>
          </div>

          {/* Hero Section */}
          <div className="text-center mb-8 md:mb-12 space-y-6 md:space-y-8 animate-slide-up stagger-1">
            <div className="space-y-3 md:space-y-4 px-4">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
                Join the future of decentralized identity
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                Share the power of Web3 naming with your network and get rewarded with unique digital assets
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mt-8 md:mt-12 animate-scale-in stagger-2 px-4">
              <div className="card-hover p-4 md:p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur border border-primary/20">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-3 md:mb-4 mx-auto">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="font-semibold text-base md:text-lg mb-2 text-primary">Free to join</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  Get valuable ENS subnames minted as NFTs for successful referrals
                </p>
              </div>

              <div className="card-hover p-4 md:p-6 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 backdrop-blur border border-accent/20">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-3 md:mb-4 mx-auto">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-base md:text-lg mb-2 text-accent">No fees</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  Share your unique referral links and grow the ENS ecosystem
                </p>
              </div>

              <div className="card-hover p-4 md:p-6 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 backdrop-blur border border-secondary/20">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-secondary/20 rounded-lg flex items-center justify-center mb-3 md:mb-4 mx-auto">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-base md:text-lg mb-2 text-secondary">Instant rewards</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  Monitor your referrals and achievements with real-time analytics
                </p>
              </div>
            </div>

            {/* Benefits Section */}
            <div className="mt-8 md:mt-12 space-y-4 md:space-y-6 animate-scale-in px-4">
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs md:text-sm text-muted-foreground px-4">
                <span className="flex items-center">
                  <svg className="w-3 h-3 md:w-4 md:h-4 mr-1 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Free to join
                </span>
                <span className="flex items-center">
                  <svg className="w-3 h-3 md:w-4 md:h-4 mr-1 text-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  No fees
                </span>
                <span className="flex items-center">
                  <svg className="w-3 h-3 md:w-4 md:h-4 mr-1 text-secondary" fill="currentColor" viewBox="0 0 20 20">
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