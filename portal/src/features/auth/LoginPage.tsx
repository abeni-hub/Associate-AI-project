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
    lockoutSeconds,
    remainingAttempts,
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
            lockoutSeconds={lockoutSeconds}
            remainingAttempts={remainingAttempts}
            labels={{
              verificationCode: t('twoFactor.verificationCode'),
              recoveryCode: t('twoFactor.recoveryCode'),
              useRecoveryCode: t('twoFactor.useRecoveryCode'),
              useAuthenticator: t('twoFactor.useAuthenticator'),
              verify: t('twoFactor.verify'),
              verifying: t('twoFactor.verifying'),
              lockedTitle: t('twoFactor.lockedTitle', 'Sign-in Temporarily Locked'),
              lockedMessage: t('twoFactor.lockedMessage', 'Too many unsuccessful sign-in attempts. For your security, access is temporarily locked.'),
              tryAgainIn: t('twoFactor.tryAgainIn', 'Try again in'),
              lockedButton: t('twoFactor.lockedButton', 'Locked'),
              attemptsRemaining: t('twoFactor.attemptsRemaining', '{count} attempts remaining'),
              oneAttemptRemaining: t('twoFactor.oneAttemptRemaining', '1 attempt remaining before temporary lockout!'),
            }}
          />

          <LoginSecurityNotice />
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
