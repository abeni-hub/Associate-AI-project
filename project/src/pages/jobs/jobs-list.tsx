import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Briefcase, MoreHorizontal, Pencil, Trash2, FileSearch, ArrowUpDown } from 'lucide-react';
import { useOrganization } from '@/contexts/org-context';
import { getJobs, deleteJob } from '@/lib/services';
import type { JobWithCandidateCount } from '@/lib/types';
import type { JobStatus } from '@/lib/constants';
import { JOB_STATUSES } from '@/lib/constants';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EmptyState, TableLoading, PageLoading } from '@/components/empty-states';
import { JobStatusBadge, EmploymentTypeBadge } from '@/components/status-badges';
import { formatDate } from '@/lib/format';
import { useToast } from '@/hooks/use-toast';

type SortField = 'title' | 'department' | 'created_at' | 'candidate_count';
type SortDir = 'asc' | 'desc';

export function JobsListPage() {
  const { currentOrg } = useOrganization();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<JobWithCandidateCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [deleteTarget, setDeleteTarget] = useState<JobWithCandidateCount | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!currentOrg) return;
    setLoading(true);
    getJobs(currentOrg.id).then((data) => {
      setJobs(data);
      setLoading(false);
    });
  }, [currentOrg]);

  const filtered = useMemo(() => {
    let result = jobs;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (j) => j.title.toLowerCase().includes(s) || j.department.toLowerCase().includes(s) || j.location.toLowerCase().includes(s),
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter((j) => j.status === statusFilter);
    }
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'title') cmp = a.title.localeCompare(b.title);
      else if (sortField === 'department') cmp = a.department.localeCompare(b.department);
      else if (sortField === 'candidate_count') cmp = (a.candidate_count ?? 0) - (b.candidate_count ?? 0);
      else cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [jobs, search, statusFilter, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !currentOrg) return;
    setDeleting(true);
    const { error } = await deleteJob(deleteTarget.id);
    setDeleting(false);
    if (error) {
      toast({ variant: 'destructive', title: 'Failed to delete job', description: error });
    } else {
      setJobs(jobs.filter((j) => j.id !== deleteTarget.id));
      toast({ title: 'Job deleted', description: `"${deleteTarget.title}" has been removed.` });
      setDeleteTarget(null);
    }
  };

  return (
    <AppLayout
      title="Jobs"
      breadcrumbs={[{ label: 'Jobs' }]}
      actions={
        <Button size="sm" onClick={() => navigate('/jobs/new')}>
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Create Job</span>
        </Button>
      }
    >
      {/* Filters */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
          <Input
            placeholder="Search jobs by title, department, or location…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {JOB_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <Card><TableLoading /></Card>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <EmptyState
            icon={<Briefcase className="h-6 w-6" />}
            title={jobs.length === 0 ? "No jobs yet" : "No matching jobs"}
            description={jobs.length === 0 ? "Create your first job opening to start collecting and analyzing resumes." : "Try adjusting your search or filters."}
            action={jobs.length === 0 ? (
              <Button onClick={() => navigate('/jobs/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Create your first job
              </Button>
            ) : undefined}
          />
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">
                  <button className="flex items-center gap-1 font-medium hover:text-foreground" onClick={() => toggleSort('title')}>
                    Title
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-1 font-medium hover:text-foreground" onClick={() => toggleSort('department')}>
                    Department
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead className="hidden md:table-cell">Location</TableHead>
                <TableHead className="hidden lg:table-cell">Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">
                  <button className="flex items-center gap-1 font-medium hover:text-foreground mx-auto" onClick={() => toggleSort('candidate_count')}>
                    Candidates
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <button className="flex items-center gap-1 font-medium hover:text-foreground" onClick={() => toggleSort('created_at')}>
                    Created
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead className="pr-6 w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((job) => (
                <TableRow
                  key={job.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  <TableCell className="pl-6 font-medium text-foreground">{job.title}</TableCell>
                  <TableCell className="text-muted-foreground">{job.department}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{job.location}</TableCell>
                  <TableCell className="hidden lg:table-cell"><EmploymentTypeBadge type={job.employment_type} /></TableCell>
                  <TableCell><JobStatusBadge status={job.status} /></TableCell>
                  <TableCell className="text-center tabular-nums text-muted-foreground">{job.candidate_count ?? 0}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{formatDate(job.created_at)}</TableCell>
                  <TableCell className="pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => navigate(`/jobs/${job.id}`)}>
                          <Briefcase className="mr-2 h-4 w-4" /> View details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/jobs/${job.id}/edit`)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/analysis?jobId=${job.id}`)}>
                          <FileSearch className="mr-2 h-4 w-4" /> Analyze resumes
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteTarget(job)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this job?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteTarget?.title}" and all {deleteTarget?.candidate_count ?? 0} candidate records associated with it. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
