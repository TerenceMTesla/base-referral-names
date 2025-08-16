import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RealTimeUpdateOptions {
  onReferralUpdate?: (referral: any) => void;
  onLeaderboardUpdate?: (leaderboard: any[]) => void;
  enabled?: boolean;
}

export const useRealTimeUpdates = ({
  onReferralUpdate,
  onLeaderboardUpdate,
  enabled = true,
}: RealTimeUpdateOptions) => {
  const { toast } = useToast();

  const handleReferralUpdate = useCallback((payload: any) => {
    if (payload.eventType === 'UPDATE' && payload.new?.status === 'verified') {
      toast({
        title: "🎉 Referral Verified!",
        description: "Someone just verified using your referral code!",
      });
    }
    onReferralUpdate?.(payload);
  }, [onReferralUpdate, toast]);

  const handleLeaderboardUpdate = useCallback((payload: any) => {
    // Simulate leaderboard changes for demo
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      // Fetch updated leaderboard data
      onLeaderboardUpdate?.([]);
    }
  }, [onLeaderboardUpdate]);

  useEffect(() => {
    if (!enabled) return;

    // Listen to referrals table changes
    const referralsChannel = supabase
      .channel('referrals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'referrals'
        },
        handleReferralUpdate
      )
      .subscribe();

    // Listen to profiles table changes for leaderboard updates
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        handleLeaderboardUpdate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(referralsChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, [enabled, handleReferralUpdate, handleLeaderboardUpdate]);

  return {
    // Utility methods for triggering updates in demo mode
    simulateReferralUpdate: () => {
      handleReferralUpdate({
        eventType: 'UPDATE',
        new: { status: 'verified' }
      });
    }
  };
};