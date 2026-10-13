import { useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useOrganization } from '@/contexts/org-context';
import { createJob, updateJob, getJob } from '@/lib/services';
import type { JobInput } from '@/lib/services';
import { EMPLOYMENT_TYPES, JOB_STATUSES } from '@/lib/constants';
import type { EmploymentType, JobStatus } from '@/lib/constants';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

const jobSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  department: z.string().min(1, 'Department is required'),
  location: z.string().min(1, 'Location is required'),
  employment_type: z.enum(['full_time', 'part_time', 'contract', 'internship', 'temporary']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  required_skills: z.array(z.string()),
  preferred_skills: z.array(z.string()),
  min_experience_years: z.number().nullable(),
  education_requirements: z.string().nullable(),
  evaluation_criteria: z.string().nullable(),
  status: z.enum(['draft', 'open', 'paused', 'closed']),
});

type JobFormValues = z.infer<typeof jobSchema>;

export function JobFormPage() {
  const { jobId } = useParams();
  const isEdit = !!jobId;
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { currentOrg } = useOrganization();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [requiredSkillInput, setRequiredSkillInput] = useState('');
  const [preferredSkillInput, setPreferredSkillInput] = useState('');
  const [existingJob, setExistingJob] = useState<JobFormValues | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      department: '',
      location: 'Remote',
      employment_type: 'full_time',
      description: '',
      required_skills: [],
      preferred_skills: [],
      min_experience_years: null,
      education_requirements: null,
      evaluation_criteria: null,
      status: 'draft',
    },
  });

  useEffect(() => {
    if (isEdit && jobId) {
      getJob(jobId).then((job) => {
        if (job) {
          const values: JobFormValues = {
            title: job.title,
            department: job.department,
            location: job.location,
            employment_type: job.employment_type as EmploymentType,
            description: job.description,
            required_skills: job.required_skills || [],
            preferred_skills: job.preferred_skills || [],
            min_experience_years: job.min_experience_years,
            education_requirements: job.education_requirements,
            evaluation_criteria: job.evaluation_criteria,
            status: job.status as JobStatus,
          };
          setExistingJob(values);
          reset(values);
        }
      });
    }
  }, [isEdit, jobId, reset]);

  const requiredSkills = watch('required_skills') || [];
  const preferredSkills = watch('preferred_skills') || [];
  const employmentType = watch('employment_type');
  const status = watch('status');

  const addRequiredSkill = () => {
    const skill = requiredSkillInput.trim();
    if (skill && !requiredSkills.includes(skill)) {
      setValue('required_skills', [...requiredSkills, skill]);
    }
    setRequiredSkillInput('');
  };

  const removeRequiredSkill = (skill: string) => {
    setValue('required_skills', requiredSkills.filter((s) => s !== skill));
  };

  const addPreferredSkill = () => {
    const skill = preferredSkillInput.trim();
    if (skill && !preferredSkills.includes(skill)) {
      setValue('preferred_skills', [...preferredSkills, skill]);
    }
    setPreferredSkillInput('');
  };

  const removePreferredSkill = (skill: string) => {
    setValue('preferred_skills', preferredSkills.filter((s) => s !== skill));
  };

  const onSubmit = async (values: JobFormValues) => {
    if (!currentOrg || !user) return;
    setError(null);
    setLoading(true);

    const input: JobInput = {
      ...values,
      min_experience_years: values.min_experience_years ?? null,
      education_requirements: values.education_requirements || null,
      evaluation_criteria: values.evaluation_criteria || null,
    };

    if (isEdit && jobId) {
      const { error } = await updateJob(jobId, input);
      setLoading(false);
      if (error) {
        setError(error);
      } else {
        toast({ title: 'Job updated', description: `"${values.title}" has been saved.` });
        navigate(`/jobs/${jobId}`);
      }
    } else {
      const { data, error } = await createJob(currentOrg.id, user.id, input);
      setLoading(false);
      if (error) {
        setError(error);
      } else {
        toast({ title: 'Job created', description: `"${values.title}" is ready for resume analysis.` });
        navigate(`/jobs/${data?.id}`);
      }
    }
  };

  const breadcrumbs = [
    { label: 'Jobs', to: '/jobs' },
    { label: isEdit ? 'Edit' : 'New' },
  ];

  return (
    <AppLayout
      title={isEdit ? 'Edit Job' : 'Create Job'}
      breadcrumbs={breadcrumbs}
      actions={
        <Button variant="ghost" size="sm" onClick={() => navigate(isEdit ? `/jobs/${jobId}` : '/jobs')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Basic info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
            <CardDescription>Define the role and what you're hiring for.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Job title <span className="text-destructive">*</span></Label>
              <Input id="title" placeholder="Senior Frontend Engineer" {...register('title')} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="department">Department <span className="text-destructive">*</span></Label>
                <Input id="department" placeholder="Engineering" {...register('department')} />
                {errors.department && <p className="text-xs text-destructive">{errors.department.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location">Location <span className="text-destructive">*</span></Label>
                <Input id="location" placeholder="Remote · San Francisco, CA" {...register('location')} />
                {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="employment_type">Employment type</Label>
                <Select value={employmentType} onValueChange={(v) => setValue('employment_type', v as EmploymentType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(v) => setValue('status', v as JobStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {JOB_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Job description <span className="text-destructive">*</span></Label>
              <Textarea
                id="description"
                rows={6}
                placeholder="Describe the role, responsibilities, and what success looks like…"
                {...register('description')}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Skills & requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Skills & Requirements</CardTitle>
            <CardDescription>These criteria are used to match and rank candidates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Required skills</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Type a skill and press Enter"
                  value={requiredSkillInput}
                  onChange={(e) => setRequiredSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRequiredSkill(); } }}
                />
                <Button type="button" variant="outline" size="icon" onClick={addRequiredSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {requiredSkills.map((skill) => (
                    <span key={skill} className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-2 py-0.5 text-xs font-medium">
                      {skill}
                      <button type="button" onClick={() => removeRequiredSkill(skill)} className="text-muted-foreground hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Preferred skills</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Type a skill and press Enter"
                  value={preferredSkillInput}
                  onChange={(e) => setPreferredSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPreferredSkill(); } }}
                />
                <Button type="button" variant="outline" size="icon" onClick={addPreferredSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {preferredSkills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {preferredSkills.map((skill) => (
                    <span key={skill} className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {skill}
                      <button type="button" onClick={() => removePreferredSkill(skill)} className="text-muted-foreground hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="min_experience">Minimum experience (years)</Label>
                <Input
                  id="min_experience"
                  type="number"
                  min={0}
                  placeholder="3"
                  {...register('min_experience_years', { setValueAs: (v) => v === '' || v === null ? null : Number(v) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="education">Education requirements</Label>
                <Input id="education" placeholder="Bachelor's degree in CS or equivalent" {...register('education_requirements')} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="evaluation">Additional evaluation criteria</Label>
              <Textarea
                id="evaluation"
                rows={3}
                placeholder="Any additional criteria the AI should consider when evaluating candidates…"
                {...register('evaluation_criteria')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(isEdit ? `/jobs/${jobId}` : '/jobs')}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? 'Save changes' : 'Create job'}
          </Button>
        </div>
      </form>
    </AppLayout>
  );
}
