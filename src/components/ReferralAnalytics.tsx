import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Crown, Medal, Award, TrendingUp, Users, Zap, RefreshCw } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorDisplay } from '@/components/ui/error-boundary';

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  email: string;
  verified_referrals: number;
  total_referrals: number;
  subnames_earned: number;
  rank: number;
}

interface UserStats {
  totalReferrals: number;
  verifiedReferrals: number;
  conversionRate: number;
  subnamesEarned: number;
  currentRank: number;
  totalUsers: number;
}

export const ReferralAnalytics = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      fetchAnalyticsData();
    }
  }, [profile]);

  const fetchAnalyticsData = async () => {
    if (!profile) return;

    try {
      setLoading(true);
      setError(null);
      await Promise.all([
        fetchLeaderboard(),
        fetchUserStats()
      ]);
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      const errorMessage = error.message || 'Failed to load analytics data';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    // Get aggregated referral data
    const { data: leaderboardData, error } = await supabase
      .from('profiles')
      .select(`
        id,
        display_name,
        email,
        referrals_as_referrer:referrals!referrer_id(
          id,
          status,
          referred_id
        ),
        subnames(
          id
        )
      `)
      .order('display_name');

    if (error) throw error;

    // Process and rank the data
    const processedData: LeaderboardEntry[] = leaderboardData
      ?.map((user: any) => {
        const totalReferrals = user.referrals_as_referrer?.length || 0;
        const verifiedReferrals = user.referrals_as_referrer?.filter((r: any) => r.status === 'verified').length || 0;
        const subnamesEarned = user.subnames?.length || 0;

        return {
          user_id: user.id,
          display_name: user.display_name || 'Anonymous',
          email: user.email || '',
          total_referrals: totalReferrals,
          verified_referrals: verifiedReferrals,
          subnames_earned: subnamesEarned,
          rank: 0 // Will be set after sorting
        };
      })
      .sort((a, b) => {
        // Sort by verified referrals first, then by subnames earned
        if (b.verified_referrals !== a.verified_referrals) {
          return b.verified_referrals - a.verified_referrals;
        }
        return b.subnames_earned - a.subnames_earned;
      })
      .map((user, index) => ({
        ...user,
        rank: index + 1
      }))
      .slice(0, 10) || []; // Top 10

    setLeaderboard(processedData);
  };

  const fetchUserStats = async () => {
    if (!profile) return;

    // Get user's referral data
    const { data: userReferrals, error: referralsError } = await supabase
      .from('referrals')
      .select('id, status')
      .eq('referrer_id', profile.id);

    if (referralsError) throw referralsError;

    // Get user's subnames
    const { data: userSubnames, error: subnamesError } = await supabase
      .from('subnames')
      .select('id')
      .eq('user_id', profile.id);

    if (subnamesError) throw subnamesError;

    // Get total users count for rank calculation
    const { count: totalUsers, error: countError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' });

    if (countError) throw countError;

    const totalReferrals = userReferrals?.length || 0;
    const verifiedReferrals = userReferrals?.filter(r => r.status === 'verified').length || 0;
    const conversionRate = totalReferrals > 0 ? (verifiedReferrals / totalReferrals) * 100 : 0;
    const subnamesEarned = userSubnames?.length || 0;

    // Find user's rank in leaderboard
    const userRank = leaderboard.find(entry => entry.user_id === profile.id)?.rank || 0;

    setUserStats({
      totalReferrals,
      verifiedReferrals,
      conversionRate,
      subnamesEarned,
      currentRank: userRank,
      totalUsers: totalUsers || 0
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Analytics data has been updated.",
    });
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <Trophy className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRankBadgeVariant = (rank: number) => {
    switch (rank) {
      case 1:
        return "default";
      case 2:
      case 3:
        return "secondary";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <LoadingSpinner size="lg" message="Loading analytics data..." />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={fetchAnalyticsData}
        title="Failed to load analytics"
        description="There was an issue loading your referral analytics."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics & Leaderboard</h2>
          <p className="text-muted-foreground">
            Track your performance and see how you rank against other users
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* User Stats Overview */}
      {userStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Rank</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold">
                  {userStats.currentRank > 0 ? `#${userStats.currentRank}` : 'Unranked'}
                </div>
                {userStats.currentRank > 0 && getRankIcon(userStats.currentRank)}
              </div>
              <p className="text-xs text-muted-foreground">
                Out of {userStats.totalUsers} users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {userStats.verifiedReferrals} of {userStats.totalReferrals} referrals verified
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">NFTs Earned</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.subnamesEarned}</div>
              <p className="text-xs text-muted-foreground">
                Subname NFTs collected
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.totalReferrals}</div>
              <p className="text-xs text-muted-foreground">
                Friends invited
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Top Referrers
          </CardTitle>
          <CardDescription>
            The most successful community members this period
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div 
                  key={entry.user_id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:bg-muted/50 ${
                    entry.user_id === profile?.id ? 'bg-primary/5 border-primary/20' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getRankIcon(entry.rank)}
                      <Badge variant={getRankBadgeVariant(entry.rank)}>
                        #{entry.rank}
                      </Badge>
                    </div>
                    
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {entry.display_name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{entry.display_name}</span>
                        {entry.user_id === profile?.id && (
                          <Badge variant="outline" className="text-xs">You</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {entry.email.split('@')[0]}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-primary">{entry.verified_referrals}</div>
                        <div className="text-xs text-muted-foreground">Verified</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold">{entry.total_referrals}</div>
                        <div className="text-xs text-muted-foreground">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-orange-500">{entry.subnames_earned}</div>
                        <div className="text-xs text-muted-foreground">NFTs</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Rankings Yet</h3>
              <p className="text-muted-foreground">
                Be the first to start referring and claim the top spot!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievement Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Achievement Milestones</CardTitle>
          <CardDescription>
            Unlock special recognition at these referral levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { milestone: 1, title: "First Steps", description: "Your first verified referral", tier: "Starter" },
              { milestone: 5, title: "Rising Star", description: "Building momentum", tier: "Bronze" },
              { milestone: 10, title: "Community Builder", description: "Making an impact", tier: "Silver" },
              { milestone: 20, title: "Influencer", description: "Leading by example", tier: "Gold" },
              { milestone: 50, title: "Legend", description: "Ultimate achievement", tier: "Diamond" },
              { milestone: 100, title: "Hall of Fame", description: "Reserved for the elite", tier: "Legendary" }
            ].map((achievement) => {
              const isAchieved = (userStats?.verifiedReferrals || 0) >= achievement.milestone;
              
              return (
                <div 
                  key={achievement.milestone}
                  className={`p-4 border rounded-lg ${
                    isAchieved ? 'bg-primary/5 border-primary/20' : 'bg-muted/20 border-muted'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{achievement.title}</h4>
                    <Badge 
                      variant={isAchieved ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {achievement.milestone} refs
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {achievement.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {achievement.tier}
                    </Badge>
                    {isAchieved && (
                      <div className="flex items-center text-primary">
                        <Award className="h-4 w-4 mr-1" />
                        <span className="text-xs font-medium">Achieved</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};