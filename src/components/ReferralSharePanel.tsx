import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useReferralGeneration } from '@/hooks/useReferralGeneration';
import { Copy, Share2, MessageCircle, Send, Twitter, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorDisplay } from '@/components/ui/error-boundary';

export const ReferralSharePanel = () => {
  const {
    referralCode,
    referralLink,
    loading,
    generateReferralCode,
    copyToClipboard,
    shareToSocial,
    error,
  } = useReferralGeneration();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Share Your Referral Link
        </CardTitle>
        <CardDescription>
          Generate your unique referral link and start earning subname NFT rewards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <ErrorDisplay 
            error={error}
            onRetry={generateReferralCode}
            title="Failed to load referral data"
            description="There was an issue with your referral information."
          />
        )}
        
        {!error && !referralCode ? (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Generate your referral code to start inviting friends
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
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Referral Code</label>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono text-lg px-3 py-1">
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

            <div className="space-y-3">
              <label className="text-sm font-medium">Share via</label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareToSocial('twitter')}
                  className="flex items-center gap-2"
                >
                  <Twitter className="h-4 w-4" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareToSocial('telegram')}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Telegram
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareToSocial('whatsapp')}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Button>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">How it works:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Share your referral link with friends</li>
                <li>• They sign up using your link</li>
                <li>• You earn subname NFT rewards at milestones</li>
                <li>• 1st, 5th, 10th, 20th, and 50th referrals unlock rewards!</li>
              </ul>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};