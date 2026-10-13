import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  FileSearch,
  ClipboardList,
  Plus,
  ArrowRight,
  Inbox,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useOrganization } from '@/contexts/org-context';
import { getDashboardStats, getJobs, getCandidates } from '@/lib/services';
import type { JobWithCandidateCount, CandidateWithJob } from '@/lib/types';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState, PageLoading } from '@/components/empty-states';
import { JobStatusBadge, ReviewStatusBadge } from '@/components/status-badges';
import { ScoreRing } from '@/components/score-display';
import { formatRelativeTime } from '@/lib/format';
import { cn } from '@/lib/utils';

interface Stats {
  activeJobs: number;
  candidatesUnderReview: number;
  analysesCompleted: number;
  pendingReviews: number;
}

export function OverviewPage() {
  const { user } = useAuth();
  const { currentOrg } = useOrganization();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [jobs, setJobs] = useState<JobWithCandidateCount[]>([]);
  const [candidates, setCandidates] = useState<CandidateWithJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentOrg) return;
    setLoading(true);
    Promise.all([
      getDashboardStats(currentOrg.id),
      getJobs(currentOrg.id),
      getCandidates(currentOrg.id),
    ]).then(([statsData, jobsData, candidatesData]) => {
      setStats(statsData);
      setJobs(jobsData.slice(0, 5));
      setCandidates(candidatesData.slice(0, 6));
      setLoading(false);
    });
  }, [currentOrg]);

  if (loading) {
    return (
      <AppLayout title="Overview">
        <PageLoading />
      </AppLayout>
    );
  }

  const isEmpty = jobs.length === 0 && candidates.length === 0;

  const metrics = [
    { label: 'Active Jobs', value: stats?.activeJobs ?? 0, icon: Briefcase, to: '/jobs', color: 'text-primary' },
    { label: 'Under Review', value: stats?.candidatesUnderReview ?? 0, icon: Users, to: '/candidates', color: 'text-info' },
    { label: 'Analyses Done', value: stats?.analysesCompleted ?? 0, icon: FileSearch, to: '/analysis', color: 'text-success' },
    { label: 'Pending Reviews', value: stats?.pendingReviews ?? 0, icon: ClipboardList, to: '/candidates', color: 'text-warning' },
  ];

  return (
    <AppLayout
      title="Overview"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/analysis')}>
            <FileSearch className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Analyze Resumes</span>
          </Button>
          <Button size="sm" onClick={() => navigate('/jobs/new')}>
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Create Job</span>
          </Button>
        </div>
      }
    >
      {/* Welcome */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight">
          Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {currentOrg?.name} workspace
        </p>
      </div>

      {isEmpty ? (
        <Card className="border-dashed">
          <EmptyState
            icon={<Inbox className="h-6 w-6" />}
            title="Get started with your first job"
            description="Create a job opening to define what you're hiring for, then upload resumes to analyze and rank candidates."
            action={
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={() => navigate('/jobs/new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first job
                </Button>
                <Button variant="outline" onClick={() => navigate('/analysis')}>
                  <FileSearch className="mr-2 h-4 w-4" />
                  Analyze resumes
                </Button>
              </div>
            }
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {metrics.map((m) => {
              const Icon = m.icon;
              return (
                <Link
                  key={m.label}
                  to={m.to}
                  className="group rounded-lg border border-border bg-card p-4 transition-all hover:shadow-sm hover:border-primary/20"
                >
                  <div className="flex items-center justify-between">
                    <div className={cn('flex h-9 w-9 items-center justify-center rounded-md bg-accent', m.color)}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                  </div>
                  <p className="mt-3 text-2xl font-semibold tabular-nums">{m.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.label}</p>
                </Link>
              );
            })}
          </div>

          {/* Recent jobs + candidates */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent jobs */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Recent Jobs</CardTitle>
                  <Link to="/jobs" className="text-xs text-primary hover:underline">View all</Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {jobs.length === 0 ? (
                  <p className="px-6 py-8 text-sm text-muted-foreground text-center">No jobs yet.</p>
                ) : (
                  <div className="divide-y divide-border">
                    {jobs.map((job) => (
                      <Link
                        key={job.id}
                        to={`/jobs/${job.id}`}
                        className="flex items-center justify-between px-6 py-3 hover:bg-muted/40 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{job.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {job.department} · {formatRelativeTime(job.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-muted-foreground tabular-nums">{job.candidate_count ?? 0}</span>
                          <JobStatusBadge status={job.status} />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent candidates */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Recent Candidates</CardTitle>
                  <Link to="/candidates" className="text-xs text-primary hover:underline">View all</Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {candidates.length === 0 ? (
                  <p className="px-6 py-8 text-sm text-muted-foreground text-center">No candidates yet.</p>
                ) : (
                  <div className="divide-y divide-border">
                    {candidates.map((c) => (
                      <Link
                        key={c.id}
                        to={`/candidates/${c.id}`}
                        className="flex items-center justify-between px-6 py-3 hover:bg-muted/40 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {c.current_title || '—'} · {c.job?.title || '—'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <ScoreRing score={c.match_score} size={32} />
                          <ReviewStatusBadge status={c.review_status} />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
