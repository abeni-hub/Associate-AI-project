/*
# Fix invitations SELECT policy RLS permission error

## Problem
The `select_invitations` policy in the core schema attempted to subquery `auth.users`:
`(SELECT email FROM auth.users WHERE id = auth.uid())`
In Supabase, the `authenticated` role does not have direct SELECT permissions on the `auth.users` table.
This causes PostgreSQL to raise a 42501 permission denied error, which PostgREST translates into HTTP 403 Forbidden.

## Fix
1. Replace the direct subquery on `auth.users` with `auth.jwt() ->> 'email'`, which safely reads the user's email claim from their verified JWT token.
2. Allow organization members, organization creators, and the recipient of the pending invitation to SELECT from `invitations`.
*/

DROP POLICY IF EXISTS "select_invitations" ON invitations;
CREATE POLICY "select_invitations" ON invitations
  FOR SELECT TO authenticated
  USING (
    user_org_role(invitations.organization_id) IS NOT NULL
    OR (invitations.email = (auth.jwt() ->> 'email') AND invitations.status = 'pending')
    OR EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = invitations.organization_id
      AND o.created_by = auth.uid()
    )
  );
