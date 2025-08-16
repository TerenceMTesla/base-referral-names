import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Crown, Medal, Award, TrendingUp } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';
import { NFTCharacter } from './NFTCharacter';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  referrals: number;
  rank: number;
  change: number;
  achievements: string[];
}

export const ReferralLeaderboard = () => {
  const data = { liveReferrals: 156 };
  
  // Demo leaderboard data
  const leaderboard: LeaderboardEntry[] = [
    {
      id: '1',
      name: 'AlexCrypto.eth',
      referrals: 87,
      rank: 1,
      change: 0,
      achievements: ['legend', 'speedster']
    },
    {
      id: '2', 
      name: 'Sarah_Web3',
      referrals: 76,
      rank: 2,
      change: 1,
      achievements: ['super-star', 'marksman']
    },
    {
      id: '3',
      name: 'BlockchainBob',
      referrals: 64,
      rank: 3,
      change: -1,
      achievements: ['power-user', 'verified']
    },
    {
      id: '4',
      name: 'EnsEthusiast',
      referrals: 52,
      rank: 4,
      change: 2,
      achievements: ['power-user']
    },
    {
      id: '5',
      name: 'MetaverseMike',
      referrals: 41,
      rank: 5,
      change: 0,
      achievements: ['first-referral', 'milestone']
    }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <Trophy className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-yellow-600';
      case 2: return 'from-gray-300 to-gray-500';
      case 3: return 'from-amber-400 to-amber-600';
      default: return 'from-muted to-muted-foreground';
    }
  };

  const getChangeIndicator = (change: number) => {
    if (change > 0) {
      return <TrendingUp className="h-3 w-3 text-green-500" />;
    } else if (change < 0) {
      return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
    }
    return <div className="w-3 h-3" />;
  };

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 gradient-text">
          <Trophy className="h-5 w-5" />
          Live Leaderboard
        </CardTitle>
        <CardDescription>
          Top referrers earning ENS subname NFTs • Updates in real-time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {leaderboard.slice(0, 3).map((entry, index) => (
            <div 
              key={entry.id}
              className={cn(
                'relative p-4 rounded-lg text-center space-y-3',
                `bg-gradient-to-br ${getRankColor(entry.rank)}`,
                'text-white animate-fade-in'
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex justify-center">
                {getRankIcon(entry.rank)}
              </div>
              
              <NFTCharacter 
                size="sm" 
                rarity={entry.rank === 1 ? 'legendary' : entry.rank === 2 ? 'epic' : 'rare'}
                animated
              />
              
              <div>
                <p className="font-semibold text-sm truncate">{entry.name}</p>
                <p className="text-xs opacity-90">
                  <AnimatedCounter value={entry.referrals} /> referrals
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Full Leaderboard */}
        <div className="space-y-2">
          {leaderboard.map((entry, index) => (
            <div 
              key={entry.id}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg border transition-all duration-300 hover:shadow-md card-hover',
                entry.rank <= 3 && 'bg-gradient-to-r from-primary/5 to-transparent border-primary/20'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 min-w-[2rem]">
                  <span className="font-bold text-lg">{entry.rank}</span>
                  {getChangeIndicator(entry.change)}
                </div>
                
                <Avatar className="h-8 w-8">
                  <AvatarImage src={entry.avatar} />
                  <AvatarFallback>{entry.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                
                <div>
                  <p className="font-medium">{entry.name}</p>
                  <div className="flex gap-1">
                    {entry.achievements.slice(0, 2).map((achievement) => (
                      <Badge key={achievement} variant="secondary" className="text-xs">
                        {achievement}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-lg">
                  <AnimatedCounter value={entry.referrals} />
                </p>
                <p className="text-xs text-muted-foreground">referrals</p>
              </div>
            </div>
          ))}
        </div>

        {/* Live Activity Indicator */}
        <div className="flex items-center justify-center gap-2 py-4 border-t">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <p className="text-sm text-muted-foreground">
            Live updates • <AnimatedCounter value={data.liveReferrals} /> referrals processing
          </p>
        </div>
      </CardContent>
    </Card>
  );
};