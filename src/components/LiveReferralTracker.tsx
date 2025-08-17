import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Copy, ExternalLink, Users, TrendingUp } from 'lucide-react';

interface ReferralLink {
  id: string;
  referral_code: string;
  click_count: number;
  status: string;
  created_at: string;
  campaign_name?: string;
}

interface RecentActivity {
  id: string;
  type: 'click' | 'signup' | 'verification';
  timestamp: string;
  details: string;
}

export const LiveReferralTracker = () => {
  const { profile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [referralLinks, setReferralLinks] = useState<ReferralLink[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && profile) {
      fetchReferralLinks();
      fetchRecentActivity();
      
      // Set up real-time updates
      const channel = supabase
        .channel('referral-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'referrals',
            filter: `referrer_id=eq.${profile.id}`
          },
          (payload) => {
            console.log('Referral update:', payload);
            fetchReferralLinks();
            fetchRecentActivity();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAuthenticated, profile]);

  const fetchReferralLinks = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      const { data: referrals, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReferralLinks(referrals || []);
    } catch (error: any) {
      console.error('Error fetching referral links:', error);
      toast({
        title: "Error",
        description: "Failed to load referral links",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    if (!profile) return;

    try {
      const { data: referrals, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', profile.id)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Transform referral data into activity feed
      const activities: RecentActivity[] = (referrals || []).map(referral => ({
        id: referral.id,
        type: referral.status === 'verified' ? 'verification' : 'signup',
        timestamp: referral.updated_at,
        details: referral.status === 'verified' 
          ? `Referral verified: ${referral.referred_email || 'Unknown user'}`
          : `New referral: ${referral.referral_code}`
      }));

      setRecentActivity(activities);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const copyReferralLink = async (code: string) => {
    const baseUrl = window.location.origin;
    const referralUrl = `${baseUrl}?ref=${code}`;
    
    try {
      await navigator.clipboard.writeText(referralUrl);
      toast({
        title: "Link Copied!",
        description: "Referral link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link to clipboard",
        variant: "destructive"
      });
    }
  };

  const generateNewReferralCode = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase.rpc('generate_referral_code');
      
      if (error) throw error;

      const newCode = data as string;
      
      const { error: insertError } = await supabase
        .from('referrals')
        .insert({
          referrer_id: profile.id,
          referral_code: newCode,
          status: 'pending',
          campaign_name: `Campaign ${new Date().toLocaleDateString()}`
        });

      if (insertError) throw insertError;

      toast({
        title: "New Referral Code Generated!",
        description: `Code: ${newCode}`,
      });

      fetchReferralLinks();
    } catch (error: any) {
      console.error('Error generating referral code:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate new referral code",
        variant: "destructive"
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Live Referral Tracker</CardTitle>
          <CardDescription>Connect your wallet to track referrals in real-time</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const totalClicks = referralLinks.reduce((sum, link) => sum + link.click_count, 0);
  const verifiedReferrals = referralLinks.filter(link => link.status === 'verified').length;
  const conversionRate = totalClicks > 0 ? (verifiedReferrals / totalClicks) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Links</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referralLinks.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifiedReferrals}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Generate New Link */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Referral Link</CardTitle>
          <CardDescription>Create a new referral code to share with others</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={generateNewReferralCode} className="w-full">
            Generate New Link
          </Button>
        </CardContent>
      </Card>

      {/* Active Referral Links */}
      <Card>
        <CardHeader>
          <CardTitle>Active Referral Links</CardTitle>
          <CardDescription>Track clicks and conversions for each referral code</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading referral links...</div>
          ) : referralLinks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No referral links yet. Generate your first one!
            </div>
          ) : (
            <div className="space-y-4">
              {referralLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-2 py-1 rounded text-sm">
                        {link.referral_code}
                      </code>
                      <Badge 
                        variant={link.status === 'verified' ? 'default' : 'secondary'}
                      >
                        {link.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {link.click_count} clicks • Created {new Date(link.created_at).toLocaleDateString()}
                    </div>
                    {link.campaign_name && (
                      <div className="text-sm text-muted-foreground">
                        Campaign: {link.campaign_name}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyReferralLink(link.referral_code)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Live updates on your referral performance</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recent activity
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <div className="text-sm font-medium">{activity.details}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <Badge variant="outline">{activity.type}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};