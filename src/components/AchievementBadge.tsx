import React from 'react';
import { Crown, Medal, Award, Trophy, Star, Shield, Zap, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AchievementBadgeProps {
  achievement: 'first-referral' | 'power-user' | 'super-star' | 'legend' | 'verified' | 'milestone' | 'speedster' | 'marksman';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

const achievementConfig = {
  'first-referral': {
    icon: Star,
    title: 'First Steps',
    color: 'from-blue-400 to-blue-600',
    description: 'Made your first referral'
  },
  'power-user': {
    icon: Zap,
    title: 'Power User',
    color: 'from-yellow-400 to-orange-500',
    description: '10+ verified referrals'
  },
  'super-star': {
    icon: Crown,
    title: 'Super Star',
    color: 'from-purple-400 to-purple-600',
    description: '25+ verified referrals'
  },
  'legend': {
    icon: Trophy,
    title: 'Legend',
    color: 'from-gradient-hero',
    description: '50+ verified referrals'
  },
  'verified': {
    icon: Shield,
    title: 'Verified',
    color: 'from-green-400 to-green-600',
    description: 'Account verified'
  },
  'milestone': {
    icon: Target,
    title: 'Milestone',
    color: 'from-indigo-400 to-indigo-600',
    description: 'Reached referral milestone'
  },
  'speedster': {
    icon: Zap,
    title: 'Speedster',
    color: 'from-red-400 to-red-600',
    description: '5 referrals in one day'
  },
  'marksman': {
    icon: Target,
    title: 'Marksman',
    color: 'from-emerald-400 to-emerald-600',
    description: '90%+ conversion rate'
  }
};

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-20 h-20'
};

export const AchievementBadge = ({ 
  achievement, 
  size = 'md', 
  animated = false,
  className 
}: AchievementBadgeProps) => {
  const config = achievementConfig[achievement];
  const Icon = config.icon;

  return (
    <div className={cn(
      'relative group cursor-pointer',
      animated && 'hover:scale-110 transition-transform duration-300',
      className
    )}>
      {/* Main badge */}
      <div className={cn(
        sizeClasses[size],
        'rounded-full flex items-center justify-center',
        `bg-gradient-to-br ${config.color}`,
        'shadow-lg border-2 border-white/20',
        animated && 'animate-pulse-slow'
      )}>
        <Icon className={cn(
          'text-white',
          size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-7 h-7' : 'w-9 h-9'
        )} />
      </div>

      {/* Sparkle effects for special achievements */}
      {(['legend', 'super-star'].includes(achievement)) && (
        <div className="absolute inset-0 animate-spin-slow">
          <div className="absolute top-0 left-1/2 w-1 h-1 bg-yellow-300 rounded-full transform -translate-x-1/2 animate-ping" />
          <div className="absolute bottom-0 right-0 w-1 h-1 bg-yellow-300 rounded-full animate-ping delay-100" />
          <div className="absolute bottom-0 left-0 w-1 h-1 bg-yellow-300 rounded-full animate-ping delay-200" />
        </div>
      )}

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
        <div className="font-semibold">{config.title}</div>
        <div className="text-gray-300">{config.description}</div>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/90" />
      </div>
    </div>
  );
};