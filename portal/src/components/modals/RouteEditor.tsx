import React, { useState } from 'react';
import { Icon } from '../shared/Icon';
import type { RouteItem, RouteStep, RouteModalConfig } from '../../types/portal.types';
import { useGetOrganizationsQuery } from '../../services/organizationsApi';

export interface RouteEditorProps {
  route?: RouteItem;
  modal?: RouteModalConfig;
  onClose: () => void;
  onSave?: (steps: RouteStep[], organizationId?: number | null) => void;
}

export const RouteEditor: React.FC<RouteEditorProps> = ({
  route: propRoute,
  modal,
  onClose,
  onSave: propOnSave,
}) => {
  const route = propRoute || modal?.route;
  const onSave = propOnSave || modal?.onSave || (() => {});

  const { data: orgsResponse } = useGetOrganizationsQuery();
  const organizations = orgsResponse?.data || [];

  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(() => route?.organizationId || null);

  const [steps, setSteps] = useState<RouteStep[]>(() =>
    route?.steps ? route.steps.map((step) => ({ ...step })) : []
  );
  const [saving, setSaving] = useState(false);

  const update = (index: number, key: keyof RouteStep, value: string) =>
    setSteps((items) =>
      items.map((step, i) => (i === index ? { ...step, [key]: value } : step))
    );

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.resolve(onSave(steps, selectedOrgId));
      onClose();
    } catch {
      // Handled in caller
    } finally {
      setSaving(false);
    }
  };

  if (!route) return null;

  return (
    <div>
      <div className="modal-header">
        <div>
          <span className="panel-eyebrow">
            ROOM-BY-ROOM GUIDE · {route.category.toUpperCase()}
          </span>
          <h2>Edit route</h2>
          <p>{route.service}</p>
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

      <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
          Branch / Office Scope
        </label>
        <select
          value={selectedOrgId ?? ''}
          onChange={(e) => setSelectedOrgId(e.target.value ? Number(e.target.value) : null)}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            fontSize: '13px',
            background: '#ffffff',
            fontWeight: 500,
          }}
        >
          <option value="">All Offices & Sub-cities (Global Service Default)</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name} ({org.code})
            </option>
          ))}
        </select>
        <small style={{ display: 'block', color: '#64748b', fontSize: '11px', marginTop: '4px' }}>
          Assign room numbers and floor instructions specific to this branch location.
        </small>
      </div>

      <div className="route-editor-list">
        {steps.map((step, index) => (
          <div className="route-editor-step" key={index}>
            <span className="route-editor-index">
              {String(index + 1).padStart(2, '0')}
            </span>
            <label>
              <span>Room number</span>
              <input
                value={step.room}
                onChange={(e) => update(index, 'room', e.target.value)}
                placeholder="e.g. Room 101, Counter 3"
                aria-label={`Room number for step ${index + 1}`}
              />
            </label>
            <label>
              <span>Floor / Level</span>
              <input
                value={step.floor || ''}
                onChange={(e) => update(index, 'floor', e.target.value)}
                placeholder="e.g. Ground Floor, 1st Floor"
                aria-label={`Floor for step ${index + 1}`}
              />
            </label>
            <label>
              <span>Step name</span>
              <input
                value={step.title}
                onChange={(e) => update(index, 'title', e.target.value)}
                placeholder="e.g. Document Verification"
                aria-label={`Step name for step ${index + 1}`}
              />
            </label>
            <button
              type="button"
              className="remove-step"
              aria-label="Remove step"
              onClick={() =>
                setSteps((items) => items.filter((_, i) => i !== index))
              }
            >
              <Icon name="close" size={16} />
            </button>
            <label className="step-description">
              <span>Citizen instructions</span>
              <input
                value={step.detail}
                onChange={(e) => update(index, 'detail', e.target.value)}
                placeholder="Instructions for citizen upon entering the room..."
                aria-label={`Instructions for step ${index + 1}`}
              />
            </label>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="add-step-button"
        onClick={() =>
          setSteps((items) => [...items, { room: '', title: '', detail: '', floor: 'Ground Floor' }])
        }
      >
        <Icon name="plus" size={15} /> Add another step
      </button>
      <div className="modal-footer">
        <span>
          <Icon name="globe" size={14} /> Published guides appear on the citizen page for this office.
        </span>
        <div>
          <button
            type="button"
            className="button secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="button primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving sequence...' : 'Save route'} <Icon name="arrow" size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RouteEditor;
