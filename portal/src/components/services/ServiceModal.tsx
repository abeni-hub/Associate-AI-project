import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../shared/Icon';
import { useGetDocumentsQuery } from '../../services/documentsApi';
import { useGetOrganizationsQuery } from '../../services/organizationsApi';
import { useGetServicesQuery } from '../../services/servicesApi';
import type { CreateServicePayload, UpdateServicePayload } from '../../services/servicesApi';

export interface ServiceModalProps {
  service?: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: any) => Promise<void> | void;
  isLoading?: boolean;
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

interface SelectedDocMeta {
  is_mandatory: boolean;
  notes: string;
  order_column: number;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({
  service,
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}) => {
  const { data: docsResponse, isLoading: isLoadingDocs } = useGetDocumentsQuery();
  const availableDocuments = useMemo(() => docsResponse?.data || [], [docsResponse]);

  const { data: orgsResponse } = useGetOrganizationsQuery();
  const organizations = useMemo(() => orgsResponse?.data || [], [orgsResponse]);

  const { data: allServicesResponse } = useGetServicesQuery();
  const masterServices = useMemo(() => {
    if (!allServicesResponse?.data) return [];
    return allServicesResponse.data.filter((s: any) => s.is_master || s.parent_id === null);
  }, [allServicesResponse]);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [feeAmount, setFeeAmount] = useState<string | number>('0');
  const [estimatedDuration, setEstimatedDuration] = useState<string | number>('30');
  const [isActive, setIsActive] = useState(true);
  const [isCustomCode, setIsCustomCode] = useState(false);
  const [isMaster, setIsMaster] = useState(true);
  const [parentId, setParentId] = useState<number | null>(null);
  const [primaryOrgId, setPrimaryOrgId] = useState<number | null>(null);
  const [selectedOfferingOrgs, setSelectedOfferingOrgs] = useState<number[]>([]);
  const [docSearch, setDocSearch] = useState('');
  const [orgSearch, setOrgSearch] = useState('');
  const [selectedDocs, setSelectedDocs] = useState<Record<number, SelectedDocMeta>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (service) {
        const raw = service.raw || service;
        setName(raw.name || service.name || '');
        setCode(raw.code || '');
        setDescription(raw.description || service.description || '');
        setFeeAmount(raw.fee_amount !== undefined ? raw.fee_amount : 0);
        setEstimatedDuration(raw.estimated_duration_minutes !== undefined ? raw.estimated_duration_minutes : 30);
        setIsActive(raw.is_active !== undefined ? Boolean(raw.is_active) : (service.published ?? true));
        setIsCustomCode(true);
        setIsMaster(raw.is_master !== undefined ? Boolean(raw.is_master) : (raw.parent_id === null));
        setParentId(raw.parent_id || null);
        setPrimaryOrgId(raw.organization_id || raw.organization?.id || null);

        const initialOrgs = raw.offering_organizations?.map((o: any) => o.id) || [];
        setSelectedOfferingOrgs(initialOrgs);

        const initialDocs: Record<number, SelectedDocMeta> = {};
        if (raw.required_documents && Array.isArray(raw.required_documents)) {
          raw.required_documents.forEach((d: any, idx: number) => {
            initialDocs[d.id] = {
              is_mandatory: d.is_mandatory ?? true,
              notes: d.notes || '',
              order_column: d.order_column || idx + 1,
            };
          });
        }
        setSelectedDocs(initialDocs);
      } else {
        setName('');
        setCode('');
        setDescription('');
        setFeeAmount('0');
        setEstimatedDuration('30');
        setIsActive(true);
        setIsCustomCode(false);
        setIsMaster(true);
        setParentId(null);
        setPrimaryOrgId(null);
        setSelectedOfferingOrgs([]);
        setSelectedDocs({});
      }
      setDocSearch('');
      setOrgSearch('');
      setErrorMsg(null);
    }
  }, [isOpen, service]);

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

  const handleToggleDoc = (docId: number) => {
    setSelectedDocs((prev) => {
      const copy = { ...prev };
      if (copy[docId]) {
        delete copy[docId];
      } else {
        const currentCount = Object.keys(copy).length;
        copy[docId] = {
          is_mandatory: true,
          notes: '',
          order_column: currentCount + 1,
        };
      }
      return copy;
    });
  };

  const handleToggleMandatory = (docId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDocs((prev) => {
      if (!prev[docId]) return prev;
      return {
        ...prev,
        [docId]: {
          ...prev[docId],
          is_mandatory: !prev[docId].is_mandatory,
        },
      };
    });
  };

  const handleNoteChange = (docId: number, notes: string) => {
    setSelectedDocs((prev) => {
      if (!prev[docId]) return prev;
      return {
        ...prev,
        [docId]: {
          ...prev[docId],
          notes,
        },
      };
    });
  };

  const filteredCatalogDocs = useMemo(() => {
    if (!docSearch.trim()) return availableDocuments;
    const q = docSearch.toLowerCase();
    return availableDocuments.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        (d.description && d.description.toLowerCase().includes(q))
    );
  }, [availableDocuments, docSearch]);

  const selectedCount = Object.keys(selectedDocs).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Service standard name is required.');
      return;
    }
    const cleanCode = code.trim().toLowerCase();
    if (!cleanCode) {
      setErrorMsg('Service code slug is required.');
      return;
    }
    if (!/^[a-z0-9-]+$/.test(cleanCode)) {
      setErrorMsg('Code must only contain lowercase letters, numbers, and hyphens (e.g. business-license-renewal).');
      return;
    }

    const documentsPayload = Object.entries(selectedDocs).map(([docId, meta], index) => ({
      document_id: Number(docId),
      is_mandatory: meta.is_mandatory,
      order_column: meta.order_column || index + 1,
      notes: meta.notes ? meta.notes.trim() : undefined,
    }));

    const rawId = service ? (service.raw?.id || service.id) : undefined;

    try {
      await onSave({
        ...(rawId ? { id: rawId } : {}),
        name: name.trim(),
        code: cleanCode,
        description: description.trim() || undefined,
        parent_id: isMaster ? null : (parentId || null),
        organization_id: primaryOrgId || undefined,
        offering_organizations: selectedOfferingOrgs,
        fee_amount: Number(feeAmount) || 0,
        fee_currency: 'ETB',
        estimated_duration_minutes: Number(estimatedDuration) || 30,
        is_active: isActive,
        documents: documentsPayload,
      });
    } catch (err: any) {
      setErrorMsg(err?.data?.message || err?.message || 'Failed to save service standard. Please check the fields and try again.');
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <section
        className="modal-card modal-form"
        role="dialog"
        aria-modal="true"
        aria-label={service ? 'Edit service standard' : 'Create service standard'}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', width: '94%', maxHeight: '92vh', overflowY: 'auto' }}
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <div>
              <span className="panel-eyebrow">PUBLIC SERVICE STANDARDS</span>
              <h2>{service ? 'Edit service standard' : 'Create service standard'}</h2>
              <p>Define service expectations, turnaround criteria, and citizen document prerequisites.</p>
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
            {/* Service Hierarchy */}
            <div className="modal-field full" style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Service Level:</span>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
                <input
                  type="radio"
                  name="service_level"
                  checked={isMaster}
                  onChange={() => { setIsMaster(true); setParentId(null); }}
                  style={{ accentColor: '#00485a' }}
                />
                <b>Main (Master) Service</b>
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
                <input
                  type="radio"
                  name="service_level"
                  checked={!isMaster}
                  onChange={() => setIsMaster(false)}
                  style={{ accentColor: '#00485a' }}
                />
                <b>Subservice (Actionable Unit)</b>
              </label>
            </div>

            {/* Parent Master Service Selector if Subservice */}
            {!isMaster && (
              <label className="modal-field full">
                <span>Parent Master Service <i>*</i></span>
                <select
                  required={!isMaster}
                  value={parentId ?? ''}
                  onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="">Select Parent Master Service...</option>
                  {masterServices.map((ms: any) => (
                    <option key={ms.id} value={ms.id}>
                      {ms.name} ({ms.code})
                    </option>
                  ))}
                </select>
              </label>
            )}

            {/* Governing Bureau / Sector Organization */}
            <label className="modal-field full">
              <span>Governing Bureau / Sector Organization</span>
              <select
                value={primaryOrgId ?? ''}
                onChange={(e) => setPrimaryOrgId(e.target.value ? Number(e.target.value) : null)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              >
                <option value="">Select Governing Bureau / Sector Agency (Optional)...</option>
                {organizations.map((org: any) => (
                  <option key={org.id} value={org.id}>
                    {org.name} ({org.code})
                  </option>
                ))}
              </select>
            </label>

            {/* Service Name */}
            <label className="modal-field full">
              <span>Service name <i>*</i></span>
              <input
                required
                placeholder="e.g. Civil Registration, Trade License Renewal, Construction Permit"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </label>

            {/* Code Slug */}
            <label className="modal-field">
              <span>Service Code (slug) <i>*</i></span>
              <input
                required
                placeholder="e.g. civil-registration, trade-license"
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
              />
            </label>

            {/* Turnaround Duration */}
            <label className="modal-field">
              <span>Target Duration (minutes)</span>
              <input
                type="number"
                min={0}
                placeholder="30"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
              />
            </label>

            {/* Fee Amount */}
            <label className="modal-field">
              <span>Standard fee (ETB)</span>
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00 (Free service)"
                value={feeAmount}
                onChange={(e) => setFeeAmount(e.target.value)}
              />
            </label>

            {/* Status Toggle */}
            <label
              className="modal-field"
              style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', marginTop: '22px' }}
            >
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                style={{ width: '17px', height: '17px', accentColor: '#00485a' }}
              />
              <span style={{ fontSize: '13px', color: '#2b4d48', fontWeight: 600 }}>Active service standard</span>
            </label>

            {/* Description */}
            <label className="modal-field full">
              <span>Service description & citizen overview <i>*</i></span>
              <textarea
                required
                rows={2}
                placeholder="Describe what this public service provides, who is eligible, and output expectations..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>

            {/* =========================================================================
                REQUIRED DOCUMENTS CHECKLIST SELECTOR
               ========================================================================= */}
            <div className="modal-field full" style={{ marginTop: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#165760' }}>
                    Required Citizen Documents
                  </span>
                  <small style={{ display: 'block', color: '#688075', fontSize: '11.5px' }}>
                    Select documents from the catalog that applicants must bring or upload.
                  </small>
                </div>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: selectedCount > 0 ? '#e4f3ee' : '#edf3ef',
                    color: selectedCount > 0 ? '#1b694f' : '#64776e',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {selectedCount} selected
                </span>
              </div>

              {/* Document Search / Filter box */}
              {availableDocuments.length > 5 && (
                <div style={{ position: 'relative', marginBottom: '8px' }}>
                  <input
                    type="search"
                    placeholder="Filter document catalog..."
                    value={docSearch}
                    onChange={(e) => setDocSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      fontSize: '12px',
                      borderRadius: '4px',
                      border: '1px solid #d8e5dd',
                    }}
                  />
                </div>
              )}

              {/* Checklist Container */}
              <div className="service-doc-checklist">
                {isLoadingDocs && availableDocuments.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#6b8277', fontSize: '12px' }}>
                    Loading available documents catalog...
                  </div>
                ) : filteredCatalogDocs.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#768b80', fontSize: '12px' }}>
                    {availableDocuments.length === 0 ? (
                      <>
                        No documents catalogued yet.{' '}
                        <b style={{ color: '#00485a' }}>Go to the Required Documents page to add documents.</b>
                      </>
                    ) : (
                      'No documents match your filter search.'
                    )}
                  </div>
                ) : (
                  filteredCatalogDocs.map((doc) => {
                    const isSelected = Boolean(selectedDocs[doc.id]);
                    const meta = selectedDocs[doc.id];

                    return (
                      <div
                        key={doc.id}
                        className={`service-doc-item${isSelected ? ' selected' : ''}`}
                      >
                        <div
                          className="service-doc-main-row"
                          onClick={() => handleToggleDoc(doc.id)}
                        >
                          <div className="service-doc-label-group">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleDoc(doc.id)}
                              onClick={(e) => e.stopPropagation()}
                              style={{ width: '16px', height: '16px', accentColor: '#00485a' }}
                            />
                            <div>
                              <b style={{ color: '#274b48', fontSize: '13px' }}>{doc.name}</b>
                              <span
                                style={{
                                  display: 'inline-block',
                                  marginLeft: '6px',
                                  padding: '1px 5px',
                                  borderRadius: '3px',
                                  background: '#edf3ef',
                                  color: '#46675e',
                                  fontSize: '10.5px',
                                  fontFamily: 'ui-monospace, monospace',
                                }}
                              >
                                {doc.code}
                              </span>
                            </div>
                          </div>

                          <span style={{ fontSize: '11px', color: isSelected ? '#156b50' : '#88988e', fontWeight: 600 }}>
                            {isSelected ? '✓ Selected' : '+ Attach'}
                          </span>
                        </div>

                        {/* Options when selected: Mandatory toggle & instruction notes */}
                        {isSelected && (
                          <div className="service-doc-options-row">
                            <label
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                cursor: 'pointer',
                                userSelect: 'none',
                                whiteSpace: 'nowrap',
                              }}
                              onClick={(e) => handleToggleMandatory(doc.id, e)}
                            >
                              <input
                                type="checkbox"
                                checked={meta.is_mandatory}
                                onChange={() => {}}
                                style={{ width: '14px', height: '14px', accentColor: '#00485a' }}
                              />
                              <span style={{ fontWeight: 700, color: meta.is_mandatory ? '#a13420' : '#577065', fontSize: '11px' }}>
                                {meta.is_mandatory ? 'Mandatory (Required)' : 'Optional prerequisite'}
                              </span>
                            </label>

                            <input
                              type="text"
                              placeholder="Notes (e.g. Original + 2 copies, validity within 6 months)..."
                              value={meta.notes}
                              onChange={(e) => handleNoteChange(doc.id, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                flex: 1,
                                height: '26px',
                                padding: '2px 8px',
                                fontSize: '11.5px',
                                borderRadius: '3px',
                                border: '1px solid #cce0d5',
                                background: '#fff',
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* =========================================================================
                OFFERING OFFICES & SUB-CITIES CHECKLIST
               ========================================================================= */}
            <div className="modal-field full" style={{ marginTop: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#165760' }}>
                    Offering Offices & Sub-cities
                  </span>
                  <small style={{ display: 'block', color: '#688075', fontSize: '11.5px' }}>
                    Select which municipal sub-cities, bureaus, or woredas provide this service.
                  </small>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedOfferingOrgs.length === organizations.length) {
                        setSelectedOfferingOrgs([]);
                      } else {
                        setSelectedOfferingOrgs(organizations.map((o: any) => o.id));
                      }
                    }}
                    style={{
                      background: 'transparent',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      color: '#00485a',
                      fontWeight: 600,
                    }}
                  >
                    {selectedOfferingOrgs.length === organizations.length ? 'Deselect all' : 'Select all branches'}
                  </button>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: selectedOfferingOrgs.length > 0 ? '#e4f3ee' : '#edf3ef',
                      color: selectedOfferingOrgs.length > 0 ? '#1b694f' : '#64776e',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    {selectedOfferingOrgs.length} offices
                  </span>
                </div>
              </div>

              {/* Organization Checklist Container */}
              <div
                style={{
                  maxHeight: '160px',
                  overflowY: 'auto',
                  border: '1px solid #d8e5dd',
                  borderRadius: '6px',
                  padding: '6px',
                  background: '#fafcfb',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '6px',
                }}
              >
                {organizations.map((org: any) => {
                  const isChecked = selectedOfferingOrgs.includes(org.id);
                  return (
                    <label
                      key={org.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 8px',
                        borderRadius: '4px',
                        background: isChecked ? '#e6f4ea' : '#ffffff',
                        border: `1px solid ${isChecked ? '#a7d7b9' : '#e2e8f0'}`,
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: isChecked ? 600 : 400,
                        color: isChecked ? '#137333' : '#334155',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setSelectedOfferingOrgs((prev) =>
                            prev.includes(org.id) ? prev.filter((id) => id !== org.id) : [...prev, org.id]
                          );
                        }}
                        style={{ width: '15px', height: '15px', accentColor: '#00485a' }}
                      />
                      <span>{org.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '1rem 1.5rem' }}>
            <button type="button" className="button secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="button primary" disabled={isLoading}>
              {isLoading ? 'Saving...' : service ? 'Save changes' : 'Create service standard'}
            </button>
          </div>
        </form>
      </section>
    </div>,
    window.document.body
  );
};

export default ServiceModal;

