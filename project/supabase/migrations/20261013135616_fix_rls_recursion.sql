/*
# Fix infinite recursion in organization_members RLS policies

## Problem
The SELECT/INSERT/UPDATE/DELETE policies on `organization_members` all used
`EXISTS (SELECT 1 FROM organization_members m2 WHERE ...)` — a self-referencing
subquery that triggers the table's own SELECT policy, which triggers itself
again, causing infinite recursion.

A secondary issue: the INSERT policy required an existing owner/admin to
authorize the insert, but the very first owner (creating a new org) has no
membership row yet — so the insert would fail even without recursion.

## Fix
1. Replace all self-referencing EXISTS checks with calls to the `user_org_role()`
   SECURITY DEFINER function. Because the function is SECURITY DEFINER, it runs
   with the owner's privileges and bypasses RLS — breaking the recursion.
2. The INSERT policy now allows inserts when EITHER:
   - The user is already an owner/admin (adding a team member), OR
   - The user is the `created_by` of the organization (first owner setup).
3. The `organizations` SELECT policy is also simplified to use `user_org_role()`
   directly, avoiding cross-table subqueries that could re-enter the cycle.

## Tables modified
- `organization_members` — all 4 CRUD policies rewritten
- `organizations` — SELECT policy simplified
*/
-- ============================================================
-- Fix organizations SELECT policy
-- ============================================================
DROP POLICY IF EXISTS "select_own_organizations" ON organizations;
CREATE POLICY "select_own_organizations" ON organizations
  FOR SELECT TO authenticated
  USING (user_org_role(organizations.id) IS NOT NULL);

-- ============================================================
-- Fix organization_members — all policies use user_org_role() to avoid recursion
-- ============================================================
DROP POLICY IF EXISTS "select_org_members" ON organization_members;
CREATE POLICY "select_org_members" ON organization_members
  FOR SELECT TO authenticated
  USING (user_org_role(organization_members.organization_id) IS NOT NULL);

DROP POLICY IF EXISTS "insert_org_members" ON organization_members;
CREATE POLICY "insert_org_members" ON organization_members
  FOR INSERT TO authenticated
  WITH CHECK (
    user_org_role(organization_members.organization_id) IN ('owner', 'admin')
    OR EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = organization_members.organization_id
      AND o.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_org_members" ON organization_members;
CREATE POLICY "update_org_members" ON organization_members
  FOR UPDATE TO authenticated
  USING (user_org_role(organization_members.organization_id) IN ('owner', 'admin'))
  WITH CHECK (user_org_role(organization_members.organization_id) IN ('owner', 'admin'));

DROP POLICY IF EXISTS "delete_org_members" ON organization_members;
CREATE POLICY "delete_org_members" ON organization_members
  FOR DELETE TO authenticated
  USING (user_org_role(organization_members.organization_id) IN ('owner', 'admin'));
