import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, Download, Copy, Twitter, Facebook, Instagram } from 'lucide-react';
import { AchievementBadge } from './AchievementBadge';
import { NFTCharacter } from './NFTCharacter';
import { useToast } from '@/hooks/use-toast';

interface ShareableAchievementProps {
  achievement: {
    id: string;
    type: 'first-referral' | 'power-user' | 'super-star' | 'legend';
    title: string;
    description: string;
    date: string;
    referralCount: number;
    nftRarity: 'common' | 'rare' | 'epic' | 'legendary';
  };
  onShare?: (platform: string) => void;
}

export const ShareableAchievement = ({ achievement, onShare }: ShareableAchievementProps) => {
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);

  const generateShareContent = () => {
    const shareText = `🎉 Just unlocked "${achievement.title}" on ENS Referral Platform! 
    
${achievement.description}
${achievement.referralCount} verified referrals and counting! 🚀

Join me and start earning exclusive ENS subname NFTs! 
#ENS #Web3 #NFT #Referrals`;

    return shareText;
  };

  const shareToSocial = async (platform: string) => {
    setIsSharing(true);
    const shareContent = generateShareContent();
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareContent)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(shareContent)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}&summary=${encodeURIComponent(shareContent)}`
    };

    if (urls[platform as keyof typeof urls]) {
      window.open(urls[platform as keyof typeof urls], '_blank');
      onShare?.(platform);
    }

    setTimeout(() => setIsSharing(false), 1000);
  };

  const copyAchievement = async () => {
    try {
      await navigator.clipboard.writeText(generateShareContent());
      toast({
        title: "Copied!",
        description: "Achievement details copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy manually.",
        variant: "destructive",
      });
    }
  };

  const downloadAchievement = () => {
    // Generate a simple SVG badge for download
    const svg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#3b82f6"/>
            <stop offset="100%" style="stop-color:#1e40af"/>
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#bg)" rx="12"/>
        <text x="200" y="80" text-anchor="middle" fill="white" font-size="24" font-weight="bold">
          🏆 Achievement Unlocked!
        </text>
        <text x="200" y="120" text-anchor="middle" fill="white" font-size="18">
          ${achievement.title}
        </text>
        <text x="200" y="160" text-anchor="middle" fill="white" font-size="14">
          ${achievement.description}
        </text>
        <text x="200" y="200" text-anchor="middle" fill="white" font-size="16">
          ${achievement.referralCount} Verified Referrals
        </text>
        <text x="200" y="240" text-anchor="middle" fill="white" font-size="12">
          ENS Referral Platform • ${achievement.date}
        </text>
      </svg>
    `;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ens-achievement-${achievement.type}.svg`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: "Achievement badge saved to your device.",
    });
  };

  return (
    <Card className="card-hover animate-fade-in border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <NFTCharacter 
              rarity={achievement.nftRarity} 
              size="lg" 
              animated 
            />
            <div className="absolute -top-2 -right-2">
              <AchievementBadge 
                achievement={achievement.type} 
                size="md" 
                animated 
              />
            </div>
          </div>
        </div>
        
        <div>
          <CardTitle className="gradient-text text-xl mb-2">
            🎉 Achievement Unlocked!
          </CardTitle>
          <Badge variant="secondary" className="mb-2">
            {achievement.title}
          </Badge>
          <p className="text-sm text-muted-foreground">
            {achievement.description}
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-2xl font-bold text-primary">
            {achievement.referralCount}
          </p>
          <p className="text-sm text-muted-foreground">Verified Referrals</p>
          <p className="text-xs text-muted-foreground mt-1">
            Achieved on {achievement.date}
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-center">Share your achievement</p>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => shareToSocial('twitter')}
              disabled={isSharing}
              className="flex items-center gap-2"
            >
              <Twitter className="h-4 w-4" />
              Twitter
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => shareToSocial('facebook')}
              disabled={isSharing}
              className="flex items-center gap-2"
            >
              <Facebook className="h-4 w-4" />
              Facebook
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyAchievement}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={downloadAchievement}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};