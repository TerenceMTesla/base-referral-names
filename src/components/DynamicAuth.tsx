import { DynamicWidget } from '@dynamic-labs/sdk-react-core';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export const DynamicAuth = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isAuthenticated && user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Welcome Back!</CardTitle>
          <CardDescription>You're successfully connected</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Email:</strong> {user.email || 'Not provided'}</p>
            <p><strong>User ID:</strong> {user.userId}</p>
          </div>
          <DynamicWidget />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Connect Your Account</CardTitle>
        <CardDescription>Sign in with your social account or crypto wallet</CardDescription>
      </CardHeader>
      <CardContent>
        <DynamicWidget />
      </CardContent>
    </Card>
  );
};