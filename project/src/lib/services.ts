import { supabase } from '@/lib/supabase';
import { slugify } from '@/lib/format';
import type {
  DatabaseJob,
  DatabaseCandidate,
  DatabaseCandidateNote,
  DatabaseAuditEvent,
  DatabaseOrganization,
  DatabaseOrgMember,
  DatabaseInvitation,
  JobWithCandidateCount,
  CandidateWithJob,
} from '@/lib/types';
import type { EmploymentType, JobStatus, ReviewStatus, OrgRole } from '@/lib/constants';

export async function createOrganization(
  name: string,
  userId: string,
): Promise<{ data: DatabaseOrganization | null; error: string | null }> {
  const slug = slugify(name) + '-' + Math.random().toString(36).slice(2, 8);
  const { data, error } = await supabase
    .from('organizations')
    .insert({ name, slug, created_by: userId })
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  const org = data as DatabaseOrganization;
  const { error: memberError } = await supabase.from('organization_members').insert({
    organization_id: org.id,
    user_id: userId,
    role: 'owner' as OrgRole,
  });

  if (memberError && !memberError.message.includes('duplicate')) {
    console.warn('organization_members insert note:', memberError.message);
  }

  return { data: org, error: null };
}

export async function getOrganizationsForUser(userId: string): Promise<DatabaseOrganization[]> {
  const { data: members } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', userId);

  if (!members || members.length === 0) return [];

  const orgIds = members.map((m) => m.organization_id);
  const { data: orgs } = await supabase
    .from('organizations')
    .select('*')
    .in('id', orgIds);

  return (orgs || []) as DatabaseOrganization[];
}

export async function getOrgMembers(orgId: string): Promise<DatabaseOrgMember[]> {
  const { data: members } = await supabase
    .from('organization_members')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: true });

  return (members as DatabaseOrgMember[]) || [];
}

export interface JobInput {
  title: string;
  department: string;
  location: string;
  employment_type: EmploymentType;
  description: string;
  required_skills: string[];
  preferred_skills: string[];
  min_experience_years: number | null;
  education_requirements: string | null;
  evaluation_criteria: string | null;
  status: JobStatus;
}

export async function createJob(orgId: string, userId: string, input: JobInput): Promise<{ data: DatabaseJob | null; error: string | null }> {
  const { data, error } = await supabase
    .from('jobs')
    .insert({
      ...input,
      organization_id: orgId,
      created_by: userId,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  await logAuditEvent(orgId, userId, 'job_created', 'job', (data as DatabaseJob).id, { title: input.title });
  return { data: data as DatabaseJob, error: null };
}

export async function updateJob(jobId: string, input: Partial<JobInput>): Promise<{ data: DatabaseJob | null; error: string | null }> {
  const { data, error } = await supabase
    .from('jobs')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', jobId)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as DatabaseJob, error: null };
}

export async function deleteJob(jobId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('jobs').delete().eq('id', jobId);
  return { error: error?.message ?? null };
}

export async function getJobs(orgId: string): Promise<JobWithCandidateCount[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  const jobs = data as DatabaseJob[];
  const jobsWithCounts = await Promise.all(
    jobs.map(async (job) => {
      const { count } = await supabase
        .from('candidates')
        .select('id', { count: 'exact', head: true })
        .eq('job_id', job.id);
      return { ...job, candidate_count: count ?? 0 };
    }),
  );

  return jobsWithCounts;
}

export async function getJob(jobId: string): Promise<DatabaseJob | null> {
  const { data } = await supabase.from('jobs').select('*').eq('id', jobId).maybeSingle();
  return (data as DatabaseJob) || null;
}

export async function getCandidatesForJob(jobId: string): Promise<DatabaseCandidate[]> {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('job_id', jobId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data as DatabaseCandidate[];
}

export async function getCandidates(
  orgId: string,
  filters?: { jobId?: string; reviewStatus?: ReviewStatus; search?: string },
): Promise<CandidateWithJob[]> {
  let query = supabase
    .from('candidates')
    .select('*, job:jobs(id, title, department)')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });

  if (filters?.jobId) {
    query = query.eq('job_id', filters.jobId);
  }
  if (filters?.reviewStatus) {
    query = query.eq('review_status', filters.reviewStatus);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  let results = data as CandidateWithJob[];
  if (filters?.search) {
    const search = filters.search.toLowerCase();
    results = results.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.current_title?.toLowerCase().includes(search) ||
        c.email?.toLowerCase().includes(search),
    );
  }

  return results;
}

export async function getCandidate(candidateId: string): Promise<CandidateWithJob | null> {
  const { data } = await supabase
    .from('candidates')
    .select('*, job:jobs(id, title, department)')
    .eq('id', candidateId)
    .maybeSingle();
  return (data as CandidateWithJob) || null;
}

export interface CandidateInput {
  job_id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  current_title?: string | null;
  summary?: string | null;
  skills?: string[];
  experience_years?: number | null;
  education?: unknown;
  projects?: unknown;
  match_score?: number | null;
  matched_skills?: unknown;
  missing_skills?: string[];
  match_evidence?: unknown;
  analysis_result?: unknown;
  analysis_status?: string;
  resume_filename?: string | null;
}

export async function createCandidates(orgId: string, inputs: CandidateInput[]): Promise<{ data: DatabaseCandidate[] | null; error: string | null }> {
  const rows = inputs.map((input) => ({
    ...input,
    organization_id: orgId,
    analysis_status: input.analysis_status || 'completed',
    review_status: 'new' as ReviewStatus,
  }));

  const { data, error } = await supabase
    .from('candidates')
    .insert(rows)
    .select();

  if (error) return { data: null, error: error.message };
  return { data: data as DatabaseCandidate[], error: null };
}

export async function updateCandidateReviewStatus(
  candidateId: string,
  status: ReviewStatus,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('candidates')
    .update({ review_status: status, updated_at: new Date().toISOString() })
    .eq('id', candidateId);
  return { error: error?.message ?? null };
}

export async function getCandidateNotes(candidateId: string): Promise<DatabaseCandidateNote[]> {
  const { data } = await supabase
    .from('candidate_notes')
    .select('*')
    .eq('candidate_id', candidateId)
    .order('created_at', { ascending: false });
  return (data as DatabaseCandidateNote[]) || [];
}

export async function addCandidateNote(
  candidateId: string,
  orgId: string,
  userId: string,
  content: string,
): Promise<{ data: DatabaseCandidateNote | null; error: string | null }> {
  const { data, error } = await supabase
    .from('candidate_notes')
    .insert({
      candidate_id: candidateId,
      organization_id: orgId,
      user_id: userId,
      content,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as DatabaseCandidateNote, error: null };
}

export async function deleteCandidateNote(noteId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('candidate_notes').delete().eq('id', noteId);
  return { error: error?.message ?? null };
}

export async function getAuditEvents(orgId: string, limit = 50): Promise<DatabaseAuditEvent[]> {
  const { data } = await supabase
    .from('audit_events')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data as DatabaseAuditEvent[]) || [];
}

export async function logAuditEvent(
  orgId: string,
  userId: string,
  action: string,
  entityType: string,
  entityId?: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await supabase.from('audit_events').insert({
    organization_id: orgId,
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata: metadata || null,
  });
}

export async function getInvitations(orgId: string): Promise<DatabaseInvitation[]> {
  try {
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Invitations query warning:', error.message);
      return [];
    }
    return (data as DatabaseInvitation[]) || [];
  } catch (err) {
    console.warn('Invitations fetch exception:', err);
    return [];
  }
}

export async function createInvitation(
  orgId: string,
  invitedBy: string,
  email: string,
  role: OrgRole,
): Promise<{ data: DatabaseInvitation | null; error: string | null }> {
  const { data, error } = await supabase
    .from('invitations')
    .insert({
      organization_id: orgId,
      email,
      role,
      invited_by: invitedBy,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as DatabaseInvitation, error: null };
}

export async function revokeInvitation(invitationId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('invitations')
    .update({ status: 'revoked' })
    .eq('id', invitationId);
  return { error: error?.message ?? null };
}

export async function getDashboardStats(orgId: string): Promise<{
  activeJobs: number;
  candidatesUnderReview: number;
  analysesCompleted: number;
  pendingReviews: number;
}> {
  const [jobsRes, candidatesRes, analysesRes, pendingRes] = await Promise.all([
    supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('organization_id', orgId).in('status', ['open', 'draft']),
    supabase.from('candidates').select('id', { count: 'exact', head: true }).eq('organization_id', orgId).not('review_status', 'in', '("rejected","hired")'),
    supabase.from('candidates').select('id', { count: 'exact', head: true }).eq('organization_id', orgId).eq('analysis_status', 'completed'),
    supabase.from('candidates').select('id', { count: 'exact', head: true }).eq('organization_id', orgId).eq('review_status', 'new'),
  ]);

  return {
    activeJobs: jobsRes.count ?? 0,
    candidatesUnderReview: candidatesRes.count ?? 0,
    analysesCompleted: analysesRes.count ?? 0,
    pendingReviews: pendingRes.count ?? 0,
  };
}
