import { useEffect, useState } from 'react';
import { UserPlus, Mail, Clock, Trash2, Users, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useOrganization } from '@/contexts/org-context';
import { getOrgMembers, getInvitations, createInvitation, revokeInvitation } from '@/lib/services';
import type { DatabaseOrgMember, DatabaseInvitation } from '@/lib/types';
import type { OrgRole } from '@/lib/constants';
import { ORG_ROLES } from '@/lib/constants';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { RoleBadge } from '@/components/status-badges';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { initials, formatRelativeTime } from '@/lib/format';
import { useToast } from '@/hooks/use-toast';

export function TeamPage() {
  const { user } = useAuth();
  const { currentOrg, currentRole } = useOrganization();
  const { toast } = useToast();
  const [members, setMembers] = useState<DatabaseOrgMember[]>([]);
  const [invitations, setInvitations] = useState<DatabaseInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<OrgRole>('recruiter');
  const [inviting, setInviting] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<DatabaseInvitation | null>(null);
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    if (!currentOrg) return;
    setLoading(true);
    Promise.all([
      getOrgMembers(currentOrg.id),
      getInvitations(currentOrg.id),
    ]).then(([membersData, invitesData]) => {
      setMembers(membersData);
      setInvitations(invitesData);
      setLoading(false);
    });
  }, [currentOrg]);

  const canManage = currentRole === 'owner' || currentRole === 'admin';

  const handleInvite = async () => {
    if (!currentOrg || !user || !inviteEmail.trim()) return;
    setInviting(true);
    const { data, error } = await createInvitation(currentOrg.id, user.id, inviteEmail.trim(), inviteRole);
    setInviting(false);
    if (error) {
      toast({ variant: 'destructive', title: 'Failed to send invitation', description: error });
    } else {
      setInvitations([data!, ...invitations]);
      setInviteEmail('');
      toast({ title: 'Invitation sent', description: `An invitation has been sent to ${inviteEmail}.` });
    }
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    setRevoking(true);
    const { error } = await revokeInvitation(revokeTarget.id);
    setRevoking(false);
    if (error) {
      toast({ variant: 'destructive', title: 'Failed to revoke invitation', description: error });
    } else {
      setInvitations(invitations.filter((i) => i.id !== revokeTarget.id));
      toast({ title: 'Invitation revoked' });
      setRevokeTarget(null);
    }
  };

  return (
    <AppLayout title="Team & Access" breadcrumbs={[{ label: 'Team & Access' }]}>
      <div className="space-y-6">
        {/* Members */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" /> Team Members ({members.length})
            </CardTitle>
            <CardDescription>People with access to this workspace.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <p className="px-6 py-8 text-sm text-muted-foreground text-center">Loading…</p>
            ) : (
              <div className="divide-y divide-border">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 px-6 py-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
                        {member.user_id === user?.id ? 'You' : '··'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {member.user_id === user?.id ? `${user.email?.split('@')[0]} (you)` : 'Team member'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Joined {formatRelativeTime(member.created_at)}
                      </p>
                    </div>
                    <RoleBadge role={member.role} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invitations */}
        {canManage && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <UserPlus className="h-4 w-4" /> Invite People
                </CardTitle>
                <CardDescription>Send invitations to join this workspace.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 space-y-1.5">
                    <Label htmlFor="invite-email" className="sr-only">Email address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                      <Input
                        id="invite-email"
                        type="email"
                        placeholder="colleague@company.com"
                        className="pl-9"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="w-full sm:w-[180px] space-y-1.5">
                    <Label className="sr-only">Role</Label>
                    <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as OrgRole)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ORG_ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleInvite} disabled={inviting || !inviteEmail.trim()}>
                    {inviting ? 'Sending…' : 'Send invite'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pending invitations */}
            {invitations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Pending Invitations</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {invitations.map((inv) => (
                      <div key={inv.id} className="flex items-center gap-3 px-6 py-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-warning/10 text-warning">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{inv.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Invited as {ORG_ROLES.find((r) => r.value === inv.role)?.label} · {formatRelativeTime(inv.created_at)}
                          </p>
                        </div>
                        <RoleBadge role={inv.role} />
                        {inv.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setRevokeTarget(inv)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Roles info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" /> Roles & Permissions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ORG_ROLES.map((role) => (
              <div key={role.value} className="flex items-start gap-3">
                <RoleBadge role={role.value} className="mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  {role.value === 'owner' && 'Full access including deleting the workspace and managing all members.'}
                  {role.value === 'admin' && 'Can manage members, invitations, and all workspace data.'}
                  {role.value === 'recruiter' && 'Can create and edit jobs, analyze resumes, and manage candidates.'}
                  {role.value === 'reviewer' && 'Read-only access to view candidates and add notes. Cannot create or delete data.'}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {!canManage && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Only workspace owners and administrators can manage team members and send invitations.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Revoke confirmation */}
      <AlertDialog open={!!revokeTarget} onOpenChange={(open) => !open && setRevokeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke invitation?</AlertDialogTitle>
            <AlertDialogDescription>
              The invitation to {revokeTarget?.email} will be revoked. They will not be able to join the workspace with this invitation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevoke} disabled={revoking}>
              {revoking ? 'Revoking…' : 'Revoke'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
