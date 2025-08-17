import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardCache } from '@/hooks/useDashboardCache';
import { useToast } from '@/hooks/use-toast';

interface DashboardData {
  referrals: any[];
  subnames: any[];
  stats: {
    totalReferrals: number;
    verifiedReferrals: number;
    pendingReferrals: number;
    subnamesCount: number;
  };
}

export const useOptimizedDashboard = (isDemoMode = false) => {
  const { profile } = useAuth();
  const { get, set, invalidatePattern } = useDashboardCache();
  const { toast } = useToast();
  
  const [data, setData] = useState<DashboardData>({
    referrals: [],
    subnames: [],
    stats: {
      totalReferrals: 0,
      verifiedReferrals: 0,
      pendingReferrals: 0,
      subnamesCount: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Demo data for testing
  const getDemoData = useCallback((): DashboardData => ({
    referrals: [
      {
        id: 'demo-1',
        referral_code: 'DEMO123',
        referred_email: 'john.doe@example.com',
        status: 'verified' as const,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'demo-2',
        referral_code: 'DEMO456',
        referred_email: 'jane.smith@example.com',
        status: 'rewarded' as const,
        created_at: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: 'demo-3',
        referral_code: 'DEMO789',
        referred_email: null,
        status: 'pending' as const,
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    subnames: [
      {
        id: 'demo-sub-1',
        subname: 'rewards.eth',
        referral_count: 5,
        nft_token_id: 'token123',
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'demo-sub-2',
        subname: 'social.eth',
        referral_count: 3,
        nft_token_id: 'token456',
        created_at: new Date(Date.now() - 172800000).toISOString(),
      },
    ],
    stats: {
      totalReferrals: 3,
      verifiedReferrals: 1,
      pendingReferrals: 1,
      subnamesCount: 2
    }
  }), []);

  // Optimized single query for essential data
  const fetchEssentialData = useCallback(async () => {
    if (isDemoMode) {
      // Use demo data
      setLoading(true);
      setTimeout(() => {
        setData(getDemoData());
        setLoading(false);
        setError(null);
      }, 500); // Simulate loading
      return;
    }

    if (!profile?.id) return;

    const cacheKey = `essential-${profile.id}`;
    const cached = get<DashboardData>(cacheKey);
    
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Single optimized query combining referrals and stats
      const [referralsResult, subnamesResult] = await Promise.all([
        supabase
          .from('referrals')
          .select('id, referral_code, referred_email, status, created_at')
          .eq('referrer_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(10), // Only get recent referrals
        
        supabase
          .from('subnames')
          .select('id, subname, referral_count, nft_token_id, created_at')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
      ]);

      if (referralsResult.error) throw referralsResult.error;
      if (subnamesResult.error) throw subnamesResult.error;

      const referrals = referralsResult.data || [];
      const subnames = subnamesResult.data || [];

      // Calculate stats from fetched data
      const stats = {
        totalReferrals: referrals.length,
        verifiedReferrals: referrals.filter(r => r.status === 'verified').length,
        pendingReferrals: referrals.filter(r => r.status === 'pending').length,
        subnamesCount: subnames.length
      };

      const dashboardData = { referrals, subnames, stats };
      
      // Cache the data
      set(cacheKey, dashboardData, 'referrals');
      setData(dashboardData);

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [isDemoMode, profile?.id, get, set, getDemoData]);

  // Refresh function that invalidates cache
  const refresh = useCallback(() => {
    if (isDemoMode) {
      fetchEssentialData();
    } else if (profile?.id) {
      invalidatePattern(`essential-${profile.id}`);
      fetchEssentialData();
    }
  }, [isDemoMode, profile?.id, invalidatePattern, fetchEssentialData]);

  useEffect(() => {
    fetchEssentialData();
  }, [fetchEssentialData]);

  return {
    data,
    loading,
    error,
    refresh
  };
};