import React from 'react';
import { Brand } from '../shared';
import {
  useAuth,
  LoginStory,
  LoginForm,
  LoginSecurityNotice,
  LoginPanelHeader,
} from './index';
import layoutStyles from './styles/loginLayout.module.css';
import panelStyles from './styles/loginForm.module.css';
import { useLanguage } from '../shared/i18n';
import { tokenStorage } from '../../utils/tokenStorage';

export const LoginPage: React.FC = () => {
  const { t } = useLanguage();
  const [sessionExpired] = React.useState(() => tokenStorage.consumeSessionExpired());
  const {
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
  } = useAuth();

  return (
    <main className={layoutStyles.shell}>
      <LoginStory />

      <section className={panelStyles.panel}>
        <LoginPanelHeader />

        <div className={panelStyles.content}>
          <div className={panelStyles.mobileBrand}>
            <Brand />
          </div>

          <span className={panelStyles.kicker}>GOVERNMENT PORTAL</span>
          <h2 className={panelStyles.title}>
            Sign in to your
            <br />
            workspace<span className={panelStyles.titleDot}>.</span>
          </h2>
          <p className={panelStyles.intro}>
            Use your assigned administrative account to access platform directories, services, and citizen feedback.
          </p>

          {sessionExpired && (
            <div role="status" className={panelStyles.errorBanner}>
              {t('sessionTimeout.expired')}
            </div>
          )}

          <LoginForm
            username={username}
            password={password}
            showPassword={showPassword}
            error={error}
            isLoading={isLoading}
            onUsernameChange={handleUsernameChange}
            onPasswordChange={handlePasswordChange}
            onToggleShowPassword={handleToggleShowPassword}
            onSubmit={handleSubmit}
            onForgotPassword={handleForgotPassword}
          />

          <LoginSecurityNotice />
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
