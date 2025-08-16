import React, { useState, lazy, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Gift, Award, Copy, TrendingUp, RefreshCw } from 'lucide-react';
import { useOptimizedDashboard } from '@/hooks/useOptimizedDashboard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorDisplay } from '@/components/ui/error-boundary';
import { Button } from '@/components/ui/button';

// Lazy load heavy components
const LazyReferralSharePanel = lazy(() => import('@/components/ReferralSharePanel').then(m => ({ default: m.ReferralSharePanel })));
const LazySubnameMinting = lazy(() => import('@/components/SubnameMinting').then(m => ({ default: m.SubnameMinting })));
const LazyRewardsPanel = lazy(() => import('@/components/RewardsPanel').then(m => ({ default: m.RewardsPanel })));

// Lightweight analytics component
const QuickAnalytics = lazy(() => import('./QuickAnalytics').then(m => ({ default: m.QuickAnalytics })));

const TabLoadingSpinner = () => (
  <div className="flex items-center justify-center py-8">
    <LoadingSpinner message="Loading..." />
  </div>
);

export const SimplifiedDashboard = () => {
  const { data, loading, error, refresh } = useOptimizedDashboard();
  const [activeTab, setActiveTab] = useState('overview');

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
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Track your referrals and rewards</p>
        </div>
        <Button variant="outline" onClick={refresh} size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Quick Stats - Always visible */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalReferrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Verified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.stats.verifiedReferrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4" />
              NFTs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{data.stats.subnamesCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.stats.totalReferrals > 0 
                ? Math.round((data.stats.verifiedReferrals / data.stats.totalReferrals) * 100)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simplified Tabs with Lazy Loading */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="share">Share</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Recent Referrals - Lightweight */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              {data.referrals.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No referrals yet. Start sharing to earn rewards!
                </p>
              ) : (
                <div className="space-y-2">
                  {data.referrals.slice(0, 5).map((referral: any) => (
                    <div key={referral.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">{referral.referral_code}</p>
                        <p className="text-xs text-muted-foreground">
                          {referral.referred_email || 'Pending signup'}
                        </p>
                      </div>
                      <Badge 
                        variant={
                          referral.status === 'verified' ? 'default' : 'outline'
                        }
                        className="text-xs"
                      >
                        {referral.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* NFT Subnames - Lightweight */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your NFT Subnames</CardTitle>
            </CardHeader>
            <CardContent>
              {data.subnames.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No subnames earned yet. Refer friends to unlock NFT rewards!
                </p>
              ) : (
                <div className="space-y-2">
                  {data.subnames.map((subname: any) => (
                    <div key={subname.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">{subname.subname}</p>
                        <p className="text-xs text-muted-foreground">
                          {subname.referral_count} referrals
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {subname.nft_token_id ? 'Minted' : 'Ready'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="share">
          <Suspense fallback={<TabLoadingSpinner />}>
            <LazyReferralSharePanel />
          </Suspense>
        </TabsContent>

        <TabsContent value="rewards">
          <Suspense fallback={<TabLoadingSpinner />}>
            <LazyRewardsPanel />
          </Suspense>
        </TabsContent>

        <TabsContent value="analytics">
          <Suspense fallback={<TabLoadingSpinner />}>
            <QuickAnalytics />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
};