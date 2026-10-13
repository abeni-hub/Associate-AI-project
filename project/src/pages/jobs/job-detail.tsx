import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Pencil, FileSearch, Users, MapPin, Briefcase, Calendar, Clock,
  CheckCircle2, XCircle, AlertCircle, Plus,
} from 'lucide-react';
import { useOrganization } from '@/contexts/org-context';
import { getJob, getCandidatesForJob } from '@/lib/services';
import type { DatabaseJob, DatabaseCandidate } from '@/lib/types';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PageLoading, EmptyState } from '@/components/empty-states';
import { JobStatusBadge, EmploymentTypeBadge, ReviewStatusBadge } from '@/components/status-badges';
import { ScoreRing } from '@/components/score-display';
import { formatDate } from '@/lib/format';

export function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { currentOrg } = useOrganization();
  const [job, setJob] = useState<DatabaseJob | null>(null);
  const [candidates, setCandidates] = useState<DatabaseCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) return;
    Promise.all([getJob(jobId), getCandidatesForJob(jobId)]).then(([jobData, candidatesData]) => {
      setJob(jobData);
      setCandidates(candidatesData);
      setLoading(false);
    });
  }, [jobId]);

  if (loading) {
    return <AppLayout title="Job Details"><PageLoading /></AppLayout>;
  }

  if (!job) {
    return (
      <AppLayout title="Job Not Found" breadcrumbs={[{ label: 'Jobs', to: '/jobs' }, { label: 'Not Found' }]}>
        <Card className="border-dashed">
          <EmptyState
            icon={<Briefcase className="h-6 w-6" />}
            title="Job not found"
            description="This job may have been deleted or you may not have access to it."
            action={<Button onClick={() => navigate('/jobs')}>Back to jobs</Button>}
          />
        </Card>
      </AppLayout>
    );
  }

  const breadcrumbs = [
    { label: 'Jobs', to: '/jobs' },
    { label: job.title },
  ];

  return (
    <AppLayout
      title={job.title}
      breadcrumbs={breadcrumbs}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/jobs/${job.id}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button size="sm" onClick={() => navigate(`/analysis?jobId=${job.id}`)}>
            <FileSearch className="mr-2 h-4 w-4" /> Analyze
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Job header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">{job.title}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> {job.department}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
                  <EmploymentTypeBadge type={job.employment_type} />
                  <JobStatusBadge status={job.status} />
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Created {formatDate(job.created_at)}</span>
                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Updated {formatDate(job.updated_at)}</span>
              </div>
            </div>

            {job.description && (
              <>
                <Separator className="my-4" />
                <div>
                  <h3 className="text-sm font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{job.description}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Requirements grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Required skills */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" /> Required Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              {job.required_skills && job.required_skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {job.required_skills.map((skill) => (
                    <span key={skill} className="inline-flex items-center rounded-md border border-success/20 bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No required skills specified.</p>
              )}
            </CardContent>
          </Card>

          {/* Preferred skills */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Plus className="h-4 w-4 text-info" /> Preferred Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              {job.preferred_skills && job.preferred_skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {job.preferred_skills.map((skill) => (
                    <span key={skill} className="inline-flex items-center rounded-md border border-info/20 bg-info/10 px-2 py-0.5 text-xs font-medium text-info">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No preferred skills specified.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Other requirements */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Min. Experience</p>
              <p className="text-sm font-medium">{job.min_experience_years !== null ? `${job.min_experience_years} years` : 'Not specified'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Education</p>
              <p className="text-sm font-medium">{job.education_requirements || 'Not specified'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Evaluation Criteria</p>
              <p className="text-sm font-medium line-clamp-2">{job.evaluation_criteria || 'None specified'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Candidates */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" /> Candidates ({candidates.length})
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => navigate(`/analysis?jobId=${job.id}`)}>
                <FileSearch className="mr-2 h-4 w-4" /> Analyze resumes
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {candidates.length === 0 ? (
              <EmptyState
                icon={<Users className="h-6 w-6" />}
                title="No candidates yet"
                description="Upload resumes and run an analysis to see ranked candidates for this job."
                action={<Button size="sm" onClick={() => navigate(`/analysis?jobId=${job.id}`)}>
                  <FileSearch className="mr-2 h-4 w-4" /> Analyze resumes
                </Button>}
              />
            ) : (
              <div className="divide-y divide-border">
                {candidates.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => navigate(`/candidates/${c.id}`)}
                    className="flex items-center justify-between w-full px-6 py-3 hover:bg-muted/40 transition-colors text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {c.current_title || '—'} · {c.skills.length} skills
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <ScoreRing score={c.match_score} size={32} />
                      <ReviewStatusBadge status={c.review_status} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
