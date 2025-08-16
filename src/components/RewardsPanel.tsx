import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Wallet, Trophy, Coins, ExternalLink, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSmartContract } from '@/hooks/useSmartContract';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useReferralValidation } from '@/hooks/useReferralValidation';

interface RewardMilestone {
  referrals: number;
  title: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  achieved: boolean;
}

interface RewardsPanelProps {
  isDemoMode?: boolean;
}

export const RewardsPanel = ({ isDemoMode = false }: RewardsPanelProps) => {
  const { profile } = useAuth();
  const { connectToBase, mintSubnameNFT, checkWalletConnection, loading } = useSmartContract();
  const { toast } = useToast();
  const { stats, fetchReferralStats } = useReferralValidation();
  const [verifiedReferrals, setVerifiedReferrals] = useState(0);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [pendingRewards, setPendingRewards] = useState<any[]>([]);

  const milestones: RewardMilestone[] = [
    {
      referrals: 1,
      title: "First Steps",
      description: "Your first successful referral - welcome to the community!",
      rarity: 'common',
      achieved: verifiedReferrals >= 1,
    },
    {
      referrals: 5,
      title: "Bronze Advocate",
      description: "5 verified referrals - you're building momentum!",
      rarity: 'uncommon',
      achieved: verifiedReferrals >= 5,
    },
    {
      referrals: 10,
      title: "Silver Champion",
      description: "10 verified referrals - impressive growth!",
      rarity: 'rare',
      achieved: verifiedReferrals >= 10,
    },
    {
      referrals: 20,
      title: "Gold Master",
      description: "20 verified referrals - you're a referral master!",
      rarity: 'epic',
      achieved: verifiedReferrals >= 20,
    },
    {
      referrals: 50,
      title: "Diamond Legend",
      description: "50 verified referrals - legendary status achieved!",
      rarity: 'legendary',
      achieved: verifiedReferrals >= 50,
    },
  ];

  useEffect(() => {
    if (isDemoMode) {
      // Set demo data
      setVerifiedReferrals(6);
      setIsWalletConnected(true);
      setPendingRewards([]);
    } else if (profile) {
      fetchReferralData();
      fetchReferralStats();
      checkWallet();
    }
  }, [profile, fetchReferralStats, isDemoMode]);

  const fetchReferralData = async () => {
    if (!profile || isDemoMode) return;

    try {
      // Get verified referrals count
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select('id')
        .eq('referrer_id', profile.id)
        .eq('status', 'verified');

      if (referralsError) throw referralsError;
      setVerifiedReferrals(referralsData?.length || 0);

      // Get pending rewards (subnames that should be minted but haven't been)
      const { data: pendingData, error: pendingError } = await supabase
        .from('subnames')
        .select('*')
        .eq('user_id', profile.id)
        .is('nft_token_id', null);

      if (pendingError) throw pendingError;
      setPendingRewards(pendingData || []);

    } catch (error: any) {
      console.error('Error fetching referral data:', error);
      toast({
        title: "Error",
        description: "Failed to load referral data. Please refresh the page.",
        variant: "destructive",
      });
    }
  };

  const checkWallet = async () => {
    const connected = await checkWalletConnection();
    setIsWalletConnected(connected);
  };

  const handleConnectWallet = async () => {
    const success = await connectToBase();
    if (success) {
      setIsWalletConnected(true);
    }
  };

  const handleMintReward = async (subname: any) => {
    try {
      const txHash = await mintSubnameNFT(subname.subname, subname.referral_count);
      
      if (txHash) {
        // Update database with transaction hash
        await supabase
          .from('subnames')
          .update({
            nft_token_id: txHash, // In production, this would be the actual token ID
            transaction_hash: txHash,
          })
          .eq('id', subname.id);

        // Refresh pending rewards
        fetchReferralData();
      }
    } catch (error) {
      console.error('Error minting reward:', error);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'uncommon': return 'bg-green-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getNextMilestone = () => {
    return milestones.find(m => !m.achieved) || milestones[milestones.length - 1];
  };

  const nextMilestone = getNextMilestone();
  const progressPercentage = nextMilestone.achieved ? 100 : (verifiedReferrals / nextMilestone.referrals) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Referral Progress
          </CardTitle>
          <CardDescription>
            Track your referral milestones and earn exclusive ENS subnames
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{verifiedReferrals}</p>
              <p className="text-sm text-muted-foreground">Verified Referrals</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">Next: {nextMilestone.title}</p>
              <p className="text-sm text-muted-foreground">
                {nextMilestone.referrals - verifiedReferrals} more referrals needed
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{verifiedReferrals}</span>
              <span>{nextMilestone.referrals}</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Wallet Connection */}
      {!isWalletConnected && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Wallet className="h-5 w-5" />
              Connect Wallet to Mint NFTs
            </CardTitle>
            <CardDescription className="text-orange-600">
              Connect your wallet to Base network to mint your earned subname NFTs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleConnectWallet} disabled={loading} className="w-full">
              {loading ? 'Connecting...' : 'Connect to Base Network'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pending Rewards */}
      {pendingRewards.length > 0 && isWalletConnected && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Zap className="h-5 w-5" />
              Ready to Mint
            </CardTitle>
            <CardDescription className="text-green-600">
              You have earned subnames ready to be minted as NFTs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingRewards.map((reward) => (
              <div key={reward.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div>
                  <p className="font-medium">{reward.subname}</p>
                  <p className="text-sm text-muted-foreground">
                    {reward.referral_count} referrals • {reward.metadata?.rarity || 'common'} rarity
                  </p>
                </div>
                <Button
                  onClick={() => handleMintReward(reward)}
                  disabled={loading}
                  size="sm"
                >
                  {loading ? 'Minting...' : 'Mint NFT'}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Reward Milestones</CardTitle>
          <CardDescription>
            Earn exclusive ENS subnames for reaching referral milestones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {milestones.map((milestone, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border transition-all ${
                milestone.achieved 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${milestone.achieved ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div>
                    <h4 className="font-medium">{milestone.title}</h4>
                    <p className="text-sm text-muted-foreground">{milestone.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="secondary" 
                    className={`${getRarityColor(milestone.rarity)} text-white`}
                  >
                    {milestone.rarity}
                  </Badge>
                  <span className="text-lg font-bold">{milestone.referrals}</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};