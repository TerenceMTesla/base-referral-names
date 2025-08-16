import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface InteractiveCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  animated?: boolean;
  glowing?: boolean;
  onClick?: () => void;
}

export const InteractiveCard = ({ 
  title, 
  description, 
  children, 
  className,
  animated = false,
  glowing = false,
  onClick 
}: InteractiveCardProps) => {
  return (
    <Card 
      className={cn(
        'transition-all duration-300',
        animated && 'card-hover animate-fade-in',
        glowing && 'ring-2 ring-primary/20 shadow-lg shadow-primary/10',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className={cn(
          animated && 'gradient-text'
        )}>
          {title}
        </CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};