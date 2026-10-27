import { createPortal } from 'react-dom'
import ModalForm from './ModalForm.jsx'
import RouteEditor from './RouteEditor.jsx'
import FeedbackDetail from './FeedbackDetail.jsx'
import QRDialog from './QRDialog.jsx'

function Modal({ modal, onClose }) {
  if (!modal) return null
  return createPortal(
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <section className={`modal-card modal-${modal.kind}`} role="dialog" aria-modal="true" aria-label={modal.title || modal.item?.type || 'Workspace dialog'}>
        {modal.kind === 'form' ? (
          <ModalForm modal={modal} onClose={onClose} />
        ) : modal.kind === 'route' ? (
          <RouteEditor route={modal.route} onClose={onClose} onSave={modal.onSave} />
        ) : modal.kind === 'feedback' ? (
          <FeedbackDetail item={modal.item} onClose={onClose} onUpdate={modal.onUpdate} />
        ) : (
          <QRDialog onClose={onClose} onGenerate={modal.onGenerate} />
        )}
      </section>
    </div>,
    document.body
  )
}

export default Modal
