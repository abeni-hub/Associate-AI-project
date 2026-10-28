import React, { useState } from 'react';
import type { FeedbackModalConfig } from '../../types/portal.types';
import { Icon } from '../shared/Icon';

export interface FeedbackDetailProps {
  modal: FeedbackModalConfig;
  onClose: () => void;
}

export const FeedbackDetail: React.FC<FeedbackDetailProps> = ({ modal, onClose }) => {
  const { item, onUpdate } = modal;
  const [status, setStatus] = useState(item.status);

  return (
    <div>
      <div className="modal-header">
        <div>
          <span className="panel-eyebrow">CITIZEN RESPONSE · {item.id}</span>
          <h2>{item.type} received</h2>
          <p>
            {item.time} · {item.subcity}
          </p>
        </div>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog">
          <Icon name="close" />
        </button>
      </div>
      <div className="feedback-detail-body">
        <div className="detail-context">
          <span>
            <small>SERVICE</small>
            <b>{item.service}</b>
          </span>
          <span>
            <small>BUREAU</small>
            <b>{item.bureau}</b>
          </span>
          {item.rating && (
            <span>
              <small>CITIZEN RATING</small>
              <b className="detail-stars">
                {'★'.repeat(item.rating)}
                <i>{'★'.repeat(5 - item.rating)}</i> <span>{item.rating}.0 / 5</span>
              </b>
            </span>
          )}
        </div>
        <blockquote>“{item.message}”</blockquote>
        <label className="detail-status-label">
          Follow-up status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>Open</option>
            <option>In review</option>
            <option>Resolved</option>
          </select>
        </label>
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
          <button type="button" className="button secondary" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="button primary"
            onClick={() => {
              onUpdate(status);
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
