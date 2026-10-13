import { useState } from 'react';
import { Building2, User, Lock, Database, Info, Save, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useOrganization } from '@/contexts/org-context';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RoleBadge } from '@/components/status-badges';

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const { currentOrg, currentRole } = useOrganization();
  const [saving, setSaving] = useState(false);

  return (
    <AppLayout title="Settings" breadcrumbs={[{ label: 'Settings' }]}>
      <Tabs defaultValue="workspace" className="space-y-6">
        <TabsList>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="data">Data & Privacy</TabsTrigger>
          <TabsTrigger value="ai">AI Processing</TabsTrigger>
        </TabsList>

        {/* Workspace settings */}
        <TabsContent value="workspace" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Workspace Profile
              </CardTitle>
              <CardDescription>Manage your company workspace details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-lg">
              <div className="space-y-1.5">
                <Label htmlFor="org-name">Workspace name</Label>
                <Input id="org-name" defaultValue={currentOrg?.name} disabled={currentRole === 'reviewer'} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="org-slug">URL identifier</Label>
                <Input id="org-slug" defaultValue={currentOrg?.slug} disabled className="font-mono text-sm" />
                <p className="text-xs text-muted-foreground">This identifier is used internally and cannot be changed.</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="org-desc">Description</Label>
                <Textarea id="org-desc" rows={3} placeholder="A brief description of your organization…" defaultValue={currentOrg?.description || ''} disabled={currentRole === 'reviewer'} />
              </div>
              {currentRole && currentRole !== 'reviewer' ? (
                <Button onClick={() => setSaving(true)} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" /> {saving ? 'Saving…' : 'Save changes'}
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">Read-only reviewers cannot edit workspace settings.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {currentRole && <RoleBadge role={currentRole} />}
                <span className="text-sm text-muted-foreground">
                  {currentRole === 'owner' && 'You have full control over this workspace.'}
                  {currentRole === 'admin' && 'You can manage members and all workspace data.'}
                  {currentRole === 'recruiter' && 'You can create jobs, analyze resumes, and manage candidates.'}
                  {currentRole === 'reviewer' && 'You have read-only access to review candidates.'}
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" /> Account Profile
              </CardTitle>
              <CardDescription>Your personal account information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-lg">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" value={user?.email || ''} disabled className="bg-muted/50" />
                <p className="text-xs text-muted-foreground">Your email is managed by your authentication provider.</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="name">Display name</Label>
                <Input id="name" placeholder="Add your name" />
              </div>
              <Button onClick={() => setSaving(true)} disabled={saving}>
                <Save className="mr-2 h-4 w-4" /> {saving ? 'Saving…' : 'Save profile'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="h-4 w-4" /> Security
              </CardTitle>
              <CardDescription>Manage your password and session.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-lg">
              <div className="space-y-1.5">
                <Label htmlFor="current-password">Current password</Label>
                <Input id="current-password" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-password">New password</Label>
                <Input id="new-password" type="password" placeholder="At least 8 characters" />
              </div>
              <Button onClick={() => setSaving(true)} disabled={saving}>
                <Save className="mr-2 h-4 w-4" /> Update password
              </Button>
              <Separator />
              <div>
                <Button variant="outline" onClick={signOut}>Sign out of all sessions</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data & Privacy */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="h-4 w-4" /> Data Retention & Deletion
              </CardTitle>
              <CardDescription>Control how long candidate data is retained.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-lg">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Data retention policies require backend configuration. The settings below show the intended controls — changes are not yet persisted.
                </AlertDescription>
              </Alert>
              <div className="space-y-1.5">
                <Label htmlFor="retention">Retention period for analyzed resumes</Label>
                <Input id="retention" defaultValue="180 days" disabled />
                <p className="text-xs text-muted-foreground">Resumes and analysis results will be automatically deleted after this period.</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-1">Delete all candidate data</p>
                <p className="text-xs text-muted-foreground mb-3">Permanently delete all candidates, notes, and analysis results in this workspace.</p>
                <Button variant="destructive" disabled>Request data deletion</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Processing */}
        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4" /> AI Processing Disclosure
              </CardTitle>
              <CardDescription>How AI is used in this platform and your privacy rights.</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-3">
              <div>
                <h4 className="text-sm font-semibold">What AI does</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  This platform uses AI to extract structured information from uploaded resumes (skills, experience, education) and compare them against job requirements. The AI generates match scores and evidence summaries to support recruiter decision-making.
                </p>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold">What AI does not do</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  The AI does not make hiring or rejection decisions. It does not infer protected characteristics (race, gender, age, disability, etc.) or use them in scoring. Final decisions are always made by authorized human reviewers.
                </p>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold">Data handling</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Resume files are processed by the AI analysis service and stored in your workspace. They are not shared with other organizations or used to train AI models. Resume files are not publicly accessible.
                </p>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold">Score limitations</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Match scores are decision-support signals based on how well a resume's stated qualifications align with job requirements. They are not measures of a candidate's worth, potential, or guaranteed job performance. Scores should be considered alongside human judgment and additional evaluation.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
