import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Target, Zap, Gift, Crown, Users, TrendingUp } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';
import { AchievementBadge } from './AchievementBadge';
import { NFTCharacter } from './NFTCharacter';
import { ReferralLeaderboard } from './ReferralLeaderboard';
import { ShareableAchievement } from './ShareableAchievement';

export const GamificationHub = () => {
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);

  // Mock user data
  const userStats = {
    level: 7,
    xp: 2840,
    nextLevelXp: 3000,
    totalReferrals: 23,
    verifiedReferrals: 18,
    conversionRate: 78,
    streak: 5,
    rank: 142
  };

  const achievements = [
    {
      id: '1',
      type: 'first-referral' as const,
      title: 'First Steps',
      description: 'Made your first successful referral',
      date: '2024-01-15',
      referralCount: 1,
      nftRarity: 'common' as const,
      unlocked: true
    },
    {
      id: '2',
      type: 'power-user' as const,
      title: 'Power User',
      description: 'Reached 10+ verified referrals',
      date: '2024-02-03',
      referralCount: 10,
      nftRarity: 'rare' as const,
      unlocked: true
    },
    {
      id: '3',
      type: 'super-star' as const,
      title: 'Super Star',
      description: 'Amazing! 25+ verified referrals',
      date: '',
      referralCount: 25,
      nftRarity: 'epic' as const,
      unlocked: false
    }
  ];

  const challenges = [
    {
      id: 'daily',
      title: 'Daily Streak',
      description: 'Share your referral link once per day',
      progress: 5,
      target: 7,
      reward: '50 XP',
      timeLeft: '18h 32m'
    },
    {
      id: 'weekly',
      title: 'Weekly Goal',
      description: 'Get 3 verified referrals this week',
      progress: 1,
      target: 3,
      reward: 'Rare NFT',
      timeLeft: '4d 6h'
    },
    {
      id: 'social',
      title: 'Social Butterfly',
      description: 'Share on 3 different platforms',
      progress: 2,
      target: 3,
      reward: '100 XP',
      timeLeft: '23h 45m'
    }
  ];

  return (
    <div className="space-y-6">
      {/* User Level & Stats */}
      <Card className="animate-fade-in card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 gradient-text">
            <Crown className="h-5 w-5" />
            Level {userStats.level} Referrer
          </CardTitle>
          <CardDescription>
            Your gamification progress and achievements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* XP Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>XP Progress</span>
              <span>{userStats.xp} / {userStats.nextLevelXp}</span>
            </div>
            <Progress value={(userStats.xp / userStats.nextLevelXp) * 100} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {userStats.nextLevelXp - userStats.xp} XP until Level {userStats.level + 1}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">
                <AnimatedCounter value={userStats.totalReferrals} />
              </p>
              <p className="text-xs text-muted-foreground">Total Referrals</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-ens-primary">
                <AnimatedCounter value={userStats.conversionRate} />%
              </p>
              <p className="text-xs text-muted-foreground">Conversion Rate</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-ens-secondary">
                <AnimatedCounter value={userStats.streak} />
              </p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-ens-accent">
                #{<AnimatedCounter value={userStats.rank} />}
              </p>
              <p className="text-xs text-muted-foreground">Global Rank</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="achievements" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Rewards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => (
              <Card 
                key={achievement.id}
                className={`card-hover animate-fade-in transition-all duration-300 ${
                  achievement.unlocked 
                    ? 'border-primary/20 bg-gradient-to-br from-primary/5 to-transparent' 
                    : 'opacity-60 border-dashed'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => achievement.unlocked && setSelectedAchievement(achievement)}
              >
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="relative">
                        <NFTCharacter 
                          rarity={achievement.nftRarity} 
                          size="md" 
                          animated={achievement.unlocked}
                          className={!achievement.unlocked ? 'grayscale' : ''}
                        />
                        {achievement.unlocked && (
                          <div className="absolute -top-1 -right-1">
                            <AchievementBadge 
                              achievement={achievement.type} 
                              size="sm" 
                              animated 
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-1">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                      
                      {achievement.unlocked ? (
                        <Badge variant="secondary" className="text-xs">
                          Unlocked
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          {achievement.referralCount - userStats.verifiedReferrals} more needed
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          {challenges.map((challenge, index) => (
            <Card 
              key={challenge.id}
              className="card-hover animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">{challenge.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {challenge.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="mb-1">
                      {challenge.reward}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {challenge.timeLeft} left
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{challenge.progress} / {challenge.target}</span>
                  </div>
                  <Progress 
                    value={(challenge.progress / challenge.target) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="leaderboard">
          <ReferralLeaderboard />
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Available Rewards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Common ENS Subname</p>
                      <p className="text-sm text-muted-foreground">5 verified referrals</p>
                    </div>
                    <Badge variant="secondary">Available</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg opacity-60">
                    <div>
                      <p className="font-medium">Rare ENS Subname</p>
                      <p className="text-sm text-muted-foreground">10 verified referrals</p>
                    </div>
                    <Badge variant="outline">7 more needed</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Next Milestone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <NFTCharacter rarity="rare" size="lg" animated />
                  <div>
                    <h3 className="font-semibold">Rare ENS Subname</h3>
                    <p className="text-sm text-muted-foreground">
                      Get {25 - userStats.verifiedReferrals} more verified referrals
                    </p>
                    <Progress 
                      value={(userStats.verifiedReferrals / 25) * 100} 
                      className="mt-3"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Achievement Share Modal */}
      {selectedAchievement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full">
            <ShareableAchievement 
              achievement={selectedAchievement}
              onShare={(platform) => console.log(`Shared to ${platform}`)}
            />
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => setSelectedAchievement(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};