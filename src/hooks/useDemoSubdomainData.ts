import { useState, useEffect } from 'react';

export interface DemoSubdomainCommunity {
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

export const useDemoSubdomainData = () => {
  const [communities, setCommunities] = useState<DemoSubdomainCommunity[]>([]);

  useEffect(() => {
    // Load initial demo communities
    const initialCommunities: DemoSubdomainCommunity[] = [
      {
        id: 'demo-gaming',
        subname: 'gaming.ezens.eth',
        community_name: 'Gaming',
        description: 'Join our gaming community and earn exclusive NFT rewards!',
        referral_code: 'GAMING123',
        members: 247,
        totalReferrals: 89,
        activeToday: 12,
        conversionRate: 78.5,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        analytics: {
          dailySignups: [5, 8, 12, 15, 11, 9, 12],
          topReferrers: [
            { name: 'GameMaster', referrals: 15 },
            { name: 'ProGamer', referrals: 12 },
            { name: 'NFTCollector', referrals: 8 }
          ]
        }
      },
      {
        id: 'demo-defi',
        subname: 'defi.ezens.eth',
        community_name: 'DeFi',
        description: 'Explore DeFi together and earn yield-farming NFTs!',
        referral_code: 'DEFI456',
        members: 189,
        totalReferrals: 67,
        activeToday: 8,
        conversionRate: 82.1,
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        analytics: {
          dailySignups: [3, 6, 9, 11, 8, 7, 8],
          topReferrers: [
            { name: 'YieldFarmer', referrals: 18 },
            { name: 'DeFiWhale', referrals: 14 },
            { name: 'LiquidityPro', referrals: 10 }
          ]
        }
      }
    ];

    // Load from localStorage and merge with created communities
    const storedCommunities = JSON.parse(localStorage.getItem('demoSubdomainReferrals') || '[]');
    const allCommunities = [...initialCommunities, ...storedCommunities.map((stored: any) => ({
      ...stored,
      members: stored.metadata?.members || 1,
      totalReferrals: stored.metadata?.totalReferrals || 0,
      activeToday: Math.floor(Math.random() * 5) + 1,
      conversionRate: 75 + Math.random() * 20,
      referral_code: stored.metadata?.referral_code || 'DEMO123',
      community_name: stored.metadata?.community_name || 'Demo',
      description: stored.metadata?.description || 'A demo community',
      analytics: {
        dailySignups: Array.from({ length: 7 }, () => Math.floor(Math.random() * 10) + 1),
        topReferrers: [
          { name: 'DemoUser1', referrals: Math.floor(Math.random() * 10) + 1 },
          { name: 'DemoUser2', referrals: Math.floor(Math.random() * 8) + 1 },
          { name: 'DemoUser3', referrals: Math.floor(Math.random() * 6) + 1 }
        ]
      }
    }))];

    setCommunities(allCommunities);
  }, []);

  const updateCommunityStats = (communityId: string, updates: Partial<DemoSubdomainCommunity>) => {
    setCommunities(prev => prev.map(community => 
      community.id === communityId 
        ? { ...community, ...updates }
        : community
    ));
  };

  const addCommunity = (community: DemoSubdomainCommunity) => {
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