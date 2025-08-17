import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useENSDetection } from '@/hooks/useENSDetection';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReferralStats {
  totalReferrals: number;
  verifiedReferrals: number;
  pendingReferrals: number;
  totalRewards: number;
  nextMilestone: number;
  progressToNext: number;
}

interface RewardSubname {
  id: string;
  subname: string;
  referral_count: number;
  created_at: string;
  metadata?: any;
}

export const ReferralAnalytics = () => {
  const { profile, isAuthenticated } = useAuth();
  const { ensDomain, hasENSDomain } = useENSDetection();
  const { toast } = useToast();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [rewards, setRewards] = useState<RewardSubname[]>([]);
  const [loading, setLoading] = useState(false);

  const milestones = [1, 5, 10, 20, 50];

  useEffect(() => {
    if (isAuthenticated && profile) {
      fetchReferralStats();
      fetchRewards();
    }
  }, [isAuthenticated, profile]);

  const fetchReferralStats = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      const { data: referrals, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', profile.id);

      if (error) throw error;

      const verifiedCount = referrals?.filter(r => r.status === 'verified').length || 0;
      const pendingCount = referrals?.filter(r => r.status === 'pending').length || 0;
      const totalCount = referrals?.length || 0;

      // Find next milestone
      const nextMilestone = milestones.find(m => m > verifiedCount) || 100;
      const previousMilestone = milestones.filter(m => m <= verifiedCount).pop() || 0;
      const progressToNext = ((verifiedCount - previousMilestone) / (nextMilestone - previousMilestone)) * 100;

      setStats({
        totalReferrals: totalCount,
        verifiedReferrals: verifiedCount,
        pendingReferrals: pendingCount,
        totalRewards: Math.floor(verifiedCount / 5), // Simplified reward calculation
        nextMilestone,
        progressToNext: Math.min(progressToNext, 100)
      });
    } catch (error: any) {
      console.error('Error fetching referral stats:', error);
      toast({
        title: "Error",
        description: "Failed to load referral statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRewards = async () => {
    if (!profile) return;

    try {
      const { data: subnames, error } = await supabase
        .from('subnames')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRewards(subnames || []);
    } catch (error) {
      console.error('Error fetching rewards:', error);
    }
  };

  const getMilestoneReward = (milestone: number) => {
    const rewards = {
      1: { tier: 'Bronze', rarity: 'Common' },
      5: { tier: 'Silver', rarity: 'Uncommon' },
      10: { tier: 'Gold', rarity: 'Rare' },
      20: { tier: 'Platinum', rarity: 'Epic' },
      50: { tier: 'Diamond', rarity: 'Legendary' }
    };
    return rewards[milestone as keyof typeof rewards] || { tier: 'Unknown', rarity: 'Unknown' };
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Referral Analytics</CardTitle>
          <CardDescription>Connect your wallet to view referral statistics</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Referral Analytics</CardTitle>
          <CardDescription>Loading your referral data...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* ENS Domain Status */}
      {hasENSDomain && ensDomain && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ENS Domain Connected
              <Badge variant="secondary">Live</Badge>
            </CardTitle>
            <CardDescription>
              Points are being tracked for {ensDomain.name}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{stats.verifiedReferrals}</CardTitle>
              <CardDescription>Verified Referrals</CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{stats.pendingReferrals}</CardTitle>
              <CardDescription>Pending Referrals</CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{rewards.length}</CardTitle>
              <CardDescription>Total Rewards</CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{stats.nextMilestone}</CardTitle>
              <CardDescription>Next Milestone</CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Progress to Next Milestone */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Progress to Next Milestone</CardTitle>
            <CardDescription>
              {stats.verifiedReferrals} / {stats.nextMilestone} referrals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={stats.progressToNext} className="w-full" />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>{stats.verifiedReferrals} verified</span>
              <span>{stats.nextMilestone - stats.verifiedReferrals} remaining</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Milestone Rewards */}
      <Card>
        <CardHeader>
          <CardTitle>Milestone Rewards</CardTitle>
          <CardDescription>Unlock exclusive subnames at each milestone</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {milestones.map((milestone) => {
              const reward = getMilestoneReward(milestone);
              const isEarned = (stats?.verifiedReferrals || 0) >= milestone;
              const isNext = milestone === stats?.nextMilestone;
              
              return (
                <div
                  key={milestone}
                  className={`p-4 rounded-lg border ${
                    isEarned 
                      ? 'border-green-500 bg-green-50 dark:bg-green-950' 
                      : isNext 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-gray-200 bg-gray-50 dark:bg-gray-900'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold">{milestone}</div>
                    <div className="text-sm text-muted-foreground">Referrals</div>
                    <Badge variant={isEarned ? "default" : "outline"} className="mt-2">
                      {reward.tier}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {reward.rarity}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Earned Rewards */}
      {rewards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Earned Rewards</CardTitle>
            <CardDescription>Your collection of referral reward subnames</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rewards.map((reward) => {
                const milestone = reward.referral_count;
                const rewardInfo = getMilestoneReward(milestone);
                
                return (
                  <div
                    key={reward.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <div className="font-medium">{reward.subname}</div>
                      <div className="text-sm text-muted-foreground">
                        Earned at {milestone} referrals
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{rewardInfo.tier}</Badge>
                      <Badge variant="outline">{rewardInfo.rarity}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Button */}
      <Card>
        <CardHeader>
          <CardTitle>Share Your Referral Link</CardTitle>
          <CardDescription>
            Start earning points towards your {hasENSDomain ? ensDomain?.name : 'ENS domain'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => window.location.hash = '#referral'}
            className="w-full"
          >
            Generate Referral Link
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};