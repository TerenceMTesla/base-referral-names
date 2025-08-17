import { useState } from 'react';
import { DynamicWidget } from '@dynamic-labs/sdk-react-core';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ErrorDisplay } from '@/components/ui/error-boundary';

export const DynamicAuth = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [debugMode, setDebugMode] = useState(false);
  const [fallbackAuth, setFallbackAuth] = useState(false);

  console.log('DynamicAuth render:', { user, isAuthenticated, loading, fallbackAuth });

  // Handle Dynamic SDK initialization errors gracefully
  const handleRetry = () => {
    console.log('Retrying authentication...');
    window.location.reload();
  };

  // Fallback authentication for testing
  const handleFallbackAuth = () => {
    console.log('Using fallback authentication');
    setFallbackAuth(true);
    // Simulate successful authentication for testing
    localStorage.setItem('fallback_auth', 'true');
  };

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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setDebugMode(!debugMode)}
          >
            {debugMode ? 'Hide' : 'Show'} Debug Info
          </Button>
          {debugMode && (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              <pre>{JSON.stringify({ user, isAuthenticated, loading }, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (fallbackAuth || localStorage.getItem('fallback_auth')) {
    return (
      <Card className="w-full max-w-md mx-auto border-accent/30 bg-gradient-to-br from-accent/20 to-accent/10">
        <CardHeader>
          <CardTitle className="text-accent">Demo Mode Active</CardTitle>
          <CardDescription className="text-accent/80">Using fallback authentication for testing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-accent/70 space-y-1">
            <p><strong>Mode:</strong> Demo/Testing</p>
            <p><strong>Auth:</strong> Fallback Active</p>
          </div>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => {
              setFallbackAuth(false);
              localStorage.removeItem('fallback_auth');
              window.location.reload();
            }}
          >
            Reset Authentication
          </Button>
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
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground text-center">
            If authentication doesn't load, try refreshing the page
          </div>
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleFallbackAuth}
              className="text-xs"
            >
              Use Demo Mode (Testing)
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};