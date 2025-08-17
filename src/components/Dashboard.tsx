import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Users, Gift, Award, ExternalLink, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { RewardsPanel } from '@/components/RewardsPanel';
import { ReferralSharePanel } from '@/components/ReferralSharePanel';
import { SubnameMinting } from '@/components/SubnameMinting';
import { ReferralAnalytics } from '@/components/ReferralAnalytics';
import { ReferralProcessor } from '@/components/ReferralProcessor';
import { SimplifiedDashboard } from '@/components/SimplifiedDashboard';
import { ErrorDisplay } from '@/components/ui/error-boundary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Referral {
  id: string;
  referral_code: string;
  referred_email: string | null;
  status: 'pending' | 'verified' | 'rewarded';
  created_at: string;
}

interface Subname {
  id: string;
  subname: string;
  referral_count: number;
  nft_token_id: string | null;
  created_at: string;
}

// Empty data for real website start
const getEmptyData = () => ({
  referrals: [],
  subnames: [],
  profile: null,
});

interface DashboardProps {
  isLiveMode?: boolean;
}

export const Dashboard = ({ isLiveMode = true }: DashboardProps) => {
  const { profile, loading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [subnames, setSubnames] = useState<Subname[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string>('');
  const [useSimplified, setUseSimplified] = useState(true); // Default to simplified version
  
  // Real website mode - require authentication
  const emptyData = getEmptyData();
  const currentProfile = profile;

  useEffect(() => {
    if (profile && isAuthenticated) {
      fetchDashboardData();
    } else if (!authLoading && !isAuthenticated) {
      // Start with empty data
      setReferrals([]);
      setSubnames([]);
      setLoading(false);
      setError(null);
    }
  }, [profile, authLoading, isAuthenticated]);

  const fetchDashboardData = async () => {
    if (!profile) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch user's referrals
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', profile.id)
        .order('created_at', { ascending: false });

      if (referralsError) throw referralsError;
      setReferrals(referralsData || []);

      // Fetch user's subnames
      const { data: subnamesData, error: subnamesError } = await supabase
        .from('subnames')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (subnamesError) throw subnamesError;
      setSubnames(subnamesData || []);

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. This could be due to authentication issues.');
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const retryDataFetch = () => {
    fetchDashboardData();
  };

  const generateReferralCode = async () => {

    if (!profile) return;

    try {
      const { data, error } = await supabase.rpc('generate_referral_code');
      if (error) throw error;

      const newReferral = {
        referrer_id: profile.id,
        referral_code: data,
        status: 'pending' as const,
      };

      const { error: insertError } = await supabase
        .from('referrals')
        .insert(newReferral);

      if (insertError) throw insertError;

      setReferralCode(data);
      fetchDashboardData(); // Refresh the data

      toast({
        title: "Referral Code Generated",
        description: `Your referral code: ${data}`,
      });
    } catch (error: any) {
      console.error('Error generating referral code:', error);
      toast({
        title: "Error",
        description: "Failed to generate referral code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyReferralCode = (code: string) => {
    const referralUrl = `${window.location.origin}?ref=${code}`;
    navigator.clipboard.writeText(referralUrl);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard.",
    });
  };

  const verifiedReferrals = referrals.filter(r => r.status === 'verified').length;
  const rewardedReferrals = referrals.filter(r => r.status === 'rewarded').length;
  const totalSubnames = subnames.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" message="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <ErrorDisplay 
          error={error}
          title="Dashboard Loading Error"
          description="There was an issue loading your dashboard data."
          onRetry={retryDataFetch}
        />
      </div>
    );
  }

  // Show simplified version for authenticated users
  if (useSimplified && isAuthenticated) {
    return (
      <div className="space-y-6">
        <ReferralProcessor />
        <SimplifiedDashboard />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ReferralProcessor />
      
      {/* Performance Mode Toggle */}
      {isAuthenticated && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-700">
                  {useSimplified ? 'Fast Mode Active' : 'Full Dashboard Mode'}
                </p>
                <p className="text-xs text-blue-600">
                  {useSimplified ? 'Optimized for speed with essential features' : 'Complete dashboard with all analytics'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUseSimplified(!useSimplified)}
            >
              Switch to {useSimplified ? 'Full' : 'Fast'} Mode
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Referral Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {currentProfile?.display_name || 'User'}! Track your referrals and earn ENS subnames.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referrals.length}</div>
            <p className="text-xs text-muted-foreground">
              All time referrals sent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Referrals</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifiedReferrals}</div>
            <p className="text-xs text-muted-foreground">
              Successful conversions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rewards Earned</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rewardedReferrals}</div>
            <p className="text-xs text-muted-foreground">
              Referrals rewarded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ENS Subnames</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubnames}</div>
            <p className="text-xs text-muted-foreground">
              NFT subnames owned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="share" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="share" className="flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Share & Earn
          </TabsTrigger>
          <TabsTrigger value="mint" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Mint NFTs
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="referrals" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            My Referrals
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Rewards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="share" className="space-y-6">
          <ReferralSharePanel />
        </TabsContent>

        <TabsContent value="mint" className="space-y-6">
          <SubnameMinting />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <ReferralAnalytics />
        </TabsContent>

        <TabsContent value="referrals" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Referral Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Generate Referral</CardTitle>
                <CardDescription>
                  Create a new referral code to share with friends
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={generateReferralCode} className="w-full">
                  Generate New Referral Code
                </Button>
                
                {referralCode && (
                  <div className="p-4 bg-muted rounded-lg animate-fade-in">
                    <div className="flex items-center justify-between">
                      <code className="text-sm">{window.location.origin}?ref={referralCode}</code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyReferralCode(referralCode)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ENS Subnames */}
            <Card>
              <CardHeader>
                <CardTitle>Your ENS Subnames</CardTitle>
                <CardDescription>
                  NFT subnames you've earned through referrals
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subnames.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No subnames earned yet. Start referring to earn your first ENS subname!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {subnames.map((subname) => (
                      <div key={subname.id} className="flex items-center justify-between p-3 border rounded-lg hover-scale">
                        <div>
                          <p className="font-medium">{subname.subname}</p>
                          <p className="text-sm text-muted-foreground">
                            {subname.referral_count} referrals
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">NFT</Badge>
                          {subname.nft_token_id && (
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Referrals */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Referrals</CardTitle>
              <CardDescription>
                Track the status of your recent referral codes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {referrals.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No referrals yet. Generate your first referral code above!
                </p>
              ) : (
                <div className="space-y-3">
                  {referrals.slice(0, 10).map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between p-3 border rounded-lg hover-scale">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">{referral.referral_code}</p>
                          <p className="text-sm text-muted-foreground">
                            {referral.referred_email || 'Pending signup'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={
                            referral.status === 'rewarded' ? 'default' :
                            referral.status === 'verified' ? 'secondary' : 'outline'
                          }
                        >
                          {referral.status}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyReferralCode(referral.referral_code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards">
          <RewardsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};