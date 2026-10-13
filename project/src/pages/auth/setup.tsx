import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { createOrganization } from '@/lib/services';
import { AuthShell } from './auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Building2, AlertCircle } from 'lucide-react';

export function WorkspaceSetupPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('You must be signed in to create a workspace.');
      return;
    }

    setLoading(true);
    const { error } = await createOrganization(orgName, user.id);
    setLoading(false);

    if (error) {
      setError(error);
    } else {
      navigate('/overview', { replace: true });
    }
  };

  return (
    <AuthShell>
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight">Set up your workspace</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your workspace is a private space for your company to manage jobs and candidates.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="orgName">Company name</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input
              id="orgName"
              placeholder="Acme Corporation"
              className="pl-9"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <p className="text-xs text-muted-foreground">You can change this later in settings.</p>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create workspace'}
        </Button>
      </form>
    </AuthShell>
  );
}
