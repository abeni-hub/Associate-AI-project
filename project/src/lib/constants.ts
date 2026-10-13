export const APP_NAME = 'TalentForge';

export const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'temporary', label: 'Temporary' },
] as const;

export const JOB_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'muted' },
  { value: 'open', label: 'Open', color: 'success' },
  { value: 'paused', label: 'Paused', color: 'warning' },
  { value: 'closed', label: 'Closed', color: 'destructive' },
] as const;

export const ANALYSIS_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'muted' },
  { value: 'processing', label: 'Processing', color: 'info' },
  { value: 'completed', label: 'Completed', color: 'success' },
  { value: 'failed', label: 'Failed', color: 'destructive' },
] as const;

export const REVIEW_STATUSES = [
  { value: 'new', label: 'New', color: 'info' },
  { value: 'needs_review', label: 'Needs Review', color: 'warning' },
  { value: 'shortlisted', label: 'Shortlisted', color: 'success' },
  { value: 'interview', label: 'Interview', color: 'info' },
  { value: 'on_hold', label: 'On Hold', color: 'muted' },
  { value: 'rejected', label: 'Rejected', color: 'destructive' },
  { value: 'hired', label: 'Hired', color: 'success' },
] as const;

export const ORG_ROLES = [
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Administrator' },
  { value: 'recruiter', label: 'Recruiter' },
  { value: 'reviewer', label: 'Read-only Reviewer' },
] as const;

export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number]['value'];
export type JobStatus = (typeof JOB_STATUSES)[number]['value'];
export type AnalysisStatus = (typeof ANALYSIS_STATUSES)[number]['value'];
export type ReviewStatus = (typeof REVIEW_STATUSES)[number]['value'];
export type OrgRole = (typeof ORG_ROLES)[number]['value'];

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const MAX_UPLOAD_FILES = 20;
export const MAX_FILE_SIZE_MB = 10;
export const ACCEPTED_FILE_TYPES = '.pdf,application/pdf';
