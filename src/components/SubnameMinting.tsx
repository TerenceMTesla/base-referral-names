import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useSmartContract } from '@/hooks/useSmartContract';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Wallet, Coins, Trophy, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorDisplay } from '@/components/ui/error-boundary';

interface MintingTier {
  threshold: number;
  tierName: string;
  suffix: string;
  description: string;
  rarity: string;
  color: string;
}

const MINTING_TIERS: MintingTier[] = [
  {
    threshold: 1,
    tierName: 'Starter',
    suffix: 'starter',
    description: 'Your first EZVERSE subname',
    rarity: 'common',
    color: 'bg-gray-100'
  },
  {
    threshold: 5,
    tierName: 'Bronze',
    suffix: 'bronze',
    description: 'Bronze tier achievement',
    rarity: 'uncommon',
    color: 'bg-amber-100'
  },
  {
    threshold: 10,
    tierName: 'Silver',
    suffix: 'silver',
    description: 'Silver tier achievement',
    rarity: 'rare',
    color: 'bg-gray-200'
  },
  {
    threshold: 20,
    tierName: 'Gold',
    suffix: 'gold',
    description: 'Gold tier achievement',
    rarity: 'epic',
    color: 'bg-yellow-100'
  },
  {
    threshold: 50,
    tierName: 'Diamond',
    suffix: 'diamond',
    description: 'Ultimate tier achievement',
    rarity: 'legendary',
    color: 'bg-blue-100'
  }
];

export const SubnameMinting = () => {
  const { profile } = useAuth();
  const { connectToBase, mintSubnameNFT, checkWalletConnection, loading } = useSmartContract();
  const { toast } = useToast();
  
  const [verifiedReferrals, setVerifiedReferrals] = useState(0);
  const [customPrefix, setCustomPrefix] = useState('');
  const [selectedTier, setSelectedTier] = useState<MintingTier | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [existingSubnames, setExistingSubnames] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      fetchReferralData();
      checkWallet();
    }
  }, [profile]);

  const fetchReferralData = async () => {
    if (!profile) return;

    try {
      setLoadingData(true);
      setError(null);

      // Get verified referrals count
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select('id')
        .eq('referrer_id', profile.id)
        .eq('status', 'verified');

      if (referralsError) throw referralsError;
      setVerifiedReferrals(referralsData?.length || 0);

      // Get existing subnames
      const { data: subnamesData, error: subnamesError } = await supabase
        .from('subnames')
        .select('subname')
        .eq('user_id', profile.id);

      if (subnamesError) throw subnamesError;
      setExistingSubnames(subnamesData?.map(s => s.subname) || []);

    } catch (error: any) {
      console.error('Error fetching referral data:', error);
      const errorMessage = error.message || 'Failed to load referral data';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const checkWallet = async () => {
    const connected = await checkWalletConnection();
    setWalletConnected(connected);
  };

  const getEligibleTiers = () => {
    return MINTING_TIERS.filter(tier => verifiedReferrals >= tier.threshold);
  };

  const getNextTier = () => {
    return MINTING_TIERS.find(tier => verifiedReferrals < tier.threshold);
  };

  const isSubnameAlreadyMinted = (tierSuffix: string) => {
    return existingSubnames.some(subname => subname.includes(`.${tierSuffix}.`));
  };

  const generateFullSubname = (prefix: string, tier: MintingTier) => {
    return `${prefix}.${tier.suffix}.ezverse.eth`;
  };

  const handleConnectWallet = async () => {
    const success = await connectToBase();
    setWalletConnected(success);
  };

  const handleMintSubname = async () => {
    if (!selectedTier || !customPrefix.trim()) {
      toast({
        title: "Invalid input",
        description: "Please select a tier and enter a custom prefix.",
        variant: "destructive",
      });
      return;
    }

    if (!walletConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to Base network first.",
        variant: "destructive",
      });
      return;
    }

    const fullSubname = generateFullSubname(customPrefix.toLowerCase(), selectedTier);
    
    // Check if this tier was already minted
    if (isSubnameAlreadyMinted(selectedTier.suffix)) {
      toast({
        title: "Already minted",
        description: `You've already minted a ${selectedTier.tierName} tier subname.`,
        variant: "destructive",
      });
      return;
    }

    try {
      await mintSubnameNFT(fullSubname, verifiedReferrals);
      
      // Refresh data after successful mint
      await fetchReferralData();
      
      // Clear form
      setCustomPrefix('');
      setSelectedTier(null);
      
    } catch (error) {
      console.error('Minting failed:', error);
    }
  };

  const validatePrefix = (prefix: string) => {
    const cleaned = prefix.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleaned.length >= 3 && cleaned.length <= 20;
  };

  if (loadingData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <LoadingSpinner size="lg" message="Loading minting data..." />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={fetchReferralData}
        title="Failed to load minting data"
        description="There was an issue loading your minting information."
      />
    );
  }

  const eligibleTiers = getEligibleTiers();
  const nextTier = getNextTier();

  return (
    <div className="space-y-6">
      {/* Wallet Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {walletConnected ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-700">Connected to Base Network</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <span className="text-orange-700">Not connected to Base Network</span>
                </>
              )}
            </div>
            {!walletConnected && (
              <Button onClick={handleConnectWallet} disabled={loading}>
                {loading ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Referral Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Your Progress
          </CardTitle>
          <CardDescription>
            Track your referral milestones and unlock new minting tiers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">Verified Referrals</span>
              <Badge variant="default" className="text-lg px-3 py-1">
                {verifiedReferrals}
              </Badge>
            </div>
            
            {nextTier && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Next milestone: {nextTier.tierName}</span>
                  <span className="text-muted-foreground">
                    {nextTier.threshold - verifiedReferrals} more referrals needed
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${Math.min((verifiedReferrals / nextTier.threshold) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Tiers */}
      <Card>
        <CardHeader>
          <CardTitle>Available Minting Tiers</CardTitle>
          <CardDescription>
            Select a tier you're eligible for and create your custom subname
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {MINTING_TIERS.map((tier) => {
              const isEligible = eligibleTiers.includes(tier);
              const alreadyMinted = isSubnameAlreadyMinted(tier.suffix);
              const isSelected = selectedTier?.suffix === tier.suffix;

              return (
                <div
                  key={tier.suffix}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected ? 'border-primary bg-primary/5' : 'border-border'
                  } ${
                    !isEligible || alreadyMinted ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'
                  }`}
                  onClick={() => {
                    if (isEligible && !alreadyMinted) {
                      setSelectedTier(tier);
                    }
                  }}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{tier.tierName}</h3>
                      <Badge 
                        variant={isEligible ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {tier.threshold} refs
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{tier.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {tier.rarity}
                      </Badge>
                      {alreadyMinted && (
                        <Badge variant="secondary" className="text-xs">
                          Minted
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Minting Interface */}
      {eligibleTiers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Mint Your Subname NFT
            </CardTitle>
            <CardDescription>
              Create your personalized EZVERSE.eth subname
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Prefix</label>
              <Input
                placeholder="Enter your custom prefix (e.g., alice)"
                value={customPrefix}
                onChange={(e) => {
                  const cleaned = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
                  setCustomPrefix(cleaned);
                }}
                className="font-mono"
              />
              {customPrefix && !validatePrefix(customPrefix) && (
                <p className="text-xs text-muted-foreground">
                  Prefix must be 3-20 characters, letters and numbers only
                </p>
              )}
            </div>

            {selectedTier && customPrefix && validatePrefix(customPrefix) && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Preview:</p>
                <p className="font-mono font-bold text-lg">
                  {generateFullSubname(customPrefix, selectedTier)}
                </p>
              </div>
            )}

            <Button
              onClick={handleMintSubname}
              disabled={!selectedTier || !customPrefix || !validatePrefix(customPrefix) || !walletConnected || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Minting...
                </>
              ) : (
                `Mint ${selectedTier?.tierName || 'Subname'} NFT`
              )}
            </Button>

            {!walletConnected && (
              <p className="text-xs text-muted-foreground text-center">
                Connect your wallet to Base network to mint
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {eligibleTiers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Minting Tiers Available</h3>
            <p className="text-muted-foreground">
              You need at least 1 verified referral to mint your first subname NFT.
              Share your referral link to get started!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Existing Subnames */}
      {existingSubnames.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Minted Subnames</CardTitle>
            <CardDescription>
              EZVERSE.eth subnames you've successfully minted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {existingSubnames.map((subname, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-mono">{subname}</span>
                  <Badge variant="secondary">NFT</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
