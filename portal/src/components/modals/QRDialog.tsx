import React from 'react';
import type { QRModalConfig } from '../../types/portal.types';
import { Icon } from '../shared/Icon';
import { StatusPill } from '../shared/StatusPill';
import { QRPattern } from '../shared/QRPattern';

export interface QRDialogProps {
  modal: QRModalConfig;
  onClose: () => void;
}

export const QRDialog: React.FC<QRDialogProps> = ({ modal, onClose }) => {
  return (
    <div>
      <div className="modal-header">
        <div>
          <span className="panel-eyebrow">BUREAU FEEDBACK ACCESS</span>
          <h2>Your QR code is ready</h2>
          <p>Use this code to guide citizens directly to the feedback form.</p>
        </div>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog">
          <Icon name="close" />
        </button>
      </div>
      <div className="qr-dialog-body">
        <QRPattern data="https://civiclink.gov.et/feedback/rev-002" />
        <div>
          <b>QR-REV-002</b>
          <p>Revenues Bureau · Lemi Kura</p>
          <StatusPill>Active</StatusPill>
        </div>
      </div>
      <div className="modal-footer">
        <span>
          <Icon name="globe" size={14} /> Citizens can scan without an account.
        </span>
        <div>
          <button type="button" className="button secondary" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="button primary"
            onClick={() => {
              modal.onGenerate();
              onClose();
            }}
          >
            <Icon name="download" size={15} /> Save code
          </button>
        </div>
      </div>
    </div>
  );
};
