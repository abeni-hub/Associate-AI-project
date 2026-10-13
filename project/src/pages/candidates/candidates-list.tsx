import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, Users, ArrowUpDown, X, GitCompare, ChevronRight,
} from 'lucide-react';
import { useOrganization } from '@/contexts/org-context';
import { getCandidates, getJobs } from '@/lib/services';
import type { CandidateWithJob, JobWithCandidateCount } from '@/lib/types';
import type { ReviewStatus } from '@/lib/constants';
import { REVIEW_STATUSES } from '@/lib/constants';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import { EmptyState, TableLoading } from '@/components/empty-states';
import { ReviewStatusBadge, AnalysisStatusBadge } from '@/components/status-badges';
import { ScoreRing } from '@/components/score-display';
import { formatDate, truncate } from '@/lib/format';
import { cn } from '@/lib/utils';

type SortField = 'name' | 'match_score' | 'created_at';

export function CandidatesListPage() {
  const { currentOrg } = useOrganization();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [candidates, setCandidates] = useState<CandidateWithJob[]>([]);
  const [jobs, setJobs] = useState<JobWithCandidateCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [jobFilter, setJobFilter] = useState<string>(searchParams.get('jobId') || 'all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [compareOpen, setCompareOpen] = useState(false);

  useEffect(() => {
    if (!currentOrg) return;
    setLoading(true);
    Promise.all([
      getCandidates(currentOrg.id),
      getJobs(currentOrg.id),
    ]).then(([candData, jobData]) => {
      setCandidates(candData);
      setJobs(jobData);
      setLoading(false);
    });
  }, [currentOrg]);

  const filtered = useMemo(() => {
    let result = candidates;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (c) => c.name.toLowerCase().includes(s) || c.current_title?.toLowerCase().includes(s) || c.email?.toLowerCase().includes(s),
      );
    }
    if (jobFilter !== 'all') {
      result = result.filter((c) => c.job_id === jobFilter);
    }
    if (statusFilter !== 'all') {
      result = result.filter((c) => c.review_status === statusFilter);
    }
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortField === 'match_score') cmp = (a.match_score ?? -1) - (b.match_score ?? -1);
      else cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [candidates, search, jobFilter, statusFilter, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 4) next.add(id);
      return next;
    });
  };

  const selectedCandidates = filtered.filter((c) => selected.has(c.id));
  const jobName = (jobId: string) => jobs.find((j) => j.id === jobId)?.title || '—';

  return (
    <AppLayout
      title="Candidates"
      breadcrumbs={[{ label: 'Candidates' }]}
      actions={
        selected.size >= 2 ? (
          <Button size="sm" onClick={() => setCompareOpen(true)}>
            <GitCompare className="mr-2 h-4 w-4" />
            Compare ({selected.size})
          </Button>
        ) : undefined
      }
    >
      {/* Filters */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
          <Input
            placeholder="Search by name, title, or email…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={jobFilter} onValueChange={setJobFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All jobs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All jobs</SelectItem>
            {jobs.map((j) => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Review status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {REVIEW_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Selection hint */}
      {selected.size > 0 && selected.size < 2 && (
        <p className="mb-3 text-sm text-muted-foreground">
          Select at least 2 candidates to compare them side by side. ({selected.size}/4 selected)
        </p>
      )}

      {/* Table */}
      {loading ? (
        <Card><TableLoading /></Card>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title={candidates.length === 0 ? "No candidates yet" : "No matching candidates"}
            description={candidates.length === 0 ? "Run a resume analysis to see ranked candidates here." : "Try adjusting your search or filters."}
            action={candidates.length === 0 ? (
              <Button onClick={() => navigate('/analysis')}>Analyze resumes</Button>
            ) : undefined}
          />
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4 w-10">
                  <Checkbox
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelected(new Set(filtered.slice(0, 4).map((c) => c.id)));
                      } else {
                        setSelected(new Set());
                      }
                    }}
                  />
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-1 font-medium hover:text-foreground" onClick={() => toggleSort('name')}>
                    Candidate <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead className="hidden md:table-cell">Current Title</TableHead>
                <TableHead className="hidden lg:table-cell">Job</TableHead>
                <TableHead className="text-center">
                  <button className="flex items-center gap-1 font-medium hover:text-foreground mx-auto" onClick={() => toggleSort('match_score')}>
                    Score <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead className="hidden md:table-cell">Skills Matched</TableHead>
                <TableHead>Review</TableHead>
                <TableHead className="hidden lg:table-cell">
                  <button className="flex items-center gap-1 font-medium hover:text-foreground" onClick={() => toggleSort('created_at')}>
                    Analyzed <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead className="pr-4 w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow
                  key={c.id}
                  className={cn('cursor-pointer', selected.has(c.id) && 'bg-accent/50')}
                  onClick={() => navigate(`/candidates/${c.id}`)}
                >
                  <TableCell className="pl-4" onClick={(e) => { e.stopPropagation(); toggleSelect(c.id); }}>
                    <Checkbox checked={selected.has(c.id)} />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{c.name}</div>
                    {c.email && <div className="text-xs text-muted-foreground">{c.email}</div>}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{c.current_title || '—'}</TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">{c.job?.title || '—'}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center"><ScoreRing score={c.match_score} size={36} /></div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="text-success font-medium tabular-nums">{c.matched_skills?.length ?? 0}</span>
                      <span>/</span>
                      <span className="text-destructive/70 tabular-nums">{c.missing_skills?.length ?? 0}</span>
                    </div>
                  </TableCell>
                  <TableCell><ReviewStatusBadge status={c.review_status} /></TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">{formatDate(c.created_at)}</TableCell>
                  <TableCell className="pr-4">
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Comparison sheet */}
      <Sheet open={compareOpen} onOpenChange={setCompareOpen}>
        <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto scrollbar-thin">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <GitCompare className="h-4 w-4" /> Compare Candidates
            </SheetTitle>
            <SheetDescription>
              Side-by-side comparison of {selectedCandidates.length} candidates. Scores are AI-generated decision-support signals, not measures of candidate quality.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <tbody>
                {/* Name row */}
                <tr className="border-b">
                  <td className="py-3 pr-4 font-medium text-muted-foreground text-xs uppercase tracking-wide w-32">Name</td>
                  {selectedCandidates.map((c) => (
                    <td key={c.id} className="py-3 px-4 font-semibold align-top">
                      <button onClick={() => { navigate(`/candidates/${c.id}`); setCompareOpen(false); }} className="text-left hover:text-primary">
                        {c.name}
                      </button>
                    </td>
                  ))}
                </tr>
                {/* Score row */}
                <tr className="border-b">
                  <td className="py-3 pr-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Match Score</td>
                  {selectedCandidates.map((c) => (
                    <td key={c.id} className="py-3 px-4 align-top">
                      <div className="flex items-center gap-2">
                        <ScoreRing score={c.match_score} size={32} />
                        <span className="font-semibold tabular-nums">{c.match_score !== null ? Math.round(c.match_score) : '—'}</span>
                      </div>
                    </td>
                  ))}
                </tr>
                {/* Title row */}
                <tr className="border-b">
                  <td className="py-3 pr-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Title</td>
                  {selectedCandidates.map((c) => (
                    <td key={c.id} className="py-3 px-4 text-muted-foreground align-top">{c.current_title || '—'}</td>
                  ))}
                </tr>
                {/* Job row */}
                <tr className="border-b">
                  <td className="py-3 pr-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Job</td>
                  {selectedCandidates.map((c) => (
                    <td key={c.id} className="py-3 px-4 text-muted-foreground align-top">{c.job?.title || '—'}</td>
                  ))}
                </tr>
                {/* Experience row */}
                <tr className="border-b">
                  <td className="py-3 pr-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Experience</td>
                  {selectedCandidates.map((c) => (
                    <td key={c.id} className="py-3 px-4 text-muted-foreground align-top">{c.experience_years !== null ? `${c.experience_years} years` : '—'}</td>
                  ))}
                </tr>
                {/* Skills row */}
                <tr className="border-b">
                  <td className="py-3 pr-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Skills</td>
                  {selectedCandidates.map((c) => (
                    <td key={c.id} className="py-3 px-4 align-top">
                      <div className="flex flex-wrap gap-1">
                        {(c.skills || []).slice(0, 8).map((s) => (
                          <span key={s} className="text-xs bg-muted px-1.5 py-0.5 rounded">{s}</span>
                        ))}
                        {c.skills.length > 8 && <span className="text-xs text-muted-foreground">+{c.skills.length - 8}</span>}
                      </div>
                    </td>
                  ))}
                </tr>
                {/* Matched skills row */}
                <tr className="border-b">
                  <td className="py-3 pr-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Matched</td>
                  {selectedCandidates.map((c) => (
                    <td key={c.id} className="py-3 px-4 align-top">
                      <div className="flex flex-wrap gap-1">
                        {(c.matched_skills || []).slice(0, 6).map((s, i) => (
                          <span key={i} className="text-xs bg-success/10 text-success px-1.5 py-0.5 rounded">
                            {typeof s === 'string' ? s : s.skill}
                          </span>
                        ))}
                        {(c.matched_skills || []).length > 6 && <span className="text-xs text-muted-foreground">+{(c.matched_skills || []).length - 6}</span>}
                      </div>
                    </td>
                  ))}
                </tr>
                {/* Missing skills row */}
                <tr className="border-b">
                  <td className="py-3 pr-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Missing</td>
                  {selectedCandidates.map((c) => (
                    <td key={c.id} className="py-3 px-4 align-top">
                      <div className="flex flex-wrap gap-1">
                        {(c.missing_skills || []).slice(0, 6).map((s, i) => (
                          <span key={i} className="text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">
                            {typeof s === 'string' ? s : String(s)}
                          </span>
                        ))}
                        {(c.missing_skills || []).length > 6 && <span className="text-xs text-muted-foreground">+{(c.missing_skills || []).length - 6}</span>}
                      </div>
                    </td>
                  ))}
                </tr>
                {/* Review status row */}
                <tr className="border-b">
                  <td className="py-3 pr-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Review</td>
                  {selectedCandidates.map((c) => (
                    <td key={c.id} className="py-3 px-4 align-top"><ReviewStatusBadge status={c.review_status} /></td>
                  ))}
                </tr>
                {/* Summary row */}
                <tr>
                  <td className="py-3 pr-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Summary</td>
                  {selectedCandidates.map((c) => (
                    <td key={c.id} className="py-3 px-4 text-muted-foreground align-top text-xs leading-relaxed">{truncate(c.summary || '—', 200)}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}
