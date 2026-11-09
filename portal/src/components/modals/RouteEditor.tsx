import React, { useState, useEffect, useMemo } from 'react';
import { Icon } from '../shared/Icon';
import type { RouteItem, RouteStep, RouteModalConfig } from '../../types/portal.types';
import { useGetOrganizationsQuery } from '../../services/organizationsApi';
import { useGetServiceStepsQuery } from '../../services/servicesApi';

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

  const { data: orgsResponse } = useGetOrganizationsQuery({ per_page: 100 });
  const organizations = useMemo(() => orgsResponse?.data || [], [orgsResponse]);

  const { subcities, bureaus } = useMemo(() => {
    const subs: typeof organizations = [];
    const burs: typeof organizations = [];
    organizations.forEach((o) => {
      const isSub =
        o.type?.code === 'sub_city' ||
        o.name.toLowerCase().includes('sub-city') ||
        o.name.toLowerCase().includes('subcity');
      if (isSub) {
        subs.push(o);
      } else {
        burs.push(o);
      }
    });
    return { subcities: subs, bureaus: burs };
  }, [organizations]);

  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(
    () => route?.organizationId || null
  );

  // Live query for steps of the currently selected organization
  const { data: liveStepsData, isLoading: isLoadingSteps } = useGetServiceStepsQuery(
    route?.id
      ? {
          serviceId: route.id,
          organization_id: selectedOrgId ?? undefined,
        }
      : '',
    { skip: !route?.id }
  );

  const [steps, setSteps] = useState<RouteStep[]>(() =>
    route?.steps ? route.steps.map((step) => ({ ...step })) : []
  );

  // When live steps arrive for the selected branch, synchronize the editor list
  useEffect(() => {
    if (liveStepsData?.data) {
      if (liveStepsData.data.length > 0) {
        setSteps(
          liveStepsData.data.map((st) => ({
            id: st.id,
            room: st.room_number || `Room ${st.step_number}`,
            title: st.title,
            detail: st.instruction,
            floor: st.floor || 'Ground Floor',
            building: st.building || '',
            department: st.department_name || '',
          }))
        );
      } else if (selectedOrgId !== null) {
        // Empty branch route: start empty so staff know this office doesn't have custom routing yet
        setSteps([]);
      }
    }
  }, [liveStepsData, selectedOrgId]);

  const [saving, setSaving] = useState(false);

  const update = (index: number, key: keyof RouteStep, value: string) =>
    setSteps((items) =>
      items.map((step, i) => (i === index ? { ...step, [key]: value } : step))
    );

  const handleCopyFromTemplate = () => {
    if (route?.steps && route.steps.length > 0) {
      setSteps(route.steps.map((step) => ({ ...step })));
    } else {
      setSteps([
        {
          room: 'Info Desk',
          floor: 'Ground Floor',
          title: 'Reception & Initial Ticket',
          detail: 'Citizen obtains ticket number and initial guidance upon arrival.',
        },
        {
          room: 'Room 101',
          floor: '1st Floor',
          title: 'Document Verification',
          detail: 'Officer reviews original IDs and submitted paperwork.',
        },
        {
          room: 'Room 102',
          floor: '1st Floor',
          title: 'Certificate Issuance & Stamp',
          detail: 'Final processing, biometric validation, and official stamping.',
        },
      ]);
    }
  };

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

  const currentOrg = organizations.find((o) => o.id === selectedOrgId);
  const isBranchCustom = selectedOrgId !== null;

  return (
    <div>
      <div className="modal-header">
        <div>
          <span className="panel-eyebrow">
            ROOM-BY-ROOM PHYSICAL GUIDE · {route.category.toUpperCase()}
          </span>
          <h2>Edit physical route</h2>
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

      {/* Branch / Office Scope Selector */}
      <div
        style={{
          padding: '1rem 1.5rem',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <label
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#00485a',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            🏢 Target Branch / Office Scope
          </label>
          <span
            style={{
              fontSize: '11.5px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '12px',
              background: isBranchCustom ? '#e0f2fe' : '#f1f5f9',
              color: isBranchCustom ? '#0369a1' : '#475569',
            }}
          >
            {isBranchCustom ? `Custom Route · ${currentOrg?.name || 'Office'}` : 'Global Route Template'}
          </span>
        </div>

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
            fontWeight: 600,
            color: '#0f172a',
          }}
        >
          <option value="">🏛 Global Route Template (Default fallback for all branches)</option>
          {subcities.length > 0 && (
            <optgroup label="── Municipal Sub-cities ──">
              {subcities.map((org) => (
                <option key={org.id} value={org.id}>
                  📍 {org.name}
                </option>
              ))}
            </optgroup>
          )}
          {bureaus.length > 0 && (
            <optgroup label="── Central Bureaus & Agencies ──">
              {bureaus.map((org) => (
                <option key={org.id} value={org.id}>
                  🏢 {org.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>

        <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '12px', lineHeight: 1.4 }}>
          {isBranchCustom ? (
            <span>
              Rooms and steps configured here will appear <strong>strictly when citizens visit {currentOrg?.name}</strong>.
            </span>
          ) : (
            <span>
              This global route serves as the standard template for offices that have not yet set up customized floor plans.
            </span>
          )}
        </p>

        {isBranchCustom && steps.length === 0 && !isLoadingSteps && (
          <div
            style={{
              marginTop: '10px',
              padding: '10px 12px',
              borderRadius: '6px',
              background: '#fef3c7',
              border: '1px solid #fde68a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '12px', color: '#92400e', fontWeight: 600 }}>
              No custom room numbers saved for {currentOrg?.name} yet.
            </span>
            <button
              type="button"
              onClick={handleCopyFromTemplate}
              style={{
                border: '1px solid #d97706',
                background: '#ffffff',
                color: '#92400e',
                borderRadius: '4px',
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              📋 Copy Standard Template
            </button>
          </div>
        )}
      </div>

      {/* List of Steps */}
      <div className="route-editor-list" style={{ padding: '1.25rem 1.5rem', maxHeight: '50vh', overflowY: 'auto' }}>
        {steps.map((step, index) => (
          <div className="route-editor-step" key={index} style={{ marginBottom: '14px' }}>
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
              title="Remove step"
            >
              <Icon name="close" size={16} />
            </button>
            <label className="step-description">
              <span>Citizen instructions & departmental guidance</span>
              <input
                value={step.detail}
                onChange={(e) => update(index, 'detail', e.target.value)}
                placeholder="Clear instructions for citizen upon entering this room..."
                aria-label={`Instructions for step ${index + 1}`}
              />
            </label>
          </div>
        ))}

        {steps.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
            <Icon name="route" size={28} />
            <p style={{ margin: '8px 0 0', fontWeight: 600, fontSize: '13px' }}>
              No room routing steps defined yet.
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '12px' }}>
              Click &quot;Add another step&quot; or copy the standard template.
            </p>
          </div>
        )}
      </div>

      <div style={{ padding: '0 1.5rem 1rem' }}>
        <button
          type="button"
          className="add-step-button"
          onClick={() =>
            setSteps((items) => [
              ...items,
              {
                room: '',
                title: '',
                detail: '',
                floor: 'Ground Floor',
              },
            ])
          }
        >
          <Icon name="plus" size={15} /> Add another step
        </button>
      </div>

      <div className="modal-footer" style={{ padding: '1rem 1.5rem', background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
        <span style={{ fontSize: '12px', color: '#64748b' }}>
          <Icon name="globe" size={14} /> Saved steps appear on the citizen guide for{' '}
          <strong>{currentOrg?.name || 'all branches'}</strong>.
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
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
            {saving ? 'Saving route...' : 'Save branch route'} <Icon name="arrow" size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RouteEditor;
