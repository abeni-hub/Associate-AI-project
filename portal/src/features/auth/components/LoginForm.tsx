import React from 'react';
import { Icon } from '../../shared';
import type { LoginFormProps } from '../types/auth.types';
import styles from '../styles/loginForm.module.css';

export const LoginForm: React.FC<LoginFormProps> = ({
  username,
  password,
  showPassword,
  error,
  isLoading,
  onUsernameChange,
  onPasswordChange,
  onToggleShowPassword,
  onSubmit,
  onForgotPassword,
  twoFactorChallenge = false,
  useRecoveryCode = false,
  twoFactorCode = '',
  recoveryCode = '',
  onToggleRecoveryCode,
  onTwoFactorCodeChange,
  onRecoveryCodeChange,
  lockoutSeconds = 0,
  labels = {},
}) => {
  const isLocked = lockoutSeconds > 0;
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m > 0) {
      return `${m}:${String(s).padStart(2, '0')}`;
    }
    return `${s}s`;
  };

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {twoFactorChallenge ? (
        <>
          <label htmlFor="two-factor-code" className={styles.label}>
            {useRecoveryCode ? labels.recoveryCode : labels.verificationCode}
          </label>
          <div className={styles.inputShell}>
            <Icon name="lock" size={17} />
            <input
              id="two-factor-code"
              className={styles.input}
              autoComplete="one-time-code"
              inputMode={useRecoveryCode ? 'text' : 'numeric'}
              required
              maxLength={useRecoveryCode ? 32 : 6}
              pattern={useRecoveryCode ? undefined : '[0-9]{6}'}
              value={useRecoveryCode ? recoveryCode : twoFactorCode}
              disabled={isLoading || isLocked}
              onChange={(event) => (
                useRecoveryCode ? onRecoveryCodeChange : onTwoFactorCodeChange
              )?.(event.target.value)}
            />
          </div>
          <button type="button" className={styles.forgotButton} onClick={onToggleRecoveryCode}>
            {useRecoveryCode ? labels.useAuthenticator : labels.useRecoveryCode}
          </button>
        </>
      ) : (
        <>
          <label htmlFor="username" className={styles.label}>
            Username or email
          </label>
          <div className={styles.inputShell}>
            <Icon name="users" size={17} />
            <input
              id="username"
              className={styles.input}
              autoComplete="username"
              placeholder="Enter username or work email"
              value={username}
              disabled={isLoading || isLocked}
              onChange={(e) => onUsernameChange(e.target.value)}
            />
          </div>

          <div className={styles.labelRow}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <button type="button" className={styles.forgotButton} onClick={onForgotPassword} disabled={isLocked}>
              Forgot password?
            </button>
          </div>

          <div className={styles.inputShell}>
            <Icon name="lock" size={17} />
            <input
              id="password"
              className={styles.input}
              autoComplete="current-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              disabled={isLoading || isLocked}
              onChange={(e) => onPasswordChange(e.target.value)}
            />
            <button
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              type="button"
              className={styles.eyeButton}
              onClick={onToggleShowPassword}
            >
              <Icon name="eye" size={17} />
            </button>
          </div>
        </>
      )}

      {error && (
        <div
          className={`${styles.errorBanner} ${isLocked ? styles.lockoutBanner : ''}`}
          role="status"
          aria-live="polite"
        >
          {isLocked ? (
            <div className={styles.lockoutContent}>
              <div className={styles.lockoutHeader}>
                <Icon name="clock" size={16} />
                <span>{labels.lockedTitle || 'Sign-in Temporarily Locked'}</span>
              </div>
              <p className={styles.lockoutMessage}>
                {labels.lockedMessage || 'Too many unsuccessful sign-in attempts. For your security, access is temporarily locked.'}
              </p>
              <div className={styles.countdownBadge}>
                <span>{labels.tryAgainIn || 'Try again in'}</span>
                <strong className={styles.countdownTimer}>{formatTime(lockoutSeconds)}</strong>
              </div>
            </div>
          ) : (
            error
          )}
        </div>
      )}

      <button
        className={`button primary ${styles.submitButton}`}
        type="submit"
        disabled={isLoading || isLocked}
      >
        <span>
          {isLocked
            ? `${labels.lockedButton || 'Locked'} (${formatTime(lockoutSeconds)})`
            : isLoading
            ? labels.verifying || 'Verifying...'
            : twoFactorChallenge
            ? labels.verify || 'Verify code'
            : 'Sign in'}
        </span>
        <Icon name="arrow" size={17} />
      </button>
    </form>
  );
};

export default LoginForm;
