import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Check, FileSearch, Upload, FileText, X, AlertCircle, Loader2,
  ArrowRight, ArrowLeft, Briefcase, RefreshCw, Sparkles, User,
  Mail, Phone, MapPin, Linkedin, Github, GraduationCap, Award,
  FolderGit2, Globe, CheckCircle2, XCircle, HelpCircle, Save,
  ChevronDown, ChevronUp, Code2
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useOrganization } from '@/contexts/org-context';
import { getJobs, createCandidates } from '@/lib/services';
import type {
  JobWithCandidateCount,
  ApiResume,
  ApiCandidateRankingResponse,
  ApiRankedCandidateItem,
} from '@/lib/types';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { EmptyState } from '@/components/empty-states';
import { JobStatusBadge, EmploymentTypeBadge } from '@/components/status-badges';
import { ScoreRing } from '@/components/score-display';
import { formatFileSize } from '@/lib/format';
import {
  rankResumes,
  analyzeResume,
  checkApiHealth,
  buildValidJobDescription,
  ApiError,
} from '@/lib/api';
import {
  MAX_UPLOAD_FILES,
  MAX_FILE_SIZE_MB,
  ACCEPTED_FILE_TYPES,
  API_BASE_URL,
} from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type BatchStage = 'select' | 'upload' | 'review' | 'processing' | 'results' | 'error';

interface UploadedFile {
  file: File;
  id: string;
  error?: string;
}

const BATCH_STEPS: { key: BatchStage; label: string }[] = [
  { key: 'select', label: '1. Select Job' },
  { key: 'upload', label: '2. Upload Resumes' },
  { key: 'review', label: '3. Review & Rank' },
];

export function AnalysisPage() {
  const { user } = useAuth();
  const { currentOrg } = useOrganization();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const presetJobId = searchParams.get('jobId');

  // Backend Health State
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [apiStatusMsg, setApiStatusMsg] = useState<string>('');
  const [checkingHealth, setCheckingHealth] = useState(false);

  // Tab State: 'ranking' | 'single'
  const [activeTab, setActiveTab] = useState<'ranking' | 'single'>('ranking');

  // Single Resume Analysis State
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [singleAnalyzing, setSingleAnalyzing] = useState(false);
  const [singleResult, setSingleResult] = useState<ApiResume | null>(null);
  const [singleError, setSingleError] = useState<string | null>(null);
  const [showSingleRawJson, setShowSingleRawJson] = useState(false);
  const singleInputRef = useRef<HTMLInputElement>(null);

  // Batch Ranking State
  const [batchStage, setBatchStage] = useState<BatchStage>('select');
  const [jobs, setJobs] = useState<JobWithCandidateCount[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobWithCandidateCount | null>(null);
  const [batchFiles, setBatchFiles] = useState<UploadedFile[]>([]);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [rankingResponse, setRankingResponse] = useState<ApiCandidateRankingResponse | null>(null);
  const [batchDragActive, setBatchDragActive] = useState(false);
  const [singleDragActive, setSingleDragActive] = useState(false);
  const [savingCandidates, setSavingCandidates] = useState(false);
  const [candidatesSaved, setCandidatesSaved] = useState(false);
  const [expandedCandidateIndex, setExpandedCandidateIndex] = useState<number | null>(0);
  const batchInputRef = useRef<HTMLInputElement>(null);

  // Verify Backend Health
  const verifyBackend = useCallback(async () => {
    setCheckingHealth(true);
    const health = await checkApiHealth();
    setApiOnline(health.ok);
    setApiStatusMsg(health.ok ? 'FastAPI is online and reachable' : (health.message || 'FastAPI backend unavailable'));
    setCheckingHealth(false);
  }, []);

  useEffect(() => {
    verifyBackend();
  }, [verifyBackend]);

  // Load Jobs
  useEffect(() => {
    if (!currentOrg) return;
    getJobs(currentOrg.id).then((data) => {
      setJobs(data);
      if (presetJobId) {
        const preset = data.find((j) => j.id === presetJobId);
        if (preset) {
          setSelectedJob(preset);
          setBatchStage('upload');
        }
      }
    });
  }, [currentOrg, presetJobId]);

  // -------------------------------------------------------------
  // Single Resume Handlers
  // -------------------------------------------------------------
  const handleSingleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      toast({
        variant: 'destructive',
        title: 'Invalid file format',
        description: 'Only standard PDF documents are supported.',
      });
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: `The file exceeds the maximum limit of ${MAX_FILE_SIZE_MB} MB.`,
      });
      return;
    }
    setSingleFile(file);
    setSingleResult(null);
    setSingleError(null);
  };

  const runSingleAnalysis = async () => {
    if (!singleFile) return;
    setSingleAnalyzing(true);
    setSingleError(null);
    setSingleResult(null);

    try {
      const result = await analyzeResume(singleFile);
      setSingleResult(result);
      toast({
        title: 'Resume analysis successful',
        description: `Extracted structured profile for ${result.candidate.name || 'Candidate'}.`,
      });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : (err as Error).message;
      setSingleError(msg || 'Failed to extract structured data from PDF.');
    } finally {
      setSingleAnalyzing(false);
    }
  };

  // -------------------------------------------------------------
  // Batch Ranking Handlers
  // -------------------------------------------------------------
  const validBatchFiles = batchFiles.filter((f) => !f.error);

  const handleBatchFileSelect = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles: UploadedFile[] = [];
    for (const file of Array.from(fileList)) {
      if (batchFiles.length + newFiles.length >= MAX_UPLOAD_FILES) {
        toast({
          variant: 'destructive',
          title: 'Upload limit reached',
          description: `Maximum ${MAX_UPLOAD_FILES} files can be ranked in one request.`,
        });
        break;
      }
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const tooLarge = file.size > MAX_FILE_SIZE_MB * 1024 * 1024;
      const isDuplicate = batchFiles.some((f) => f.file.name === file.name && f.file.size === file.size);

      newFiles.push({
        file,
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        error: !isPdf
          ? 'Only PDF files are supported'
          : tooLarge
          ? `File exceeds ${MAX_FILE_SIZE_MB} MB limit`
          : isDuplicate
          ? 'Duplicate file'
          : undefined,
      });
    }
    setBatchFiles((prev) => [...prev, ...newFiles]);
  }, [batchFiles, toast]);

  const removeBatchFile = (id: string) => {
    setBatchFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const runBatchRanking = async () => {
    if (!selectedJob) return;
    setBatchStage('processing');
    setBatchError(null);
    setCandidatesSaved(false);

    // Build the strictly formatted job description matching FastAPI JobDescription model
    const jobPayload = buildValidJobDescription({
      title: selectedJob.title,
      description: selectedJob.description,
      required_skills: selectedJob.required_skills,
      preferred_skills: selectedJob.preferred_skills,
      minimum_score: 0,
    });

    try {
      const response = await rankResumes({
        job: jobPayload,
        files: validBatchFiles.map((f) => f.file),
      });

      setRankingResponse(response);
      setBatchStage('results');
      toast({
        title: 'Ranking complete',
        description: `Successfully scored and ranked ${response.candidates.length} candidate(s).`,
      });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : (err as Error).message;
      setBatchError(msg || 'An error occurred during candidate ranking.');
      setBatchStage('error');
    }
  };

  const saveResultsToWorkspace = async () => {
    if (!rankingResponse || !selectedJob || !currentOrg) return;
    setSavingCandidates(true);

    try {
      const candidateInputs = rankingResponse.candidates.map((item, idx) => {
        const match = item.match;
        const matchedSkills = match.requirement_matches
          .filter((rm) => rm.evidence_status === 'supported')
          .map((rm) => ({ skill: rm.requirement_name, evidence: rm.evidence.join('; ') }));

        const missingSkills = match.requirement_matches
          .filter((rm) => rm.evidence_status === 'not_established')
          .map((rm) => rm.requirement_name);

        const matchEvidence = match.requirement_matches.map((rm) => ({
          requirement: rm.requirement_name,
          status: rm.evidence_status === 'supported' ? 'matched' : rm.evidence_status === 'partial' ? 'partial' : 'missing',
          evidence: rm.evidence.join('; ') || undefined,
          detail: rm.explanation,
        }));

        const matchedFileName = validBatchFiles[idx]?.file.name || null;

        return {
          job_id: selectedJob.id,
          name: match.candidate_name || `Candidate #${item.rank}`,
          email: null,
          phone: null,
          current_title: null,
          summary: match.summary,
          skills: matchedSkills.map((s) => s.skill),
          experience_years: null,
          education: null,
          projects: null,
          match_score: match.overall_score,
          matched_skills: matchedSkills,
          missing_skills: missingSkills,
          match_evidence: matchEvidence,
          analysis_result: match as unknown as Record<string, unknown>,
          analysis_status: 'completed',
          resume_filename: matchedFileName,
        };
      });

      const { error } = await createCandidates(currentOrg.id, candidateInputs);
      if (error) {
        toast({ variant: 'destructive', title: 'Failed to save', description: error });
      } else {
        setCandidatesSaved(true);
        toast({
          title: 'Candidates saved',
          description: `${candidateInputs.length} candidates were saved to your workspace candidates directory.`,
        });
      }
    } catch (err) {
      toast({ variant: 'destructive', title: 'Save error', description: (err as Error).message });
    } finally {
      setSavingCandidates(false);
    }
  };

  const resetBatch = () => {
    setBatchStage('select');
    setSelectedJob(null);
    setBatchFiles([]);
    setRankingResponse(null);
    setBatchError(null);
    setCandidatesSaved(false);
  };

  const currentStepNumber = batchStage === 'processing' || batchStage === 'results' || batchStage === 'error'
    ? 3
    : batchStage === 'review'
    ? 3
    : batchStage === 'upload'
    ? 2
    : 1;

  return (
    <AppLayout
      title="AI Resume Analysis & Matching"
      breadcrumbs={[{ label: 'Resume Analysis' }]}
      actions={
        <div className="flex items-center gap-2">
          {/* Health indicator */}
          <div
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
              apiOnline === true
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400'
                : apiOnline === false
                ? 'bg-destructive/10 text-destructive border-destructive/20'
                : 'bg-muted text-muted-foreground border-border'
            )}
            title={apiStatusMsg}
          >
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                apiOnline === true ? 'bg-emerald-500' : apiOnline === false ? 'bg-destructive' : 'bg-muted-foreground'
              )}
            />
            <span>{apiOnline ? 'FastAPI Online' : 'FastAPI Offline'}</span>
            <button
              onClick={verifyBackend}
              disabled={checkingHealth}
              className="ml-1 hover:opacity-80 p-0.5"
              aria-label="Refresh status"
            >
              <RefreshCw className={cn('h-3 w-3', checkingHealth && 'animate-spin')} />
            </button>
          </div>
        </div>
      }
    >
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'ranking' | 'single')} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
          <TabsList className="grid grid-cols-2 w-full sm:w-[420px]">
            <TabsTrigger value="ranking" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span>Multi-Resume Ranking</span>
            </TabsTrigger>
            <TabsTrigger value="single" className="flex items-center gap-2">
              <FileSearch className="h-4 w-4" />
              <span>Single Resume Extraction</span>
            </TabsTrigger>
          </TabsList>

          <p className="text-xs text-muted-foreground">
            Target API: <code className="bg-muted px-1.5 py-0.5 rounded text-[11px]">{API_BASE_URL || 'Not Configured'}</code>
          </p>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: MULTI-RESUME RANKING                                    */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="ranking" className="space-y-6 focus-visible:outline-none">
          {/* Step indicator */}
          {batchStage !== 'processing' && batchStage !== 'results' && (
            <div className="flex items-center gap-2">
              {BATCH_STEPS.map((step, i) => {
                const stepNum = i + 1;
                const completed = stepNum < currentStepNumber;
                const active = stepNum === currentStepNumber;
                return (
                  <div key={step.key} className="flex items-center gap-2">
                    <div
                      className={cn(
                        'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                        active && 'bg-primary text-primary-foreground',
                        completed && 'text-primary bg-primary/10',
                        !active && !completed && 'text-muted-foreground bg-muted'
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-4 w-4 items-center justify-center rounded-full text-[10px]',
                          active && 'bg-primary-foreground/20 text-primary-foreground',
                          completed && 'bg-primary text-primary-foreground',
                          !active && !completed && 'bg-muted-foreground/20'
                        )}
                      >
                        {completed ? <Check className="h-2.5 w-2.5" /> : stepNum}
                      </span>
                      {step.label}
                    </div>
                    {i < BATCH_STEPS.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground/40" />}
                  </div>
                );
              })}
            </div>
          )}

          {/* Stage 1: Select Job */}
          {batchStage === 'select' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Select a Job for Candidate Ranking</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  The candidates' resumes will be extracted with AI and scored against this job's requirements using the backend phrase-matching engine.
                </p>
              </div>

              {jobs.length === 0 ? (
                <Card className="border-dashed">
                  <EmptyState
                    icon={<Briefcase className="h-6 w-6" />}
                    title="No jobs created yet"
                    description="Create a job first to define the title, description, and required skills for ranking."
                    action={
                      <Button onClick={() => navigate('/jobs/new')}>
                        <Briefcase className="mr-2 h-4 w-4" /> Create a Job
                      </Button>
                    }
                  />
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {jobs.map((job) => (
                    <button
                      key={job.id}
                      onClick={() => {
                        setSelectedJob(job);
                        setBatchStage('upload');
                      }}
                      className={cn(
                        'text-left rounded-lg border p-4 transition-all hover:border-primary/40 hover:shadow-sm bg-card',
                        selectedJob?.id === job.id && 'border-primary ring-1 ring-primary'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{job.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{job.department} · {job.location}</p>
                        </div>
                        <JobStatusBadge status={job.status} />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <EmploymentTypeBadge type={job.employment_type} />
                        {job.required_skills.slice(0, 3).map((s) => (
                          <span key={s} className="text-[11px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                            {s}
                          </span>
                        ))}
                        {job.required_skills.length > 3 && (
                          <span className="text-[11px] text-muted-foreground">+{job.required_skills.length - 3}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stage 2: Upload Resumes */}
          {batchStage === 'upload' && selectedJob && (
            <div className="space-y-6">
              <Card className="bg-muted/40">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 mb-0.5">
                      <Briefcase className="h-3 w-3" /> Evaluating against
                    </span>
                    <p className="font-semibold text-foreground">{selectedJob.title}</p>
                    <p className="text-xs text-muted-foreground">{selectedJob.department} · {selectedJob.location}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setBatchStage('select')}>
                    Change Job
                  </Button>
                </CardContent>
              </Card>

              <div>
                <h2 className="text-lg font-semibold tracking-tight">Upload Resumes for Ranking</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Select between 1 and {MAX_UPLOAD_FILES} PDF resumes (up to {MAX_FILE_SIZE_MB} MB each).
                </p>
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); setBatchDragActive(true); }}
                onDragLeave={() => setBatchDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setBatchDragActive(false);
                  handleBatchFileSelect(e.dataTransfer.files);
                }}
                onClick={() => batchInputRef.current?.click()}
                className={cn(
                  'flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10 cursor-pointer transition-colors',
                  batchDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-muted/30'
                )}
              >
                <Upload className="h-8 w-8 text-muted-foreground/60 mb-2" />
                <p className="text-sm font-medium">Drop PDF resumes here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">PDF format only · Max {MAX_UPLOAD_FILES} files · {MAX_FILE_SIZE_MB} MB limit per file</p>
                <input
                  ref={batchInputRef}
                  type="file"
                  accept={ACCEPTED_FILE_TYPES}
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    handleBatchFileSelect(e.target.files);
                    e.target.value = '';
                  }}
                />
              </div>

              {batchFiles.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-medium text-foreground">
                      {validBatchFiles.length} valid file(s) ready for analysis
                    </p>
                    <Button variant="ghost" size="sm" onClick={() => setBatchFiles([])}>
                      Clear All
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin">
                    {batchFiles.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          'flex items-center justify-between gap-3 p-3 rounded-md border text-sm',
                          item.error ? 'border-destructive/30 bg-destructive/5' : 'border-border bg-card'
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className={cn('h-5 w-5 shrink-0', item.error ? 'text-destructive' : 'text-primary/70')} />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{item.file.name}</p>
                            <p className="text-xs text-muted-foreground">{formatFileSize(item.file.size)}</p>
                            {item.error && (
                              <p className="text-xs text-destructive flex items-center gap-1 mt-0.5">
                                <AlertCircle className="h-3 w-3" /> {item.error}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeBatchFile(item.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <Button variant="outline" onClick={() => setBatchStage('select')}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button disabled={validBatchFiles.length === 0} onClick={() => setBatchStage('review')}>
                  Review & Rank ({validBatchFiles.length}) <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Stage 3: Review */}
          {batchStage === 'review' && selectedJob && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Review Parameters Before Ranking</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  The backend will parse each PDF, run AI extraction via Groq, evaluate against the requirements below, and return scored rankings.
                </p>
              </div>

              <Card>
                <CardContent className="p-5 space-y-4">
                  <div>
                    <span className="text-xs text-muted-foreground">Target Role</span>
                    <p className="font-semibold text-base">{selectedJob.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{selectedJob.description}</p>
                  </div>

                  <Separator />

                  <div>
                    <span className="text-xs text-muted-foreground mb-2 block">Evaluation Criteria & Weighted Requirements</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.required_skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                          {skill} (Required)
                        </Badge>
                      ))}
                      {selectedJob.preferred_skills.map((skill) => (
                        <Badge key={skill} variant="outline">
                          {skill} (Preferred)
                        </Badge>
                      ))}
                      {selectedJob.required_skills.length === 0 && selectedJob.preferred_skills.length === 0 && (
                        <span className="text-xs text-muted-foreground">Core job description proficiency</span>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <span className="text-xs text-muted-foreground mb-1 block">
                      Resumes to Process ({validBatchFiles.length})
                    </span>
                    <ul className="text-xs space-y-1 text-muted-foreground max-h-36 overflow-y-auto">
                      {validBatchFiles.map((f) => (
                        <li key={f.id} className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{f.file.name}</span>
                          <span className="opacity-60">({formatFileSize(f.file.size)})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => setBatchStage('upload')}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Files
                </Button>
                <Button onClick={runBatchRanking} disabled={!apiOnline}>
                  <Sparkles className="mr-2 h-4 w-4" /> Run Candidate Ranking
                </Button>
              </div>
            </div>
          )}

          {/* Stage: Processing */}
          {batchStage === 'processing' && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="relative mb-6">
                <div className="h-16 w-16 rounded-full border-4 border-muted" />
                <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight">Extracting & Ranking Resumes…</h2>
              <p className="mt-1.5 text-sm text-muted-foreground max-w-md">
                FastAPI is extracting text with PyPDF, executing Groq schema extraction, and performing transparent evidence scoring.
              </p>
              <div className="mt-6 space-y-2 text-xs text-muted-foreground bg-muted/40 p-4 rounded-lg max-w-sm w-full text-left">
                <p className="flex items-center gap-2"><Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> Processing uploaded PDF buffers</p>
                <p className="flex items-center gap-2"><Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> Groq AI candidate extraction</p>
                <p className="flex items-center gap-2"><Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> Transparent weighted requirement matching</p>
              </div>
            </div>
          )}

          {/* Stage: Results */}
          {batchStage === 'results' && rankingResponse && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Ranking Completed for {rankingResponse.job_title}</span>
                  </div>
                  <h2 className="text-xl font-semibold tracking-tight">
                    {rankingResponse.candidates.length} Candidate(s) Ranked
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {currentOrg && (
                    <Button
                      variant={candidatesSaved ? 'secondary' : 'default'}
                      size="sm"
                      onClick={saveResultsToWorkspace}
                      disabled={savingCandidates || candidatesSaved}
                    >
                      {savingCandidates ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                        </>
                      ) : candidatesSaved ? (
                        <>
                          <Check className="mr-2 h-4 w-4" /> Saved to Workspace
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" /> Save Candidates to Workspace
                        </>
                      )}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={resetBatch}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Rank New Batch
                  </Button>
                </div>
              </div>

              {/* Disclaimer */}
              <Alert className="bg-muted/30 border-border">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                <AlertDescription className="text-xs text-muted-foreground">
                  Scores are calculated via transparent phrase-matching against candidate evidence. These provide objective decision-support signals, not autonomous hiring or rejection decisions.
                </AlertDescription>
              </Alert>

              {/* Candidates list */}
              <div className="space-y-4">
                {rankingResponse.candidates.map((item: ApiRankedCandidateItem, idx: number) => {
                  const match = item.match;
                  const isExpanded = expandedCandidateIndex === idx;

                  return (
                    <Card key={idx} className="overflow-hidden">
                      <div
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-muted/20 transition-colors"
                        onClick={() => setExpandedCandidateIndex(isExpanded ? null : idx)}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                            #{item.rank}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-base text-foreground truncate">
                              {match.candidate_name || `Candidate #${item.rank}`}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {match.summary}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                          <div className="text-right">
                            <ScoreRing score={match.overall_score} size={48} showLabel />
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      {/* Expanded requirement matches breakdown */}
                      {isExpanded && (
                        <div className="border-t border-border bg-muted/10 p-5 space-y-4">
                          <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                              Requirement Evidence Breakdown
                            </h4>
                            <div className="space-y-2">
                              {match.requirement_matches.map((rm, rIdx) => (
                                <div key={rIdx} className="rounded-md border border-border p-3 text-xs bg-card space-y-1.5">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      {rm.evidence_status === 'supported' ? (
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                      ) : rm.evidence_status === 'partial' ? (
                                        <HelpCircle className="h-4 w-4 text-amber-500 shrink-0" />
                                      ) : (
                                        <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                                      )}
                                      <span className="font-semibold text-foreground">{rm.requirement_name}</span>
                                      {rm.required ? (
                                        <Badge variant="secondary" className="text-[10px] py-0 px-1.5">Required</Badge>
                                      ) : (
                                        <Badge variant="outline" className="text-[10px] py-0 px-1.5">Optional</Badge>
                                      )}
                                    </div>
                                    <span className="font-medium tabular-nums text-muted-foreground">
                                      Score: {rm.score} / 100 (Weight: {rm.weight}%)
                                    </span>
                                  </div>

                                  <p className="text-muted-foreground">{rm.explanation}</p>

                                  {rm.evidence && rm.evidence.length > 0 && (
                                    <div className="bg-muted/40 p-2 rounded text-[11px] font-mono text-foreground space-y-1">
                                      <p className="text-[10px] uppercase font-sans text-muted-foreground font-semibold">Matched Evidence:</p>
                                      {rm.evidence.map((ev, eIdx) => (
                                        <p key={eIdx} className="truncate">• {ev}</p>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {match.limitations && match.limitations.length > 0 && (
                            <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
                              <span className="font-semibold block mb-1">Assessment Limitations:</span>
                              <ul className="list-disc list-inside space-y-0.5">
                                {match.limitations.map((lim, lIdx) => (
                                  <li key={lIdx}>{lim}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stage: Error */}
          {batchStage === 'error' && (
            <div className="max-w-lg mx-auto py-12">
              <Card className="border-destructive/30">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive shrink-0">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Analysis Request Failed</h3>
                      <p className="text-sm text-muted-foreground mt-1">{batchError}</p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-3">
                    <Button onClick={() => setBatchStage('review')}>
                      <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                    </Button>
                    <Button variant="outline" onClick={resetBatch}>
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: SINGLE RESUME EXTRACTION                              */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="single" className="space-y-6 focus-visible:outline-none">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Structured AI Resume Extraction</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Extract candidate contact details, skills, employment history, education, certifications, and projects using <code>POST /api/v1/resumes/analyze</code>.
            </p>
          </div>

          {/* Upload card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setSingleDragActive(true); }}
                onDragLeave={() => setSingleDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setSingleDragActive(false);
                  handleSingleFileSelect(e.dataTransfer.files);
                }}
                onClick={() => singleInputRef.current?.click()}
                className={cn(
                  'flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 cursor-pointer transition-colors text-center',
                  singleDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-muted/30'
                )}
              >
                <FileSearch className="h-8 w-8 text-muted-foreground/60 mb-2" />
                <p className="text-sm font-medium">Drop single PDF here</p>
                <p className="text-xs text-muted-foreground mt-1">PDF format · Max {MAX_FILE_SIZE_MB} MB</p>
                <input
                  ref={singleInputRef}
                  type="file"
                  accept={ACCEPTED_FILE_TYPES}
                  className="hidden"
                  onChange={(e) => {
                    handleSingleFileSelect(e.target.files);
                    e.target.value = '';
                  }}
                />
              </div>

              {singleFile && (
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-xs font-medium truncate">{singleFile.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSingleFile(null)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Size: {formatFileSize(singleFile.size)}</p>
                    <Button
                      className="w-full"
                      size="sm"
                      onClick={runSingleAnalysis}
                      disabled={singleAnalyzing || !apiOnline}
                    >
                      {singleAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Extracting Data…
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" /> Extract Candidate Profile
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {singleError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-xs font-semibold">Extraction Failed</AlertTitle>
                  <AlertDescription className="text-xs">{singleError}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Structured Result Display */}
            <div className="md:col-span-2">
              {singleResult ? (
                <div className="space-y-6">
                  {/* Candidate header card */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle className="text-xl flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            {singleResult.candidate.name || 'Unnamed Candidate'}
                          </CardTitle>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-2">
                            {singleResult.candidate.email && (
                              <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {singleResult.candidate.email}</span>
                            )}
                            {singleResult.candidate.phone && (
                              <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {singleResult.candidate.phone}</span>
                            )}
                            {singleResult.candidate.location && (
                              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {singleResult.candidate.location}</span>
                            )}
                            {singleResult.candidate.linkedin && (
                              <a href={singleResult.candidate.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                                <Linkedin className="h-3 w-3" /> LinkedIn
                              </a>
                            )}
                            {singleResult.candidate.github && (
                              <a href={singleResult.candidate.github} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                                <Github className="h-3 w-3" /> GitHub
                              </a>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSingleRawJson(!showSingleRawJson)}
                          className="text-xs"
                        >
                          <Code2 className="mr-1.5 h-3.5 w-3.5" />
                          {showSingleRawJson ? 'Hide Raw JSON' : 'Inspect JSON'}
                        </Button>
                      </div>
                    </CardHeader>

                    {singleResult.professional_summary && (
                      <CardContent className="pt-0">
                        <Separator className="mb-3" />
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Professional Summary</h4>
                        <p className="text-sm text-foreground/90 leading-relaxed">{singleResult.professional_summary}</p>
                      </CardContent>
                    )}
                  </Card>

                  {/* Raw JSON toggle */}
                  {showSingleRawJson && (
                    <Card className="bg-muted/40 font-mono text-xs">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-mono">Raw Backend JSON Payload</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="max-h-72 overflow-y-auto scrollbar-thin p-2 bg-background rounded border text-[11px]">
                          {JSON.stringify(singleResult, null, 2)}
                        </pre>
                      </CardContent>
                    </Card>
                  )}

                  {/* Skills */}
                  {singleResult.skills && singleResult.skills.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Award className="h-4 w-4 text-primary" /> Extracted Skills
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1.5">
                          {singleResult.skills.map((skill, sIdx) => (
                            <Badge key={sIdx} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Work Experience */}
                  {singleResult.work_experience && singleResult.work_experience.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-primary" /> Work Experience
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {singleResult.work_experience.map((exp, expIdx) => (
                          <div key={expIdx} className="border-l-2 border-primary/40 pl-4 space-y-1">
                            <div className="flex items-baseline justify-between gap-2">
                              <p className="font-semibold text-sm">{exp.job_title || 'Position'}</p>
                              <span className="text-xs text-muted-foreground">
                                {exp.start_date || '—'} – {exp.is_current ? 'Present' : exp.end_date || '—'}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
                            {exp.responsibilities && exp.responsibilities.length > 0 && (
                              <ul className="list-disc list-inside text-xs text-muted-foreground mt-2 space-y-1">
                                {exp.responsibilities.map((r, rIdx) => (
                                  <li key={rIdx}>{r}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Education & Certifications */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {singleResult.education && singleResult.education.length > 0 && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-primary" /> Education
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {singleResult.education.map((edu, eIdx) => (
                            <div key={eIdx} className="text-xs space-y-0.5">
                              <p className="font-semibold text-foreground">{edu.degree || edu.field_of_study || 'Degree'}</p>
                              <p className="text-muted-foreground">{edu.institution}</p>
                              <p className="text-[11px] text-muted-foreground/70">{edu.graduation_date || edu.start_date || ''}</p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {singleResult.certifications && singleResult.certifications.length > 0 && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Award className="h-4 w-4 text-primary" /> Certifications
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {singleResult.certifications.map((cert, cIdx) => (
                            <div key={cIdx} className="text-xs space-y-0.5">
                              <p className="font-semibold text-foreground">{cert.name}</p>
                              {cert.issuing_organization && <p className="text-muted-foreground">{cert.issuing_organization}</p>}
                              {cert.issue_date && <p className="text-[11px] text-muted-foreground/70">{cert.issue_date}</p>}
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Projects */}
                  {singleResult.projects && singleResult.projects.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <FolderGit2 className="h-4 w-4 text-primary" /> Projects
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {singleResult.projects.map((proj, pIdx) => (
                          <div key={pIdx} className="text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-foreground">{proj.name || 'Project'}</p>
                              {proj.url && (
                                <a href={proj.url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-[11px]">
                                  View
                                </a>
                              )}
                            </div>
                            {proj.description && <p className="text-muted-foreground">{proj.description}</p>}
                            {proj.technologies && proj.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {proj.technologies.map((t, tIdx) => (
                                  <span key={tIdx} className="bg-muted px-1.5 py-0.5 rounded text-[10px] text-muted-foreground">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card className="border-dashed h-full min-h-[300px] flex items-center justify-center">
                  <div className="p-8 text-center max-w-sm">
                    <FileSearch className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                    <h3 className="font-semibold text-foreground text-sm">No Resume Extracted Yet</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload a PDF on the left and click "Extract Candidate Profile" to see structured output.
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
