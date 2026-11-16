import React, { useState } from 'react';
import QRCode from 'qrcode';
import { Check, KeyRound, LockKeyhole, QrCode, ShieldCheck, ShieldOff, Smartphone } from 'lucide-react';
import {
  useBeginTwoFactorSetupMutation,
  useConfirmTwoFactorSetupMutation,
  useDisableTwoFactorMutation,
  useGetTwoFactorStatusQuery,
  useRegenerateTwoFactorRecoveryCodesMutation,
} from '../api/authApi';
import { useLanguage } from '../../shared/i18n';
import styles from './twoFactorSettings.module.css';

function messageFrom(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error !== 'object' || error === null || !('data' in error)) return '';

  const data = error.data;
  if (typeof data !== 'object' || data === null) return '';

  if ('errors' in data && typeof data.errors === 'object' && data.errors !== null) {
    const fieldMessage = Object.values(data.errors).find(
      (messages): messages is string[] =>
        Array.isArray(messages) && typeof messages[0] === 'string'
    )?.[0];
    if (fieldMessage) return fieldMessage;
  }

  return 'message' in data && typeof data.message === 'string' ? data.message : '';
}

export const TwoFactorSettingsPage: React.FC = () => {
  const { t } = useLanguage();
  const { data: statusResponse, isLoading, refetch } = useGetTwoFactorStatusQuery();
  const [beginSetup, { isLoading: isStarting }] = useBeginTwoFactorSetupMutation();
  const [confirmSetup, { isLoading: isConfirming }] = useConfirmTwoFactorSetupMutation();
  const [regenerate, { isLoading: isRegenerating }] = useRegenerateTwoFactorRecoveryCodesMutation();
  const [disable, { isLoading: isDisabling }] = useDisableTwoFactorMutation();
  const [secret, setSecret] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [code, setCode] = useState('');
  const [recoveryPassword, setRecoveryPassword] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const status = statusResponse?.data;

  const handleBeginSetup = async () => {
    setError('');
    try {
      const response = await beginSetup().unwrap();
      if (!response.data) return;
      setSecret(response.data.secret);
      setQrDataUrl(await QRCode.toDataURL(response.data.otpauth_url));
    } catch (requestError) {
      setError(messageFrom(requestError) || t('twoFactor.requestFailed'));
    }
  };

  const handleConfirmSetup = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      const response = await confirmSetup({ code }).unwrap();
      setRecoveryCodes(response.data?.recovery_codes || []);
      setSecret('');
      setQrDataUrl('');
      setCode('');
      setNotice(response.message);
      await refetch();
    } catch (requestError) {
      setError(messageFrom(requestError) || t('twoFactor.requestFailed'));
    }
  };

  const handleRegenerate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      const response = await regenerate({ password: recoveryPassword }).unwrap();
      setRecoveryCodes(response.data?.recovery_codes || []);
      setRecoveryPassword('');
      setNotice(response.message);
    } catch (requestError) {
      setError(messageFrom(requestError) || t('twoFactor.requestFailed'));
    }
  };

  const handleDisable = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!window.confirm(t('twoFactor.disableConfirm'))) return;
    setError('');
    try {
      const response = await disable({ password: disablePassword }).unwrap();
      setDisablePassword('');
      setRecoveryCodes([]);
      setNotice(response.message);
      await refetch();
    } catch (requestError) {
      setError(messageFrom(requestError) || t('twoFactor.requestFailed'));
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.headingIcon} aria-hidden="true"><ShieldCheck size={23} strokeWidth={1.8} /></div>
        <div>
          <p className={styles.eyebrow}>{t('twoFactor.securityEyebrow')}</p>
          <h1>{t('twoFactor.title')}</h1>
          <p className={styles.intro}>{t('twoFactor.description')}</p>
        </div>
      </header>

      {status?.required && !status.enabled && (
        <div className={styles.requiredNotice} role="status">
          <LockKeyhole size={18} aria-hidden="true" />
          <span>{t('twoFactor.required')}</span>
        </div>
      )}
      {notice && <div className={styles.notice} role="status"><Check size={17} aria-hidden="true" />{notice}</div>}
      {error && <div className={styles.error} role="alert"><ShieldOff size={17} aria-hidden="true" />{error}</div>}
      {isLoading ? <p className={styles.loading}>{t('common.loading')}</p> : (
        <section className={styles.card}>
          <div className={styles.cardHeading}>
            <div className={`${styles.cardIcon} ${status?.enabled ? styles.cardIconEnabled : ''}`} aria-hidden="true">
              {status?.enabled ? <ShieldCheck size={21} /> : <LockKeyhole size={21} />}
            </div>
            <div>
              <h2>{status?.enabled ? t('twoFactor.enabled') : t('twoFactor.disabled')}</h2>
            </div>
          </div>
          {!status?.enabled && !secret && (
            <div className={styles.setupPrompt}>
              <div className={styles.promptIcon} aria-hidden="true"><Smartphone size={20} /></div>
              <button type="button" className={styles.primary} onClick={() => void handleBeginSetup()} disabled={isStarting}>
                {isStarting ? t('common.loading') : t('twoFactor.beginSetup')}
              </button>
            </div>
          )}

          {secret && (
            <div className={styles.setup}>
              <div className={styles.setupIntro}>
                <span className={styles.setupIcon} aria-hidden="true"><QrCode size={18} /></span>
                <p>{t('twoFactor.showQr')}</p>
              </div>
              <div className={styles.setupGrid}>
                <div className={styles.qrPanel}>
                  {qrDataUrl && <img className={styles.qr} src={qrDataUrl} alt={t('twoFactor.title')} />}
                </div>
                <div className={styles.setupDetails}>
                  <div className={styles.secretPanel}>
                    <label htmlFor="two-factor-secret">{t('twoFactor.secret')}</label>
                    <code id="two-factor-secret" className={styles.secret}>{secret}</code>
                  </div>
                  <form onSubmit={(event) => void handleConfirmSetup(event)}>
                    <div className={styles.formIntro}>
                      <span className={styles.promptIcon} aria-hidden="true"><Smartphone size={18} /></span>
                      <p>{t('twoFactor.confirmCode')}</p>
                    </div>
                    <label htmlFor="two-factor-setup-code">{t('twoFactor.verificationCode')}</label>
                    <input id="two-factor-setup-code" autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={(event) => setCode(event.target.value)} />
                    <button type="submit" className={styles.primary} disabled={isConfirming}>{t('twoFactor.enable')}</button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {status?.enabled && (
            <div className={styles.actions}>
              <form onSubmit={(event) => void handleRegenerate(event)}>
                <div className={styles.actionIcon} aria-hidden="true"><KeyRound size={18} /></div>
                <h3>{t('twoFactor.regenerate')}</h3>
                <label htmlFor="recovery-password">{t('twoFactor.password')}</label>
                <input id="recovery-password" type="password" autoComplete="current-password" required value={recoveryPassword} onChange={(event) => setRecoveryPassword(event.target.value)} />
                <button type="submit" className={styles.secondary} disabled={isRegenerating}>{t('twoFactor.regenerate')}</button>
              </form>
              <form onSubmit={(event) => void handleDisable(event)}>
                <div className={styles.actionIcon} aria-hidden="true"><ShieldOff size={18} /></div>
                <h3>{t('twoFactor.disable')}</h3>
                <label htmlFor="disable-password">{t('twoFactor.password')}</label>
                <input id="disable-password" type="password" autoComplete="current-password" required value={disablePassword} onChange={(event) => setDisablePassword(event.target.value)} />
                <button type="submit" className={styles.danger} disabled={isDisabling}>{t('twoFactor.disable')}</button>
              </form>
            </div>
          )}

          {recoveryCodes.length > 0 && (
            <div className={styles.recovery} role="alert">
              <div className={styles.recoveryHeading}>
                <div className={styles.recoveryIcon} aria-hidden="true"><KeyRound size={19} /></div>
                <h3>{t('twoFactor.recoveryTitle')}</h3>
              </div>
              <p>{t('twoFactor.recoveryWarning')}</p>
              <ul>{recoveryCodes.map((item) => <li key={item}><code>{item}</code></li>)}</ul>
              <button type="button" className={styles.secondary} onClick={() => setRecoveryCodes([])}>
                {t('common.close')}
              </button>
            </div>
          )}
        </section>
      )}
    </main>
  );
};

export default TwoFactorSettingsPage;
