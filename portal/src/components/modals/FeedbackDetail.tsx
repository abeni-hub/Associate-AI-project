import React, { useState } from 'react';
import { Icon } from '../shared/Icon';
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
  const item = propItem || modal?.item;
  const onUpdate = propOnUpdate || modal?.onUpdate || (() => {});

  const [status, setStatus] = useState<string>(() => item?.status || 'Open');
  const [responseText, setResponseText] = useState<string>('');
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
          <span className="panel-eyebrow">CITIZEN RESPONSE · {item.id}</span>
          <h2>{item.type} received</h2>
          <p>{item.time}</p>
          <div className="feedback-tracking-ref">
            <span>
              <small>TRACKING NUMBER</small>
              <b>{item.trackingNumber || 'Not assigned'}</b>
            </span>
            {item.trackingNumber && (
              <button
                type="button"
                onClick={copyTrackingNumber}
                disabled={!globalThis.navigator?.clipboard?.writeText}
                aria-label="Copy tracking number"
              >
                <Icon name={trackingCopied ? 'check' : 'copy'} size={14} />
                {trackingCopied ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>
        </div>
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <Icon name="close" />
        </button>
      </div>
      <div className="feedback-detail-body">
        <div
          className={`detail-context${item.rating ? ' has-rating' : ' no-rating'}`}
        >
          <span>
            <small>SERVICE</small>
            <b>{item.service}</b>
          </span>
          <span>
            <small>BUREAU</small>
            <b>{item.bureau}</b>
          </span>
          <span>
            <small>SUB-CITY</small>
            <b>{item.subcity || 'Not provided'}</b>
          </span>
          {item.rating && (
            <span>
              <small>CITIZEN RATING</small>
              <b className="detail-stars">
                {'★'.repeat(item.rating)}
                <i>{'★'.repeat(5 - item.rating)}</i>{' '}
                <span>{item.rating}.0 / 5</span>
              </b>
            </span>
          )}
          {citizenName && (
            <span>
              <small>CITIZEN NAME</small>
              <b>{citizenName}</b>
            </span>
          )}
          {citizenPhone && (
            <span>
              <small>PHONE NUMBER</small>
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
              <small>EMAIL</small>
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
        <blockquote>"{item.message}"</blockquote>
        <div className="detail-status-section" style={{ margin: '1rem 0' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
            Follow-up Resolution Status
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'Open', label: 'Open', desc: 'Awaiting first review', bg: '#fffbeb', border: '#fde68a', color: '#b45309' },
              { id: 'In review', label: 'In review', desc: 'Under investigation', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
              { id: 'Resolved', label: 'Resolved', desc: 'Addressed & completed', bg: '#ecfdf5', border: '#a7f3d0', color: '#047857' },
              { id: 'Closed', label: 'Closed', desc: 'Archived / Dismissed', bg: '#f1f5f9', border: '#cbd5e1', color: '#475569' },
            ].map((s) => {
              const isSelected = status.toLowerCase() === s.id.toLowerCase();
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStatus(s.id)}
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
                    cursor: 'pointer',
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
            Official Response to Citizen (Optional)
          </label>
          <textarea
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder="Write official resolution notes or citizen response..."
            rows={3}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
        </div>
        <div className="feedback-routing-note">
          <Icon name="shield" size={16} />
          <span>
            <b>Routed to authorized teams</b>
            <small>
              Visible to {item.subcity} Sub-city Admin and {item.bureau} Admin
            </small>
          </span>
        </div>
      </div>
      <div className="modal-footer">
        <span>
          <Icon name="lock" size={14} /> Citizen details are kept private.
        </span>
        <div>
          <button
            type="button"
            className="button secondary"
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="button primary"
            onClick={() => {
              onUpdate(status, responseText);
              onClose();
            }}
          >
            Save follow-up <Icon name="check" size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackDetail;
