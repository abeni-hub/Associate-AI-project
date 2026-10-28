import React from 'react';
import type { ModalConfig } from '../../types/portal.types';
import { ModalForm } from './ModalForm';
import { RouteEditor } from './RouteEditor';
import { FeedbackDetail } from './FeedbackDetail';
import { QRDialog } from './QRDialog';

export interface ModalProps {
  modal: ModalConfig;
  onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({ modal, onClose }) => {
  if (!modal) return null;

  const getTitle = () => {
    if (modal.kind === 'form') return modal.title;
    if (modal.kind === 'route') return 'Edit route';
    if (modal.kind === 'feedback') return modal.item.type;
    return 'Feedback QR code';
  };

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className={`modal-card modal-${modal.kind}`}
        role="dialog"
        aria-modal="true"
        aria-label={getTitle()}
      >
        {modal.kind === 'form' && <ModalForm modal={modal} onClose={onClose} />}
        {modal.kind === 'route' && <RouteEditor modal={modal} onClose={onClose} />}
        {modal.kind === 'feedback' && <FeedbackDetail modal={modal} onClose={onClose} />}
        {modal.kind === 'qr' && <QRDialog modal={modal} onClose={onClose} />}
      </section>
    </div>
  );
};
