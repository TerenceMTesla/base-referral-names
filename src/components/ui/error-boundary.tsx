import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  title?: string;
  description?: string;
}

export const ErrorDisplay = ({ 
  error, 
  onRetry, 
  title = "Something went wrong",
  description = "An error occurred while loading data."
}: ErrorDisplayProps) => {
  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-destructive/10 p-3 rounded-md">
          <p className="text-sm text-destructive font-mono">{error}</p>
        </div>
        {onRetry && (
          <Button variant="outline" onClick={onRetry} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
};