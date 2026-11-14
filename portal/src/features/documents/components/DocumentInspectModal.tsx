import React from 'react';
import { Icon, StatusPill, useLanguage, getLocalizedText } from '../../shared';
import type { DocumentItem } from '../api/documentsApi';

interface DocumentInspectModalProps {
  doc: DocumentItem | null;
  canManage: boolean;
  onClose: () => void;
  onEdit: (doc: DocumentItem) => void;
}

export const DocumentInspectModal: React.FC<DocumentInspectModalProps> = ({
  doc,
  canManage,
  onClose,
  onEdit,
}) => {
  const { language } = useLanguage();
  if (!doc) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: '580px', width: '92%', overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <div>
            <span className="panel-eyebrow">DOCUMENT SPECIFICATION</span>
            <h2>{getLocalizedText(doc.name, language) || (typeof doc.name === 'string' ? doc.name : '')}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <code style={{ background: '#edf3ef', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', color: '#315a51', fontWeight: 700 }}>
                {doc.code}
              </code>
              <StatusPill status={doc.is_active ? 'Active' : 'Draft'}>
                {doc.is_active ? 'Active' : 'Draft'}
              </StatusPill>
            </div>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h4 style={{ margin: '0 0 6px', color: '#274f4b', fontSize: '13px', fontWeight: 700 }}>
              Prerequisite Description & Citizen Guidelines
            </h4>
            <p style={{ margin: 0, color: '#566e64', fontSize: '13px', lineHeight: 1.5, background: '#f8faf7', padding: '12px 14px', borderRadius: '6px', border: '1px solid #e5ede7' }}>
              {getLocalizedText(doc.description, language) || (typeof doc.description === 'string' ? doc.description : 'No detailed citizen guidelines have been recorded for this prerequisite.')}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ padding: '12px', borderRadius: '6px', background: '#f8faf7', border: '1px solid #e5ede7' }}>
              <small style={{ color: '#82938a', display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                Required in Public Services
              </small>
              <b style={{ color: '#165760', fontSize: '17px', display: 'block', marginTop: '4px' }}>
                {doc.services_count ?? 0} {doc.services_count === 1 ? 'service' : 'services'}
              </b>
              <span style={{ color: '#688075', fontSize: '11.5px' }}>Attached as mandatory/optional checklist</span>
            </div>

            <div style={{ padding: '12px', borderRadius: '6px', background: '#f8faf7', border: '1px solid #e5ede7' }}>
              <small style={{ color: '#82938a', display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                Sample Download Form
              </small>
              {doc.sample_file_url ? (
                <a
                  href={doc.sample_file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#00485a', fontWeight: 700, fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}
                >
                  <Icon name="download" size={13} /> Download template
                </a>
              ) : (
                <span style={{ color: '#97a89f', fontSize: '13px', display: 'block', marginTop: '4px' }}>
                  No sample template provided
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ padding: '14px 24px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', color: '#819389' }}>
            ID #{doc.id} · Created: {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Active'}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {canManage && (
              <button
                type="button"
                className="button primary"
                onClick={() => {
                  onClose();
                  onEdit(doc);
                }}
              >
                <Icon name="edit" size={13} /> Edit document
              </button>
            )}
            <button type="button" className="button secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

