import { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePortal } from '../../shared';
import { useLoginMutation, useTwoFactorChallengeMutation } from '../api/authApi';
import type { ValidationErrorMap } from '../../../types/api.types';
import { tokenStorage } from '../../../utils/tokenStorage';
import type { LoginResponseData } from '../types/auth.types';

const LOCKOUT_KEY = 'civiclink_lockout_until';
const LOCKOUT_MSG_KEY = 'civiclink_lockout_msg';

function getStoredLockoutRemaining(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const stored = window.localStorage.getItem(LOCKOUT_KEY);
    if (stored) {
      const remaining = Math.ceil((Number(stored) - Date.now()) / 1000);
      if (remaining > 0) return remaining;
      window.localStorage.removeItem(LOCKOUT_KEY);
      window.localStorage.removeItem(LOCKOUT_MSG_KEY);
    }
  } catch {
    // Storage unavailable
  }
  return 0;
}

function setStoredLockout(seconds: number, message: string): void {
  if (typeof window === 'undefined') return;
  try {
    const until = Date.now() + seconds * 1000;
    window.localStorage.setItem(LOCKOUT_KEY, String(until));
    window.localStorage.setItem(LOCKOUT_MSG_KEY, message);
  } catch {
    // Storage unavailable
  }
}

function clearStoredLockout(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(LOCKOUT_KEY);
    window.localStorage.removeItem(LOCKOUT_MSG_KEY);
  } catch {
    // Storage unavailable
  }
}

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
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(() => getStoredLockoutRemaining());
  const [error, setError] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    try {
      const remaining = getStoredLockoutRemaining();
      if (remaining > 0) {
        return (
          window.localStorage.getItem(LOCKOUT_MSG_KEY) ||
          'Too many sign-in attempts. Access is temporarily locked.'
        );
      }
    } catch {
      // Storage unavailable
    }
    return '';
  });
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const busy = isLoading || isChallengeLoading;

  useEffect(() => {
    if (lockoutSeconds <= 0) return;

    const timer = setInterval(() => {
      const remaining = getStoredLockoutRemaining();
      if (remaining <= 0) {
        clearStoredLockout();
        setLockoutSeconds(0);
        setError('');
        clearInterval(timer);
      } else {
        setLockoutSeconds(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lockoutSeconds > 0]);

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
      if (lockoutSeconds > 0) {
        return;
      }

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
          clearStoredLockout();
          setLockoutSeconds(0);
          setRemainingAttempts(null);
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
        const errObj = err as {
          status?: number;
          data?: {
            errors?: ValidationErrorMap | { exception?: string };
            message?: string;
            data?: { retry_after?: number; remaining_attempts?: number; max_attempts?: number };
          };
        };
        const status = errObj?.status;
        const apiData = errObj?.data?.data;
        const apiErrors = errObj?.data?.errors as Record<string, unknown> | undefined;
        const apiMessage = errObj?.data?.message;

        const retrySeconds =
          Number(apiData?.retry_after) ||
          Number(apiErrors?.retry_after_seconds) ||
          (status === 429 ? 60 : 0);

        if (status === 429 || retrySeconds > 0 || apiMessage?.toLowerCase().includes('too many') || apiMessage?.toLowerCase().includes('sign-in attempts')) {
          const seconds = retrySeconds > 0 ? retrySeconds : 60;
          const msg = apiMessage || 'Too many sign-in attempts. Access is temporarily locked.';
          setStoredLockout(seconds, msg);
          setLockoutSeconds(seconds);
          setRemainingAttempts(0);
          setError(msg);
          return;
        }

        if (apiData && typeof apiData === 'object' && 'remaining_attempts' in apiData) {
          setRemainingAttempts(Number(apiData.remaining_attempts));
        } else {
          setRemainingAttempts(null);
        }

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
    [username, password, challengeToken, twoFactorCode, recoveryCode, useRecoveryCode, lockoutSeconds, loginTrigger, challengeTrigger, portal, navigate, location.state]
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
    lockoutSeconds,
    remainingAttempts,
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
