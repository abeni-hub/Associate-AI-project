import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Check, FileSearch, Upload, FileText, X, AlertCircle, Loader2,
  ArrowRight, ArrowLeft, Briefcase, RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useOrganization } from '@/contexts/org-context';
import { getJobs, createCandidates } from '@/lib/services';
import type { JobWithCandidateCount, ApiRankCandidate } from '@/lib/types';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EmptyState } from '@/components/empty-states';
import { JobStatusBadge, EmploymentTypeBadge } from '@/components/status-badges';
import { formatFileSize } from '@/lib/format';
import { rankResumes, ApiError } from '@/lib/api';
import { MAX_UPLOAD_FILES, MAX_FILE_SIZE_MB, ACCEPTED_FILE_TYPES, API_BASE_URL } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type Stage = 'select' | 'upload' | 'review' | 'processing' | 'results' | 'error';

interface UploadedFile {
  file: File;
  id: string;
  error?: string;
}

const STEPS: { key: Stage; label: string }[] = [
  { key: 'select', label: 'Select Job' },
  { key: 'upload', label: 'Upload Resumes' },
  { key: 'review', label: 'Review & Analyze' },
];

export function AnalysisPage() {
  const { user } = useAuth();
  const { currentOrg } = useOrganization();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const presetJobId = searchParams.get('jobId');

  const [stage, setStage] = useState<Stage>('select');
  const [jobs, setJobs] = useState<JobWithCandidateCount[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobWithCandidateCount | null>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [results, setResults] = useState<ApiRankCandidate[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!currentOrg) return;
    getJobs(currentOrg.id).then((data) => {
      setJobs(data);
      if (presetJobId) {
        const preset = data.find((j) => j.id === presetJobId);
        if (preset) {
          setSelectedJob(preset);
          setStage('upload');
        }
      }
    });
  }, [currentOrg, presetJobId]);

  const validFiles = files.filter((f) => !f.error);

  const handleFileSelect = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles: UploadedFile[] = [];
    for (const file of Array.from(fileList)) {
      if (files.length + newFiles.length >= MAX_UPLOAD_FILES) {
        toast({ variant: 'destructive', title: 'Upload limit reached', description: `Maximum ${MAX_UPLOAD_FILES} files per analysis.` });
        break;
      }
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const tooLarge = file.size > MAX_FILE_SIZE_MB * 1024 * 1024;
      const isDuplicate = files.some((f) => f.file.name === file.name && f.file.size === file.size);

      newFiles.push({
        file,
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        error: !isPdf ? 'Only PDF files are supported' : tooLarge ? `File exceeds ${MAX_FILE_SIZE_MB}MB limit` : isDuplicate ? 'Duplicate file' : undefined,
      });
    }
    setFiles((prev) => [...prev, ...newFiles]);
  }, [files, toast]);

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const runAnalysis = async () => {
    if (!selectedJob || !currentOrg || !user) return;
    setStage('processing');
    setAnalysisError(null);

    const jobPayload = {
      title: selectedJob.title,
      department: selectedJob.department,
      description: selectedJob.description,
      required_skills: selectedJob.required_skills,
      preferred_skills: selectedJob.preferred_skills,
      min_experience_years: selectedJob.min_experience_years,
      education_requirements: selectedJob.education_requirements,
      evaluation_criteria: selectedJob.evaluation_criteria,
    };

    try {
      const ranked = await rankResumes({
        job: jobPayload,
        files: validFiles.map((f) => f.file),
      });

      // Save candidates to database
      const candidateInputs = ranked.map((c) => ({
        job_id: selectedJob.id,
        name: c.name || 'Unknown Candidate',
        email: c.email || null,
        phone: c.phone || null,
        current_title: c.current_title || null,
        summary: c.summary || null,
        skills: c.skills || [],
        experience_years: c.experience_years ?? null,
        education: c.education || null,
        projects: c.projects || null,
        match_score: c.match_score ?? null,
        matched_skills: c.matched_skills || [],
        missing_skills: c.missing_skills || [],
        match_evidence: c.match_evidence || null,
        analysis_result: c as unknown as Record<string, unknown>,
        analysis_status: 'completed',
        resume_filename: c.resume_filename || validFiles.find((f) => f.file.name.includes(c.name?.split(' ')[0] || ''))?.file.name || null,
      }));

      const { data: savedCandidates, error: saveError } = await createCandidates(currentOrg.id, candidateInputs);

      if (saveError) {
        setAnalysisError(`Analysis completed but saving results failed: ${saveError}`);
        setStage('error');
        return;
      }

      setResults(ranked);
      setStage('results');
      toast({
        title: 'Analysis complete',
        description: `${ranked.length} candidate${ranked.length !== 1 ? 's' : ''} analyzed and saved.`,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setAnalysisError(err.message);
      } else if (err instanceof Error) {
        setAnalysisError(err.message);
      } else {
        setAnalysisError('An unexpected error occurred during analysis.');
      }
      setStage('error');
    }
  };

  const reset = () => {
    setStage('select');
    setSelectedJob(null);
    setFiles([]);
    setResults([]);
    setAnalysisError(null);
  };

  const stepIndex = STEPS.findIndex((s) => s.key === stage);
  const currentStep = stage === 'processing' || stage === 'results' || stage === 'error' ? 2 : stepIndex;

  return (
    <AppLayout
      title="Resume Analysis"
      breadcrumbs={[{ label: 'Resume Analysis' }]}
    >
      {/* Step indicator */}
      <div className="mb-6 flex items-center gap-2">
        {STEPS.map((step, i) => {
          const completed = i < currentStep;
          const active = i === currentStep;
          return (
            <div key={step.key} className="flex items-center gap-2">
              <div className={cn(
                'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                active && 'bg-primary text-primary-foreground',
                completed && 'text-primary',
                !active && !completed && 'text-muted-foreground',
              )}>
                <span className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full text-xs',
                  active && 'bg-primary-foreground/20',
                  completed && 'bg-primary/10',
                  !active && !completed && 'bg-muted',
                )}>
                  {completed ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                {step.label}
              </div>
              {i < STEPS.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40" />}
            </div>
          );
        })}
      </div>

      {/* Stage: Select job */}
      {stage === 'select' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Select a job to analyze against</h2>
            <p className="mt-1 text-sm text-muted-foreground">Choose an existing job opening. The job's requirements will be used to match and rank candidates.</p>
          </div>

          {jobs.length === 0 ? (
            <Card className="border-dashed">
              <EmptyState
                icon={<Briefcase className="h-6 w-6" />}
                title="No jobs available"
                description="Create a job first to define what you're hiring for, then come back to analyze resumes."
                action={<Button onClick={() => navigate('/jobs/new')}><Briefcase className="mr-2 h-4 w-4" /> Create a job</Button>}
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {jobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => { setSelectedJob(job); setStage('upload'); }}
                  className={cn(
                    'text-left rounded-lg border-2 p-4 transition-all hover:shadow-sm',
                    selectedJob?.id === job.id ? 'border-primary bg-accent' : 'border-border bg-card hover:border-primary/20',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{job.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{job.department} · {job.location}</p>
                    </div>
                    <JobStatusBadge status={job.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <EmploymentTypeBadge type={job.employment_type} />
                    {job.required_skills.slice(0, 3).map((s) => (
                      <span key={s} className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{s}</span>
                    ))}
                    {job.required_skills.length > 3 && <span className="text-xs text-muted-foreground">+{job.required_skills.length - 3} more</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stage: Upload */}
      {stage === 'upload' && selectedJob && (
        <div className="space-y-6">
          {/* Selected job summary */}
          <Card className="bg-accent/50">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Briefcase className="h-3.5 w-3.5" /> Selected job
                  </div>
                  <p className="font-medium">{selectedJob.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{selectedJob.department} · {selectedJob.location}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStage('select')}>Change</Button>
              </div>
              {selectedJob.required_skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {selectedJob.required_skills.map((s) => (
                    <span key={s} className="text-xs bg-success/10 text-success px-1.5 py-0.5 rounded">{s}</span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upload area */}
          <div>
            <h2 className="text-lg font-semibold">Upload resumes</h2>
            <p className="mt-1 text-sm text-muted-foreground">Drag and drop PDF files or browse to select. Maximum {MAX_UPLOAD_FILES} files, {MAX_FILE_SIZE_MB}MB each.</p>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 cursor-pointer transition-colors',
              dragActive ? 'border-primary bg-accent' : 'border-border hover:border-primary/30 hover:bg-muted/30',
            )}
          >
            <Upload className="h-8 w-8 text-muted-foreground/50 mb-3" />
            <p className="text-sm font-medium">Drop PDF files here or click to browse</p>
            <p className="text-xs text-muted-foreground mt-1">PDF files only · Up to {MAX_UPLOAD_FILES} files</p>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_FILE_TYPES}
              multiple
              className="hidden"
              onChange={(e) => { handleFileSelect(e.target.files); e.target.value = ''; }}
            />
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{validFiles.length} valid file{validFiles.length !== 1 ? 's' : ''} ready</p>
                <Button variant="ghost" size="sm" onClick={() => setFiles([])}>Clear all</Button>
              </div>
              <div className="space-y-1.5">
                {files.map((f) => (
                  <div
                    key={f.id}
                    className={cn(
                      'flex items-center gap-3 rounded-md border p-3',
                      f.error ? 'border-destructive/30 bg-destructive/5' : 'border-border bg-card',
                    )}
                  >
                    <FileText className={cn('h-5 w-5 shrink-0', f.error ? 'text-destructive/50' : 'text-primary/60')} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{f.file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(f.file.size)}</p>
                      {f.error && (
                        <p className="text-xs text-destructive flex items-center gap-1 mt-0.5">
                          <AlertCircle className="h-3 w-3" /> {f.error}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeFile(f.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* API config warning */}
          {!API_BASE_URL && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                The AI analysis service is not configured. Set <code className="text-xs bg-muted px-1 py-0.5 rounded">VITE_API_BASE_URL</code> in your environment to connect the backend. You can still proceed — results will show an error from the service.
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setStage('select')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button disabled={validFiles.length === 0} onClick={() => setStage('review')}>
              Continue with {validFiles.length} file{validFiles.length !== 1 ? 's' : ''}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Stage: Review */}
      {stage === 'review' && selectedJob && (
        <div className="max-w-2xl space-y-6">
          <div>
            <h2 className="text-lg font-semibold">Review and start analysis</h2>
            <p className="mt-1 text-sm text-muted-foreground">Confirm the details below, then start the analysis. This may take a few minutes depending on the number of resumes.</p>
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Job</p>
                <p className="font-medium">{selectedJob.title}</p>
                <p className="text-sm text-muted-foreground">{selectedJob.department}</p>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-xs text-muted-foreground mb-2">Resumes to analyze ({validFiles.length})</p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin">
                  {validFiles.map((f) => (
                    <div key={f.id} className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{f.file.name}</span>
                      <span className="text-muted-foreground text-xs shrink-0">{formatFileSize(f.file.size)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-xs text-muted-foreground mb-2">Matching criteria</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJob.required_skills.map((s) => (
                    <span key={s} className="text-xs bg-success/10 text-success px-1.5 py-0.5 rounded">{s}</span>
                  ))}
                  {selectedJob.preferred_skills.map((s) => (
                    <span key={s} className="text-xs bg-info/10 text-info px-1.5 py-0.5 rounded">{s}</span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setStage('upload')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={runAnalysis}>
              <FileSearch className="mr-2 h-4 w-4" /> Start analysis
            </Button>
          </div>
        </div>
      )}

      {/* Stage: Processing */}
      {stage === 'processing' && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-muted" />
            <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <h2 className="mt-6 text-lg font-semibold">Analyzing resumes…</h2>
          <p className="mt-1.5 text-sm text-muted-foreground text-center max-w-md">
            The AI service is extracting candidate information and comparing it against the job requirements. This may take a few minutes.
          </p>
          <div className="mt-6 space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Extracting resume data…</p>
            <p className="flex items-center gap-2 text-muted-foreground/50">Matching against job requirements…</p>
            <p className="flex items-center gap-2 text-muted-foreground/50">Ranking candidates…</p>
          </div>
        </div>
      )}

      {/* Stage: Results */}
      {stage === 'results' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Analysis complete</h2>
              <p className="text-sm text-muted-foreground">{results.length} candidates analyzed and saved to your workspace.</p>
            </div>
          </div>

          {results.length > 0 && (
            <Card className="overflow-hidden p-0">
              <div className="divide-y divide-border">
                {results.map((c, i) => (
                  <div key={i} className="flex items-center gap-4 p-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground shrink-0">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">{c.name || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground truncate">{c.current_title || '—'}</p>
                    </div>
                    {c.match_score !== undefined && c.match_score !== null && (
                      <div className="text-right shrink-0">
                        <p className="text-lg font-semibold tabular-nums">{Math.round(c.match_score)}</p>
                        <p className="text-xs text-muted-foreground">match score</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="flex items-center gap-3">
            <Button onClick={() => navigate('/candidates')}>
              View all candidates <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={reset}>
              <RefreshCw className="mr-2 h-4 w-4" /> Run another analysis
            </Button>
          </div>
        </div>
      )}

      {/* Stage: Error */}
      {stage === 'error' && (
        <div className="max-w-lg mx-auto py-12">
          <Card className="border-destructive/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive shrink-0">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">Analysis failed</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{analysisError}</p>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <Button onClick={() => setStage('review')}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Try again
                </Button>
                <Button variant="outline" onClick={reset}>Start over</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AppLayout>
  );
}
