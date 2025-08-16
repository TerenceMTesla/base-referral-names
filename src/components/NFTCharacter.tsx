import React from 'react';
import { cn } from '@/lib/utils';

interface NFTCharacterProps {
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animated?: boolean;
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32'
};

const rarityGradients = {
  common: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600', 
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500'
};

export const NFTCharacter = ({ 
  rarity = 'common', 
  size = 'md', 
  className,
  animated = false 
}: NFTCharacterProps) => {
  return (
    <div className={cn(
      sizeClasses[size],
      'relative rounded-xl overflow-hidden',
      animated && 'animate-bounce-gentle',
      className
    )}>
      <svg 
        viewBox="0 0 120 120" 
        className="w-full h-full"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`bg-${rarity}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" className={`bg-gradient-to-br ${rarityGradients[rarity]}`} />
          </linearGradient>
          <linearGradient id="character-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="50%" stopColor="hsl(var(--secondary))" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
        
        {/* Background circle with rarity gradient */}
        <circle 
          cx="60" 
          cy="60" 
          r="55" 
          className={`fill-current bg-gradient-to-br ${rarityGradients[rarity]}`}
          opacity="0.9"
        />
        
        {/* Character body - cute hexagonal robot */}
        <g transform="translate(60, 60)">
          {/* Main body - hexagon */}
          <path 
            d="M-15 -25 L15 -25 L25 0 L15 25 L-15 25 L-25 0 Z" 
            fill="url(#character-gradient)"
            stroke="white"
            strokeWidth="2"
          />
          
          {/* Eyes */}
          <circle cx="-8" cy="-10" r="3" fill="white" />
          <circle cx="8" cy="-10" r="3" fill="white" />
          <circle cx="-8" cy="-10" r="1.5" fill="#333" />
          <circle cx="8" cy="-10" r="1.5" fill="#333" />
          
          {/* Smile */}
          <path 
            d="M-8 5 Q0 12 8 5" 
            stroke="white" 
            strokeWidth="2" 
            fill="none"
            strokeLinecap="round"
          />
          
          {/* ENS domain antenna */}
          <line x1="0" y1="-25" x2="0" y2="-35" stroke="white" strokeWidth="2" />
          <circle cx="0" cy="-35" r="3" fill="hsl(var(--accent))" />
          
          {/* Arms */}
          <circle cx="-30" cy="0" r="6" fill="url(#character-gradient)" />
          <circle cx="30" cy="0" r="6" fill="url(#character-gradient)" />
          
          {/* Decorative elements based on rarity */}
          {rarity === 'legendary' && (
            <g>
              <circle cx="-20" cy="-20" r="2" fill="gold" opacity="0.8" />
              <circle cx="20" cy="-20" r="2" fill="gold" opacity="0.8" />
              <circle cx="0" cy="30" r="2" fill="gold" opacity="0.8" />
            </g>
          )}
          
          {rarity === 'epic' && (
            <g>
              <circle cx="-18" cy="-18" r="1.5" fill="purple" opacity="0.8" />
              <circle cx="18" cy="-18" r="1.5" fill="purple" opacity="0.8" />
            </g>
          )}
          
          {rarity === 'rare' && (
            <circle cx="0" cy="15" r="1" fill="blue" opacity="0.8" />
          )}
        </g>
        
        {/* Rarity indicator border */}
        <circle 
          cx="60" 
          cy="60" 
          r="55" 
          fill="none"
          stroke="white"
          strokeWidth="3"
          opacity="0.8"
        />
      </svg>
      
      {/* Rarity badge */}
      <div className={cn(
        'absolute top-1 right-1 px-2 py-1 rounded-full text-xs font-bold text-white',
        `bg-gradient-to-r ${rarityGradients[rarity]}`
      )}>
        {rarity.toUpperCase()}
      </div>
    </div>
  );
};