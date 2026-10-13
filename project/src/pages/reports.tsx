import { useEffect, useState, useMemo } from 'react';
import { BarChart3, FileSearch, Users, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useOrganization } from '@/contexts/org-context';
import { getJobs, getCandidates, getAuditEvents } from '@/lib/services';
import type { JobWithCandidateCount, CandidateWithJob, DatabaseAuditEvent } from '@/lib/types';
import { REVIEW_STATUSES, ANALYSIS_STATUSES } from '@/lib/constants';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EmptyState, PageLoading } from '@/components/empty-states';
import { ReviewStatusBadge } from '@/components/status-badges';
import { formatRelativeTime } from '@/lib/format';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function ReportsPage() {
  const { currentOrg } = useOrganization();
  const [jobs, setJobs] = useState<JobWithCandidateCount[]>([]);
  const [candidates, setCandidates] = useState<CandidateWithJob[]>([]);
  const [auditEvents, setAuditEvents] = useState<DatabaseAuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentOrg) return;
    setLoading(true);
    Promise.all([
      getJobs(currentOrg.id),
      getCandidates(currentOrg.id),
      getAuditEvents(currentOrg.id, 20),
    ]).then(([jobsData, candData, auditData]) => {
      setJobs(jobsData);
      setCandidates(candData);
      setAuditEvents(auditData);
      setLoading(false);
    });
  }, [currentOrg]);

  const stats = useMemo(() => {
    const total = candidates.length;
    const completed = candidates.filter((c) => c.analysis_status === 'completed').length;
    const failed = candidates.filter((c) => c.analysis_status === 'failed').length;
    const byReviewStatus = REVIEW_STATUSES.map((s) => ({
      name: s.label,
      value: candidates.filter((c) => c.review_status === s.value).length,
    })).filter((s) => s.value > 0);
    const byJob = jobs
      .map((j) => ({ name: j.title.length > 20 ? j.title.slice(0, 20) + '…' : j.title, candidates: j.candidate_count ?? 0 }))
      .filter((j) => j.candidates > 0)
      .sort((a, b) => b.candidates - a.candidates)
      .slice(0, 8);
    const scoreBuckets = [
      { name: '0-25', value: candidates.filter((c) => c.match_score !== null && c.match_score < 25).length },
      { name: '25-50', value: candidates.filter((c) => c.match_score !== null && c.match_score >= 25 && c.match_score < 50).length },
      { name: '50-75', value: candidates.filter((c) => c.match_score !== null && c.match_score >= 50 && c.match_score < 75).length },
      { name: '75-100', value: candidates.filter((c) => c.match_score !== null && c.match_score >= 75).length },
    ];
    return { total, completed, failed, byReviewStatus, byJob, scoreBuckets };
  }, [candidates, jobs]);

  if (loading) {
    return <AppLayout title="Reports"><PageLoading /></AppLayout>;
  }

  if (candidates.length === 0 && jobs.length === 0) {
    return (
      <AppLayout title="Reports" breadcrumbs={[{ label: 'Reports' }]}>
        <Card className="border-dashed">
          <EmptyState
            icon={<BarChart3 className="h-6 w-6" />}
            title="No data to report yet"
            description="Once you create jobs and analyze resumes, you'll see metrics on review progress, score distributions, and job activity here."
          />
        </Card>
      </AppLayout>
    );
  }

  const metrics = [
    { label: 'Resumes Analyzed', value: stats.total, icon: FileSearch },
    { label: 'Analyses Completed', value: stats.completed, icon: CheckCircle2 },
    { label: 'Analysis Failures', value: stats.failed, icon: AlertTriangle },
    { label: 'Total Candidates', value: candidates.length, icon: Users },
  ];

  return (
    <AppLayout title="Reports" breadcrumbs={[{ label: 'Reports' }]}>
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          All metrics reflect data in the <strong>{currentOrg?.name}</strong> workspace. Time range: all-time.
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Icon className="h-4.5 w-4.5 text-muted-foreground/60" />
                </div>
                <p className="mt-3 text-2xl font-semibold tabular-nums">{m.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{m.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Score distribution */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Match Score Distribution</CardTitle>
            <CardDescription className="text-xs">How candidates are distributed across score ranges.</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.scoreBuckets.every((b) => b.value === 0) ? (
              <p className="text-sm text-muted-foreground text-center py-8">No scored candidates yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.scoreBuckets}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Review status breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Candidate Review Progress</CardTitle>
            <CardDescription className="text-xs">Candidates by current review status.</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.byReviewStatus.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No candidates yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={stats.byReviewStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={2}
                  >
                    {stats.byReviewStatus.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="mt-3 flex flex-wrap gap-3">
              {stats.byReviewStatus.map((s, i) => (
                <div key={s.name} className="flex items-center gap-1.5 text-xs">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground">{s.name}: {s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job activity */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Jobs with Most Activity</CardTitle>
          <CardDescription className="text-xs">Ranked by number of candidates analyzed.</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.byJob.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No job activity yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(200, stats.byJob.length * 40)}>
              <BarChart data={stats.byJob} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={140} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="candidates" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Recent activity log */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Recent Activity</CardTitle>
          <CardDescription className="text-xs">Audit trail of key actions in this workspace.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {auditEvents.length === 0 ? (
            <p className="px-6 py-8 text-sm text-muted-foreground text-center">No recent activity.</p>
          ) : (
            <div className="divide-y divide-border">
              {auditEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 px-6 py-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-foreground/60 shrink-0">
                    <TrendingUp className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium capitalize">
                      {event.action.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {event.entity_type} · {formatRelativeTime(event.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
