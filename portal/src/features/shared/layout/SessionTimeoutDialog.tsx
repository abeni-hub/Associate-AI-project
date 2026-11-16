import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useKeepAliveMutation } from '../../auth';
import type { AuthUser } from '../../auth';
import { useLanguage } from '../i18n';
import { usePortal } from '../hooks/usePortal';
import { tokenStorage } from '../../../utils/tokenStorage';
import styles from './sessionTimeoutDialog.module.css';

type DraftField = {
  index: number;
  tagName: string;
  value?: string;
  checked?: boolean;
};

const controlsSelector = 'input, textarea, select';
const sensitiveField = /password|secret|token|csrf|api.?key|ssn|national.?id/i;

function draftStorageKey(userId: number, path: string): string {
  return `civiclink_timeout_draft:${userId}:${encodeURIComponent(path)}`;
}

function activityStorageKey(userId: number): string {
  return `civiclink_session_activity:${userId}`;
}

function saveDraft(userId: number, path: string): void {
  const fields: DraftField[] = [];
  document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(controlsSelector)
    .forEach((element, index) => {
      if (element instanceof HTMLInputElement && ['password', 'file', 'hidden'].includes(element.type)) return;
      if (sensitiveField.test(`${element.name} ${element.id}`)) return;

      if (element instanceof HTMLInputElement && ['checkbox', 'radio'].includes(element.type)) {
        if (element.checked !== element.defaultChecked) {
          fields.push({ index, tagName: element.tagName, checked: element.checked });
        }
        return;
      }

      const defaultValue = element instanceof HTMLSelectElement
        ? Array.from(element.options).filter((option) => option.defaultSelected).map((option) => option.value).join(',')
        : element.defaultValue;

      if (element.value !== defaultValue) {
        fields.push({ index, tagName: element.tagName, value: element.value });
      }
    });

  try {
    const key = draftStorageKey(userId, path);
    if (fields.length) {
      sessionStorage.setItem(key, JSON.stringify({ userId, path, fields }));
    } else {
      sessionStorage.removeItem(key);
    }
  } catch {
    // Draft recovery is best-effort when browser storage is unavailable.
  }
}

export function restoreSessionDraft(userId: number, path: string): () => void {
  let attempts = 0;
  let timer: number | undefined;

  const restore = () => {
    attempts += 1;
    let draft: { userId: number; path: string; fields: DraftField[] } | null = null;
    try {
      draft = JSON.parse(sessionStorage.getItem(draftStorageKey(userId, path)) || 'null');
    } catch {
      return;
    }

    if (!draft || draft.userId !== userId || draft.path !== path) return;

    const controls = Array.from(document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(controlsSelector));
    const highestIndex = Math.max(-1, ...draft.fields.map(({ index }) => index));
    if (controls.length <= highestIndex && attempts < 10) {
      timer = window.setTimeout(restore, 150);
      return;
    }

    draft.fields.forEach((field) => {
      const element = controls[field.index];
      if (!element || element.tagName !== field.tagName) return;
      if (element instanceof HTMLInputElement && field.checked !== undefined) {
        element.checked = field.checked;
        element.dispatchEvent(new Event('change', { bubbles: true }));
      } else if (field.value !== undefined) {
        const prototype = element instanceof HTMLTextAreaElement
          ? HTMLTextAreaElement.prototype
          : element instanceof HTMLSelectElement
            ? HTMLSelectElement.prototype
            : HTMLInputElement.prototype;
        Object.getOwnPropertyDescriptor(prototype, 'value')?.set?.call(element, field.value);
        element.dispatchEvent(new Event(element instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }));
      }
    });

    try {
      sessionStorage.removeItem(draftStorageKey(userId, path));
    } catch {
      // The form values have already been restored in memory.
    }
  };

  timer = window.setTimeout(restore, 0);
  return () => {
    if (timer !== undefined) window.clearTimeout(timer);
  };
}

interface SessionTimeoutDialogProps {
  user: AuthUser;
  path: string;
}

export const SessionTimeoutDialog: React.FC<SessionTimeoutDialogProps> = ({ user, path }) => {
  const { t } = useLanguage();
  const { signOut } = usePortal();
  const [keepAlive] = useKeepAliveMutation();
  const [now, setNow] = useState(Date.now());
  const [connectionError, setConnectionError] = useState(false);
  const [lastActivityAt, setLastActivityAt] = useState(() => {
    const sessionStartedAt = user.session_expires_at && user.absolute_session_lifetime
      ? Date.parse(user.session_expires_at) - user.absolute_session_lifetime * 60_000
      : 0;
    try {
      const raw = localStorage.getItem(activityStorageKey(user.id));
      const saved = raw ? JSON.parse(raw) as { userId?: number; at?: number } : null;
      if (
        saved?.userId === user.id &&
        typeof saved.at === 'number' &&
        saved.at >= sessionStartedAt &&
        saved.at <= Date.now()
      ) return saved.at;
    } catch {
      // Start a local clock if cross-tab storage is blocked.
    }
    return Date.now();
  });
  const dialogRef = useRef<HTMLDivElement>(null);
  const stayButtonRef = useRef<HTMLButtonElement>(null);
  const lastActivityRef = useRef(lastActivityAt);
  const lastPingRef = useRef(0);
  const expiryRequestedRef = useRef(false);

  const idleTimeoutMs = Math.max(1, user.effective_session_timeout) * 60_000;
  const absoluteDeadline = user.session_expires_at ? Date.parse(user.session_expires_at) : Number.POSITIVE_INFINITY;
  const deadline = Math.min(lastActivityAt + idleTimeoutMs, absoluteDeadline);
  const warningWindow = Math.min(90_000, idleTimeoutMs);
  const remainingMs = Math.max(0, deadline - now);
  const warningVisible = remainingMs <= warningWindow;
  const countdown = useMemo(() => {
    const seconds = Math.ceil(remainingMs / 1000);
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }, [remainingMs]);

  const ping = useCallback(async () => {
    try {
      await keepAlive().unwrap();
      setConnectionError(false);
      return true;
    } catch {
      setConnectionError(true);
      return false;
    }
  }, [keepAlive]);

  const recordActivity = useCallback((at = Date.now(), shouldPing = true) => {
    lastActivityRef.current = at;
    setLastActivityAt(at);
    try {
      localStorage.setItem(
        activityStorageKey(user.id),
        JSON.stringify({ userId: user.id, at })
      );
    } catch {
      // In-memory activity tracking still works when local storage is unavailable.
    }

    if (warningVisible && path) {
      saveDraft(user.id, path);
    }

    if (shouldPing && at - lastPingRef.current >= 15_000) {
      lastPingRef.current = at;
      void ping();
    }
  }, [path, ping, user.id, user.session_expires_at, warningVisible]);

  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    const onActivity = () => recordActivity();
    const activityEvents: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'input', 'touchstart'];
    activityEvents.forEach((event) => window.addEventListener(event, onActivity, { passive: true }));
    window.addEventListener('civiclink:api-activity', onActivity);
    return () => {
      activityEvents.forEach((event) => window.removeEventListener(event, onActivity));
      window.removeEventListener('civiclink:api-activity', onActivity);
    };
  }, [recordActivity]);

  useEffect(() => {
    const key = activityStorageKey(user.id);
    const onStorage = (event: StorageEvent) => {
      if (event.key !== key || !event.newValue) return;
      try {
        const saved = JSON.parse(event.newValue) as { userId?: number; at?: number };
        if (saved.userId === user.id && typeof saved.at === 'number' && saved.at > lastActivityRef.current) {
          recordActivity(saved.at);
        }
      } catch {
        // Ignore malformed cross-tab activity data.
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [recordActivity, user.id, user.session_expires_at]);

  useEffect(() => {
    if (!warningVisible) return;
    saveDraft(user.id, path);
  }, [path, user.id, user.session_expires_at, warningVisible]);

  useEffect(() => {
    if (remainingMs > 0) {
      expiryRequestedRef.current = false;
      return;
    }
    if (expiryRequestedRef.current) return;
    expiryRequestedRef.current = true;
    void signOut();
  }, [remainingMs, signOut]);

  useEffect(() => {
    if (!warningVisible) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    stayButtonRef.current?.focus();
    return () => {
      previousFocus?.focus();
    };
  }, [warningVisible]);

  const handleStayLoggedIn = async () => {
    if (await ping()) {
      lastPingRef.current = Date.now();
      recordActivity(Date.now(), false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return;
    const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
    if (!buttons?.length) return;
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!Number.isFinite(idleTimeoutMs) || !user.effective_session_timeout) return null;

  return warningVisible ? (
    <div className={styles.backdrop}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="session-timeout-title"
        aria-describedby="session-timeout-description"
        onKeyDown={handleKeyDown}
      >
        <div className={styles.icon} aria-hidden="true">!</div>
        <h2 id="session-timeout-title">{t('sessionTimeout.title')}</h2>
        <p id="session-timeout-description">{t('sessionTimeout.warning')}</p>
        <div className={styles.countdown} aria-live="polite" aria-atomic="true">{countdown}</div>
        <p className={styles.draftNotice}>{t('sessionTimeout.unsavedWarning')}</p>
        {connectionError && <p className={styles.connectionError} role="alert">{t('sessionTimeout.connectionError')}</p>}
        <div className={styles.actions}>
          <button ref={stayButtonRef} type="button" className={styles.primaryButton} onClick={() => void handleStayLoggedIn()}>
            {t('sessionTimeout.stayLoggedIn')}
          </button>
          <button type="button" className={styles.secondaryButton} onClick={() => void signOut()}>
            {t('sessionTimeout.logoutNow')}
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

export default SessionTimeoutDialog;
