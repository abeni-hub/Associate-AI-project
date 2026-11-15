import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  setCredentials,
  setRole,
  clearAuth,
  selectAuthUser,
  selectAuthRole,
  selectIsAuthenticated,
} from '../../auth/slice/authSlice';
import {
  setMobileOpen,
  setModal,
  closeModal,
  setGlobalSearch,
  resetGlobalSearch,
  selectMobileOpen,
  selectActiveModal,
  selectGlobalSearch,
} from '../slice/uiSlice';
import { useLogoutMutation } from '../../auth/api/authApi';
import { baseApi } from '../../../app/baseApi';
import { tokenStorage } from '../../../utils/tokenStorage';
import type { AuthUser } from '../../auth/types/auth.types';
import type { RoleKey, ModalConfig, FeedbackItem, FormFieldConfig, RouteStep, PostItem } from '../../../types/portal.types';

export const usePortal = () => {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector(selectAuthUser);
  const role = useAppSelector(selectAuthRole);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const mobileOpen = useAppSelector(selectMobileOpen);
  const modal = useAppSelector(selectActiveModal);
  const search = useAppSelector(selectGlobalSearch);

  const [logoutTrigger] = useLogoutMutation();

  const signInLive = useCallback(
    (user: AuthUser, token?: string) => {
      dispatch(setCredentials({ user, token }));
    },
    [dispatch]
  );

  const signOut = useCallback(async () => {
    try {
      if (tokenStorage.hasToken()) {
        await logoutTrigger().unwrap();
      }
    } catch {
      // Ignore network failures during logout
    } finally {
      dispatch(clearAuth());
      dispatch(baseApi.util.resetApiState());
      dispatch(closeModal());
      dispatch(resetGlobalSearch());
    }
  }, [dispatch, logoutTrigger]);

  const openForm = useCallback(
    (config: {
      eyebrow?: string;
      title: string;
      description?: string;
      submit?: string;
      fields: FormFieldConfig[];
      onSubmit: (values: Record<string, string>) => void;
    }) => {
      dispatch(setModal({ kind: 'form', ...config } as unknown as ModalConfig));
    },
    [dispatch]
  );

  const openFeedback = useCallback(
    (item: FeedbackItem) => {
      dispatch(setModal({ kind: 'feedback', item } as unknown as ModalConfig));
    },
    [dispatch]
  );

  const createForPage = useCallback(
    (page: string) => {
      if (page === 'subcities' || page === 'offices') {
        openForm({
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
          onSubmit: () => {
            dispatch(closeModal());
          },
        });
      } else if (page === 'bureaus') {
        openForm({
          eyebrow: 'ORGANIZATION DIRECTORY',
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
          onSubmit: () => {
            dispatch(closeModal());
          },
        });
      } else {
        openForm({
          eyebrow: 'CIVIC WORKSPACE',
          title: `Create new ${page}`,
          description: `Set up details and administrative properties for ${page}.`,
          submit: 'Save & create',
          fields: [
            { name: 'name', label: 'Title / name', required: true },
            { name: 'description', label: 'Description', type: 'textarea' },
          ],
          onSubmit: () => {
            dispatch(closeModal());
          },
        });
      }
    },
    [dispatch, openForm]
  );

  return {
    role,
    setRole: (r: RoleKey) => dispatch(setRole(r)),
    authUser,
    session: isAuthenticated ? { role, user: authUser } : null,
    signInLive,
    signOut,
    mobileOpen,
    setMobileOpen: (open: boolean) => dispatch(setMobileOpen(open)),
    modal,
    setModal: (m: ModalConfig) => dispatch(setModal(m)),
    search,
    setSearch: (s: string) => dispatch(setGlobalSearch(s)),
    typeFilter: 'All types',
    setTypeFilter: (_t: string) => {},
    statusFilter: 'All statuses',
    setStatusFilter: (_s: string) => {},
    resetSearch: () => dispatch(resetGlobalSearch()),
    openForm,
    openFeedback,
    createForPage,
    saveRouteSteps: (_routeId: number, _steps: RouteStep[]) => {},
    posts: [] as PostItem[],
    onTogglePostPublish: (_id: number | string) => {},
  };
};

export default usePortal;
