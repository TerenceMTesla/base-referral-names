import React from 'react';

interface ENSLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12', 
  lg: 'w-16 h-16'
};

export const ENSLogo = ({ className = '', size = 'md' }: ENSLogoProps) => {
  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center`}>
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ENS-inspired geometric logo */}
        <defs>
          <linearGradient id="ensGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--secondary))" />
          </linearGradient>
        </defs>
        
        {/* Main hexagonal shape */}
        <path 
          d="M50 10 L80 25 L80 55 L50 70 L20 55 L20 25 Z" 
          fill="url(#ensGradient)" 
          fillOpacity="0.9"
        />
        
        {/* Inner design - stylized "E" */}
        <path 
          d="M35 30 L35 50 L60 50 M35 40 L55 40 M35 30 L60 30" 
          stroke="white" 
          strokeWidth="3" 
          strokeLinecap="round"
        />
        
        {/* Decorative dots */}
        <circle cx="50" cy="60" r="2" fill="white" fillOpacity="0.8" />
        <circle cx="45" cy="63" r="1.5" fill="white" fillOpacity="0.6" />
        <circle cx="55" cy="63" r="1.5" fill="white" fillOpacity="0.6" />
      </svg>
    </div>
  );
};