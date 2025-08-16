import React from 'react';
import { Users, Gift, Trophy, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { NFTCharacter } from './NFTCharacter';

interface EmptyStateProps {
  type: 'referrals' | 'rewards' | 'subnames' | 'analytics';
  onAction?: () => void;
  actionLabel?: string;
}

const emptyStateConfig = {
  referrals: {
    icon: Users,
    title: 'No referrals yet',
    description: 'Start sharing your referral link to see your network grow!',
    actionLabel: 'Share Referral Link',
    character: 'common' as const,
    tips: [
      'Share on social media',
      'Send to friends directly', 
      'Add to your bio links'
    ]
  },
  rewards: {
    icon: Gift,
    title: 'No rewards earned',
    description: 'Complete referral milestones to unlock exclusive NFT rewards!',
    actionLabel: 'View Milestones',
    character: 'rare' as const,
    tips: [
      'Get 5 verified referrals',
      'Reach 90% conversion rate',
      'Maintain consistency'
    ]
  },
  subnames: {
    icon: Sparkles,
    title: 'No ENS subnames yet',
    description: 'Earn verified referrals to mint your exclusive ENS subnames!',
    actionLabel: 'Learn More',
    character: 'epic' as const,
    tips: [
      'Mint at 10 referrals',
      'Each subname is unique',
      'Build your Web3 identity'
    ]
  },
  analytics: {
    icon: Trophy,
    title: 'No data to show',
    description: 'Your analytics will appear here once you start getting referrals!',
    actionLabel: 'Get Started',
    character: 'legendary' as const,
    tips: [
      'Track conversion rates',
      'Monitor growth trends',
      'Optimize your strategy'
    ]
  }
};

export const EmptyState = ({ type, onAction, actionLabel }: EmptyStateProps) => {
  const config = emptyStateConfig[type];
  const Icon = config.icon;

  return (
    <Card className="border-dashed border-2 border-muted">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-6">
        {/* Character illustration */}
        <div className="relative">
          <NFTCharacter 
            rarity={config.character} 
            size="lg" 
            animated 
            className="opacity-60"
          />
          
          {/* Floating icon */}
          <div className="absolute -top-2 -right-2 bg-primary rounded-full p-2 animate-bounce-gentle">
            <Icon className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>

        {/* Text content */}
        <div className="space-y-2 max-w-md">
          <h3 className="text-xl font-semibold text-foreground">
            {config.title}
          </h3>
          <p className="text-muted-foreground">
            {config.description}
          </p>
        </div>

        {/* Tips */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Quick tips:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {config.tips.map((tip, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground"
              >
                {tip}
              </span>
            ))}
          </div>
        </div>

        {/* Action button */}
        {onAction && (
          <Button 
            onClick={onAction}
            className="button-glow transition-all duration-300 hover:scale-105"
          >
            {actionLabel || config.actionLabel}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}

        {/* Motivational message */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 max-w-sm">
          <p className="text-sm text-primary font-medium">
            💡 Every great referrer started with zero! Your journey begins now.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};