import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSubdomainData } from '@/hooks/useSubdomainData';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { Share2, Users, TrendingUp, Trophy, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const SubdomainDashboard = () => {
  const { communities, getCommunityByReferralCode } = useSubdomainData();
  const { toast } = useToast();

  const totalMembers = communities.reduce((sum, c) => sum + c.members, 0);
  const totalReferrals = communities.reduce((sum, c) => sum + c.totalReferrals, 0);
  const avgConversion = communities.reduce((sum, c) => sum + c.conversionRate, 0) / communities.length || 0;

  const copyReferralLink = (referralCode: string, communityName: string) => {
    const link = `${window.location.origin}/?ref=${referralCode}&community=${communityName.toLowerCase()}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Copied!",
      description: `${communityName} referral link copied to clipboard`,
    });
  };

  const shareToTwitter = (referralCode: string, communityName: string) => {
    const link = `${window.location.origin}/?ref=${referralCode}&community=${communityName.toLowerCase()}`;
    const message = `Join our ${communityName} community on EZVERSE and earn exclusive NFTs! ${link}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Communities</p>
                <p className="text-2xl font-bold text-primary">
                  <AnimatedCounter value={communities.length} />
                </p>
              </div>
              <Users className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold text-primary">
                  <AnimatedCounter value={totalMembers} />
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
                <p className="text-2xl font-bold text-primary">
                  <AnimatedCounter value={totalReferrals} />
                </p>
              </div>
              <Share2 className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Conversion</p>
                <p className="text-2xl font-bold text-primary">
                  <AnimatedCounter value={Math.round(avgConversion * 10) / 10} />%
                </p>
              </div>
              <Trophy className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Communities Management */}
      <Tabs defaultValue="communities" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="communities">My Communities</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="rewards">Community Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="communities" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {communities.map((community) => (
              <Card key={community.id} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{community.subname}</CardTitle>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{community.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-primary">{community.members}</div>
                      <div className="text-xs text-muted-foreground">Members</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-primary">{community.totalReferrals}</div>
                      <div className="text-xs text-muted-foreground">Referrals</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-primary">{community.activeToday}</div>
                      <div className="text-xs text-muted-foreground">Today</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Referral Code:</span>
                      <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                        {community.referral_code}
                      </code>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => copyReferralLink(community.referral_code, community.community_name)}
                        className="flex-1"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy Link
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => shareToTwitter(community.referral_code, community.community_name)}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {communities.map((community) => (
              <Card key={community.id}>
                <CardHeader>
                  <CardTitle className="text-base">{community.community_name} Analytics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Conversion Rate</p>
                      <p className="text-xl font-bold text-primary">{community.conversionRate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Growth Rate</p>
                      <p className="text-xl font-bold text-green-600">+{(Math.random() * 20 + 5).toFixed(1)}%</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Top Referrers</p>
                    <div className="space-y-1">
                      {community.analytics.topReferrers.map((referrer, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{referrer.name}</span>
                          <span className="font-medium">{referrer.referrals} referrals</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {communities.map((community) => (
              <Card key={community.id}>
                <CardHeader>
                  <CardTitle className="text-base">{community.community_name} Rewards</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Starter NFT (1 referral)</span>
                      <Badge variant="outline">Common</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Community Badge (5 referrals)</span>
                      <Badge variant="outline">Uncommon</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Elite Status (10 referrals)</span>
                      <Badge variant="outline">Rare</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Legend Tier (25 referrals)</span>
                      <Badge variant="outline">Epic</Badge>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Members with {community.totalReferrals}+ referrals earn exclusive {community.community_name} NFTs
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};