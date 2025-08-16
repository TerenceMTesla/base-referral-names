import { DynamicWidget, useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const DynamicAuth = () => {
  const { user } = useDynamicContext();

  if (user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Welcome!</CardTitle>
          <CardDescription>You're connected with Dynamic</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p><strong>Email:</strong> {user.email}</p>
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