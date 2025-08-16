import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, TrendingUp, Target, Award } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardCache } from '@/hooks/useDashboardCache';
import { supabase } from '@/integrations/supabase/client';

interface QuickStats {
  userRank: number;
  totalUsers: number;
  conversionRate: number;
  nextMilestone: number;
  progress: number;
}

interface QuickAnalyticsProps {
  isDemoMode?: boolean;
}

export const QuickAnalytics = ({ isDemoMode = false }: QuickAnalyticsProps) => {
  const { profile } = useAuth();
  const { get, set } = useDashboardCache();
  const [stats, setStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemoMode) {
      // Load demo data immediately
      setStats({
        userRank: 23,
        totalUsers: 1000,
        conversionRate: 75.5,
        nextMilestone: 10,
        progress: 60
      });
      setLoading(false);
    } else {
      fetchQuickStats();
    }
  }, [profile?.id, isDemoMode]);

  const fetchQuickStats = async () => {
    if (!profile?.id || isDemoMode) return;

    const cacheKey = `quick-analytics-${profile.id}`;
    const cached = get<QuickStats>(cacheKey);
    
    if (cached) {
      setStats(cached);
      setLoading(false);
      return;
    }

    try {
      // Simplified analytics query
      const [userDataResult, userCountResult] = await Promise.all([
        supabase
          .from('referrals')
          .select('status')
          .eq('referrer_id', profile.id),
        
        supabase
          .from('profiles')
          .select('id', { count: 'exact' })
      ]);

      const referrals = userDataResult.data || [];
      const totalReferrals = referrals.length;
      const verifiedReferrals = referrals.filter(r => r.status === 'verified').length;
      const conversionRate = totalReferrals > 0 ? (verifiedReferrals / totalReferrals) * 100 : 0;

      // Simple rank estimation (simplified version)
      const userRank = Math.floor(Math.random() * 100) + 1; // Placeholder for demo
      const totalUsers = userCountResult.count || 0;

      // Next milestone calculation
      const milestones = [1, 5, 10, 20, 50];
      const nextMilestone = milestones.find(m => m > verifiedReferrals) || 100;
      const progress = (verifiedReferrals / nextMilestone) * 100;

      const quickStats = {
        userRank,
        totalUsers,
        conversionRate,
        nextMilestone,
        progress
      };

      set(cacheKey, quickStats, 'stats');
      setStats(quickStats);

    } catch (error) {
      console.error('Error fetching quick analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-16 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Performance Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Your Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Global Rank</span>
              <Badge variant="secondary">#{stats.userRank}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Conversion Rate</span>
              <span className="font-bold">{stats.conversionRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Top {Math.round((stats.userRank / stats.totalUsers) * 100)}% of users
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Next Milestone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Target</span>
              <Badge variant="outline">{stats.nextMilestone} referrals</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(stats.progress)}%</span>
              </div>
              <Progress value={stats.progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simple Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievement Levels
          </CardTitle>
          <CardDescription>
            Referral milestones and rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { level: 1, title: "Starter", reward: "Bronze NFT" },
              { level: 5, title: "Explorer", reward: "Silver NFT" },
              { level: 10, title: "Champion", reward: "Gold NFT" },
              { level: 20, title: "Master", reward: "Platinum NFT" },
              { level: 50, title: "Legend", reward: "Diamond NFT" }
            ].map((milestone) => (
              <div 
                key={milestone.level}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{milestone.title}</p>
                    <p className="text-xs text-muted-foreground">{milestone.reward}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {milestone.level}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};