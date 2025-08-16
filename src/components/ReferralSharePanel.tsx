import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useReferralGeneration } from '@/hooks/useReferralGeneration';
import { Copy, Share2, MessageCircle, Send, Twitter, QrCode, Sparkles, Users, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AnimatedCounter } from './AnimatedCounter';
import { AchievementBadge } from './AchievementBadge';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';

interface ReferralSharePanelProps {
  isDemoMode?: boolean;
}

export const ReferralSharePanel = ({ isDemoMode = false }: ReferralSharePanelProps) => {
  const {
    referralCode,
    referralLink,
    loading,
    generateReferralCode,
    copyToClipboard,
    shareToSocial,
    error,
  } = useReferralGeneration(isDemoMode);
  
  const realTimeData = { activeReferrers: 847, nftsMintedToday: 23, liveReferrals: 156 };

  return (
    <div className="space-y-6">
      {/* Live Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-hover animate-fade-in">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Referrers</p>
                <p className="text-2xl font-bold text-primary">
                  <AnimatedCounter value={realTimeData?.activeReferrers || 847} />
                </p>
              </div>
              <Users className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">NFTs Minted Today</p>
                <p className="text-2xl font-bold text-ens-primary">
                  <AnimatedCounter value={realTimeData?.nftsMintedToday || 23} />
                </p>
              </div>
              <Sparkles className="h-8 w-8 text-ens-primary opacity-60" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Live Referrals</p>
                <p className="text-2xl font-bold text-ens-secondary">
                  <AnimatedCounter value={realTimeData?.liveReferrals || 156} />
                </p>
              </div>
              <Share2 className="h-8 w-8 text-ens-secondary opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="animate-slide-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 gradient-text">
            <Share2 className="h-5 w-5" />
            Share Your Referral Link
          </CardTitle>
          <CardDescription>
            Generate your unique EZVERSE referral link and start earning exclusive ENS subname NFT rewards
          </CardDescription>
        </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 animate-fade-in">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <p className="font-medium">Failed to load referral data</p>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <Button variant="outline" size="sm" onClick={generateReferralCode} className="mt-3">
              Try Again
            </Button>
          </div>
        )}
        
        {!error && !referralCode ? (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Generate your referral code to start inviting friends to EZVERSE
            </p>
            <Button 
              onClick={generateReferralCode} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Generating...
                </>
              ) : (
                "Generate Referral Code"
              )}
            </Button>
          </div>
        ) : !error && referralCode ? (
          <div className="space-y-6 animate-fade-in">
            {/* Achievement Notification */}
            <div className="flex items-center gap-3 p-4 bg-ens-primary/5 border border-ens-primary/20 rounded-lg">
              <AchievementBadge achievement="first-referral" size="sm" animated />
              <div>
                <p className="font-medium text-ens-primary">Referral Code Generated!</p>
                <p className="text-sm text-muted-foreground">You're ready to start earning rewards</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Your Referral Code</label>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono text-lg px-4 py-2 button-glow">
                  {referralCode}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Your Referral Link</label>
              <div className="flex gap-2">
                <Input 
                  value={referralLink || ''} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={copyToClipboard}
                  title="Copy to clipboard"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium">Share & Earn</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareToSocial('twitter')}
                  className="flex items-center gap-2 hover-scale"
                >
                  <Twitter className="h-4 w-4" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareToSocial('telegram')}
                  className="flex items-center gap-2 hover-scale"
                >
                  <Send className="h-4 w-4" />
                  Telegram
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareToSocial('whatsapp')}
                  className="flex items-center gap-2 hover-scale"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="white"/><text x="100" y="100" text-anchor="middle" font-family="Arial" font-size="12">${referralLink}</text></svg>`)}`)}
                  className="flex items-center gap-2 hover-scale"
                >
                  <QrCode className="h-4 w-4" />
                  QR Code
                </Button>
              </div>
            </div>

            <div className="bg-gradient-to-r from-ens-primary/5 to-ens-secondary/5 border border-ens-primary/20 p-6 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-ens-primary">
                <Sparkles className="h-4 w-4" />
                How it works:
              </h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-ens-primary rounded-full animate-pulse-slow" />
                  Share your EZVERSE referral link with friends
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-ens-secondary rounded-full animate-pulse-slow" style={{ animationDelay: '0.5s' }} />
                  They join EZVERSE using your link
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-ens-accent rounded-full animate-pulse-slow" style={{ animationDelay: '1s' }} />
                  You earn exclusive ENS subname NFT rewards at milestones
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gradient-to-r from-ens-primary to-ens-secondary rounded-full animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
                  <span className="font-medium">1st, 5th, 10th, 20th, and 50th referrals unlock legendary EZVERSE rewards!</span>
                </li>
              </ul>
            </div>
          </div>
        ) : null}
        </CardContent>
      </Card>
    </div>
  );
};