import React from 'react';
import { createPortal } from 'react-dom';
import type { ModalConfig } from '../../types/portal.types';
import { ModalForm } from './ModalForm';
import { RouteEditor } from './RouteEditor';
import { FeedbackDetail } from './FeedbackDetail';
import { QRDialog } from './QRDialog';

export interface ModalProps {
  modal: ModalConfig | any;
  onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({ modal, onClose }) => {
  if (!modal) return null;

  const ariaLabel =
    modal.title || modal.item?.type || 'Workspace dialog';

  return createPortal(
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className={`modal-card modal-${modal.kind}${modal.size ? ` modal-${modal.size}` : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
      >
        {modal.kind === 'form' ? (
          <ModalForm modal={modal} onClose={onClose} />
        ) : modal.kind === 'route' ? (
          <RouteEditor
            route={modal.route}
            modal={modal}
            onClose={onClose}
            onSave={modal.onSave}
          />
        ) : modal.kind === 'feedback' ? (
          <FeedbackDetail
            item={modal.item}
            modal={modal}
            onClose={onClose}
            onUpdate={modal.onUpdate}
          />
        ) : (
          <QRDialog
            modal={modal}
            onClose={onClose}
            onGenerate={modal.onGenerate}
          />
        )}
      </section>
    </div>,
    document.body
  );
};

export default Modal;
