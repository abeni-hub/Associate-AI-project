import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './auth-context';
import type { DatabaseOrganization, DatabaseOrgMember } from '@/lib/types';
import type { OrgRole } from '@/lib/constants';

interface OrgContextValue {
  organizations: DatabaseOrganization[];
  currentOrg: DatabaseOrganization | null;
  currentRole: OrgRole | null;
  membership: DatabaseOrgMember | null;
  loading: boolean;
  setCurrentOrg: (org: DatabaseOrganization) => void;
  refresh: () => Promise<void>;
}

const OrgContext = createContext<OrgContextValue | undefined>(undefined);

const STORAGE_KEY = 'talentforge.currentOrgId';

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<DatabaseOrganization[]>([]);
  const [currentOrg, setCurrentOrgState] = useState<DatabaseOrganization | null>(null);
  const [membership, setMembership] = useState<DatabaseOrgMember | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOrganizations = useCallback(async () => {
    if (!user) {
      setOrganizations([]);
      setCurrentOrgState(null);
      setMembership(null);
      setLoading(false);
      return;
    }

    const { data: members } = await supabase
      .from('organization_members')
      .select('organization_id, role, user_id, id, created_at')
      .eq('user_id', user.id);

    if (!members || members.length === 0) {
      setOrganizations([]);
      setCurrentOrgState(null);
      setMembership(null);
      setLoading(false);
      return;
    }

    const orgIds = members.map((m) => m.organization_id);
    const { data: orgs } = await supabase
      .from('organizations')
      .select('*')
      .in('id', orgIds);

    const orgList = (orgs || []) as DatabaseOrganization[];
    setOrganizations(orgList);

    const storedId = localStorage.getItem(STORAGE_KEY);
    const targetOrg = orgList.find((o) => o.id === storedId) || orgList[0];

    if (targetOrg) {
      setCurrentOrgState(targetOrg);
      const member = (members as DatabaseOrgMember[]).find((m) => m.organization_id === targetOrg.id);
      setMembership(member || null);
      localStorage.setItem(STORAGE_KEY, targetOrg.id);
    } else {
      setCurrentOrgState(null);
      setMembership(null);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  const setCurrentOrg = useCallback((org: DatabaseOrganization) => {
    setCurrentOrgState(org);
    localStorage.setItem(STORAGE_KEY, org.id);
    if (user) {
      supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', org.id)
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => setMembership((data as DatabaseOrgMember) || null));
    }
  }, [user]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await loadOrganizations();
  }, [loadOrganizations]);

  return (
    <OrgContext.Provider
      value={{
        organizations,
        currentOrg,
        currentRole: membership?.role ?? null,
        membership,
        loading,
        setCurrentOrg,
        refresh,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
}

export function useOrganization() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error('useOrganization must be used within OrganizationProvider');
  return ctx;
}
