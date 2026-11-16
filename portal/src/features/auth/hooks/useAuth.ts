import { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePortal } from '../../shared';
import { useLoginMutation, useTwoFactorChallengeMutation } from '../api/authApi';
import type { ValidationErrorMap } from '../../../types/api.types';
import { tokenStorage } from '../../../utils/tokenStorage';
import type { LoginResponseData } from '../types/auth.types';

export function useAuth() {
  const portal = usePortal();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginTrigger, { isLoading }] = useLoginMutation();
  const [challengeTrigger, { isLoading: isChallengeLoading }] = useTwoFactorChallengeMutation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [challengeToken, setChallengeToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const busy = isLoading || isChallengeLoading;

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

      if (!challengeToken && (!cleanUsername || !cleanPassword)) {
        setError('Please enter your username or email and password.');
        return;
      }

      try {
        const response = challengeToken
          ? await challengeTrigger({
              challenge_token: challengeToken,
              ...(useRecoveryCode ? { recovery_code: recoveryCode.trim() } : { code: twoFactorCode.trim() }),
            }).unwrap()
          : await loginTrigger({ username: cleanUsername, password: cleanPassword }).unwrap();

        if (response.success && response.data) {
          if ('two_factor_required' in response.data) {
            setChallengeToken(response.data.challenge_token);
            setPassword('');
            setError('');
            return;
          }

          const user = response.data as LoginResponseData;
          tokenStorage.clearSessionDraftsForOtherUsers(response.data.id);
          portal.signInLive(user, user.token);
          tokenStorage.clearSessionExpired();
          setChallengeToken('');
          const from = (location.state as { from?: { pathname?: string; search?: string; hash?: string } } | null)?.from;
          const returnPath = user.two_factor_setup_required
            ? '/security'
            : from?.pathname?.startsWith('/') && !from.pathname.startsWith('//') && from.pathname !== '/login'
            ? `${from.pathname}${from.search || ''}${from.hash || ''}`
            : '/overview';
          navigate(returnPath, { replace: true });
        } else {
          setError(response.message || 'Login failed. Please verify your credentials.');
        }
      } catch (err: unknown) {
        const errObj = err as { data?: { errors?: ValidationErrorMap | { exception?: string }; message?: string } };
        const apiErrors = errObj?.data?.errors as Record<string, unknown> | undefined;
        const apiMessage = errObj?.data?.message;

        if (apiErrors && typeof apiErrors === 'object' && !('exception' in apiErrors)) {
          const firstField = Object.keys(apiErrors)[0];
          const firstMsg = Array.isArray(apiErrors[firstField])
            ? (apiErrors[firstField] as string[])[0]
            : (apiErrors[firstField] as string);
          setError(
            firstMsg ||
              apiMessage ||
              'Invalid credentials. Please verify your username and password.'
          );
        } else {
          setError(
            apiMessage || 'Authentication failed. Please verify your credentials.'
          );
        }
      }
    },
    [username, password, challengeToken, twoFactorCode, recoveryCode, useRecoveryCode, loginTrigger, challengeTrigger, portal, navigate, location.state]
  );

  return {
    username,
    password,
    twoFactorChallenge: Boolean(challengeToken),
    twoFactorCode,
    recoveryCode,
    useRecoveryCode,
    isLoading: busy,
    showPassword,
    error,
    handleUsernameChange,
    handlePasswordChange,
    handleToggleShowPassword,
    handleSubmit,
    handleForgotPassword,
    handleTwoFactorCodeChange: setTwoFactorCode,
    handleRecoveryCodeChange: setRecoveryCode,
    handleToggleRecoveryCode: () => {
      setUseRecoveryCode((value) => !value);
      setTwoFactorCode('');
      setRecoveryCode('');
      setError('');
    },
  };
}

export default useAuth;
