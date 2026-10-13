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

    try {
      // 1. Query membership rows for the user
      const { data: members } = await supabase
        .from('organization_members')
        .select('organization_id, role, user_id, id, created_at')
        .eq('user_id', user.id);

      const memberOrgIds = (members || []).map((m) => m.organization_id);

      // 2. Also query organizations created by the user (creator fallback)
      const { data: createdOrgs } = await supabase
        .from('organizations')
        .select('*')
        .eq('created_by', user.id);

      const createdList = (createdOrgs || []) as DatabaseOrganization[];
      const createdIds = createdList.map((o) => o.id);

      const allOrgIds = Array.from(new Set([...memberOrgIds, ...createdIds]));

      if (allOrgIds.length === 0) {
        setOrganizations([]);
        setCurrentOrgState(null);
        setMembership(null);
        setLoading(false);
        return;
      }

      // 3. Query all organizations matching either membership or creator
      const { data: orgs } = await supabase
        .from('organizations')
        .select('*')
        .in('id', allOrgIds);

      const orgListMap = new Map<string, DatabaseOrganization>();
      createdList.forEach((o) => orgListMap.set(o.id, o));
      ((orgs || []) as DatabaseOrganization[]).forEach((o) => orgListMap.set(o.id, o));

      const orgList = Array.from(orgListMap.values());
      setOrganizations(orgList);

      const storedId = localStorage.getItem(STORAGE_KEY);
      const targetOrg = orgList.find((o) => o.id === storedId) || orgList[0];

      if (targetOrg) {
        setCurrentOrgState(targetOrg);
        let member = (members as DatabaseOrgMember[] || []).find((m) => m.organization_id === targetOrg.id);

        // If user is creator but member row is not present yet, grant owner role and heal membership
        if (!member && targetOrg.created_by === user.id) {
          member = {
            id: 'creator-' + targetOrg.id,
            organization_id: targetOrg.id,
            user_id: user.id,
            role: 'owner',
            created_at: targetOrg.created_at,
          };
          supabase.from('organization_members').insert({
            organization_id: targetOrg.id,
            user_id: user.id,
            role: 'owner',
          }).then(() => {});
        }

        setMembership(member || null);
        localStorage.setItem(STORAGE_KEY, targetOrg.id);
      } else {
        setCurrentOrgState(null);
        setMembership(null);
      }
    } catch (err) {
      console.error('Error loading organizations:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  const setCurrentOrg = useCallback((org: DatabaseOrganization) => {
    setCurrentOrgState(org);
    setOrganizations((prev) => {
      if (prev.some((o) => o.id === org.id)) return prev;
      return [...prev, org];
    });
    localStorage.setItem(STORAGE_KEY, org.id);
    if (user) {
      supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', org.id)
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setMembership(data as DatabaseOrgMember);
          } else if (org.created_by === user.id) {
            setMembership({
              id: 'creator-' + org.id,
              organization_id: org.id,
              user_id: user.id,
              role: 'owner',
              created_at: org.created_at,
            });
          }
        });
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
