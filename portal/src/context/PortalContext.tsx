import React, { useMemo, useState } from 'react';
import type {
  AccountItem,
  BureauItem,
  FeedbackItem,
  FormFieldConfig,
  ModalConfig,
  PostItem,
  RoleKey,
  RouteItem,
  RouteStep,
  ServiceItem,
  SubcityItem,
} from '../types/portal.types';
import type { AuthUser } from '../features/auth/auth.types';
import { mapBackendRoleToPortalRole } from '../features/auth/auth.types';
import {
  INITIAL_ACCOUNTS,
  INITIAL_BUREAUS,
  INITIAL_FEEDBACK,
  INITIAL_POSTS,
  INITIAL_ROUTES,
  INITIAL_SERVICES,
  INITIAL_SUBCITIES,
} from '../data/portalConstants';
import { PortalContext } from './portalContextDef';
import type { PortalSession } from './portalContextDef';
import { useAppDispatch } from '../app/hooks';
import { clearAuth, setCredentials } from '../features/auth/authSlice';
import { useLogoutMutation } from '../services/authApi';
import { baseApi } from '../services/baseApi';
import { tokenStorage } from '../utils/tokenStorage';

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const [logoutTrigger] = useLogoutMutation();

  const [role, setRole] = useState<RoleKey>(() => {
    const saved = tokenStorage.getSessionRole<RoleKey>();
    return saved === 'super' || saved === 'subcity' || saved === 'bureau' ? saved : 'super';
  });

  const [session, setSession] = useState<PortalSession | null>(() => {
    const savedRole = tokenStorage.getSessionRole<RoleKey>();
    const savedUser = tokenStorage.getSessionUser<AuthUser>();
    if (savedRole && (tokenStorage.hasToken() || savedRole)) {
      return {
        role: savedRole,
        isDemo: !tokenStorage.hasToken(),
        user: savedUser,
      };
    }
    return null;
  });

  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    return tokenStorage.getSessionUser<AuthUser>();
  });

  const [mobileOpen, setMobileOpen] = useState(false);
  const [modal, setModal] = useState<ModalConfig>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All types');
  const [statusFilter, setStatusFilter] = useState('All statuses');

  const [subcities, setSubcities] = useState<SubcityItem[]>(INITIAL_SUBCITIES);
  const [bureaus, setBureaus] = useState<BureauItem[]>(INITIAL_BUREAUS);
  const [accounts, setAccounts] = useState<AccountItem[]>(INITIAL_ACCOUNTS);
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [routes, setRoutes] = useState<RouteItem[]>(INITIAL_ROUTES);
  const [feedback, setFeedback] = useState<FeedbackItem[]>(INITIAL_FEEDBACK);
  const [posts, setPosts] = useState<PostItem[]>(INITIAL_POSTS);

  const resetSearch = () => {
    setSearch('');
    setTypeFilter('All types');
    setStatusFilter('All statuses');
  };

  const signInDemo = (selected: RoleKey) => {
    setRole(selected);
    setAuthUser(null);
    tokenStorage.setSessionRole(selected);
    tokenStorage.setSessionUser(null);
    setSession({ role: selected, isDemo: true, user: null });
    resetSearch();
  };

  const signInLive = (user: AuthUser, token?: string) => {
    const mapped = mapBackendRoleToPortalRole(user.role?.slug);
    setRole(mapped);
    setAuthUser(user);
    tokenStorage.setSessionRole(mapped);
    tokenStorage.setSessionUser(user);
    if (token) {
      tokenStorage.setToken(token);
    }
    dispatch(setCredentials({ token: token || tokenStorage.getToken() || undefined, user }));
    setSession({ role: mapped, isDemo: false, user });
    resetSearch();
  };

  const signOut = async () => {
    try {
      if (tokenStorage.hasToken()) {
        await logoutTrigger().unwrap();
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      dispatch(clearAuth());
      dispatch(baseApi.util.resetApiState());
      tokenStorage.clearToken();
      setSession(null);
      setAuthUser(null);
      setModal(null);
      resetSearch();
    }
  };

  const openForm = (config: {
    eyebrow?: string;
    title: string;
    description?: string;
    submit?: string;
    fields: FormFieldConfig[];
    onSubmit: (values: Record<string, string>) => void;
  }) => setModal({ kind: 'form', ...config });

  const openFeedback = (item: FeedbackItem) =>
    setModal({
      kind: 'feedback',
      item,
      onUpdate: (status) =>
        setFeedback((list) =>
          list.map((entry) => (entry.id === item.id ? { ...entry, status } : entry))
        ),
    });

  const saveRouteSteps = (routeId: number, steps: RouteStep[]) => {
    setRoutes((list) =>
      list.map((route) =>
        route.id === routeId ? { ...route, steps, status: 'Draft', updated: 'Just now' } : route
      )
    );
  };

  const createForPage = (page: string) => {
    if (page === 'subcities') {
      return openForm({
        eyebrow: 'PLATFORM DIRECTORY',
        title: 'Add a sub-city',
        description: 'Create a local workspace and invite its administrator.',
        submit: 'Create sub-city',
        fields: [
          { name: 'name', label: 'Sub-city name', required: true },
          { name: 'admin', label: 'Administrator name', required: true },
          { name: 'username', label: 'Admin username', required: true },
          { name: 'email', label: 'Work email', type: 'email', required: true },
        ],
        onSubmit: (v) => {
          setSubcities((list) => [
            {
              id: Date.now(),
              name: v.name,
              admin: v.admin,
              bureaus: 0,
              services: 0,
              status: 'Setup',
              updated: 'Just now',
            },
            ...list,
          ]);
          setAccounts((list) => [
            {
              id: Date.now() + 1,
              name: v.admin,
              username: v.username,
              role: 'Sub-city admin',
              organization: v.name,
              status: 'Pending',
              lastActive: 'Never',
            },
            ...list,
          ]);
        },
      });
    }

    if (page === 'bureaus') {
      return openForm({
        eyebrow: 'LEMI KURA · ORGANIZATION',
        title: 'Add a bureau',
        description: 'Register an office and assign a bureau administrator.',
        submit: 'Create bureau',
        fields: [
          { name: 'name', label: 'Bureau name', required: true },
          { name: 'category', label: 'Service category', placeholder: 'e.g. Civil registration' },
          { name: 'admin', label: 'Administrator name', required: true },
          { name: 'username', label: 'Admin username', required: true },
          { name: 'email', label: 'Work email', type: 'email', required: true },
        ],
        onSubmit: (v) => {
          setBureaus((list) => [
            {
              id: Date.now(),
              name: v.name,
              category: v.category || 'Public services',
              admin: v.admin,
              services: 0,
              completion: 0,
              status: 'In progress',
            },
            ...list,
          ]);
          setAccounts((list) => [
            {
              id: Date.now() + 1,
              name: v.admin,
              username: v.username,
              role: 'Bureau admin',
              organization: `${v.name} · Lemi Kura`,
              status: 'Pending',
              lastActive: 'Never',
            },
            ...list,
          ]);
        },
      });
    }

    if (page === 'accounts') {
      return openForm({
        eyebrow: 'ACCESS & PERMISSIONS',
        title: 'Create an account',
        description: 'Assign a role and organization to give an administrator the right workspace.',
        submit: 'Create account',
        fields: [
          { name: 'name', label: 'Full name', required: true },
          { name: 'username', label: 'Username', required: true },
          { name: 'email', label: 'Work email', type: 'email', required: true },
          {
            name: 'role',
            label: 'Admin role',
            type: 'select',
            required: true,
            options: ['Sub-city admin', 'Bureau admin'],
          },
          { name: 'organization', label: 'Organization', required: true },
          {
            name: 'password',
            label: 'Temporary password',
            placeholder: 'Set a temporary password',
            required: true,
          },
        ],
        onSubmit: (v) =>
          setAccounts((list) => [
            {
              id: Date.now(),
              name: v.name,
              username: v.username,
              role: v.role,
              organization: v.organization,
              status: 'Pending',
              lastActive: 'Never',
            },
            ...list,
          ]),
      });
    }

    if (page === 'services') {
      return openForm({
        eyebrow: 'SERVICE INFORMATION',
        title: 'Create a service standard',
        description: 'Define the service, required documents and expectations on both sides.',
        submit: 'Save service',
        fields: [
          { name: 'name', label: 'Service name', required: true },
          {
            name: 'serviceType',
            label: 'Service level',
            type: 'select',
            required: true,
            options: ['Main service', 'Sub-service'],
          },
          { name: 'parentService', label: 'Parent service', placeholder: 'Required for a sub-service' },
          { name: 'category', label: 'Category', placeholder: 'e.g. Civil registration' },
          { name: 'description', label: 'What this service does', type: 'textarea', full: true, required: true },
          {
            name: 'documents',
            label: 'Required documents',
            type: 'textarea',
            full: true,
            rows: 3,
            placeholder: 'Add one document per line',
          },
          {
            name: 'customerExpectations',
            label: 'What the citizen should prepare or do',
            type: 'textarea',
            full: true,
            required: true,
          },
          {
            name: 'bureauExpectations',
            label: 'What the bureau commits to',
            type: 'textarea',
            full: true,
            required: true,
          },
        ],
        onSubmit: (v) =>
          setServices((list) => [
            {
              id: Date.now(),
              name: v.name,
              serviceType: v.serviceType,
              parentService: v.parentService,
              category: v.category || 'Public service',
              description: v.description,
              documents: (v.documents || '').split('\n').filter(Boolean),
              bureaus: 0,
              published: false,
              customerExpectations: v.customerExpectations,
              bureauExpectations: v.bureauExpectations,
            },
            ...list,
          ]),
      });
    }

    if (page === 'news') {
      return openForm({
        eyebrow: 'PUBLIC INFORMATION',
        title: 'Create an update',
        description: 'Share an official announcement or upcoming event with your community.',
        submit: 'Save update',
        fields: [
          { name: 'type', label: 'Update type', type: 'select', required: true, options: ['News', 'Event'] },
          { name: 'title', label: 'Title', required: true },
          { name: 'date', label: 'Publish or event date', type: 'date', required: true },
          { name: 'audience', label: 'Audience', placeholder: 'e.g. All residents' },
          {
            name: 'excerpt',
            label: 'What residents should know',
            type: 'textarea',
            full: true,
            required: true,
          },
          { name: 'status', label: 'Save as', type: 'select', required: true, options: ['Draft', 'Published'] },
        ],
        onSubmit: (v) =>
          setPosts((list) => [
            {
              id: Date.now(),
              type: v.type,
              title: v.title,
              excerpt: v.excerpt,
              date: v.date,
              status: v.status,
              audience: v.audience || 'All residents',
            },
            ...list,
          ]),
      });
    }

    if (page === 'routes') {
      return setModal({
        kind: 'route',
        route: routes[0],
        onSave: (steps) => saveRouteSteps(routes[0]?.id, steps),
      });
    }
  };

  const onUpdateService = (item: ServiceItem) =>
    openForm({
      eyebrow: 'SERVICE INFORMATION',
      title: 'Edit service standard',
      description: 'Update the service description, checklist and shared expectations.',
      submit: 'Save standard',
      fields: [
        { name: 'name', label: 'Service name', required: true, value: item.name },
        {
          name: 'serviceType',
          label: 'Service level',
          type: 'select',
          required: true,
          value: item.serviceType || 'Main service',
          options: ['Main service', 'Sub-service'],
        },
        { name: 'parentService', label: 'Parent service', value: item.parentService || '' },
        { name: 'category', label: 'Category', value: item.category },
        {
          name: 'description',
          label: 'What this service does',
          type: 'textarea',
          full: true,
          required: true,
          value: item.description,
        },
        {
          name: 'documents',
          label: 'Required documents',
          type: 'textarea',
          full: true,
          rows: 3,
          value: item.documents.join('\n'),
        },
        {
          name: 'customerExpectations',
          label: 'What the citizen should prepare or do',
          type: 'textarea',
          full: true,
          required: true,
          value: item.customerExpectations,
        },
        {
          name: 'bureauExpectations',
          label: 'What the bureau commits to',
          type: 'textarea',
          full: true,
          required: true,
          value: item.bureauExpectations,
        },
      ],
      onSubmit: (v) =>
        setServices((list) =>
          list.map((service) =>
            service.id === item.id
              ? {
                  ...service,
                  name: v.name,
                  category: v.category,
                  serviceType: v.serviceType,
                  parentService: v.parentService,
                  description: v.description,
                  documents: v.documents.split('\n').filter(Boolean),
                  customerExpectations: v.customerExpectations,
                  bureauExpectations: v.bureauExpectations,
                }
              : service
          )
        ),
    });

  const onToggleServicePublish = (id: number) => {
    setServices((list) =>
      list.map((item) => (item.id === id ? { ...item, published: !item.published } : item))
    );
  };

  const onTogglePostPublish = (id: number) => {
    setPosts((list) =>
      list.map((item) =>
        item.id === id ? { ...item, status: item.status === 'Published' ? 'Draft' : 'Published' } : item
      )
    );
  };

  const visibleFeedback = useMemo(() => {
    if (role === 'bureau') {
      return feedback.filter((item) => item.bureau === 'Revenues Bureau' && item.subcity === 'Lemi Kura');
    }
    if (role === 'subcity') {
      return feedback.filter((item) => item.subcity === 'Lemi Kura');
    }
    return feedback;
  }, [feedback, role]);

  return (
    <PortalContext.Provider
      value={{
        role,
        setRole,
        session,
        authUser,
        signInDemo,
        signInLive,
        signOut,
        mobileOpen,
        setMobileOpen,
        modal,
        setModal,
        search,
        setSearch,
        typeFilter,
        setTypeFilter,
        statusFilter,
        setStatusFilter,
        resetSearch,
        subcities,
        bureaus,
        accounts,
        services,
        routes,
        feedback,
        posts,
        visibleFeedback,
        openForm,
        openFeedback,
        createForPage,
        onUpdateService,
        onToggleServicePublish,
        onTogglePostPublish,
        saveRouteSteps,
      }}
    >
      {children}
    </PortalContext.Provider>
  );
};

