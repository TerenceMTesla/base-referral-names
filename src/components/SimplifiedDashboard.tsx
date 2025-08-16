import React, { useState, lazy, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Gift, Award, Copy, TrendingUp, RefreshCw, Share, Coins, Image } from 'lucide-react';
import { useOptimizedDashboard } from '@/hooks/useOptimizedDashboard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorDisplay } from '@/components/ui/error-boundary';
import { Button } from '@/components/ui/button';
import { ENSLogo } from '@/components/ENSLogo';

// Lazy load heavy components
const LazyReferralSharePanel = lazy(() => import('@/components/ReferralSharePanel').then(m => ({ default: m.ReferralSharePanel })));
const LazySubnameMinting = lazy(() => import('@/components/SubnameMinting').then(m => ({ default: m.SubnameMinting })));
const LazyRewardsPanel = lazy(() => import('@/components/RewardsPanel').then(m => ({ default: m.RewardsPanel })));

// Import QuickAnalytics directly instead of lazy loading to avoid import errors
import { QuickAnalytics } from './QuickAnalytics';

const TabLoadingSpinner = () => (
  <div className="flex items-center justify-center py-8">
    <LoadingSpinner message="Loading..." />
  </div>
);

interface SimplifiedDashboardProps {
  isDemoMode?: boolean;
}

export const SimplifiedDashboard = ({ isDemoMode = false }: SimplifiedDashboardProps) => {
  const { data, loading, error, refresh } = useOptimizedDashboard(isDemoMode);
  const [activeTab, setActiveTab] = useState('share');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" message="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <ErrorDisplay 
          error={error}
          title="Dashboard Loading Error"
          description="There was an issue loading your dashboard data."
          onRetry={refresh}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-6 space-y-6">
        
        {/* Sticky Navigation Tabs - Always Visible */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6 bg-muted/50 p-1 rounded-xl">
                <TabsTrigger value="share" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
                  <Share className="h-4 w-4" />
                  <span className="hidden sm:inline">Share</span>
                </TabsTrigger>
                <TabsTrigger value="earn" className="flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-lg">
                  <Coins className="h-4 w-4" />
                  <span className="hidden sm:inline">Earn</span>
                </TabsTrigger>
                <TabsTrigger value="mint" className="flex items-center gap-2 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground rounded-lg">
                  <Award className="h-4 w-4" />
                  <span className="hidden sm:inline">Mint NFTs</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="referrals" className="flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-lg">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Referrals</span>
                </TabsTrigger>
                <TabsTrigger value="rewards" className="flex items-center gap-2 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground rounded-lg">
                  <Gift className="h-4 w-4" />
                  <span className="hidden sm:inline">Rewards</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* ENS Referrals Program Header - Compact Version */}
        <div className="text-center space-y-4 py-6">
          <div className="flex items-center justify-center gap-4">
            <ENSLogo className="h-12 w-12" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ENS Referrals Program
              </h1>
              <p className="text-muted-foreground mt-1">
                Share the future of decentralized naming and earn exclusive rewards
              </p>
            </div>
          </div>
        </div>

        {/* Stats Dashboard - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="card-hover border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gradient">
                {data.stats.totalReferrals}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Friends invited</p>
            </CardContent>
          </Card>

          <Card className="card-hover border-accent/20 bg-gradient-to-br from-accent/10 to-accent/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-accent flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Verified Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gradient">
                {data.stats.verifiedReferrals}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Successful joins</p>
            </CardContent>
          </Card>

          <Card className="card-hover border-secondary/20 bg-gradient-to-br from-secondary/10 to-secondary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-secondary flex items-center gap-2">
                <Award className="h-4 w-4" />
                NFT Subnames
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gradient">
                {data.stats.subnamesCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Subnames earned</p>
            </CardContent>
          </Card>

          <Card className="card-hover border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gradient">
                {data.stats.totalReferrals > 0 
                  ? Math.round((data.stats.verifiedReferrals / data.stats.totalReferrals) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Conversion rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Tab Content - No need to scroll past header */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="share" className="animate-fade-in">
            <Card className="card-primary border-primary/30 bg-gradient-to-br from-primary/20 to-primary/10">
              <CardHeader>
                <CardTitle className="text-xl text-primary flex items-center gap-2">
                  <Share className="h-5 w-5" />
                  Share Your Referral Link
                </CardTitle>
                <CardDescription className="text-primary/80">
                  Spread the word about ENS and earn rewards for every successful referral
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Suspense fallback={<TabLoadingSpinner />}>
                  <LazyReferralSharePanel isDemoMode={isDemoMode} />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earn" className="space-y-4 animate-fade-in">
            <Card className="card-hover border-accent/30 bg-gradient-to-br from-accent/20 to-accent/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-accent">
                  <Coins className="h-5 w-5" />
                  How to Earn Rewards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-start gap-3 p-4 bg-primary/10 rounded-lg border border-primary/30">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <h4 className="font-medium text-primary">Share Your Link</h4>
                      <p className="text-sm text-muted-foreground">Copy and share your unique referral link with friends</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-accent/10 rounded-lg border border-accent/30">
                    <div className="bg-accent text-accent-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <h4 className="font-medium text-accent">Friends Join ENS</h4>
                      <p className="text-sm text-muted-foreground">When they sign up using your link, you both benefit</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-secondary/10 rounded-lg border border-secondary/30">
                    <div className="bg-secondary text-secondary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <h4 className="font-medium text-secondary">Earn NFT Rewards</h4>
                      <p className="text-sm text-muted-foreground">Unlock exclusive subname NFTs based on referral milestones</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mint" className="animate-fade-in">
            <div className="bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-xl p-6 border border-secondary/30">
              <Suspense fallback={<TabLoadingSpinner />}>
                <LazySubnameMinting isDemoMode={isDemoMode} />
              </Suspense>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="animate-fade-in">
            <div className="bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl p-6 border border-primary/30">
              <QuickAnalytics isDemoMode={isDemoMode} />
            </div>
          </TabsContent>

          <TabsContent value="referrals" className="space-y-4 animate-fade-in">
            <Card className="card-hover border-accent/30 bg-gradient-to-br from-accent/20 to-accent/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-accent">
                  <Users className="h-5 w-5" />
                  Recent Referrals
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.referrals.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No referrals yet. Start sharing to earn rewards!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.referrals.slice(0, 10).map((referral: any, index: number) => (
                      <div key={referral.id} className={`flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors animate-fade-in stagger-${Math.min(index + 1, 4)}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 text-accent" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{referral.referral_code}</p>
                            <p className="text-xs text-muted-foreground">
                              {referral.referred_email || 'Pending signup'}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          className={`${
                            referral.status === 'verified' 
                              ? 'border-success text-success bg-success/10' 
                              : referral.status === 'pending'
                              ? 'border-warning text-warning bg-warning/10'
                              : 'border-secondary text-secondary bg-secondary/10'
                          }`}
                        >
                          {referral.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards" className="animate-fade-in">
            <div className="bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-xl p-6 border border-secondary/30">
              <Suspense fallback={<TabLoadingSpinner />}>
                <LazyRewardsPanel isDemoMode={isDemoMode} />
              </Suspense>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};