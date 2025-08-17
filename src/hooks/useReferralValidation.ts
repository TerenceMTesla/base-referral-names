import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface ReferralStats {
  totalReferrals: number;
  verifiedReferrals: number;
  pendingReferrals: number;
  pendingRewards: number;
  nextMilestone: number | null;
  referralsToNext: number;
}

export const useReferralValidation = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    verifiedReferrals: 0,
    pendingReferrals: 0,
    pendingRewards: 0,
    nextMilestone: 1,
    referralsToNext: 1
  });

  const validateReferralCode = useCallback(async (code: string): Promise<boolean> => {
    if (!code) return false;

    // Handle demo codes
    if (code.startsWith('DEMO') || code.startsWith('GAM') || code.startsWith('DEF') || code.startsWith('ART')) {
      return true;
    }

    // Standard validation for real codes
    if (code.length !== 8) return false;

    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('id, status, referrer_id')
        .eq('referral_code', code)
        .eq('status', 'pending')
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error validating referral code:', error);
      return false;
    }
  }, []);

  const fetchReferralStats = useCallback(async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      // Get all referrals made by this user
      const { data: referrals, error: referralsError } = await supabase
        .from('referrals')
        .select('id, status, reward_given')
        .eq('referrer_id', profile.id);

      if (referralsError) throw referralsError;

      const totalReferrals = referrals?.length || 0;
      const verifiedReferrals = referrals?.filter(r => r.status === 'verified').length || 0;
      const pendingReferrals = referrals?.filter(r => r.status === 'pending').length || 0;

      // Get pending rewards
      const { data: rewards, error: rewardsError } = await supabase
        .from('subnames')
        .select('id, metadata')
        .eq('user_id', profile.id)
        .contains('metadata', { status: 'pending' });

      if (rewardsError) throw rewardsError;

      const pendingRewards = rewards?.length || 0;

      // Calculate next milestone
      const milestones = [1, 5, 10, 20, 50];
      const nextMilestone = milestones.find(m => m > verifiedReferrals) || null;
      const referralsToNext = nextMilestone ? nextMilestone - verifiedReferrals : 0;

      setStats({
        totalReferrals,
        verifiedReferrals,
        pendingReferrals,
        pendingRewards,
        nextMilestone,
        referralsToNext
      });

    } catch (error: any) {
      console.error('Error fetching referral stats:', error);
      toast({
        title: "Error loading stats",
        description: "Failed to load your referral statistics.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [profile?.id, toast]);

  const claimReward = useCallback(async (subnameId: string, customPrefix?: string) => {
    if (!profile?.wallet_address) {
      toast({
        title: "Wallet required",
        description: "Please connect your wallet to claim rewards.",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      // Get the pending reward details
      const { data: subname, error: subnameError } = await supabase
        .from('subnames')
        .select('*')
        .eq('id', subnameId)
        .eq('user_id', profile.id)
        .single();

      if (subnameError) throw subnameError;

      const metadata = subname.metadata as any;
      if (metadata.status !== 'pending') {
        throw new Error('Reward is not available for claiming');
      }

      // Generate final subname
      const prefix = customPrefix || profile.display_name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user';
      const tier = metadata.tier;
      const finalSubname = `${prefix}.${tier}.ezverse.eth`;

      // Check if subname is available
      const { data: existing } = await supabase
        .from('subnames')
        .select('id')
        .eq('subname', finalSubname)
        .neq('id', subnameId)
        .maybeSingle();

      if (existing) {
        const uniqueSubname = `${prefix}-${Date.now()}.${tier}.ezverse.eth`;
        await updateSubnameRecord(subnameId, uniqueSubname);
      } else {
        await updateSubnameRecord(subnameId, finalSubname);
      }

      await fetchReferralStats(); // Refresh stats

      toast({
        title: "Reward claimed!",
        description: `Your ${tier} tier subname has been prepared for minting.`,
      });

      return true;
    } catch (error: any) {
      console.error('Error claiming reward:', error);
      toast({
        title: "Claim failed",
        description: error.message || "Failed to claim your reward.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [profile, toast, fetchReferralStats]);

  const updateSubnameRecord = async (subnameId: string, finalSubname: string) => {
    const { error } = await supabase
      .from('subnames')
      .update({
        subname: finalSubname,
        metadata: {
          ...stats,
          status: 'ready_to_mint',
          subname_finalized_at: new Date().toISOString()
        }
      })
      .eq('id', subnameId);

    if (error) throw error;
  };

  return {
    stats,
    loading,
    validateReferralCode,
    fetchReferralStats,
    claimReward
  };
};