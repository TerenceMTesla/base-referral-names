import { DynamicAuth } from '@/components/DynamicAuth';

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">Referral Reward Subnames</h1>
          <p className="text-xl text-muted-foreground">Connect with social login to get started</p>
        </div>
        <DynamicAuth />
      </div>
    </div>
  );
};

export default Index;
