import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useReferralTracking = () => {
  const [searchParams] = useSearchParams();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const ref = searchParams.get('ref');
    const community = searchParams.get('community');
    
    if (ref) {
      setReferralCode(ref);
      // Store both referral code and community info
      localStorage.setItem('referralCode', ref);
      if (community) {
        localStorage.setItem('referralCommunity', community);
      }
      
      // Handle demo referrals
      if (ref.startsWith('DEMO') || ref.startsWith('GAM') || ref.startsWith('DEF') || ref.startsWith('ART')) {
        const communityText = community ? ` to the ${community} community` : '';
        toast({
          title: "Demo referral detected!",
          description: `Welcome${communityText}! This is a demo experience. Code: ${ref}`,
        });
        
        // Simulate demo signup process
        setTimeout(() => {
          processDemoReferral(ref, community);
        }, 2000);
      } else {
        toast({
          title: "Referral detected!",
          description: `You'll be linked to referrer after signing up. Code: ${ref}`,
        });
      }
    }
  }, [searchParams, toast]);

  const processReferralSignup = async (newUserProfile: any) => {
    const storedReferralCode = localStorage.getItem('referralCode');
    if (!storedReferralCode) return;

    try {
      // Find the referral record
      const { data: referralData, error: referralError } = await supabase
        .from('referrals')
        .select('*, referrer:profiles!referrer_id(*)')
        .eq('referral_code', storedReferralCode)
        .eq('status', 'pending')
        .maybeSingle();

      if (referralError) throw referralError;
      if (!referralData) {
        console.log('No valid referral found for code:', storedReferralCode);
        return;
      }

      // Update referral with new user info
      const { error: updateError } = await supabase
        .from('referrals')
        .update({
          referred_id: newUserProfile.id,
          referred_email: newUserProfile.email,
          status: 'verified'
        })
        .eq('id', referralData.id);

      if (updateError) throw updateError;

      // Check if referrer should get a reward (e.g., every 1st, 5th, 10th referral)
      await checkAndRewardReferrer(referralData.referrer.id);

      // Clear stored referral code
      localStorage.removeItem('referralCode');

      toast({
        title: "Referral verified!",
        description: `You've been successfully referred by ${referralData.referrer.display_name}`,
      });

    } catch (error: any) {
      console.error('Error processing referral signup:', error);
      toast({
        title: "Referral processing failed",
        description: "There was an issue linking your referral, but your account was created successfully.",
        variant: "destructive",
      });
    }
  };

  const checkAndRewardReferrer = async (referrerId: string) => {
    try {
      // Count verified referrals for this user
      const { data: referralCount, error: countError } = await supabase
        .from('referrals')
        .select('id')
        .eq('referrer_id', referrerId)
        .eq('status', 'verified');

      if (countError) throw countError;

      const verifiedCount = referralCount?.length || 0;
      
      // Reward milestones: 1st, 5th, 10th, 20th, 50th referral
      const rewardMilestones = [1, 5, 10, 20, 50];
      
      if (rewardMilestones.includes(verifiedCount)) {
        await mintSubnameReward(referrerId, verifiedCount);
      }

    } catch (error) {
      console.error('Error checking referrer rewards:', error);
    }
  };

  const mintSubnameReward = async (userId: string, referralCount: number) => {
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Generate subname based on referral count
      const subnameSuffix = referralCount === 1 ? 'starter' :
                           referralCount === 5 ? 'bronze' :
                           referralCount === 10 ? 'silver' :
                           referralCount === 20 ? 'gold' :
                           referralCount === 50 ? 'diamond' : 'champion';

      const subname = `${profile.display_name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user'}-${subnameSuffix}.rewards.eth`;

      // Check if subname already exists
      const { data: existingSubname } = await supabase
        .from('subnames')
        .select('id')
        .eq('subname', subname)
        .maybeSingle();

      if (existingSubname) {
        // Generate unique subname with timestamp
        const uniqueSubname = `${subname.split('.')[0]}-${Date.now()}.rewards.eth`;
        await createSubnameRecord(userId, uniqueSubname, referralCount);
      } else {
        await createSubnameRecord(userId, subname, referralCount);
      }

      // Mark eligible referrals as rewarded
      await supabase
        .from('referrals')
        .update({ reward_given: true })
        .eq('referrer_id', userId)
        .eq('status', 'verified')
        .eq('reward_given', false);

    } catch (error) {
      console.error('Error minting subname reward:', error);
    }
  };

  const createSubnameRecord = async (userId: string, subname: string, referralCount: number) => {
    const { error } = await supabase
      .from('subnames')
      .insert({
        user_id: userId,
        subname,
        referral_count: referralCount,
        metadata: {
          milestone: referralCount,
          earned_at: new Date().toISOString(),
          type: 'referral_reward',
          rarity: referralCount >= 50 ? 'legendary' :
                 referralCount >= 20 ? 'epic' :
                 referralCount >= 10 ? 'rare' :
                 referralCount >= 5 ? 'uncommon' : 'common'
        }
      });

    if (error) throw error;
  };

  const processDemoReferral = (code: string, community?: string) => {
    // Update demo stats in localStorage
    const demoStats = JSON.parse(localStorage.getItem('demoReferralStats') || '{}');
    const communityKey = community || 'general';
    
    if (!demoStats[communityKey]) {
      demoStats[communityKey] = {
        totalReferrals: 0,
        verifiedReferrals: 0,
        members: 1,
        recentSignups: []
      };
    }
    
    demoStats[communityKey].totalReferrals += 1;
    demoStats[communityKey].verifiedReferrals += 1;
    demoStats[communityKey].members += 1;
    demoStats[communityKey].recentSignups.push({
      code,
      timestamp: new Date().toISOString(),
      community
    });
    
    localStorage.setItem('demoReferralStats', JSON.stringify(demoStats));
    
    toast({
      title: "Demo referral processed!",
      description: community 
        ? `You've joined the ${community} community successfully!`
        : "Demo referral completed successfully!",
    });
  };

  return {
    referralCode,
    processReferralSignup,
  };
};