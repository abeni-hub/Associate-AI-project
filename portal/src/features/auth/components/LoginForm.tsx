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
}) => {
  return (
    <form className={styles.form} onSubmit={onSubmit}>
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
          disabled={isLoading}
          onChange={(e) => onUsernameChange(e.target.value)}
        />
      </div>

      <div className={styles.labelRow}>
        <label htmlFor="password" className={styles.label}>
          Password
        </label>
        <button
          type="button"
          className={styles.forgotButton}
          onClick={onForgotPassword}
        >
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
          disabled={isLoading}
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

      {error && (
        <div className={styles.errorBanner} role="status">
          {error}
        </div>
      )}

      <button
        className={`button primary ${styles.submitButton}`}
        type="submit"
        disabled={isLoading}
      >
        <span>{isLoading ? 'Authenticating...' : 'Sign in'}</span>
        <Icon name="arrow" size={17} />
      </button>
    </form>
  );
};

export default LoginForm;

