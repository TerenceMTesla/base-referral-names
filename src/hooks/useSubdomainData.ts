import { useState, useEffect } from 'react';

export interface SubdomainCommunity {
  id: string;
  subname: string;
  community_name: string;
  description: string;
  referral_code: string;
  members: number;
  totalReferrals: number;
  activeToday: number;
  conversionRate: number;
  created_at: string;
  analytics: {
    dailySignups: number[];
    topReferrers: Array<{
      name: string;
      referrals: number;
    }>;
  };
}

export const useSubdomainData = () => {
  const [communities, setCommunities] = useState<SubdomainCommunity[]>([]);

  useEffect(() => {
    // Load communities from localStorage only
    const storedCommunities = JSON.parse(localStorage.getItem('subdomainReferrals') || '[]');
    const allCommunities = storedCommunities.map((stored: any) => ({
      ...stored,
      members: stored.metadata?.members || 0,
      totalReferrals: stored.metadata?.totalReferrals || 0,
      activeToday: stored.metadata?.activeToday || 0,
      conversionRate: stored.metadata?.conversionRate || 0,
      referral_code: stored.metadata?.referral_code || '',
      community_name: stored.metadata?.community_name || '',
      description: stored.metadata?.description || '',
      analytics: {
        dailySignups: stored.metadata?.analytics?.dailySignups || [0, 0, 0, 0, 0, 0, 0],
        topReferrers: stored.metadata?.analytics?.topReferrers || []
      }
    }));

    setCommunities(allCommunities);
  }, []);

  const updateCommunityStats = (communityId: string, updates: Partial<SubdomainCommunity>) => {
    setCommunities(prev => prev.map(community => 
      community.id === communityId 
        ? { ...community, ...updates }
        : community
    ));
  };

  const addCommunity = (community: SubdomainCommunity) => {
    setCommunities(prev => [...prev, community]);
  };

  const getCommunityBySubname = (subname: string) => {
    return communities.find(community => community.subname === subname);
  };

  const getCommunityByReferralCode = (code: string) => {
    return communities.find(community => community.referral_code === code);
  };

  return {
    communities,
    updateCommunityStats,
    addCommunity,
    getCommunityBySubname,
    getCommunityByReferralCode
  };
};