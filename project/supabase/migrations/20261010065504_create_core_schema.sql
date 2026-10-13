/*
# Create core recruitment intelligence schema

## Overview
Sets up the complete multi-tenant schema for a recruitment intelligence SaaS platform.
Every row is scoped to an organization, and access is enforced via Row Level Security
policies that check membership in the organization.

## New Tables

1. **organizations** — Company workspaces. Each organization is a tenant boundary.
2. **organization_members** — Maps users to organizations with roles.
3. **invitations** — Pending invitations to join an organization.
4. **jobs** — Job openings within an organization.
5. **candidates** — Candidate records from resume analysis.
6. **candidate_notes** — Internal recruiter notes on candidates.
7. **audit_events** — Audit trail of significant actions.

## Security

- RLS enabled on every table.
- All policies scope to authenticated users who are members of the same organization.
- A helper function user_org_role(uuid) returns the user's role in an org, or NULL.
- Users can only CRUD data within organizations where they have membership.
- Organization owners/admins can manage members and invitations.
- No service-role key is exposed to the browser.

## Notes

1. Tables are created first, then the helper function, then RLS policies.
2. Owner columns default to auth.uid() so client inserts succeed.
3. All child tables are scoped through organization membership.
4. Cascade deletes: deleting an organization cascades to all child data.
*/

-- ============================================================
-- 1. Create all tables first
-- ============================================================

CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'recruiter' CHECK (role IN ('owner', 'admin', 'recruiter', 'reviewer')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'recruiter' CHECK (role IN ('owner', 'admin', 'recruiter', 'reviewer')),
  invited_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  department text NOT NULL,
  location text NOT NULL DEFAULT 'Remote',
  employment_type text NOT NULL DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'internship', 'temporary')),
  description text NOT NULL,
  required_skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  preferred_skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  min_experience_years integer,
  education_requirements text,
  evaluation_criteria text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'paused', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  current_title text,
  summary text,
  skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  experience_years numeric,
  education jsonb,
  projects jsonb,
  match_score numeric CHECK (match_score >= 0 AND match_score <= 100),
  matched_skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  missing_skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  match_evidence jsonb,
  analysis_result jsonb,
  analysis_status text NOT NULL DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'processing', 'completed', 'failed')),
  review_status text NOT NULL DEFAULT 'new' CHECK (review_status IN ('new', 'needs_review', 'shortlisted', 'interview', 'on_hold', 'rejected', 'hired')),
  resume_filename text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS candidate_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. Enable RLS on all tables
-- ============================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. Helper function (after tables exist)
-- ============================================================
CREATE OR REPLACE FUNCTION public.user_org_role(org_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM organization_members
  WHERE organization_id = org_id AND user_id = auth.uid();
$$;

-- ============================================================
-- 4. RLS Policies
-- ============================================================

-- organizations
DROP POLICY IF EXISTS "select_own_organizations" ON organizations;
CREATE POLICY "select_own_organizations" ON organizations
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM organization_members m
    WHERE m.organization_id = organizations.id AND m.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "insert_organizations" ON organizations;
CREATE POLICY "insert_organizations" ON organizations
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "update_organizations" ON organizations;
CREATE POLICY "update_organizations" ON organizations
  FOR UPDATE TO authenticated
  USING (user_org_role(organizations.id) IN ('owner', 'admin'))
  WITH CHECK (user_org_role(organizations.id) IN ('owner', 'admin'));

-- organization_members
DROP POLICY IF EXISTS "select_org_members" ON organization_members;
CREATE POLICY "select_org_members" ON organization_members
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM organization_members m2
    WHERE m2.organization_id = organization_members.organization_id
    AND m2.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "insert_org_members" ON organization_members;
CREATE POLICY "insert_org_members" ON organization_members
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM organization_members m2
    WHERE m2.organization_id = organization_members.organization_id
    AND m2.user_id = auth.uid()
    AND m2.role IN ('owner', 'admin')
  ));

DROP POLICY IF EXISTS "update_org_members" ON organization_members;
CREATE POLICY "update_org_members" ON organization_members
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM organization_members m2
    WHERE m2.organization_id = organization_members.organization_id
    AND m2.user_id = auth.uid()
    AND m2.role IN ('owner', 'admin')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM organization_members m2
    WHERE m2.organization_id = organization_members.organization_id
    AND m2.user_id = auth.uid()
    AND m2.role IN ('owner', 'admin')
  ));

DROP POLICY IF EXISTS "delete_org_members" ON organization_members;
CREATE POLICY "delete_org_members" ON organization_members
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM organization_members m2
    WHERE m2.organization_id = organization_members.organization_id
    AND m2.user_id = auth.uid()
    AND m2.role IN ('owner', 'admin')
  ));

-- invitations
DROP POLICY IF EXISTS "select_invitations" ON invitations;
CREATE POLICY "select_invitations" ON invitations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members m
      WHERE m.organization_id = invitations.organization_id
      AND m.user_id = auth.uid()
    )
    OR (invitations.email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    ) AND invitations.status = 'pending')
  );

DROP POLICY IF EXISTS "insert_invitations" ON invitations;
CREATE POLICY "insert_invitations" ON invitations
  FOR INSERT TO authenticated
  WITH CHECK (user_org_role(invitations.organization_id) IN ('owner', 'admin'));

DROP POLICY IF EXISTS "update_invitations" ON invitations;
CREATE POLICY "update_invitations" ON invitations
  FOR UPDATE TO authenticated
  USING (user_org_role(invitations.organization_id) IN ('owner', 'admin'))
  WITH CHECK (user_org_role(invitations.organization_id) IN ('owner', 'admin'));

DROP POLICY IF EXISTS "delete_invitations" ON invitations;
CREATE POLICY "delete_invitations" ON invitations
  FOR DELETE TO authenticated
  USING (user_org_role(invitations.organization_id) IN ('owner', 'admin'));

-- jobs
DROP POLICY IF EXISTS "select_jobs" ON jobs;
CREATE POLICY "select_jobs" ON jobs
  FOR SELECT TO authenticated
  USING (user_org_role(jobs.organization_id) IS NOT NULL);

DROP POLICY IF EXISTS "insert_jobs" ON jobs;
CREATE POLICY "insert_jobs" ON jobs
  FOR INSERT TO authenticated
  WITH CHECK (user_org_role(jobs.organization_id) IN ('owner', 'admin', 'recruiter'));

DROP POLICY IF EXISTS "update_jobs" ON jobs;
CREATE POLICY "update_jobs" ON jobs
  FOR UPDATE TO authenticated
  USING (user_org_role(jobs.organization_id) IS NOT NULL)
  WITH CHECK (user_org_role(jobs.organization_id) IS NOT NULL);

DROP POLICY IF EXISTS "delete_jobs" ON jobs;
CREATE POLICY "delete_jobs" ON jobs
  FOR DELETE TO authenticated
  USING (user_org_role(jobs.organization_id) IN ('owner', 'admin'));

-- candidates
DROP POLICY IF EXISTS "select_candidates" ON candidates;
CREATE POLICY "select_candidates" ON candidates
  FOR SELECT TO authenticated
  USING (user_org_role(candidates.organization_id) IS NOT NULL);

DROP POLICY IF EXISTS "insert_candidates" ON candidates;
CREATE POLICY "insert_candidates" ON candidates
  FOR INSERT TO authenticated
  WITH CHECK (user_org_role(candidates.organization_id) IS NOT NULL);

DROP POLICY IF EXISTS "update_candidates" ON candidates;
CREATE POLICY "update_candidates" ON candidates
  FOR UPDATE TO authenticated
  USING (user_org_role(candidates.organization_id) IS NOT NULL)
  WITH CHECK (user_org_role(candidates.organization_id) IS NOT NULL);

DROP POLICY IF EXISTS "delete_candidates" ON candidates;
CREATE POLICY "delete_candidates" ON candidates
  FOR DELETE TO authenticated
  USING (user_org_role(candidates.organization_id) IN ('owner', 'admin', 'recruiter'));

-- candidate_notes
DROP POLICY IF EXISTS "select_candidate_notes" ON candidate_notes;
CREATE POLICY "select_candidate_notes" ON candidate_notes
  FOR SELECT TO authenticated
  USING (user_org_role(candidate_notes.organization_id) IS NOT NULL);

DROP POLICY IF EXISTS "insert_candidate_notes" ON candidate_notes;
CREATE POLICY "insert_candidate_notes" ON candidate_notes
  FOR INSERT TO authenticated
  WITH CHECK (user_org_role(candidate_notes.organization_id) IS NOT NULL);

DROP POLICY IF EXISTS "delete_candidate_notes" ON candidate_notes;
CREATE POLICY "delete_candidate_notes" ON candidate_notes
  FOR DELETE TO authenticated
  USING (
    candidate_notes.user_id = auth.uid()
    OR user_org_role(candidate_notes.organization_id) IN ('owner', 'admin')
  );

-- audit_events
DROP POLICY IF EXISTS "select_audit_events" ON audit_events;
CREATE POLICY "select_audit_events" ON audit_events
  FOR SELECT TO authenticated
  USING (user_org_role(audit_events.organization_id) IS NOT NULL);

DROP POLICY IF EXISTS "insert_audit_events" ON audit_events;
CREATE POLICY "insert_audit_events" ON audit_events
  FOR INSERT TO authenticated
  WITH CHECK (user_org_role(audit_events.organization_id) IS NOT NULL);

-- ============================================================
-- 5. Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_org_id ON jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_candidates_org_id ON candidates(organization_id);
CREATE INDEX IF NOT EXISTS idx_candidates_job_id ON candidates(job_id);
CREATE INDEX IF NOT EXISTS idx_candidates_review_status ON candidates(review_status);
CREATE INDEX IF NOT EXISTS idx_candidate_notes_candidate_id ON candidate_notes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_org_id ON audit_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_invitations_org_id ON invitations(organization_id);
