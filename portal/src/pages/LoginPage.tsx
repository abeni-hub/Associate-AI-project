import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { usePortal } from '../context';
import { ROLE } from '../data/portalData.js';
import { Brand } from '../components/shared/Brand';
import { Icon } from '../components/shared/Icon';
import { useLoginMutation } from '../services/authApi';
import type { RoleKey } from '../types/portal.types';

export interface LoginPageProps {
  selectedRole?: RoleKey | string;
  setSelectedRole?: (role: any) => void;
  onLogin?: (role: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  selectedRole: propSelectedRole,
  setSelectedRole: propSetSelectedRole,
  onLogin: propOnLogin,
}) => {
  const portal = usePortal();
  const [login] = useLoginMutation();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const selectedRole = propSelectedRole || portal.role || 'super';
  const setSelectedRole = propSetSelectedRole || portal.setRole;
  const onLogin = propOnLogin || portal.signInDemo;

  if (portal.session) {
    return <Navigate to="/overview" replace />;
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      setError('Enter your username and password, or choose a demo workspace below.');
      return;
    }

    try {
      const response = await login({
        login: cleanUsername,
        username: cleanUsername,
        password: cleanPassword,
      }).unwrap();

      if (response.success && response.data) {
        portal.signInLive(response.data, response.data.token);
        navigate('/overview');
      } else {
        setError(response.message || 'Login failed. Please verify your credentials.');
      }
    } catch {
      setError('Authentication failed. You can also explore the portal using the demo workspaces below.');
    }
  };

  return (
    <main className="login-shell">
      <section className="login-story">
        <div className="login-story-inner">
          <Brand />
          <div className="story-copy">
            <div className="eyebrow inverse">
              <span className="eyebrow-line" />
              A CLEARER WAY TO SERVE
            </div>
            <h1>
              Every visit.
              <br />
              <em>Better informed.</em>
            </h1>
            <p>
              One shared workspace for the people who keep public service information clear, useful, and up to date.
            </p>
          </div>
          <div className="story-card">
            <div className="story-card-orbit orbit-one" />
            <div className="story-card-orbit orbit-two" />
            <div className="story-card-heading">
              <span className="story-icon">
                <Icon name="route" size={19} />
              </span>
              <span>THE CITIZEN JOURNEY</span>
              <span className="live-dot" />
            </div>
            <div className="journey-track">
              <div className="journey-step">
                <span className="journey-node">
                  <Icon name="check" size={13} />
                </span>
                <span>
                  <b>Before the visit</b>
                  <small>Requirements & room guide</small>
                </span>
              </div>
              <span className="journey-line" />
              <div className="journey-step">
                <span className="journey-node">
                  <Icon name="building" size={13} />
                </span>
                <span>
                  <b>At the bureau</b>
                  <small>Clear, step-by-step service</small>
                </span>
              </div>
              <span className="journey-line" />
              <div className="journey-step">
                <span className="journey-node gold-node">
                  <Icon name="message" size={13} />
                </span>
                <span>
                  <b>After the visit</b>
                  <small>Feedback reaches the right team</small>
                </span>
              </div>
            </div>
            <div className="story-card-foot">
              <span>One connected service experience</span>
              <span>01 — 03</span>
            </div>
          </div>
          <div className="login-story-footer">
            <span>
              <Icon name="shield" size={15} /> Role-based access for public service teams
            </span>
            <span>ADDIS ABABA · ETHIOPIA</span>
          </div>
        </div>
        <div className="story-pattern" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </section>

      <section className="login-panel">
        <div className="login-panel-top">
          <span className="secure-label">
            <Icon name="lock" size={14} /> SECURE ADMIN ACCESS
          </span>
          <span className="language-chip">
            <Icon name="globe" size={14} /> EN <Icon name="chevron" size={13} />
          </span>
        </div>
        <div className="login-content">
          <div className="mobile-brand">
            <Brand />
          </div>
          <span className="login-kicker">WELCOME BACK</span>
          <h2>
            Sign in to your
            <br />
            workspace<span>.</span>
          </h2>
          <p className="login-intro">
            Use your government account to manage service information and citizen feedback.
          </p>
          <form className="login-form" onSubmit={submit}>
            <label htmlFor="username">Username</label>
            <div className="input-shell">
              <Icon name="users" size={17} />
              <input
                id="username"
                autoComplete="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
              />
            </div>
            <div className="label-row">
              <label htmlFor="password">Password</label>
              <button
                type="button"
                className="text-button"
                onClick={() =>
                  setError('Please contact your system administrator to reset your password.')
                }
              >
                Forgot password?
              </button>
            </div>
            <div className="input-shell">
              <Icon name="lock" size={17} />
              <input
                id="password"
                autoComplete="current-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
              />
              <button
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                type="button"
                className="input-action"
                onClick={() => setShowPassword(!showPassword)}
              >
                <Icon name="eye" size={17} />
              </button>
            </div>
            {error && (
              <div className="login-error" role="status">
                {error}
              </div>
            )}
            <button className="button primary login-submit" type="submit">
              Sign in <Icon name="arrow" size={17} />
            </button>
          </form>
          <div className="login-divider">
            <span />
            OR EXPLORE A DEMO WORKSPACE
            <span />
          </div>
          <p className="demo-prompt">Choose a role to preview its dashboard</p>
          <div className="demo-roles">
            {Object.entries(ROLE).map(([key, role]: [string, any]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  const roleKey = key as RoleKey;
                  setSelectedRole(roleKey);
                  onLogin(roleKey);
                  navigate('/overview');
                }}
                className={`demo-role${selectedRole === key ? ' selected' : ''}`}
              >
                <span className="demo-role-icon">
                  <Icon
                    name={key === 'super' ? 'shield' : key === 'subcity' ? 'map' : 'building'}
                    size={17}
                  />
                </span>
                <span>
                  <b>{role.label}</b>
                  <small>
                    {key === 'super'
                      ? 'Platform-wide access'
                      : key === 'subcity'
                        ? 'Manage a sub-city'
                        : 'Manage a bureau'}
                  </small>
                </span>
                <Icon name="arrow" size={15} />
              </button>
            ))}
          </div>
          <div className="prototype-note">
            <span className="note-dot" /> Preview environment <span className="note-separator">·</span> Sample information
          </div>
        </div>
        <div className="login-panel-footer">
          <span>© 2026 CivicLink Ethiopia</span>
          <span>Public service information platform</span>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
