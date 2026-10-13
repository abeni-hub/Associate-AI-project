import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, Briefcase, GraduationCap, Award, FileText,
  CheckCircle2, XCircle, AlertCircle, Clock, Trash2, Send,
  Loader2, Info, FolderGit2,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useOrganization } from '@/contexts/org-context';
import {
  getCandidate, getCandidateNotes, addCandidateNote, deleteCandidateNote,
  updateCandidateReviewStatus, logAuditEvent,
} from '@/lib/services';
import type { CandidateWithJob, DatabaseCandidateNote } from '@/lib/types';
import type { ReviewStatus } from '@/lib/constants';
import { REVIEW_STATUSES } from '@/lib/constants';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { PageLoading } from '@/components/empty-states';
import { ReviewStatusBadge, AnalysisStatusBadge } from '@/components/status-badges';
import { ScoreRing, ScoreBar } from '@/components/score-display';
import { formatDate, formatRelativeTime, initials } from '@/lib/format';
import { useToast } from '@/hooks/use-toast';

export function CandidateDetailPage() {
  const { candidateId } = useParams<{ candidateId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentOrg } = useOrganization();
  const { toast } = useToast();
  const [candidate, setCandidate] = useState<CandidateWithJob | null>(null);
  const [notes, setNotes] = useState<DatabaseCandidateNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    if (!candidateId) return;
    Promise.all([
      getCandidate(candidateId),
      getCandidateNotes(candidateId),
    ]).then(([candData, notesData]) => {
      setCandidate(candData);
      setNotes(notesData);
      setLoading(false);
    });
  }, [candidateId]);

  const handleStatusChange = async (status: ReviewStatus) => {
    if (!candidate || !currentOrg || !user) return;
    setStatusUpdating(true);
    const { error } = await updateCandidateReviewStatus(candidate.id, status);
    setStatusUpdating(false);
    if (error) {
      toast({ variant: 'destructive', title: 'Failed to update status', description: error });
    } else {
      setCandidate({ ...candidate, review_status: status });
      await logAuditEvent(currentOrg.id, user.id, 'review_status_changed', 'candidate', candidate.id, {
        from: candidate.review_status,
        to: status,
      });
      toast({ title: 'Status updated', description: `Candidate marked as "${REVIEW_STATUSES.find((s) => s.value === status)?.label}".` });
    }
  };

  const handleAddNote = async () => {
    if (!candidate || !currentOrg || !user || !newNote.trim()) return;
    setSavingNote(true);
    const { data, error } = await addCandidateNote(candidate.id, currentOrg.id, user.id, newNote.trim());
    setSavingNote(false);
    if (error) {
      toast({ variant: 'destructive', title: 'Failed to add note', description: error });
    } else {
      setNotes([data!, ...notes]);
      setNewNote('');
      toast({ title: 'Note added' });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    const { error } = await deleteCandidateNote(noteId);
    if (error) {
      toast({ variant: 'destructive', title: 'Failed to delete note', description: error });
    } else {
      setNotes(notes.filter((n) => n.id !== noteId));
    }
  };

  if (loading) {
    return <AppLayout title="Candidate"><PageLoading /></AppLayout>;
  }

  if (!candidate) {
    return (
      <AppLayout title="Not Found" breadcrumbs={[{ label: 'Candidates', to: '/candidates' }, { label: 'Not Found' }]}>
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Candidate not found or you may not have access.</p>
            <Button className="mt-4" onClick={() => navigate('/candidates')}>Back to candidates</Button>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  const breadcrumbs = [
    { label: 'Candidates', to: '/candidates' },
    { label: candidate.name },
  ];

  return (
    <AppLayout
      title={candidate.name}
      breadcrumbs={breadcrumbs}
      actions={
        <Button variant="ghost" size="sm" onClick={() => navigate('/candidates')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-accent text-accent-foreground text-lg font-semibold">
                    {initials(candidate.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold">{candidate.name}</h2>
                  {candidate.current_title && (
                    <p className="text-sm text-muted-foreground mt-0.5">{candidate.current_title}</p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    {candidate.email && <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {candidate.email}</span>}
                    {candidate.phone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {candidate.phone}</span>}
                    {candidate.experience_years !== null && <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> {candidate.experience_years} years exp.</span>}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <ReviewStatusBadge status={candidate.review_status} />
                    <AnalysisStatusBadge status={candidate.analysis_status} />
                    {candidate.job && (
                      <Link to={`/jobs/${candidate.job.id}`} className="text-xs text-primary hover:underline">
                        {candidate.job.title}
                      </Link>
                    )}
                  </div>
                </div>
                <ScoreRing score={candidate.match_score} size={56} showLabel />
              </div>

              {candidate.summary && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h3 className="text-sm font-semibold mb-1.5">Summary</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{candidate.summary}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Skills */}
          {candidate.skills && candidate.skills.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Award className="h-4 w-4" /> Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills.map((skill, i) => {
                    const isMatched = candidate.matched_skills?.some((ms) => (typeof ms === 'string' ? ms === skill : ms.skill === skill));
                    const isMissing = candidate.missing_skills?.includes(skill);
                    return (
                      <span
                        key={`${skill}-${i}`}
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${
                          isMatched ? 'border-success/20 bg-success/10 text-success' :
                          isMissing ? 'border-destructive/20 bg-destructive/10 text-destructive' :
                          'border-border bg-muted text-muted-foreground'
                        }`}
                      >
                        {isMatched && <CheckCircle2 className="h-3 w-3" />}
                        {isMissing && <XCircle className="h-3 w-3" />}
                        {skill}
                      </span>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Match evidence */}
          {candidate.match_evidence && candidate.match_evidence.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Match Evidence
                </CardTitle>
                <CardDescription className="text-xs">
                  How the AI assessed this candidate against job requirements. These are decision-support signals, not guarantees of job performance.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {candidate.match_evidence.map((evidence, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-md border border-border p-3">
                    {evidence.status === 'matched' ? (
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    ) : evidence.status === 'partial' ? (
                      <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{evidence.requirement}</p>
                      {evidence.evidence && <p className="text-xs text-muted-foreground mt-1">{evidence.evidence}</p>}
                      {evidence.detail && <p className="text-xs text-muted-foreground mt-0.5">{evidence.detail}</p>}
                    </div>
                    <span className={`text-xs font-medium shrink-0 ${
                      evidence.status === 'matched' ? 'text-success' :
                      evidence.status === 'partial' ? 'text-warning' : 'text-destructive'
                    }`}>
                      {evidence.status === 'matched' ? 'Matched' : evidence.status === 'partial' ? 'Partial' : 'Missing'}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Education */}
          {candidate.education && candidate.education.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" /> Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {candidate.education.map((edu, i) => (
                  <div key={i} className="text-sm">
                    <p className="font-medium">{edu.degree || 'Degree'}{edu.field ? ` in ${edu.field}` : ''}</p>
                    <p className="text-muted-foreground">{edu.institution || '—'}{edu.year ? ` · ${edu.year}` : ''}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Projects */}
          {candidate.projects && candidate.projects.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FolderGit2 className="h-4 w-4" /> Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {candidate.projects.map((proj, i) => (
                  <div key={i} className="text-sm">
                    <p className="font-medium">{proj.name || 'Project'}</p>
                    {proj.description && <p className="text-muted-foreground mt-0.5">{proj.description}</p>}
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {proj.technologies.map((tech) => (
                          <span key={tech} className="text-xs bg-muted px-1.5 py-0.5 rounded">{tech}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Review status control */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Review Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                value={candidate.review_status}
                onValueChange={(v) => handleStatusChange(v as ReviewStatus)}
                disabled={statusUpdating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REVIEW_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Changes are saved immediately to the server. AI scores do not automatically change this status.
              </p>
            </CardContent>
          </Card>

          {/* Score breakdown */}
          {candidate.match_score !== null && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Match Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-3">
                  <ScoreRing score={candidate.match_score} size={48} />
                  <div>
                    <p className="text-2xl font-semibold tabular-nums">{Math.round(candidate.match_score)}</p>
                    <p className="text-xs text-muted-foreground">out of 100</p>
                  </div>
                </div>
                <ScoreBar score={candidate.match_score} />
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-success">
                    <CheckCircle2 className="h-3 w-3" /> {candidate.matched_skills?.length ?? 0} matched
                  </span>
                  <span className="flex items-center gap-1 text-destructive">
                    <XCircle className="h-3 w-3" /> {candidate.missing_skills?.length ?? 0} missing
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardContent className="p-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Analyzed</span>
                <span>{formatDate(candidate.created_at)}</span>
              </div>
              {candidate.resume_filename && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> Resume</span>
                  <span className="truncate ml-2 max-w-[140px]">{candidate.resume_filename}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Recruiter Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add an internal note…"
                  rows={2}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="text-sm"
                />
              </div>
              <Button size="sm" className="w-full" onClick={handleAddNote} disabled={savingNote || !newNote.trim()}>
                {savingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="mr-2 h-3.5 w-3.5" /> Add note</>}
              </Button>

              <Separator />

              {notes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">No notes yet.</p>
              ) : (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div key={note.id} className="group rounded-md border border-border p-3">
                      <p className="text-sm">{note.content}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{formatRelativeTime(note.created_at)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI disclaimer */}
          <div className="rounded-lg border border-info/20 bg-info/5 p-4">
            <div className="flex gap-2.5">
              <Info className="h-4 w-4 text-info shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Analysis is AI-generated and may contain errors. Verify critical qualifications independently. Final hiring decisions should be made by authorized human reviewers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
