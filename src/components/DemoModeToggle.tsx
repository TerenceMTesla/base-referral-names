import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface DemoModeToggleProps {
  isDemoMode: boolean;
  onToggle: (enabled: boolean) => void;
}

export const DemoModeToggle = ({ isDemoMode, onToggle }: DemoModeToggleProps) => {
  return (
    <Card className="p-4 mb-6 border-accent bg-accent/10">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="demo-mode" className="text-base font-medium">
            Demo Mode
          </Label>
          <p className="text-sm text-muted-foreground">
            {isDemoMode ? 'Viewing dashboard with sample data' : 'Authentication required to view dashboard'}
          </p>
        </div>
        <Switch
          id="demo-mode"
          checked={isDemoMode}
          onCheckedChange={onToggle}
        />
      </div>
    </Card>
  );
};