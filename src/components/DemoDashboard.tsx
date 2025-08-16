import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Copy, Crown, Medal, Award, Trophy, Users, Gift, TrendingUp, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { ENSLogo } from '@/components/ENSLogo';

export const DemoDashboard = () => {
  const [referralCode, setReferralCode] = useState('DEMO-REF-12345');

  const mockStats = {
    totalReferrals: 24,
    verifiedReferrals: 18,
    rewardsEarned: 3,
    ensSubnames: 2
  };

  const mockReferrals = [
    { id: '1', referral_code: 'DEMO-REF-12345', referred_email: 'user1@example.com', status: 'verified', created_at: '2024-01-15' },
    { id: '2', referral_code: 'DEMO-REF-12345', referred_email: 'user2@example.com', status: 'verified', created_at: '2024-01-14' },
    { id: '3', referral_code: 'DEMO-REF-12345', referred_email: 'user3@example.com', status: 'pending', created_at: '2024-01-13' },
  ];

  const mockSubnames = [
    { id: '1', subname: 'rewards.example.eth', referral_count: 10, nft_token_id: '1001', created_at: '2024-01-10' },
    { id: '2', subname: 'bonus.example.eth', referral_count: 8, nft_token_id: '1002', created_at: '2024-01-12' },
  ];

  const mockLeaderboard = [
    { user_id: '1', display_name: 'DemoUser', email: 'demo@example.com', total_referrals: 24, verified_referrals: 18, subnames_earned: 2, rank: 1 },
    { user_id: '2', display_name: 'TopReferrer', email: 'top@example.com', total_referrals: 45, verified_referrals: 32, subnames_earned: 4, rank: 2 },
    { user_id: '3', display_name: 'ActiveUser', email: 'active@example.com', total_referrals: 38, verified_referrals: 28, subnames_earned: 3, rank: 3 },
  ];

  const copyReferralCode = () => {
    const referralLink = `${window.location.origin}?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied to clipboard!');
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <Trophy className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4 animate-fade-in">
        <div className="flex items-center justify-center gap-3">
          <ENSLogo size="lg" className="animate-bounce-gentle" />
          <h1 className="text-5xl font-bold text-gradient">ENS Referral Hub</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Explore the referral system with sample data and experience the power of decentralized naming
        </p>
        <Badge variant="secondary" className="text-sm animate-pulse-slow bg-primary/10 text-primary border-primary/20">
          Demo Mode - Sample Data
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover animate-slide-up stagger-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalReferrals}</div>
            <p className="text-xs text-muted-foreground">
              +4 from last month
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover animate-slide-up stagger-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Referrals</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.verifiedReferrals}</div>
            <p className="text-xs text-muted-foreground">
              75% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover animate-slide-up stagger-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rewards Earned</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.rewardsEarned}</div>
            <p className="text-xs text-muted-foreground">
              NFT rewards claimed
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover animate-slide-up stagger-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ENS Subnames</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.ensSubnames}</div>
            <p className="text-xs text-muted-foreground">
              Unique subnames owned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="share" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="share">Share & Earn</TabsTrigger>
          <TabsTrigger value="mint">Mint NFTs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="referrals">My Referrals</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="share" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Share Your Referral Link</CardTitle>
              <CardDescription>
                Share this link with friends to earn rewards when they sign up
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="referral-link">Your Referral Link</Label>
                <div className="flex space-x-2">
                  <Input
                    id="referral-link"
                    value={`${window.location.origin}?ref=${referralCode}`}
                    readOnly
                  />
                  <Button onClick={copyReferralCode} size="sm" className="button-glow transition-all duration-300 hover:scale-105">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>How it works:</strong> When someone signs up using your link, 
                  you'll earn points towards NFT rewards. Every 10 verified referrals 
                  unlocks a new ENS subname NFT!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mint" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mint ENS Subname NFTs</CardTitle>
              <CardDescription>
                Convert your referral achievements into unique ENS subname NFTs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="text-center p-6 border-2 border-dashed border-border rounded-lg">
                  <Sparkles className="h-12 w-12 mx-auto text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Ready to Mint!</h3>
                  <p className="text-muted-foreground mb-4">
                    You have {mockStats.verifiedReferrals} verified referrals. 
                    Mint your next subname NFT!
                  </p>
                  <Button>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Mint New Subname NFT
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress to next reward</span>
                    <span>{mockStats.verifiedReferrals % 10}/10 referrals</span>
                  </div>
                  <Progress value={(mockStats.verifiedReferrals % 10) * 10} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Referral Analytics</CardTitle>
              <CardDescription>
                Track your performance and see how you rank among other users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Your Rank</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      {getRankIcon(1)}
                      <span className="text-2xl font-bold">#1</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Top referrer this month!
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Conversion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">75%</div>
                    <p className="text-sm text-muted-foreground">
                      Above average performance
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Leaderboard</h3>
                <div className="space-y-2">
                  {mockLeaderboard.map((user, index) => (
                    <div key={user.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getRankIcon(user.rank)}
                        <div>
                          <p className="font-medium">{user.display_name}</p>
                          <p className="text-sm text-muted-foreground">{user.verified_referrals} verified referrals</p>
                        </div>
                      </div>
                      <Badge variant={user.rank <= 3 ? "default" : "secondary"}>
                        #{user.rank}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Referrals</CardTitle>
              <CardDescription>
                Track the status of your referrals and earned subnames
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Owned ENS Subnames</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {mockSubnames.map((subname) => (
                    <Card key={subname.id} className="border-primary/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-sm font-medium">{subname.subname}</span>
                          <Badge variant="outline">NFT #{subname.nft_token_id}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Earned from {subname.referral_count} referrals
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recent Referrals</h3>
                <div className="space-y-2">
                  {mockReferrals.map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{referral.referred_email}</p>
                        <p className="text-sm text-muted-foreground">
                          Referred on {new Date(referral.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={referral.status === 'verified' ? 'default' : 'secondary'}>
                        {referral.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rewards & Achievements</CardTitle>
              <CardDescription>
                View your earned rewards and track achievement milestones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg border-primary/20 bg-primary/5">
                  <Gift className="h-8 w-8 mx-auto text-primary mb-2" />
                  <h3 className="font-semibold">Milestone Reached!</h3>
                  <p className="text-sm text-muted-foreground">10 verified referrals</p>
                  <Badge className="mt-2">Achieved</Badge>
                </div>
                
                <div className="text-center p-4 border rounded-lg border-primary/20 bg-primary/5">
                  <Trophy className="h-8 w-8 mx-auto text-primary mb-2" />
                  <h3 className="font-semibold">Top Performer</h3>
                  <p className="text-sm text-muted-foreground">Rank #1 this month</p>
                  <Badge className="mt-2">Achieved</Badge>
                </div>

                <div className="text-center p-4 border rounded-lg border-muted">
                  <Sparkles className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <h3 className="font-semibold">NFT Collector</h3>
                  <p className="text-sm text-muted-foreground">Earn 5 subname NFTs</p>
                  <Badge variant="secondary" className="mt-2">2/5</Badge>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Available Rewards</h3>
                <div className="p-4 border rounded-lg">
                  <p className="text-center text-muted-foreground">
                    You have {mockStats.rewardsEarned} rewards ready to claim!
                  </p>
                  <Button className="w-full mt-4">
                    <Gift className="h-4 w-4 mr-2" />
                    Claim All Rewards
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};