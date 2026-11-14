import React, { useState } from 'react';
import { Icon } from '../shared/Icon';
import { usePermissions } from '../../hooks/usePermissions';
import { useLanguage } from '../../i18n/i18nContext';
import { getLocalizedText } from '../../i18n/utils/getLocalized';
import type { FeedbackItem, FeedbackModalConfig } from '../../types/portal.types';

export interface FeedbackDetailProps {
  item?: FeedbackItem;
  modal?: FeedbackModalConfig;
  onClose: () => void;
  onUpdate?: (status: string, responseText?: string) => void;
}

export const FeedbackDetail: React.FC<FeedbackDetailProps> = ({
  item: propItem,
  modal,
  onClose,
  onUpdate: propOnUpdate,
}) => {
  const { language, t } = useLanguage();
  const item = propItem || modal?.item;
  const onUpdate = propOnUpdate || modal?.onUpdate || (() => {});
  const { hasPermission } = usePermissions();
  const canUpdateStatus = hasPermission('feedback.update_status');

  const initialStatus = (() => {
    const s = String(item?.status || '').toLowerCase().trim();
    if (s === 'in review' || s === 'in_review' || s === 'under_review' || s === 'in_progress') return 'In review';
    if (s === 'resolved') return 'Resolved';
    if (s === 'closed' || s === 'rejected') return 'Closed';
    return 'Open';
  })();

  const [status, setStatus] = useState<string>(initialStatus);
  const [responseText, setResponseText] = useState<string>(() => (item as any)?.response || '');
  const [trackingCopied, setTrackingCopied] = useState<boolean>(false);

  if (!item) return null;

  const citizenName = item.fullName || (item as any).full_name;
  const citizenPhone = item.phoneNumber || (item as any).phone_number;
  const citizenEmail = item.email;

  async function copyTrackingNumber() {
    const clipboard = globalThis.navigator?.clipboard;
    if (!item?.trackingNumber || !clipboard?.writeText) return;
    try {
      await clipboard.writeText(item.trackingNumber);
      setTrackingCopied(true);
    } catch {
      setTrackingCopied(false);
    }
  }

  return (
    <div>
      <div className="modal-header">
        <div>
          <span className="panel-eyebrow">{t('feedback.ticketResponse', 'CITIZEN RESPONSE')} · {item.id}</span>
          <h2>
            {(() => {
              const rawType = String(item.type || '').toLowerCase();
              if (rawType.includes('complaint')) return `${t('feedback.complaint', 'Complaint')} ${t('feedback.ticketReceived', 'received')}`;
              if (rawType.includes('suggestion')) return `${t('feedback.suggestion', 'Suggestion')} ${t('feedback.ticketReceived', 'received')}`;
              if (rawType.includes('satisfaction')) return `${t('feedback.satisfaction', 'Satisfaction')} ${t('feedback.ticketReceived', 'received')}`;
              return `${item.type} ${t('feedback.ticketReceived', 'received')}`;
            })()}
          </h2>
          <p>{item.time}</p>
          <div className="feedback-tracking-ref">
            <span>
              <small>{t('feedback.trackingNumber', 'TRACKING NUMBER')}</small>
              <b>{item.trackingNumber || t('common.notAssigned', 'Not assigned')}</b>
            </span>
            {item.trackingNumber && (
              <button
                type="button"
                onClick={copyTrackingNumber}
                disabled={!globalThis.navigator?.clipboard?.writeText}
                aria-label={t('common.copy', 'Copy tracking number')}
              >
                <Icon name={trackingCopied ? 'check' : 'copy'} size={14} />
                {trackingCopied ? t('common.copied', 'Copied') : t('common.copy', 'Copy')}
              </button>
            )}
          </div>
        </div>
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label={t('common.close', 'Close dialog')}
        >
          <Icon name="close" />
        </button>
      </div>
      <div className="feedback-detail-body">
        <div
          className={`detail-context${item.rating ? ' has-rating' : ' no-rating'}`}
        >
          <span>
            <small>{t('feedback.serviceLabel', 'SERVICE')}</small>
            <b>{getLocalizedText(item.service as any, language) || (typeof item.service === 'string' ? item.service : 'General Service')}</b>
          </span>
          <span>
            <small>{t('feedback.bureauLabel', 'BUREAU')}</small>
            <b>{getLocalizedText(item.bureau as any, language) || (typeof item.bureau === 'string' ? item.bureau : 'City Bureau')}</b>
          </span>
          <span>
            <small>{t('feedback.subcityLabel', 'SUB-CITY')}</small>
            <b>{getLocalizedText(item.subcity as any, language) || (typeof item.subcity === 'string' ? item.subcity : t('common.notProvided', 'Not provided'))}</b>
          </span>
          {item.rating && (
            <span>
              <small>{t('feedback.ratingLabel', 'CITIZEN RATING')}</small>
              <b className="detail-stars">
                {'★'.repeat(item.rating)}
                <i>{'★'.repeat(5 - item.rating)}</i>{' '}
                <span>{item.rating}.0 / 5</span>
              </b>
            </span>
          )}
          {citizenName && (
            <span>
              <small>{t('feedback.citizenNameLabel', 'CITIZEN NAME')}</small>
              <b>{citizenName}</b>
            </span>
          )}
          {citizenPhone && (
            <span>
              <small>{t('feedback.phoneNumberLabel', 'PHONE NUMBER')}</small>
              <b>
                <a
                  href={`tel:${citizenPhone}`}
                  style={{ color: '#0369a1', textDecoration: 'none' }}
                  title="Call citizen"
                >
                  {citizenPhone}
                </a>
              </b>
            </span>
          )}
          {citizenEmail && (
            <span>
              <small>{t('feedback.emailLabel', 'EMAIL')}</small>
              <b>
                <a
                  href={`mailto:${citizenEmail}`}
                  style={{ color: '#0369a1', textDecoration: 'none' }}
                >
                  {citizenEmail}
                </a>
              </b>
            </span>
          )}
        </div>
        <blockquote>"{getLocalizedText(item.message as any, language) || (typeof item.message === 'string' ? item.message : '')}"</blockquote>
        <div className="detail-status-section" style={{ margin: '1rem 0' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
            {t('feedback.followupStatus', 'Follow-up Resolution Status')}
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'Open', label: t('feedback.statusOpen', 'Open'), desc: t('feedback.statusOpenDesc', 'Awaiting first review'), bg: '#fffbeb', border: '#fde68a', color: '#b45309' },
              { id: 'In review', label: t('feedback.statusReview', 'In review'), desc: t('feedback.statusReviewDesc', 'Under investigation'), bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
              { id: 'Resolved', label: t('feedback.statusResolved', 'Resolved'), desc: t('feedback.statusResolvedDesc', 'Addressed & completed'), bg: '#ecfdf5', border: '#a7f3d0', color: '#047857' },
              { id: 'Closed', label: t('feedback.statusClosed', 'Closed'), desc: t('feedback.statusClosedDesc', 'Archived / Dismissed'), bg: '#f1f5f9', border: '#cbd5e1', color: '#475569' },
            ].map((s) => {
              const isSelected = status.toLowerCase() === s.id.toLowerCase();
              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={!canUpdateStatus}
                  onClick={() => canUpdateStatus && setStatus(s.id)}
                  style={{
                    flex: '1 1 calc(50% - 4px)',
                    minWidth: '130px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1.5px solid ${isSelected ? s.color : s.border}`,
                    background: isSelected ? s.bg : '#ffffff',
                    color: isSelected ? s.color : '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: canUpdateStatus ? 'pointer' : 'default',
                    opacity: canUpdateStatus ? 1 : 0.8,
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? `0 0 0 2px ${s.color}20` : 'none',
                  }}
                >
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '13px', fontWeight: isSelected ? 700 : 600 }}>{s.label}</div>
                    <small style={{ fontSize: '10.5px', color: '#64748b' }}>{s.desc}</small>
                  </div>
                  {isSelected && <Icon name="check" size={15} />}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ margin: '1rem 0' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
            {t('feedback.officialResponseLabel', 'Official Response to Citizen (Optional)')}
          </label>
          <textarea
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            disabled={!canUpdateStatus}
            placeholder={canUpdateStatus ? t('feedback.responseInputPlaceholder', 'Write official resolution notes or citizen response...') : t('feedback.responseReadOnly', 'Read-only: permission required to update feedback status')}
            rows={3}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              fontFamily: 'inherit',
              resize: 'vertical',
              opacity: canUpdateStatus ? 1 : 0.75,
              background: canUpdateStatus ? '#ffffff' : '#f8fafc',
            }}
          />
        </div>
        <div className="feedback-routing-note">
          <Icon name="shield" size={16} />
          <span>
            <b>{t('feedback.routedTitle', 'Routed to authorized teams')}</b>
            <small>
              {t('feedback.routedDesc', 'Visible to Sub-city Admin and Bureau Admin')}
            </small>
          </span>
        </div>
      </div>
      <div className="modal-footer">
        <span>
          <Icon name="lock" size={14} /> {t('feedback.privateNote', 'Citizen details are kept private.')}
        </span>
        <div>
          <button
            type="button"
            className="button secondary"
            onClick={onClose}
          >
            {t('common.close', 'Close')}
          </button>
          {canUpdateStatus && (
            <button
              type="button"
              className="button primary"
              onClick={() => {
                onUpdate(status, responseText);
                onClose();
              }}
            >
              {t('feedback.saveFollowup', 'Save follow-up')} <Icon name="check" size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackDetail;
