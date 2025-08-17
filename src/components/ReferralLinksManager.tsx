import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMultipleReferrals, ReferralLink } from '@/hooks/useMultipleReferrals';
import { Copy, Plus, Edit, BarChart3, Share2, Eye, EyeOff } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ReferralLinksManagerProps {
  isDemoMode?: boolean;
}

export const ReferralLinksManager = ({ isDemoMode = false }: ReferralLinksManagerProps) => {
  const {
    referralLinks,
    loading,
    error,
    createReferralLink,
    toggleLinkStatus,
    updateLinkInfo,
    getReferralLink,
    copyToClipboard
  } = useMultipleReferrals(isDemoMode);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingLink, setEditingLink] = useState<ReferralLink | null>(null);
  const [campaignName, setCampaignName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateLink = async () => {
    const code = await createReferralLink(campaignName || undefined, description || undefined);
    if (code) {
      setShowCreateDialog(false);
      setCampaignName('');
      setDescription('');
    }
  };

  const handleUpdateLink = async () => {
    if (!editingLink) return;
    
    await updateLinkInfo(editingLink.id, campaignName || undefined, description || undefined);
    setEditingLink(null);
    setCampaignName('');
    setDescription('');
  };

  const openEditDialog = (link: ReferralLink) => {
    setEditingLink(link);
    setCampaignName(link.campaign_name || '');
    setDescription(link.description || '');
  };

  const shareToSocial = (code: string, platform: 'twitter' | 'telegram' | 'whatsapp') => {
    const link = getReferralLink(code);
    const message = `Join me on ezens.eth and earn exclusive ENS subname NFTs! Use my link: ${link}`;
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent('Join me on ezens.eth!')}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message)}`
    };

    window.open(urls[platform], '_blank');
  };

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 gradient-text">
              <BarChart3 className="h-5 w-5" />
              Referral Links Manager
            </CardTitle>
            <CardDescription>
              Create and manage unlimited referral links for different campaigns
            </CardDescription>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create New Link
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Referral Link</DialogTitle>
                <DialogDescription>
                  Create a new referral link for a specific campaign or purpose
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="campaign-name">Campaign Name (Optional)</Label>
                  <Input
                    id="campaign-name"
                    placeholder="e.g., Twitter Campaign, Discord Promo"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of this campaign"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateLink} disabled={loading}>
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Creating...
                    </>
                  ) : (
                    'Create Link'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
            <p className="text-destructive font-medium">{error}</p>
          </div>
        )}

        {loading && referralLinks.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner className="mr-2" />
            <span>Loading referral links...</span>
          </div>
        ) : referralLinks.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <div className="text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No referral links yet</p>
              <p>Create your first referral link to start earning rewards</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {referralLinks.map((link) => (
              <Card key={link.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono">
                        {link.referral_code}
                      </Badge>
                      <Badge variant={link.is_active ? "default" : "secondary"}>
                        {link.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">
                        {link.status === 'pending' ? 'Pending' : 
                         link.status === 'verified' ? 'Verified' : 'Rewarded'}
                      </Badge>
                    </div>
                    
                    {link.campaign_name && (
                      <h4 className="font-medium text-sm">{link.campaign_name}</h4>
                    )}
                    
                    {link.description && (
                      <p className="text-sm text-muted-foreground">{link.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Clicks: {link.click_count}</span>
                      {link.conversions !== undefined && (
                        <span>Conversions: {link.conversions}</span>
                      )}
                      <span>Created: {new Date(link.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-2 bg-muted p-2 rounded text-sm font-mono">
                      <span className="flex-1 truncate">{getReferralLink(link.referral_code)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(link.referral_code)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={link.is_active}
                        onCheckedChange={(checked) => toggleLinkStatus(link.id, checked)}
                      />
                      {link.is_active ? (
                        <Eye className="h-4 w-4 text-green-500" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(link)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>

                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => shareToSocial(link.referral_code, 'twitter')}
                        title="Share on Twitter"
                      >
                        <Share2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingLink} onOpenChange={() => setEditingLink(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Referral Link</DialogTitle>
              <DialogDescription>
                Update the campaign name and description for this referral link
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-campaign-name">Campaign Name</Label>
                <Input
                  id="edit-campaign-name"
                  placeholder="e.g., Twitter Campaign, Discord Promo"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Brief description of this campaign"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingLink(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateLink} disabled={loading}>
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Updating...
                  </>
                ) : (
                  'Update Link'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};