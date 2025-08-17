import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface ReferralLink {
  id: string;
  referral_code: string;
  campaign_name?: string;
  description?: string;
  is_active: boolean;
  click_count: number;
  created_at: string;
  status: 'pending' | 'verified' | 'rewarded';
  conversions?: number;
}

export const useMultipleReferrals = (isDemoMode = false) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [referralLinks, setReferralLinks] = useState<ReferralLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDemoMode) {
      // Set demo data
      setReferralLinks([
        {
          id: 'demo-1',
          referral_code: 'DEMO123',
          campaign_name: 'Main Campaign',
          description: 'Primary referral link',
          is_active: true,
          click_count: 45,
          created_at: new Date().toISOString(),
          status: 'pending',
          conversions: 12
        },
        {
          id: 'demo-2',
          referral_code: 'PROMO456',
          campaign_name: 'Social Media',
          description: 'Twitter & Discord campaign',
          is_active: true,
          click_count: 23,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          status: 'verified',
          conversions: 5
        }
      ]);
    } else if (profile?.id) {
      fetchReferralLinks();
    }
  }, [profile?.id, isDemoMode]);

  const fetchReferralLinks = async () => {
    if (!profile?.id || isDemoMode) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', profile.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReferralLinks(data || []);
    } catch (error: any) {
      console.error('Error fetching referral links:', error);
      setError('Failed to load referral links');
    } finally {
      setLoading(false);
    }
  };

  const createReferralLink = async (campaignName?: string, description?: string) => {
    if (isDemoMode) {
      const demoCode = `DEMO${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const newLink: ReferralLink = {
        id: `demo-${Date.now()}`,
        referral_code: demoCode,
        campaign_name: campaignName || 'Untitled Campaign',
        description: description || 'Demo referral link',
        is_active: true,
        click_count: 0,
        created_at: new Date().toISOString(),
        status: 'pending',
        conversions: 0
      };
      
      setReferralLinks(prev => [newLink, ...prev]);
      toast({
        title: "Demo: Referral link created!",
        description: `Campaign "${campaignName}" is ready to share.`,
      });
      return demoCode;
    }

    if (!profile?.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create referral links.",
        variant: "destructive",
      });
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      // Generate new referral code using the database function
      const { data: newCode, error: codeError } = await supabase.rpc('generate_referral_code');
      if (codeError) throw codeError;

      // Create referral record
      const { data, error: insertError } = await supabase
        .from('referrals')
        .insert({
          referrer_id: profile.id,
          referral_code: newCode,
          campaign_name: campaignName,
          description: description,
          status: 'pending',
          is_active: true,
          click_count: 0
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Update local state
      setReferralLinks(prev => [data, ...prev]);

      toast({
        title: "Referral link created!",
        description: `Campaign "${campaignName || 'Untitled'}" is ready to share.`,
      });

      return newCode;

    } catch (error: any) {
      console.error('Error creating referral link:', error);
      const errorMessage = error.message || 'Failed to create referral link';
      setError(errorMessage);
      toast({
        title: "Creation failed",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const toggleLinkStatus = async (linkId: string, isActive: boolean) => {
    if (isDemoMode) {
      setReferralLinks(prev => 
        prev.map(link => 
          link.id === linkId ? { ...link, is_active: isActive } : link
        )
      );
      return;
    }

    try {
      const { error } = await supabase
        .from('referrals')
        .update({ is_active: isActive })
        .eq('id', linkId);

      if (error) throw error;

      setReferralLinks(prev => 
        prev.map(link => 
          link.id === linkId ? { ...link, is_active: isActive } : link
        )
      );

      toast({
        title: isActive ? "Link activated" : "Link deactivated",
        description: `Referral link has been ${isActive ? 'activated' : 'deactivated'}.`,
      });

    } catch (error: any) {
      console.error('Error updating link status:', error);
      toast({
        title: "Update failed",
        description: "Failed to update link status.",
        variant: "destructive",
      });
    }
  };

  const updateLinkInfo = async (linkId: string, campaignName?: string, description?: string) => {
    if (isDemoMode) {
      setReferralLinks(prev => 
        prev.map(link => 
          link.id === linkId ? { ...link, campaign_name: campaignName, description } : link
        )
      );
      return;
    }

    try {
      const { error } = await supabase
        .from('referrals')
        .update({ campaign_name: campaignName, description })
        .eq('id', linkId);

      if (error) throw error;

      setReferralLinks(prev => 
        prev.map(link => 
          link.id === linkId ? { ...link, campaign_name: campaignName, description } : link
        )
      );

      toast({
        title: "Link updated",
        description: "Referral link information has been updated.",
      });

    } catch (error: any) {
      console.error('Error updating link info:', error);
      toast({
        title: "Update failed",
        description: "Failed to update link information.",
        variant: "destructive",
      });
    }
  };

  const getReferralLink = (code: string) => {
    return `${window.location.origin}/?ref=${code}`;
  };

  const copyToClipboard = async (code: string) => {
    const link = getReferralLink(code);
    try {
      await navigator.clipboard.writeText(link);
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

  return {
    referralLinks,
    loading,
    error,
    createReferralLink,
    toggleLinkStatus,
    updateLinkInfo,
    getReferralLink,
    copyToClipboard,
    refreshLinks: fetchReferralLinks
  };
};