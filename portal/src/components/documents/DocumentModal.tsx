import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../shared/Icon';
import type { DocumentItem } from '../../services/documentsApi';

export interface DocumentModalProps {
  document?: DocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: {
    id?: number;
    name: string;
    code: string;
    description?: string;
    sample_file_url?: string;
    is_active: boolean;
  }) => Promise<void> | void;
  isLoading?: boolean;
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const DocumentModal: React.FC<DocumentModalProps> = ({
  document: doc,
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [sampleFileUrl, setSampleFileUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isCustomCode, setIsCustomCode] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (doc) {
        setName(doc.name || '');
        setCode(doc.code || '');
        setDescription(doc.description || '');
        setSampleFileUrl(doc.sample_file_url || '');
        setIsActive(doc.is_active !== false);
        setIsCustomCode(true);
      } else {
        setName('');
        setCode('');
        setDescription('');
        setSampleFileUrl('');
        setIsActive(true);
        setIsCustomCode(false);
      }
      setErrorMsg(null);
    }
  }, [isOpen, doc]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isCustomCode) {
      setCode(slugify(val));
    }
  };

  const handleCodeChange = (val: string) => {
    setIsCustomCode(true);
    setCode(slugify(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Document name is required.');
      return;
    }
    const cleanCode = code.trim().toLowerCase();
    if (!cleanCode) {
      setErrorMsg('Document code slug is required.');
      return;
    }
    if (!/^[a-z0-9-]+$/.test(cleanCode)) {
      setErrorMsg('Code must only contain lowercase letters, numbers, and hyphens (e.g. resident-id, birth-certificate).');
      return;
    }

    if (sampleFileUrl.trim() && !/^https?:\/\/.+/.test(sampleFileUrl.trim())) {
      setErrorMsg('Sample file URL must be a valid web address starting with http:// or https://');
      return;
    }

    try {
      await onSave({
        ...(doc ? { id: doc.id } : {}),
        name: name.trim(),
        code: cleanCode,
        description: description.trim() || undefined,
        sample_file_url: sampleFileUrl.trim() || undefined,
        is_active: isActive,
      });
    } catch (err: any) {
      setErrorMsg(err?.data?.message || err?.message || 'Failed to save document. Please check the fields and try again.');
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <section
        className="modal-card modal-form"
        role="dialog"
        aria-modal="true"
        aria-label={doc ? 'Edit required document' : 'Add required document'}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '560px', width: '92%' }}
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <div>
              <span className="panel-eyebrow">DOCUMENT CATALOG STANDARD</span>
              <h2>{doc ? 'Edit required document' : 'Create required document'}</h2>
              <p>Define a canonical document criteria that services can require from citizens.</p>
            </div>
            <button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog">
              <Icon name="close" />
            </button>
          </div>

          {errorMsg && (
            <div
              style={{
                margin: '1rem 1.5rem 0',
                padding: '10px 14px',
                borderRadius: '6px',
                background: '#fef2f2',
                border: '1px solid #ef4444',
                color: '#991b1b',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              <Icon name="close" size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="modal-form-grid" style={{ padding: '1.25rem 1.5rem' }}>
            {/* Document Name */}
            <label className="modal-field full">
              <span>Document name <i>*</i></span>
              <input
                required
                placeholder="e.g. Kebele Resident ID, Renewed Trade License, Birth Certificate"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </label>

            {/* Document Code Slug */}
            <label className="modal-field full">
              <span>System code slug <i>*</i></span>
              <input
                required
                placeholder="e.g. kebele-resident-id, trade-license-renewed"
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
              />
              <small style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                Unique system key used by APIs and services (lowercase alphanumeric and hyphens).
              </small>
            </label>

            {/* Description */}
            <label className="modal-field full">
              <span>Description & Issuing Criteria</span>
              <textarea
                rows={3}
                placeholder="Explain what this document is, issuing authority requirements, acceptable format (original, copy, or certified slip)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>

            {/* Sample File URL */}
            <label className="modal-field full">
              <span>Sample file or template download URL <small style={{ color: '#88988f', fontWeight: 500 }}>(Optional)</small></span>
              <input
                type="url"
                placeholder="https://example.gov.et/forms/sample_template.pdf"
                value={sampleFileUrl}
                onChange={(e) => setSampleFileUrl(e.target.value)}
              />
            </label>

            {/* Status */}
            <label
              className="modal-field full"
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                marginTop: '4px',
              }}
            >
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#00485a' }}
              />
              <div>
                <b style={{ color: '#2c4d48', fontSize: '13.5px' }}>Active document standard</b>
                <small style={{ display: 'block', color: '#74867c', fontSize: '12px' }}>
                  When active, services across all sub-cities and bureaus can select and attach this document.
                </small>
              </div>
            </label>
          </div>

          <div className="modal-footer" style={{ padding: '1rem 1.5rem' }}>
            <button type="button" className="button secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="button primary" disabled={isLoading}>
              {isLoading ? 'Saving...' : doc ? 'Save changes' : 'Create document'}
            </button>
          </div>
        </form>
      </section>
    </div>,
    window.document.body
  );
};
