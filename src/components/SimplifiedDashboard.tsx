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
          description="There was an issue loading your dashboard."
          onRetry={refresh}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Tabs with new flow */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="border-b border-border bg-card/50 p-4 rounded-t-lg">
          <TabsList className="grid w-full grid-cols-6 h-auto p-1 bg-muted/50">
            <TabsTrigger value="share" className="flex items-center gap-2 py-3">
              <Share className="h-4 w-4" />
              Share
            </TabsTrigger>
            <TabsTrigger value="earn" className="flex items-center gap-2 py-3">
              <Coins className="h-4 w-4" />
              Earn
            </TabsTrigger>
            <TabsTrigger value="mint" className="flex items-center gap-2 py-3">
              <Image className="h-4 w-4" />
              Mint NFTs
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 py-3">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="referrals" className="flex items-center gap-2 py-3">
              <Users className="h-4 w-4" />
              My Referrals
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center gap-2 py-3">
              <Award className="h-4 w-4" />
              Rewards
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ENS Referrals Program Branding */}
        <div className="relative overflow-hidden card-primary rounded-lg p-8 text-center animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-50"></div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-center gap-4">
              <ENSLogo size="lg" className="animate-pulse-slow" />
              <div className="text-left">
                <h1 className="text-4xl font-bold text-primary-foreground mb-2">
                  The ENS Referrals Program
                </h1>
                <p className="text-primary-foreground/90 text-lg max-w-2xl">
                  Share your unique referral link, earn rewards, and mint exclusive NFT subnames. 
                  Join the decentralized naming revolution and get rewarded for growing the ENS ecosystem.
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={refresh} size="sm" className="bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/30">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Quick Stats - Always visible with ENS branding */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up">
          <Card className="card-hover border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-primary">
                <Users className="h-4 w-4" />
                Total Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{data.stats.totalReferrals}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="card-hover border-accent/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-accent">
                <Gift className="h-4 w-4" />
                Verified
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{data.stats.verifiedReferrals}</div>
              <p className="text-xs text-muted-foreground mt-1">Active users</p>
            </CardContent>
          </Card>

          <Card className="card-hover border-secondary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-secondary">
                <Award className="h-4 w-4" />
                NFT Subnames
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{data.stats.subnamesCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Collectibles earned</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary">Success Rate</CardTitle>
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

        <TabsContent value="share" className="animate-fade-in">
          <Card className="card-primary">
            <CardHeader>
              <CardTitle className="text-xl text-primary-foreground flex items-center gap-2">
                <Share className="h-5 w-5" />
                Share Your Referral Link
              </CardTitle>
              <CardDescription className="text-primary-foreground/80">
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
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-primary">
                <Coins className="h-5 w-5" />
                How to Earn Rewards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-medium text-primary">Share Your Link</h4>
                    <p className="text-sm text-muted-foreground">Copy and share your unique referral link with friends</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-accent/5 rounded-lg border border-accent/20">
                  <div className="bg-accent text-accent-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-medium text-accent">Friends Join ENS</h4>
                    <p className="text-sm text-muted-foreground">When they sign up using your link, you both benefit</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-secondary/5 rounded-lg border border-secondary/20">
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
          <Suspense fallback={<TabLoadingSpinner />}>
            <LazySubnameMinting isDemoMode={isDemoMode} />
          </Suspense>
        </TabsContent>

        <TabsContent value="analytics" className="animate-fade-in">
          <QuickAnalytics isDemoMode={isDemoMode} />
        </TabsContent>

        <TabsContent value="referrals" className="space-y-4 animate-fade-in">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-primary">
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
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{referral.referral_code}</p>
                          <p className="text-xs text-muted-foreground">
                            {referral.referred_email || 'Pending signup'}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant={referral.status === 'verified' ? 'default' : 'outline'}
                        className={`text-xs ${
                          referral.status === 'verified' 
                            ? 'bg-accent text-accent-foreground' 
                            : 'border-warning text-warning'
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
          <Suspense fallback={<TabLoadingSpinner />}>
            <LazyRewardsPanel isDemoMode={isDemoMode} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
};