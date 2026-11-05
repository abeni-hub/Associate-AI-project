import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../shared/Icon';
import type { OrganizationTypeItem } from '../../services/organizationsApi';

export interface LevelModalProps {
  level?: OrganizationTypeItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: {
    id?: number;
    name: string;
    code: string;
    description?: string;
    level: number;
    can_be_root: boolean;
    is_active: boolean;
  }) => Promise<void> | void;
  isLoading?: boolean;
}

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');

export const LevelModal: React.FC<LevelModalProps> = ({
  level,
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [rank, setRank] = useState<number | string>(1);
  const [isActive, setIsActive] = useState(true);
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (level) {
        setName(level.name || '');
        setCode(level.code || '');
        setRank(level.level ?? 1);
        setIsActive(level.is_active !== false);
        setDescription(level.description || '');
      } else {
        setName('');
        setCode('');
        setRank(1);
        setIsActive(true);
        setDescription('');
      }
      setErrorMsg(null);
    }
  }, [isOpen, level]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!level) setCode(slugify(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setErrorMsg('Level name is required.');
    if (!code.trim()) return setErrorMsg('Code identifier slug is required.');
    const parsedRank = Number(rank);
    if (!rank || isNaN(parsedRank) || parsedRank < 1) return setErrorMsg('Hierarchy rank level must be at least 1.');

    setErrorMsg(null);
    try {
      await onSave({
        ...(level?.id ? { id: level.id } : {}),
        name: name.trim(),
        code: code.toLowerCase().trim().replace(/[^a-z0-9_-]+/g, '_'),
        level: parsedRank,
        can_be_root: level?.can_be_root ?? false,
        is_active: isActive,
        description: description.trim() || undefined,
      });
    } catch (err: any) {
      setErrorMsg(err?.data?.message || err?.message || 'Failed to save organization level.');
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay">
      <section
        className="modal-card modal-form"
        role="dialog"
        aria-modal="true"
        aria-label={level ? 'Edit organization level' : 'Add organization level'}
        style={{ maxWidth: '580px', width: '92%' }}
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <div>
              <span className="panel-eyebrow">ORGANIZATION HIERARCHY</span>
              <h2>{level ? 'Edit organization level' : 'Add organization level'}</h2>
              <p>Configure statutory rank and classification rules.</p>
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
            {/* Level Name */}
            <label className="modal-field full">
              <span>Level / Tier name <i>*</i></span>
              <input
                required
                placeholder="e.g. Sub-City, Woreda, Bureau, Zone, or Kebele"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </label>

            {/* Code */}
            <label className="modal-field">
              <span>Code slug <i>*</i></span>
              <input
                required
                placeholder="e.g. sub_city, woreda, bureau"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </label>

            {/* Hierarchy Level Rank */}
            <label className="modal-field">
              <span>Hierarchy rank depth <i>*</i></span>
              <input
                required
                type="number"
                min={1}
                max={20}
                value={rank}
                onChange={(e) => setRank(e.target.value)}
              />
            </label>

            {/* Status */}
            <label className="modal-field">
              <span>Status</span>
              <select
                value={isActive ? 'active' : 'inactive'}
                onChange={(e) => setIsActive(e.target.value === 'active')}
              >
                <option value="active">Active (available in office creation)</option>
                <option value="inactive">Inactive (hidden from office creation)</option>
              </select>
            </label>

            {/* Description */}
            <label className="modal-field full">
              <span>Mandate description</span>
              <textarea
                rows={3}
                placeholder="Purpose of this tier in the city administration hierarchy..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </label>
          </div>

          <div className="modal-footer">
            <span />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="button secondary" onClick={onClose} disabled={isLoading}>
                Cancel
              </button>
              <button type="submit" className="button primary" disabled={isLoading}>
                {isLoading ? 'Saving...' : (level ? 'Save changes' : 'Create level')} <Icon name="arrow" size={15} />
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>,
    document.body
  );
};

export default LevelModal;

