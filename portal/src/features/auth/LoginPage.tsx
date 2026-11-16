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
    twoFactorChallenge,
    twoFactorCode,
    recoveryCode,
    useRecoveryCode,
    handleTwoFactorCodeChange,
    handleRecoveryCodeChange,
    handleToggleRecoveryCode,
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
            {twoFactorChallenge
              ? t('twoFactor.challengePrompt')
              : 'Use your assigned administrative account to access platform directories, services, and citizen feedback.'}
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
            twoFactorChallenge={twoFactorChallenge}
            twoFactorCode={twoFactorCode}
            recoveryCode={recoveryCode}
            useRecoveryCode={useRecoveryCode}
            onTwoFactorCodeChange={handleTwoFactorCodeChange}
            onRecoveryCodeChange={handleRecoveryCodeChange}
            onToggleRecoveryCode={handleToggleRecoveryCode}
            labels={{
              verificationCode: t('twoFactor.verificationCode'),
              recoveryCode: t('twoFactor.recoveryCode'),
              useRecoveryCode: t('twoFactor.useRecoveryCode'),
              useAuthenticator: t('twoFactor.useAuthenticator'),
              verify: t('twoFactor.verify'),
              verifying: t('twoFactor.verifying'),
            }}
          />

          <LoginSecurityNotice />
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
