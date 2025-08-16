import { DynamicAuth } from '@/components/DynamicAuth';
import { Dashboard } from '@/components/Dashboard';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading application...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Dashboard />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">Referral Reward Subnames</h1>
          <p className="text-xl text-muted-foreground mb-2">
            Earn ENS subnames as NFT rewards for referring new users
          </p>
          <p className="text-muted-foreground">
            Connect with your social account or crypto wallet to get started
          </p>
        </div>
        <DynamicAuth />
      </div>
    </div>
  );
};

export default Index;
