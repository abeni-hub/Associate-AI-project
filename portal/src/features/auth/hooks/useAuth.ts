import { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePortal } from '../../shared';
import { useLoginMutation } from '../api/authApi';
import type { ValidationErrorMap } from '../../../types/api.types';
import { tokenStorage } from '../../../utils/tokenStorage';

export function useAuth() {
  const portal = usePortal();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginTrigger, { isLoading }] = useLoginMutation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleUsernameChange = useCallback((val: string) => {
    setUsername(val);
    setError('');
  }, []);

  const handlePasswordChange = useCallback((val: string) => {
    setPassword(val);
    setError('');
  }, []);

  const handleToggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleForgotPassword = useCallback(() => {
    setError('Please contact your central platform administrator to reset your password.');
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      const cleanUsername = username.trim();
      const cleanPassword = password.trim();

      if (!cleanUsername || !cleanPassword) {
        setError('Please enter your username or email and password.');
        return;
      }

      try {
        const response = await loginTrigger({
          username: cleanUsername,
          password: cleanPassword,
        }).unwrap();

        if (response.success && response.data) {
          tokenStorage.clearSessionDraftsForOtherUsers(response.data.id);
          portal.signInLive(response.data, response.data.token);
          tokenStorage.clearSessionExpired();
          const from = (location.state as { from?: { pathname?: string; search?: string; hash?: string } } | null)?.from;
          const returnPath = from?.pathname?.startsWith('/') && !from.pathname.startsWith('//') && from.pathname !== '/login'
            ? `${from.pathname}${from.search || ''}${from.hash || ''}`
            : '/overview';
          navigate(returnPath, { replace: true });
        } else {
          setError(response.message || 'Login failed. Please verify your credentials.');
        }
      } catch (err: unknown) {
        const errObj = err as { data?: { errors?: ValidationErrorMap; message?: string } };
        const apiErrors = errObj?.data?.errors;
        if (apiErrors && typeof apiErrors === 'object') {
          const firstField = Object.keys(apiErrors)[0];
          const firstMsg = Array.isArray(apiErrors[firstField])
            ? apiErrors[firstField][0]
            : apiErrors[firstField];
          setError(
            firstMsg ||
              errObj?.data?.message ||
              'Invalid credentials. Please verify your username and password.'
          );
        } else {
          setError(
            errObj?.data?.message || 'Authentication failed. Please verify your credentials.'
          );
        }
      }
    },
    [username, password, loginTrigger, portal, navigate, location.state]
  );

  return {
    username,
    password,
    showPassword,
    error,
    isLoading,
    handleUsernameChange,
    handlePasswordChange,
    handleToggleShowPassword,
    handleSubmit,
    handleForgotPassword,
  };
}

export default useAuth;
