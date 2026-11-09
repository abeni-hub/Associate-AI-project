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
    organizations.forEach((o: any) => {
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

  const [localError, setLocalError] = useState<string | null>(null);

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
            title: st.title || st.room_number || `Step ${st.step_number}`,
            detail: st.instruction || '',
            floor: st.floor || 'Ground Floor',
            building: st.building || '',
            department: st.department_name || '',
          }))
        );
      } else if (selectedOrgId !== null) {
        setSteps([]);
      }
    }
  }, [liveStepsData, selectedOrgId]);

  const [saving, setSaving] = useState(false);

  const update = (index: number, key: keyof RouteStep, value: string) => {
    setLocalError(null);
    setSteps((items) =>
      items.map((step, i) => (i === index ? { ...step, [key]: value } : step))
    );
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    setSteps((prev) => {
      const newItems = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newItems.length) return prev;
      const temp = newItems[index];
      newItems[index] = newItems[targetIndex];
      newItems[targetIndex] = temp;
      return newItems;
    });
  };

  const handleCopyFromTemplate = () => {
    setLocalError(null);
    if (route?.steps && route.steps.length > 0) {
      setSteps(route.steps.map((step) => ({ ...step })));
    } else {
      setSteps([
        {
          room: 'Info Desk',
          floor: 'Ground Floor',
          building: 'Main Hall',
          department: 'Customer Service',
          title: 'Reception & Queue Ticket',
          detail: 'Citizen obtains queue ticket number and verification checklist.',
        },
        {
          room: 'Room 101',
          floor: '1st Floor',
          building: 'Block A',
          department: 'Documentation Section',
          title: 'Document Verification',
          detail: 'Officer reviews original IDs, certificates, and submitted paperwork.',
        },
        {
          room: 'Room 102',
          floor: '1st Floor',
          building: 'Block A',
          department: 'Issuance Section',
          title: 'Biometric Approval & Stamping',
          detail: 'Final processing, digital biometrics, and official stamp issuance.',
        },
      ]);
    }
  };

  const handleSave = async () => {
    setLocalError(null);

    // Sanitize steps: ignore completely blank lines
    const sanitizedSteps = steps
      .map((s, idx) => ({
        ...s,
        room: (s.room || '').trim(),
        floor: (s.floor || 'Ground Floor').trim(),
        title: (s.title || '').trim() || (s.room || '').trim() || `Step ${idx + 1}`,
        detail: (s.detail || '').trim(),
      }))
      .filter((s) => s.room !== '' || s.title !== '' || s.detail !== '');

    if (sanitizedSteps.length === 0) {
      const confirmEmpty = window.confirm(
        'All steps are empty. Saving will clear the routing steps for this branch. Proceed?'
      );
      if (!confirmEmpty) return;
    }

    setSaving(true);
    try {
      await Promise.resolve(onSave(sanitizedSteps, selectedOrgId));
      onClose();
    } catch (err: any) {
      const errDetails = err?.data?.errors
        ? Object.entries(err.data.errors)
            .map(([field, msgs]: [string, any]) => `${field}: ${Array.isArray(msgs) ? msgs.join(' ') : msgs}`)
            .join(' | ')
        : '';
      setLocalError(
        errDetails
          ? `${err?.data?.message || 'Validation failed'}: ${errDetails}`
          : err?.data?.message || err?.message || 'Failed to save room navigation route.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (!route) return null;

  const currentOrg = organizations.find((o) => o.id === selectedOrgId);
  const isBranchCustom = selectedOrgId !== null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
      {/* Modal Header */}
      <div className="modal-header">
        <div>
          <span className="panel-eyebrow">
            ROOM-BY-ROOM PHYSICAL NAVIGATION · {route.category?.toUpperCase() || 'SERVICE GUIDE'}
          </span>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="route" size={20} />
            Physical Route & Room Guide
          </h2>
          <p style={{ margin: '2px 0 0', color: '#627c72', fontSize: '13px' }}>
            <strong>{route.service}</strong> — Configure room numbers, floors, and departmental desks for citizen guidance.
          </p>
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

      {/* Error alert banner */}
      {localError && (
        <div
          style={{
            padding: '10px 16px',
            background: '#fef2f2',
            borderBottom: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Icon name="alert" size={16} />
          <span>{localError}</span>
        </div>
      )}

      {/* Scope Selector: Branch vs Global */}
      <div
        style={{
          padding: '12px 20px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <label
            style={{
              fontSize: '11.5px',
              fontWeight: 700,
              color: '#00485a',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Icon name="building" size={14} /> Target Branch / Office Scope
          </label>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '12px',
              background: isBranchCustom ? '#e0f2fe' : '#f1f5f9',
              color: isBranchCustom ? '#0369a1' : '#475569',
              border: `1px solid ${isBranchCustom ? '#bae6fd' : '#e2e8f0'}`,
            }}
          >
            {isBranchCustom ? `📍 Branch Specific: ${currentOrg?.name || 'Office'}` : '🌐 Platform-Wide Standard Template'}
          </span>
        </div>

        <select
          value={selectedOrgId ?? ''}
          onChange={(e) => {
            setLocalError(null);
            setSelectedOrgId(e.target.value ? Number(e.target.value) : null);
          }}
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
          <option value="">🏛 Global Route Template (Fallback for uncustomized municipal offices)</option>
          {subcities.length > 0 && (
            <optgroup label="── Municipal Sub-cities ──">
              {subcities.map((org: any) => (
                <option key={org.id} value={org.id}>
                  📍 {org.name}
                </option>
              ))}
            </optgroup>
          )}
          {bureaus.length > 0 && (
            <optgroup label="── Central Bureaus & Agencies ──">
              {bureaus.map((org: any) => (
                <option key={org.id} value={org.id}>
                  🏢 {org.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>

        {isBranchCustom && steps.length === 0 && !isLoadingSteps && (
          <div
            style={{
              marginTop: '10px',
              padding: '10px 14px',
              borderRadius: '6px',
              background: '#fef3c7',
              border: '1px solid #fde68a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '12.5px', color: '#92400e', fontWeight: 600 }}>
              No custom room numbers saved for {currentOrg?.name} yet.
            </span>
            <button
              type="button"
              onClick={handleCopyFromTemplate}
              style={{
                border: '1px solid #d97706',
                background: '#ffffff',
                color: '#92400e',
                borderRadius: '5px',
                padding: '5px 12px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Icon name="copy" size={13} /> Copy Standard Template
            </button>
          </div>
        )}
      </div>

      {/* Breadth & Responsive List of Steps */}
      <div
        className="route-editor-list"
        style={{
          padding: '1.25rem 1.5rem',
          maxHeight: '58vh',
          overflowY: 'auto',
          flex: 1,
        }}
      >
        {steps.map((step, index) => (
          <div className="route-editor-step-card" key={index}>
            {/* Header row with Room #, Floor, Building, Title, and Actions */}
            <div className="route-step-header-grid">
              <div className="route-step-badge-col">
                <span className="route-step-badge" title={`Step ${index + 1}`}>
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <div className="route-step-input-group">
                <label>Room / Counter #</label>
                <input
                  value={step.room || ''}
                  onChange={(e) => update(index, 'room', e.target.value)}
                  placeholder="e.g. Room 104, Counter 2"
                  aria-label={`Room number for step ${index + 1}`}
                />
              </div>

              <div className="route-step-input-group">
                <label>Floor / Level</label>
                <input
                  value={step.floor || ''}
                  onChange={(e) => update(index, 'floor', e.target.value)}
                  placeholder="e.g. Ground Floor, 1st Floor"
                  aria-label={`Floor for step ${index + 1}`}
                />
              </div>

              <div className="route-step-input-group">
                <label>Building / Wing</label>
                <input
                  value={step.building || ''}
                  onChange={(e) => update(index, 'building', e.target.value)}
                  placeholder="e.g. Main Hall, Block B"
                  aria-label={`Building for step ${index + 1}`}
                />
              </div>

              <div className="route-step-input-group">
                <label>Step Action / Name</label>
                <input
                  value={step.title || ''}
                  onChange={(e) => update(index, 'title', e.target.value)}
                  placeholder="e.g. Document Verification & Photo"
                  aria-label={`Action name for step ${index + 1}`}
                />
              </div>

              <div className="route-step-actions-bar">
                <button
                  type="button"
                  className="button secondary small-button"
                  onClick={() => moveStep(index, 'up')}
                  disabled={index === 0}
                  title="Move step up"
                  style={{ minWidth: '30px', padding: '0 6px', height: '36px' }}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="button secondary small-button"
                  onClick={() => moveStep(index, 'down')}
                  disabled={index === steps.length - 1}
                  title="Move step down"
                  style={{ minWidth: '30px', padding: '0 6px', height: '36px' }}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="remove-step"
                  onClick={() => setSteps((items) => items.filter((_, i) => i !== index))}
                  title="Delete step"
                  style={{ height: '36px', width: '32px' }}
                >
                  <Icon name="close" size={16} />
                </button>
              </div>
            </div>

            {/* Sub-row: Department & Citizen Guidance Instructions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) minmax(280px, 2.5fr)', gap: '12px' }}>
              <div className="route-step-input-group">
                <label>Department / Desk</label>
                <input
                  value={step.department || ''}
                  onChange={(e) => update(index, 'department', e.target.value)}
                  placeholder="e.g. Vital Statistics Desk, Window 3"
                />
              </div>

              <div className="route-step-input-group">
                <label>Citizen Guidance & What To Do Here</label>
                <input
                  value={step.detail || ''}
                  onChange={(e) => update(index, 'detail', e.target.value)}
                  placeholder="Instructions for the citizen (e.g. Present original ID, pay fee at counter, collect stamp)..."
                />
              </div>
            </div>
          </div>
        ))}

        {steps.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '36px 20px',
              color: '#64748b',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px dashed #cbd5e1',
            }}
          >
            <Icon name="route" size={32} />
            <h4 style={{ margin: '8px 0 4px', fontSize: '14px', color: '#1e293b' }}>
              No room routing steps defined yet
            </h4>
            <p style={{ margin: 0, fontSize: '13px' }}>
              Add room numbers and floor instructions for citizens navigating this service.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '14px' }}>
              <button
                type="button"
                className="button primary small-button"
                onClick={() =>
                  setSteps([
                    {
                      room: 'Room 101',
                      floor: 'Ground Floor',
                      building: '',
                      department: '',
                      title: 'Initial Intake',
                      detail: 'Arrive at reception desk and submit paperwork.',
                    },
                  ])
                }
              >
                <Icon name="plus" size={14} /> Add First Step
              </button>
              <button
                type="button"
                className="button secondary small-button"
                onClick={handleCopyFromTemplate}
              >
                <Icon name="copy" size={14} /> Use Standard 3-Step Template
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Step Action */}
      <div
        style={{
          padding: '10px 1.5rem',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          type="button"
          className="button secondary small-button"
          onClick={() =>
            setSteps((items) => [
              ...items,
              {
                room: '',
                floor: 'Ground Floor',
                building: '',
                department: '',
                title: '',
                detail: '',
              },
            ])
          }
          style={{
            borderColor: '#94a3b8',
            fontWeight: 700,
            color: '#00485a',
            background: '#ffffff',
          }}
        >
          <Icon name="plus" size={14} /> Add Another Step
        </button>

        <span style={{ fontSize: '12px', color: '#64748b' }}>
          {steps.length} {steps.length === 1 ? 'room step' : 'room steps'} configured
        </span>
      </div>

      {/* Footer */}
      <div className="modal-footer" style={{ padding: '12px 20px', background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
        <span style={{ fontSize: '12px', color: '#64748b' }}>
          <Icon name="globe" size={14} /> Steps are visible to citizens when filtering for{' '}
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
            {saving ? 'Saving route...' : 'Save Branch Route'} <Icon name="arrow" size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RouteEditor;
