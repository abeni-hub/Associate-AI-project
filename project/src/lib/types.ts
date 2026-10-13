import type {
  EmploymentType,
  JobStatus,
  AnalysisStatus,
  ReviewStatus,
  OrgRole,
} from './constants';

export interface DatabaseOrganization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
}

export interface DatabaseOrgMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrgRole;
  created_at: string;
}

export interface DatabaseInvitation {
  id: string;
  organization_id: string;
  email: string;
  role: OrgRole;
  invited_by: string | null;
  status: 'pending' | 'accepted' | 'revoked';
  created_at: string;
}

export interface DatabaseJob {
  id: string;
  organization_id: string;
  created_by: string | null;
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
  created_at: string;
  updated_at: string;
}

export interface DatabaseCandidate {
  id: string;
  organization_id: string;
  job_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  current_title: string | null;
  summary: string | null;
  skills: string[];
  experience_years: number | null;
  education: EducationEntry[] | null;
  projects: ProjectEntry[] | null;
  match_score: number | null;
  matched_skills: MatchedSkill[] | null;
  missing_skills: string[] | null;
  match_evidence: MatchEvidence[] | null;
  analysis_result: Record<string, unknown> | null;
  analysis_status: AnalysisStatus;
  review_status: ReviewStatus;
  resume_filename: string | null;
  created_at: string;
  updated_at: string;
}

export interface EducationEntry {
  degree?: string;
  institution?: string;
  year?: string;
  field?: string;
}

export interface ProjectEntry {
  name?: string;
  description?: string;
  technologies?: string[];
}

export interface MatchedSkill {
  skill: string;
  evidence?: string;
}

export interface MatchEvidence {
  requirement: string;
  status: 'matched' | 'missing' | 'partial';
  evidence?: string;
  detail?: string;
}

export interface DatabaseCandidateNote {
  id: string;
  candidate_id: string;
  organization_id: string;
  user_id: string | null;
  content: string;
  created_at: string;
}

export interface DatabaseAuditEvent {
  id: string;
  organization_id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface JobWithCandidateCount extends DatabaseJob {
  candidate_count?: number;
}

export interface CandidateWithJob extends DatabaseCandidate {
  job?: Pick<DatabaseJob, 'id' | 'title' | 'department'>;
}

export interface ApiRankCandidate {
  name: string;
  email?: string;
  phone?: string;
  current_title?: string;
  summary?: string;
  skills?: string[];
  experience_years?: number;
  education?: EducationEntry[];
  projects?: ProjectEntry[];
  match_score?: number;
  matched_skills?: MatchedSkill[];
  missing_skills?: string[];
  match_evidence?: MatchEvidence[];
  resume_filename?: string;
}

export interface ApiRankResponse {
  results?: ApiRankCandidate[];
  candidates?: ApiRankCandidate[];
  ranked_candidates?: ApiRankCandidate[];
  error?: string;
}
