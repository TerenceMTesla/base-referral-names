import { DynamicWidget } from '@dynamic-labs/sdk-react-core';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { ErrorDisplay } from '@/components/ui/error-boundary';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

export const DynamicAuth = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [hasConnectionError, setHasConnectionError] = useState(false);

  // Handle Dynamic SDK initialization errors gracefully
  const handleRetry = () => {
    window.location.reload();
  };

  // Check for Dynamic SDK connection errors
  useEffect(() => {
    // Listen for Dynamic SDK errors
    const checkForErrors = () => {
      const errorMessages = [
        'Failed to fetch',
        'TypeError: Failed to fetch',
        'DynamicSDK] [ERROR]'
      ];
      
      // Check console for Dynamic errors
      const hasError = errorMessages.some(errorMsg => {
        return window.console && document.documentElement.innerHTML.includes('DynamicSDK] [ERROR]');
      });
      
      if (hasError) {
        setHasConnectionError(true);
      }
    };

    const timer = setTimeout(checkForErrors, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-primary/80">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isAuthenticated && user) {
    return (
      <Card className="w-full max-w-md mx-auto border-accent/30 bg-gradient-to-br from-accent/20 to-accent/10">
        <CardHeader>
          <CardTitle className="text-accent">Welcome Back!</CardTitle>
          <CardDescription className="text-accent/80">You're successfully connected</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-accent/70 space-y-1">
            <p><strong>Email:</strong> {user.email || 'Not provided'}</p>
            <p><strong>User ID:</strong> {user.userId}</p>
          </div>
          <DynamicWidget />
        </CardContent>
      </Card>
    );
  }

  // Show error state if Dynamic SDK fails to connect
  if (hasConnectionError) {
    return (
      <Card className="w-full max-w-lg mx-auto border-destructive/30 bg-gradient-to-br from-destructive/10 to-destructive/5">
        <CardHeader className="text-center">
          <CardTitle className="text-destructive flex items-center justify-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Authentication Service Unavailable
          </CardTitle>
          <CardDescription>
            Unable to connect to Dynamic Labs authentication service
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Configuration Issue Detected</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>The Dynamic Labs environment ID appears to be invalid or not properly configured.</p>
              <p className="text-sm font-mono bg-muted p-2 rounded">
                Environment ID: fe84593e-fefc-4303-aed9-099ee46cf8a9
              </p>
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <h4 className="font-semibold">To fix this issue:</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Log into your Dynamic Labs dashboard</li>
              <li>Verify the environment ID is correct</li>
              <li>Add this domain to your allowed origins</li>
              <li>Check that your Dynamic environment is active</li>
            </ol>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleRetry} className="flex-1" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Connection
            </Button>
            <Button 
              onClick={() => window.open('https://app.dynamic.xyz', '_blank')} 
              className="flex-1"
            >
              Dynamic Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto border-primary/30 bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="text-center">
        <CardTitle className="text-primary text-xl font-bold">Connect Your Account</CardTitle>
        <CardDescription className="text-primary/80">
          Sign in with your social account or crypto wallet to start earning rewards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
          <div className="min-h-[200px] flex items-center justify-center">
            <DynamicWidget />
          </div>
        </div>
        <div className="text-xs text-muted-foreground text-center">
          If authentication doesn't load, try refreshing the page
        </div>
      </CardContent>
    </Card>
  );
};