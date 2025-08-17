import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ENSLogo } from './ENSLogo';
import { useENSDetection } from '@/hooks/useENSDetection';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Globe, Users, Share2, CheckCircle, AlertTriangle, Sparkles, Crown, Loader2, Link, Wallet, Plus, Copy } from 'lucide-react';

interface ENSSubdomainReferralPanelProps {
  isDemoMode?: boolean;
}

export const ENSSubdomainReferralPanel = ({ isDemoMode = false }: ENSSubdomainReferralPanelProps) => {
  const { ensDomain, hasENSDomain, loading: ensLoading } = useENSDetection();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [subdomain, setSubdomain] = useState('');
  const [description, setDescription] = useState('');
  const [landsOnUrl, setLandsOnUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdSubdomainReferral, setCreatedSubdomainReferral] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [referralCodes, setReferralCodes] = useState<any[]>([]);
  const [generatingCode, setGeneratingCode] = useState(false);

  // Demo mode data
  const demoSubdomainData = {
    subdomain: 'gaming.demo.eth',
    description: 'Join our gaming community and earn exclusive NFT rewards!',
    referralCode: 'GAMING123',
    members: 247,
    totalReferrals: 89,
    activeToday: 12,
    analytics: {
      dailySignups: [5, 8, 12, 15, 11, 9, 12],
      conversionRate: 78.5,
      topReferrers: [
        { name: 'GameMaster', referrals: 15 },
        { name: 'ProGamer', referrals: 12 },
        { name: 'NFTCollector', referrals: 8 }
      ]
    }
  };

  const createSubdomainReferral = async () => {
    if (isDemoMode) {
      // Demo mode - simulate creation and store in localStorage
      setLoading(true);
      setTimeout(() => {
        const demoData = {
          id: 'demo-' + Date.now(),
          subname: `${subdomain.toLowerCase().replace(/[^a-z0-9]/g, '')}.demo.eth`,
          metadata: {
            type: 'subdomain_referral',
            description: description.trim(),
            created_at: new Date().toISOString(),
            ens_domain: 'demo.eth',
            community_name: subdomain.trim(),
            is_active: true,
            referral_code: `${subdomain.toUpperCase().substr(0, 3)}${Math.random().toString(36).substr(2, 3).toUpperCase()}`,
            members: 1,
            totalReferrals: 0,
            lands_on_url: landsOnUrl.trim() || null
          }
        };
        
        // Store in localStorage for demo persistence
        const demoReferrals = JSON.parse(localStorage.getItem('demoSubdomainReferrals') || '[]');
        demoReferrals.push(demoData);
        localStorage.setItem('demoSubdomainReferrals', JSON.stringify(demoReferrals));
        
        setCreatedSubdomainReferral(demoData);
        setLoading(false);
        
        toast({
          title: "Demo: Community created!",
          description: `Your ${subdomain} demo community is now active`,
        });
      }, 1500);
      return;
    }

    if (!ensDomain?.name || !subdomain.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a community name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subnames')
        .insert({
          user_id: profile?.id,
          subname: `${subdomain.toLowerCase().replace(/[^a-z0-9]/g, '')}.${ensDomain.name}`,
          metadata: {
            type: 'subdomain_referral',
            description: description.trim(),
            created_at: new Date().toISOString(),
            ens_domain: ensDomain.name,
            community_name: subdomain.trim(),
            is_active: true,
            lands_on_url: landsOnUrl.trim() || null
          }
        })
        .select()
        .single();

      if (error) throw error;

      setCreatedSubdomainReferral(data);
      
      toast({
        title: "Community created!",
        description: `Your ${subdomain} referral community is now active`,
      });

    } catch (error: any) {
      console.error('Error creating subdomain referral:', error);
      toast({
        title: "Creation failed",
        description: error.message || "Failed to create subdomain referral community",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateUniqueReferralCode = async () => {
    if (!createdSubdomainReferral) return;

    setGeneratingCode(true);
    
    if (isDemoMode) {
      setTimeout(() => {
        const newCode = {
          id: 'code-' + Date.now(),
          code: `${createdSubdomainReferral.metadata.community_name.toUpperCase().substr(0, 3)}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
          created_at: new Date().toISOString(),
          clicks: 0,
          wallet_address: null,
          ens_domain: createdSubdomainReferral.subname,
          is_active: true
        };
        
        setReferralCodes(prev => [...prev, newCode]);
        setGeneratingCode(false);
        
        toast({
          title: "New referral code generated!",
          description: `Code: ${newCode.code}`,
        });
      }, 1000);
      return;
    }

    // Real implementation would generate via API
    try {
      const newCode = {
        id: 'code-' + Date.now(),
        code: `${createdSubdomainReferral.metadata.community_name.toUpperCase().substr(0, 3)}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        created_at: new Date().toISOString(),
        clicks: 0,
        wallet_address: null,
        ens_domain: createdSubdomainReferral.subname,
        is_active: true
      };
      
      setReferralCodes(prev => [...prev, newCode]);
      
      toast({
        title: "New referral code generated!",
        description: `Code: ${newCode.code}`,
      });
    } catch (error: any) {
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate referral code",
        variant: "destructive",
      });
    } finally {
      setGeneratingCode(false);
    }
  };

  const associateWallet = (codeId: string) => {
    if (!walletAddress.trim()) {
      toast({
        title: "Missing wallet address",
        description: "Please enter a wallet address",
        variant: "destructive",
      });
      return;
    }

    setReferralCodes(prev => prev.map(code => 
      code.id === codeId 
        ? { ...code, wallet_address: walletAddress.trim() }
        : code
    ));

    toast({
      title: "Wallet associated!",
      description: `Wallet ${walletAddress.trim()} linked to referral code`,
    });
    
    setWalletAddress('');
  };

  const copyReferralLink = (code: string) => {
    const link = `${window.location.origin}?ref=${code}&community=${createdSubdomainReferral?.subname}`;
    navigator.clipboard.writeText(link);
    
    toast({
      title: "Link copied!",
      description: "Referral link copied to clipboard",
    });
  };

  const simulateClick = (codeId: string) => {
    setReferralCodes(prev => prev.map(code => 
      code.id === codeId 
        ? { ...code, clicks: code.clicks + 1 }
        : code
    ));
  };

  if (isDemoMode) {
    return (
      <Card className="p-6 mb-6 border-accent bg-accent/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            ENS Subdomain Community
          </CardTitle>
          <CardDescription>
            Demo mode: Create and manage your ENS subdomain referral community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Existing demo community */}
            <div className="space-y-4">
              <h3 className="font-semibold">Your Active Community</h3>
              <Card className="p-4 border-2 border-primary/20">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{demoSubdomainData.subdomain}</h4>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{demoSubdomainData.description}</p>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-primary">{demoSubdomainData.members}</div>
                      <div className="text-xs text-muted-foreground">Members</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-primary">{demoSubdomainData.totalReferrals}</div>
                      <div className="text-xs text-muted-foreground">Referrals</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-primary">{demoSubdomainData.activeToday}</div>
                      <div className="text-xs text-muted-foreground">Today</div>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Referral Code:</span>
                      <code className="bg-muted px-2 py-1 rounded text-xs font-mono">{demoSubdomainData.referralCode}</code>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Create new community form */}
            <div className="space-y-4">
              <h3 className="font-semibold">Create New Community</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subdomain">Community Name</Label>
                  <Input
                    id="subdomain"
                    placeholder="e.g., gaming, defi, art"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Will create: {subdomain ? `${subdomain.toLowerCase()}.demo.eth` : 'yourname.demo.eth'}
                  </p>
                </div>

                <div>
                  <Label htmlFor="landsOnUrl">Lands On (Optional)</Label>
                  <Input
                    id="landsOnUrl"
                    placeholder="https://yourwebsite.com or app.yourname.com"
                    value={landsOnUrl}
                    onChange={(e) => setLandsOnUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Where visitors to {subdomain ? `${subdomain.toLowerCase()}.demo.eth` : 'your subdomain'} will be redirected
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your community and its benefits"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <Button 
                  onClick={createSubdomainReferral}
                  disabled={loading || !subdomain.trim()}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Community...
                    </>
                  ) : (
                    'Create Demo Community'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (ensLoading) {
    return (
      <Card className="animate-slide-up">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner className="mr-2" />
            <p className="text-muted-foreground">Checking for ENS domain...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No ENS domain detected
  if (!hasENSDomain) {
    return (
      <Card className="animate-slide-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 gradient-text">
            <ENSLogo size="sm" />
            ENS Subdomain Community
          </CardTitle>
          <CardDescription>
            Create referral campaigns for your ENS subdomains
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 border border-muted rounded-lg p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="font-medium text-muted-foreground">No ENS Domain Detected</p>
            <p className="text-sm text-muted-foreground mt-1">
              Connect a wallet with a valid .eth domain to create subdomain referral communities
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-ens-primary/5 to-ens-secondary/5 border border-ens-primary/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-ens-primary">How ENS Subdomain Referrals Work:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Connect a wallet that owns an ENS domain (like yourname.eth)</li>
              <li>• Create themed communities (gaming.yourname.eth, defi.yourname.eth)</li>
              <li>• Generate specialized referral links for each community</li>
              <li>• Track referrals and rewards per subdomain community</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ENS domain detected - show creation form or existing subdomain
  if (createdSubdomainReferral) {
    return (
      <Card className="animate-slide-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 gradient-text">
            <ENSLogo size="sm" />
            {createdSubdomainReferral.subname} Community
          </CardTitle>
          <CardDescription>
            Your ENS subdomain referral community is active
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-ens-primary/5 border border-ens-primary/20 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="h-5 w-5 text-ens-primary" />
              <p className="font-medium text-ens-primary">Community Created Successfully!</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-sm">{createdSubdomainReferral.subname}</span>
              </div>
              {createdSubdomainReferral.metadata?.description && (
                <p className="text-sm text-muted-foreground">{createdSubdomainReferral.metadata.description}</p>
              )}
              {createdSubdomainReferral.metadata?.lands_on_url && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">Redirects to:</span>
                  <a 
                    href={createdSubdomainReferral.metadata.lands_on_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs text-primary hover:underline font-mono"
                  >
                    {createdSubdomainReferral.metadata.lands_on_url}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Community Members</p>
                    <p className="text-lg font-bold text-ens-primary">0</p>
                  </div>
                  <Users className="h-5 w-5 text-ens-primary opacity-60" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Referrals</p>
                    <p className="text-lg font-bold text-ens-secondary">{referralCodes.reduce((sum, code) => sum + code.clicks, 0)}</p>
                  </div>
                  <Share2 className="h-5 w-5 text-ens-secondary opacity-60" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Active Codes</p>
                    <p className="text-lg font-bold text-ens-accent">{referralCodes.length}</p>
                  </div>
                  <Link className="h-5 w-5 text-ens-accent opacity-60" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Referral Code Generator Section */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-ens-primary flex items-center gap-2">
              <Link className="h-4 w-4" />
              Referral Link Generator
            </h3>
            
            <Button 
              onClick={generateUniqueReferralCode}
              disabled={generatingCode}
              className="w-full"
              variant="outline"
            >
              {generatingCode ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Code...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate New Referral Code
                </>
              )}
            </Button>

            {/* Wallet Association */}
            <div className="flex gap-2">
              <Input
                placeholder="Enter wallet address (0x...)"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={() => referralCodes.length > 0 && associateWallet(referralCodes[referralCodes.length - 1]?.id)}
                disabled={!walletAddress.trim() || referralCodes.length === 0}
                variant="outline"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Associate Wallet
              </Button>
            </div>

            {/* Referral Codes List */}
            {referralCodes.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Generated Referral Codes</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {referralCodes.map((code) => (
                    <Card key={code.id} className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <code className="bg-muted px-2 py-1 rounded text-xs font-mono">{code.code}</code>
                            <Button
                              onClick={() => copyReferralLink(code.code)}
                              size="sm"
                              variant="ghost"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <Badge variant="secondary">{code.clicks} clicks</Badge>
                        </div>
                        
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="flex items-center justify-between">
                            <span>ENS Domain:</span>
                            <span className="font-mono">{code.ens_domain}</span>
                          </div>
                          {code.wallet_address && (
                            <div className="flex items-center justify-between">
                              <span>Wallet:</span>
                              <span className="font-mono">{code.wallet_address.slice(0, 6)}...{code.wallet_address.slice(-4)}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span>Created:</span>
                            <span>{new Date(code.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Demo click simulator */}
                        {isDemoMode && (
                          <Button
                            onClick={() => simulateClick(code.id)}
                            size="sm"
                            variant="outline"
                            className="w-full mt-2"
                          >
                            Simulate Click (+1)
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 gradient-text">
          <ENSLogo size="sm" />
          Create ENS Subdomain Community
        </CardTitle>
        <CardDescription>
          Launch a referral community for your {ensDomain?.name} subdomains
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-ens-primary/5 border border-ens-primary/20 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-ens-primary" />
            <div>
              <p className="font-medium text-ens-primary">ENS Domain Verified</p>
              <p className="text-sm text-muted-foreground">
                Connected wallet owns: <span className="font-mono">{ensDomain?.name}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium block mb-1">Community Name</label>
            <Input
              placeholder="e.g., gaming, defi, nfts, art"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
            />
            {subdomain && (
              <p className="text-xs text-muted-foreground mt-1">
                Will create: <span className="font-mono">{subdomain}.{ensDomain?.name}</span>
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Lands On (Optional)</label>
            <Input
              placeholder="https://yourwebsite.com or app.yourname.com"
              value={landsOnUrl}
              onChange={(e) => setLandsOnUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Where visitors to {subdomain ? `${subdomain}.${ensDomain?.name}` : 'your subdomain'} will be redirected
            </p>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Description (Optional)</label>
            <Input
              placeholder="Describe your community..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <Button 
          onClick={createSubdomainReferral}
          disabled={loading || !subdomain.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Creating Community...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Create {subdomain ? `${subdomain}.${ensDomain?.name}` : 'Subdomain'} Community
            </>
          )}
        </Button>

        <div className="bg-gradient-to-r from-ens-primary/5 to-ens-secondary/5 border border-ens-primary/20 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 text-ens-primary flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Community Benefits:
          </h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Specialized referral tracking for your subdomain</li>
            <li>• Community-specific rewards and incentives</li>
            <li>• Enhanced analytics and member management</li>
            <li>• Exclusive subdomain holder benefits</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};