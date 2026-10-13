/*
# Fix organization creation RLS and allow creator to read their org

## Problem
When a user creates an organization, the INSERT succeeds (policy checks
auth.uid() = created_by), but the subsequent SELECT (from .insert().select())
fails because the SELECT policy requires user_org_role() IS NOT NULL —
and no membership row exists yet. This makes the whole operation appear
to fail with an RLS error.

## Fix
1. The organizations SELECT policy now ALSO allows the creator to read
   their org before the membership row is created:
   `user_org_role(id) IS NOT NULL OR created_by = auth.uid()`
2. The INSERT policy is unchanged (auth.uid() = created_by).

## Tables modified
- `organizations` — SELECT policy updated
*/
DROP POLICY IF EXISTS "select_own_organizations" ON organizations;
CREATE POLICY "select_own_organizations" ON organizations
  FOR SELECT TO authenticated
  USING (
    user_org_role(organizations.id) IS NOT NULL
    OR organizations.created_by = auth.uid()
  );
