import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const useReferralGeneration = (isDemoMode = false, communitySubdomain?: string) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralLink, setReferralLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDemoMode) {
      // Set demo data based on community or default
      const demoCode = communitySubdomain ? `${communitySubdomain.toUpperCase().substr(0, 3)}123` : 'DEMO123';
      const demoLink = communitySubdomain 
        ? `${window.location.origin}/?ref=${demoCode}&community=${communitySubdomain}`
        : `${window.location.origin}/?ref=${demoCode}`;
      
      setReferralCode(demoCode);
      setReferralLink(demoLink);
    } else if (profile?.id) {
      fetchExistingReferralCode();
    }
  }, [profile?.id, isDemoMode, communitySubdomain]);

  const fetchExistingReferralCode = async () => {
    if (!profile?.id || isDemoMode) return;

    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('referral_code')
        .eq('referrer_id', profile.id)
        .eq('status', 'pending')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setReferralCode(data.referral_code);
        setReferralLink(`${window.location.origin}/?ref=${data.referral_code}`);
      }
    } catch (error) {
      console.error('Error fetching referral code:', error);
      setError('Failed to load existing referral data');
    }
  };

  const generateReferralCode = async () => {
    if (isDemoMode) {
      // Demo mode simulation with community support
      const prefix = communitySubdomain ? communitySubdomain.toUpperCase().substr(0, 3) : 'DEMO';
      const demoCode = `${prefix}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const demoLink = communitySubdomain 
        ? `${window.location.origin}/?ref=${demoCode}&community=${communitySubdomain}`
        : `${window.location.origin}/?ref=${demoCode}`;
      
      setReferralCode(demoCode);
      setReferralLink(demoLink);
      
      toast({
        title: communitySubdomain ? `Demo: ${communitySubdomain} referral created!` : "Demo: Referral code generated!",
        description: communitySubdomain ? `Your ${communitySubdomain} community referral link is ready` : "Your demo referral link is ready to share.",
      });
      return;
    }

    if (!profile?.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to generate a referral code.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check if user already has a pending referral code
      const { data: existingReferral } = await supabase
        .from('referrals')
        .select('referral_code')
        .eq('referrer_id', profile.id)
        .eq('status', 'pending')
        .limit(1)
        .maybeSingle();

      if (existingReferral) {
        setReferralCode(existingReferral.referral_code);
        setReferralLink(`${window.location.origin}/?ref=${existingReferral.referral_code}`);
        toast({
          title: "Referral code found",
          description: "Using your existing referral code.",
        });
        return;
      }

      // Generate new referral code using the database function
      const { data, error } = await supabase.rpc('generate_referral_code');

      if (error) throw error;

      const newReferralCode = data;

      // Create referral record
      const { error: insertError } = await supabase
        .from('referrals')
        .insert({
          referrer_id: profile.id,
          referral_code: newReferralCode,
          status: 'pending'
        });

      if (insertError) throw insertError;

      setReferralCode(newReferralCode);
      setReferralLink(`${window.location.origin}/?ref=${newReferralCode}`);

      toast({
        title: "Referral code generated!",
        description: "Your unique referral link is ready to share.",
      });

    } catch (error: any) {
      console.error('Error generating referral code:', error);
      const errorMessage = error.message || 'Failed to generate referral code. Please try again.';
      setError(errorMessage);
      toast({
        title: "Generation failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!referralLink) return;

    try {
      await navigator.clipboard.writeText(referralLink);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy link. Please copy manually.",
        variant: "destructive",
      });
    }
  };

  const shareToSocial = (platform: 'twitter' | 'telegram' | 'whatsapp') => {
    if (!referralLink) return;

    const communityText = communitySubdomain ? ` Join our ${communitySubdomain} community and` : '';
    const message = `${communityText} Join me on EZVERSE and earn exclusive ENS subname NFTs! Use my link to get started: ${referralLink}`;
    
    const shareText = communitySubdomain 
      ? `Join our ${communitySubdomain} community on EZVERSE!`
      : 'Join me on EZVERSE and earn exclusive ENS subname NFTs!';
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message)}`
    };

    window.open(urls[platform], '_blank');
  };

  return {
    referralCode,
    referralLink,
    loading,
    error,
    generateReferralCode,
    copyToClipboard,
    shareToSocial,
  };
};