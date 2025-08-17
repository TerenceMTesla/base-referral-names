import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useReferralTracking } from '@/hooks/useReferralTracking';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const ReferralProcessor = () => {
  const { isAuthenticated, profile } = useAuth();
  const { referralCode } = useReferralTracking();
  const { toast } = useToast();

  useEffect(() => {
    const processStoredReferral = async () => {
      if (!isAuthenticated || !profile) return;

      const storedReferralCode = localStorage.getItem('referralCode');
      if (!storedReferralCode) return;

      try {
        // Check if this referral has already been processed
        const { data: existingReferral } = await supabase
          .from('referrals')
          .select('id, status')
          .eq('referred_id', profile.id)
          .eq('status', 'verified')
          .maybeSingle();

        if (existingReferral) {
          localStorage.removeItem('referralCode');
          return;
        }

        // Find the referral record and validate it
        const { data: referralData, error: referralError } = await supabase
          .from('referrals')
          .select(`
            *,
            referrer:profiles!referrer_id(*)
          `)
          .eq('referral_code', storedReferralCode)
          .eq('status', 'pending')
          .maybeSingle();

        if (referralError) throw referralError;

        if (!referralData) {
          // Check if it's a demo code
          if (storedReferralCode.startsWith('DEMO') || storedReferralCode.startsWith('GAM') || 
              storedReferralCode.startsWith('DEF') || storedReferralCode.startsWith('ART')) {
            // Process demo referral
            const community = localStorage.getItem('referralCommunity');
            toast({
              title: "Demo referral processed!",
              description: community 
                ? `Welcome to the ${community} demo community!`
                : "Demo referral completed successfully!",
            });
            localStorage.removeItem('referralCode');
            localStorage.removeItem('referralCommunity');
            return;
          }
          
          toast({
            title: "Invalid referral code",
            description: "The referral code you used is no longer valid.",
            variant: "destructive",
          });
          localStorage.removeItem('referralCode');
          return;
        }

        // Prevent self-referral
        if (referralData.referrer_id === profile.id) {
          toast({
            title: "Self-referral not allowed",
            description: "You cannot refer yourself.",
            variant: "destructive",
          });
          localStorage.removeItem('referralCode');
          return;
        }

        // Update the referral record
        const { error: updateError } = await supabase
          .from('referrals')
          .update({
            referred_id: profile.id,
            referred_email: profile.email,
            status: 'verified'
          })
          .eq('id', referralData.id);

        if (updateError) throw updateError;

        // Check and process rewards
        await checkReferrerRewards(referralData.referrer_id);

        localStorage.removeItem('referralCode');

        toast({
          title: "Referral success!",
          description: `You've been successfully referred by ${referralData.referrer.display_name}`,
        });

      } catch (error: any) {
        console.error('Error processing referral:', error);
        toast({
          title: "Referral processing failed",
          description: "There was an issue with your referral, but your account is ready to use.",
          variant: "destructive",
        });
        localStorage.removeItem('referralCode');
      }
    };

    processStoredReferral();
  }, [isAuthenticated, profile, toast]);

  const checkReferrerRewards = async (referrerId: string) => {
    try {
      // Count verified referrals
      const { data: referralCount, error: countError } = await supabase
        .from('referrals')
        .select('id')
        .eq('referrer_id', referrerId)
        .eq('status', 'verified');

      if (countError) throw countError;

      const count = referralCount?.length || 0;
      const rewardMilestones = [1, 5, 10, 20, 50];

      if (rewardMilestones.includes(count)) {
        await createPendingReward(referrerId, count);
      }
    } catch (error) {
      console.error('Error checking referrer rewards:', error);
    }
  };

  const createPendingReward = async (userId: string, milestone: number) => {
    try {
      const tierMap: Record<number, string> = {
        1: 'starter',
        5: 'bronze', 
        10: 'silver',
        20: 'gold',
        50: 'diamond'
      };

      const rarityMap: Record<number, string> = {
        1: 'common',
        5: 'uncommon',
        10: 'rare', 
        20: 'epic',
        50: 'legendary'
      };

      // Check if reward already exists for this milestone
      const { data: existingReward } = await supabase
        .from('subnames')
        .select('id')
        .eq('user_id', userId)
        .eq('referral_count', milestone)
        .maybeSingle();

      if (existingReward) return;

      // Create a pending subname record
      const { error } = await supabase
        .from('subnames')
        .insert({
          user_id: userId,
          subname: `pending-${tierMap[milestone]}-${Date.now()}`,
          referral_count: milestone,
          metadata: {
            milestone,
            tier: tierMap[milestone],
            rarity: rarityMap[milestone],
            status: 'pending',
            earned_at: new Date().toISOString(),
            type: 'referral_reward'
          }
        });

      if (error) throw error;

      // Send notification to referrer
      await notifyReferrer(userId, milestone, tierMap[milestone]);

    } catch (error) {
      console.error('Error creating pending reward:', error);
    }
  };

  const notifyReferrer = async (userId: string, milestone: number, tier: string) => {
    // This could be expanded to send email notifications, etc.
    console.log(`User ${userId} earned ${tier} tier reward for ${milestone} referrals`);
  };

  // This component doesn't render anything visible
  return null;
};