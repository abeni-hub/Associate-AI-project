import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../Icon';
import { getModalContainer } from '../../utils/portalRoot';
import type { ModalShellProps } from './ModalShell.types';
import styles from './ModalShell.module.css';

export const ModalShell: React.FC<ModalShellProps> = ({
  isOpen,
  onClose,
  title,
  eyebrow,
  size = 'md',
  children,
  footer,
  ariaLabel,
  className = '',
}) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const resolvedLabel = ariaLabel || title || 'Dialog';

  return createPortal(
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <section
        className={`${styles.card} ${styles[size] ?? styles.md} ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label={resolvedLabel}
      >
        {(title || eyebrow) && (
          <header className={styles.header}>
            <div className={styles.headerTitleGroup}>
              {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
              {title && <h2 className={styles.title}>{title}</h2>}
            </div>
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close dialog"
            >
              <Icon name="close" size={16} />
            </button>
          </header>
        )}

        <div className={styles.body}>{children}</div>

        {footer && <footer className={styles.footer}>{footer}</footer>}
      </section>
    </div>,
    getModalContainer()
  );
};

export default ModalShell;

