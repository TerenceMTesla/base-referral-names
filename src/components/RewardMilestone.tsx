import React from 'react';
import { CheckCircle, Lock, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NFTCharacter } from './NFTCharacter';
import { AchievementBadge } from './AchievementBadge';
import { cn } from '@/lib/utils';

interface RewardMilestoneProps {
  milestone: {
    id: string;
    referralsRequired: number;
    title: string;
    description: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    reward: string;
    achieved: boolean;
  };
  currentReferrals: number;
  onClaim?: () => void;
  canClaim?: boolean;
}

const rarityColors = {
  common: 'border-gray-300 bg-gray-50',
  rare: 'border-blue-300 bg-blue-50',
  epic: 'border-purple-300 bg-purple-50', 
  legendary: 'border-yellow-300 bg-yellow-50'
};

export const RewardMilestone = ({ 
  milestone, 
  currentReferrals, 
  onClaim,
  canClaim = false 
}: RewardMilestoneProps) => {
  const progress = Math.min((currentReferrals / milestone.referralsRequired) * 100, 100);
  const isComplete = currentReferrals >= milestone.referralsRequired;
  const isClaimable = isComplete && !milestone.achieved && canClaim;

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-300',
      milestone.achieved 
        ? 'border-green-300 bg-green-50 dark:bg-green-950/20' 
        : isComplete 
        ? 'border-primary bg-primary/5 shadow-lg animate-pulse-slow'
        : rarityColors[milestone.rarity],
      'hover:shadow-lg card-hover'
    )}>
      {/* Achievement status indicator */}
      <div className="absolute top-4 right-4">
        {milestone.achieved ? (
          <CheckCircle className="w-6 h-6 text-green-500" />
        ) : isComplete ? (
          <Star className="w-6 h-6 text-yellow-500 animate-bounce-gentle" />
        ) : (
          <Lock className="w-6 h-6 text-muted-foreground" />
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg flex items-center gap-2">
              {milestone.title}
              <Badge 
                variant="outline" 
                className={cn(
                  'text-xs',
                  milestone.rarity === 'legendary' && 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-yellow-400',
                  milestone.rarity === 'epic' && 'bg-gradient-to-r from-purple-400 to-purple-600 text-white border-purple-400',
                  milestone.rarity === 'rare' && 'bg-gradient-to-r from-blue-400 to-blue-600 text-white border-blue-400'
                )}
              >
                {milestone.rarity.toUpperCase()}
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {milestone.description}
            </p>
          </div>
          
          {/* NFT Preview */}
          <NFTCharacter 
            rarity={milestone.rarity} 
            size="sm" 
            animated={isComplete && !milestone.achieved}
            className={cn(
              'transition-all duration-300',
              !isComplete && 'opacity-40 grayscale'
            )}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {currentReferrals}/{milestone.referralsRequired} referrals
            </span>
          </div>
          <Progress 
            value={progress} 
            className={cn(
              'h-2',
              isComplete && 'bg-green-200'
            )}
          />
        </div>

        {/* Reward details */}
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-sm font-medium">Reward:</p>
          <p className="text-sm text-muted-foreground">{milestone.reward}</p>
        </div>

        {/* Action button */}
        {isClaimable && onClaim && (
          <Button 
            onClick={onClaim}
            className="w-full button-primary"
            size="sm"
          >
            <Star className="w-4 h-4 mr-2" />
            Claim Reward
          </Button>
        )}

        {milestone.achieved && (
          <div className="flex items-center justify-center gap-2 text-green-600 bg-green-100 dark:bg-green-900/20 rounded-lg py-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Milestone Complete!</span>
          </div>
        )}
      </CardContent>

      {/* Sparkle effect for legendary milestones */}
      {milestone.rarity === 'legendary' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 left-4 w-1 h-1 bg-yellow-400 rounded-full animate-ping" />
          <div className="absolute top-8 right-8 w-1 h-1 bg-yellow-400 rounded-full animate-ping delay-300" />
          <div className="absolute bottom-4 left-8 w-1 h-1 bg-yellow-400 rounded-full animate-ping delay-500" />
        </div>
      )}
    </Card>
  );
};