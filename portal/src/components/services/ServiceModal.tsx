import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../shared/Icon';
import { useGetDocumentsQuery } from '../../services/documentsApi';
import { useGetOrganizationsQuery } from '../../services/organizationsApi';
import { useGetServicesQuery } from '../../services/servicesApi';

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

  const { data: orgsResponse } = useGetOrganizationsQuery({ per_page: 100 });
  const organizations = useMemo(() => orgsResponse?.data || [], [orgsResponse]);

  const { subcities, bureaus } = useMemo(() => {
    const subs: typeof organizations = [];
    const burs: typeof organizations = [];
    organizations.forEach((o: any) => {
      const isSub =
        o.type?.code === 'sub_city' ||
        o.name?.toLowerCase().includes('sub-city') ||
        o.name?.toLowerCase().includes('subcity');
      if (isSub) {
        subs.push(o);
      } else {
        burs.push(o);
      }
    });
    return { subcities: subs, bureaus: burs };
  }, [organizations]);

  const { data: allServicesResponse } = useGetServicesQuery({ per_page: 100 });
  const masterServices = useMemo(() => {
    if (!allServicesResponse?.data) return [];
    return allServicesResponse.data.filter((s: any) => s.is_master || s.parent_id === null);
  }, [allServicesResponse]);

  // Form states
  const [activeTab, setActiveTab] = useState<'info' | 'documents' | 'branches'>('info');
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
        setIsCustomCode(Boolean(raw.code));
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
      setActiveTab('info');
      setDocSearch('');
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

  const selectedDocsCount = Object.keys(selectedDocs).length;
  const selectedOrgsCount = selectedOfferingOrgs.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Service name is required.');
      setActiveTab('info');
      return;
    }
    const cleanCode = code.trim().toLowerCase();
    if (!cleanCode) {
      setErrorMsg('Service code slug is required.');
      setActiveTab('info');
      return;
    }
    if (!/^[a-z0-9-]+$/.test(cleanCode)) {
      setErrorMsg('Code must only contain lowercase letters, numbers, and hyphens (e.g. birth-registration).');
      setActiveTab('info');
      return;
    }

    if (!isMaster && !parentId) {
      setErrorMsg('Please select a Parent Master Service for this subservice.');
      setActiveTab('info');
      return;
    }

    const documentsPayload = isMaster
      ? []
      : Object.entries(selectedDocs).map(([docId, meta], index) => ({
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
        offering_organizations: isMaster ? [] : selectedOfferingOrgs,
        fee_amount: isMaster ? 0 : (Number(feeAmount) || 0),
        fee_currency: 'ETB',
        estimated_duration_minutes: isMaster ? 0 : (Number(estimatedDuration) || 30),
        is_active: isActive,
        documents: documentsPayload,
      });
    } catch (err: any) {
      setErrorMsg(err?.data?.message || err?.message || 'Failed to save service standard. Please verify fields.');
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
        style={{
          maxWidth: '720px',
          width: '95%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 57, 70, 0.2)',
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <div className="modal-header" style={{ padding: '1.25rem 1.75rem', background: '#00485a', color: '#ffffff' }}>
            <div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  color: '#e2c37c',
                  textTransform: 'uppercase',
                }}
              >
                {isMaster ? '🏛 MASTER SERVICE CATALOG' : '📄 CITIZEN SUBSERVICE UNIT'}
              </span>
              <h2 style={{ color: '#ffffff', margin: '4px 0 2px', fontSize: '20px', fontWeight: 800 }}>
                {service ? (isMaster ? 'Edit Master Category' : 'Edit Subservice') : (isMaster ? 'Create Master Category' : 'Create Citizen Subservice')}
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '13px', margin: 0 }}>
                {isMaster
                  ? 'Define top-level government service domain holding citizen subservices.'
                  : 'Define citizen turnaround time, fees, required documents, and delivery branch locations.'}
              </p>
            </div>
            <button
              type="button"
              className="modal-close"
              onClick={onClose}
              aria-label="Close dialog"
              style={{ color: '#ffffff', background: 'rgba(255, 255, 255, 0.1)' }}
            >
              <Icon name="close" />
            </button>
          </div>

          {/* Level Switcher (Master vs Subservice) */}
          <div
            style={{
              padding: '1rem 1.75rem',
              background: '#f4f8f6',
              borderBottom: '1px solid #dce8e3',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}
          >
            <div
              onClick={() => { setIsMaster(true); setParentId(null); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '8px',
                border: `2px solid ${isMaster ? '#00485a' : '#d1dfd8'}`,
                background: isMaster ? '#ffffff' : '#f8fbf9',
                cursor: 'pointer',
                boxShadow: isMaster ? '0 2px 8px rgba(0, 72, 90, 0.1)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: isMaster ? '#00485a' : '#e5eee9',
                  color: isMaster ? '#ffffff' : '#5a736a',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon name="folder" size={17} />
              </div>
              <div style={{ minWidth: 0 }}>
                <b style={{ display: 'block', fontSize: '13.5px', color: isMaster ? '#003946' : '#455e55' }}>
                  Master Category
                </b>
                <small style={{ display: 'block', color: '#6d837a', fontSize: '11.5px', marginTop: '2px' }}>
                  Top-level service domain
                </small>
              </div>
            </div>

            <div
              onClick={() => setIsMaster(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '8px',
                border: `2px solid ${!isMaster ? '#00485a' : '#d1dfd8'}`,
                background: !isMaster ? '#ffffff' : '#f8fbf9',
                cursor: 'pointer',
                boxShadow: !isMaster ? '0 2px 8px rgba(0, 72, 90, 0.1)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: !isMaster ? '#00485a' : '#e5eee9',
                  color: !isMaster ? '#ffffff' : '#5a736a',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon name="file" size={17} />
              </div>
              <div style={{ minWidth: 0 }}>
                <b style={{ display: 'block', fontSize: '13.5px', color: !isMaster ? '#003946' : '#455e55' }}>
                  Citizen Subservice
                </b>
                <small style={{ display: 'block', color: '#6d837a', fontSize: '11.5px', marginTop: '2px' }}>
                  Actionable unit with documents & fees
                </small>
              </div>
            </div>
          </div>

          {/* Subservice Navigation Tabs (Only visible when creating/editing Subservice) */}
          {!isMaster && (
            <div
              style={{
                display: 'flex',
                gap: '2px',
                padding: '0 1.75rem',
                background: '#ffffff',
                borderBottom: '1px solid #e2ece7',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('info')}
                style={{
                  padding: '12px 16px',
                  border: 0,
                  borderBottom: `3px solid ${activeTab === 'info' ? '#00485a' : 'transparent'}`,
                  background: 'transparent',
                  color: activeTab === 'info' ? '#00485a' : '#64748b',
                  fontWeight: activeTab === 'info' ? 700 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Icon name="info" size={14} />
                1. Basic Specifications
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('documents')}
                style={{
                  padding: '12px 16px',
                  border: 0,
                  borderBottom: `3px solid ${activeTab === 'documents' ? '#00485a' : 'transparent'}`,
                  background: 'transparent',
                  color: activeTab === 'documents' ? '#00485a' : '#64748b',
                  fontWeight: activeTab === 'documents' ? 700 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Icon name="file" size={14} />
                2. Required Documents ({selectedDocsCount})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('branches')}
                style={{
                  padding: '12px 16px',
                  border: 0,
                  borderBottom: `3px solid ${activeTab === 'branches' ? '#00485a' : 'transparent'}`,
                  background: 'transparent',
                  color: activeTab === 'branches' ? '#00485a' : '#64748b',
                  fontWeight: activeTab === 'branches' ? 700 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Icon name="building" size={14} />
                3. Delivery Branches ({selectedOrgsCount})
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div
              style={{
                margin: '1rem 1.75rem 0',
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

          {/* Modal Content Scroll Area */}
          <div style={{ padding: '1.25rem 1.75rem', overflowY: 'auto', flex: 1 }}>
            {/* TAB 1: BASIC INFORMATION (Always for Master, or when activeTab === 'info') */}
            {(isMaster || activeTab === 'info') && (
              <div className="modal-form-grid" style={{ gap: '14px' }}>
                {/* If Subservice: Parent Master Category */}
                {!isMaster && (
                  <label className="modal-field full">
                    <span style={{ fontWeight: 700, color: '#003946' }}>
                      Parent Master Category <i>*</i>
                    </span>
                    <select
                      required={!isMaster}
                      value={parentId ?? ''}
                      onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13.5px',
                        fontWeight: 600,
                        background: '#ffffff',
                      }}
                    >
                      <option value="">Select Parent Master Service Category...</option>
                      {masterServices.map((ms: any) => (
                        <option key={ms.id} value={ms.id}>
                          🏛 {ms.name} ({ms.code})
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {/* Service Name */}
                <label className="modal-field full">
                  <span style={{ fontWeight: 700, color: '#003946' }}>
                    {isMaster ? 'Master Domain Name' : 'Citizen Subservice Name'} <i>*</i>
                  </span>
                  <input
                    required
                    placeholder={
                      isMaster
                        ? 'e.g. Civil Status & Vital Records, Revenues & Taxation Services'
                        : 'e.g. Birth Registration & Certificate Issuance, e-TIN Registration'
                    }
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    style={{ fontSize: '14px', padding: '9px 12px' }}
                  />
                </label>

                {/* Unique Code Slug */}
                <label className="modal-field">
                  <span style={{ fontWeight: 700, color: '#003946' }}>
                    Code Slug <i>*</i>
                  </span>
                  <input
                    required
                    placeholder="e.g. civil-vital, birth-registration"
                    value={code}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    style={{ fontSize: '13.5px', fontFamily: 'monospace' }}
                  />
                </label>

                {/* Governing Bureau / Sector Agency */}
                <label className="modal-field">
                  <span style={{ fontWeight: 700, color: '#003946' }}>
                    Governing Bureau / Agency
                  </span>
                  <select
                    value={primaryOrgId ?? ''}
                    onChange={(e) => setPrimaryOrgId(e.target.value ? Number(e.target.value) : null)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      background: '#ffffff',
                    }}
                  >
                    <option value="">Select Governing Bureau (Optional)...</option>
                    {bureaus.map((org: any) => (
                      <option key={org.id} value={org.id}>
                        🏢 {org.name}
                      </option>
                    ))}
                    {subcities.map((org: any) => (
                      <option key={org.id} value={org.id}>
                        🏛 {org.name}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Subservice operational specs: Duration & Fee */}
                {!isMaster && (
                  <>
                    <label className="modal-field">
                      <span style={{ fontWeight: 700, color: '#003946' }}>
                        Target Turnaround (Minutes)
                      </span>
                      <input
                        type="number"
                        min={0}
                        placeholder="30"
                        value={estimatedDuration}
                        onChange={(e) => setEstimatedDuration(e.target.value)}
                      />
                    </label>

                    <label className="modal-field">
                      <span style={{ fontWeight: 700, color: '#003946' }}>
                        Standard Citizen Fee (ETB)
                      </span>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="0.00 (Free service)"
                        value={feeAmount}
                        onChange={(e) => setFeeAmount(e.target.value)}
                      />
                    </label>
                  </>
                )}

                {/* Active Switch */}
                <label
                  className="modal-field full"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    background: '#f8faf9',
                    border: '1px solid #dce8e3',
                    marginTop: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#00485a' }}
                  />
                  <div>
                    <b style={{ display: 'block', fontSize: '13px', color: '#003946' }}>
                      Publish & Activate this service
                    </b>
                    <small style={{ color: '#688075', fontSize: '11.5px' }}>
                      Active services are visible to citizens and listed in government office directories.
                    </small>
                  </div>
                </label>

                {/* Citizen Overview Description */}
                <label className="modal-field full">
                  <span style={{ fontWeight: 700, color: '#003946' }}>
                    Citizen Overview & Eligibility Description
                  </span>
                  <textarea
                    rows={3}
                    placeholder="Describe what this public service provides, who is eligible, and output expectations..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ fontSize: '13.5px', padding: '9px 12px', lineHeight: 1.5 }}
                  />
                </label>
              </div>
            )}

            {/* TAB 2: REQUIRED DOCUMENTS (Subservice only) */}
            {!isMaster && activeTab === 'documents' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <b style={{ display: 'block', color: '#003946', fontSize: '14px' }}>
                      Document Prerequisites
                    </b>
                    <small style={{ color: '#64748b', fontSize: '12px' }}>
                      Select documents that citizens must present or upload to obtain this service.
                    </small>
                  </div>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: '12px',
                      background: selectedDocsCount > 0 ? '#dcfce7' : '#f1f5f9',
                      color: selectedDocsCount > 0 ? '#15803d' : '#64748b',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    {selectedDocsCount} Attached
                  </span>
                </div>

                {/* Search document catalog */}
                <div style={{ marginBottom: '12px' }}>
                  <input
                    type="search"
                    placeholder="Search documents by name or code..."
                    value={docSearch}
                    onChange={(e) => setDocSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                    }}
                  />
                </div>

                <div className="service-doc-checklist" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                  {isLoadingDocs ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                      Loading documents catalog...
                    </div>
                  ) : filteredCatalogDocs.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                      No documents match your search.
                    </div>
                  ) : (
                    filteredCatalogDocs.map((doc) => {
                      const isSelected = Boolean(selectedDocs[doc.id]);
                      const meta = selectedDocs[doc.id];

                      return (
                        <div
                          key={doc.id}
                          className={`service-doc-item${isSelected ? ' selected' : ''}`}
                          style={{
                            padding: '10px 12px',
                            border: `1px solid ${isSelected ? '#86efac' : '#e2e8f0'}`,
                            background: isSelected ? '#f0fdf4' : '#ffffff',
                            borderRadius: '6px',
                            marginBottom: '8px',
                          }}
                        >
                          <div
                            className="service-doc-main-row"
                            onClick={() => handleToggleDoc(doc.id)}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleDoc(doc.id)}
                                onClick={(e) => e.stopPropagation()}
                                style={{ width: '16px', height: '16px', accentColor: '#00485a' }}
                              />
                              <div>
                                <b style={{ fontSize: '13.5px', color: '#0f172a' }}>{doc.name}</b>
                                <span
                                  style={{
                                    marginLeft: '8px',
                                    fontFamily: 'monospace',
                                    fontSize: '11px',
                                    color: '#475569',
                                    background: '#f1f5f9',
                                    padding: '1px 5px',
                                    borderRadius: '3px',
                                  }}
                                >
                                  {doc.code}
                                </span>
                              </div>
                            </div>

                            <span style={{ fontSize: '12px', fontWeight: 700, color: isSelected ? '#16a34a' : '#64748b' }}>
                              {isSelected ? '✓ Attached' : '+ Attach'}
                            </span>
                          </div>

                          {isSelected && (
                            <div
                              style={{
                                marginTop: '10px',
                                paddingTop: '8px',
                                borderTop: '1px dashed #bbf7d0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                              }}
                            >
                              <label
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  whiteSpace: 'nowrap',
                                }}
                                onClick={(e) => handleToggleMandatory(doc.id, e)}
                              >
                                <input
                                  type="checkbox"
                                  checked={meta.is_mandatory}
                                  onChange={() => {}}
                                  style={{ accentColor: '#00485a' }}
                                />
                                <span style={{ fontWeight: 700, color: meta.is_mandatory ? '#b91c1c' : '#475569' }}>
                                  {meta.is_mandatory ? 'Mandatory (Required)' : 'Optional'}
                                </span>
                              </label>

                              <input
                                type="text"
                                placeholder="Instructions (e.g. Original document + 2 photocopies)..."
                                value={meta.notes}
                                onChange={(e) => handleNoteChange(doc.id, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  flex: 1,
                                  height: '28px',
                                  padding: '0 8px',
                                  fontSize: '12px',
                                  borderRadius: '4px',
                                  border: '1px solid #cbd5e1',
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
            )}

            {/* TAB 3: DELIVERY BRANCHES & OFFICES (Subservice only) */}
            {!isMaster && activeTab === 'branches' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <b style={{ display: 'block', color: '#003946', fontSize: '14px' }}>
                      Offering Offices & Sub-cities
                    </b>
                    <small style={{ color: '#64748b', fontSize: '12px' }}>
                      Select which municipal offices and sub-cities provide this service to citizens.
                    </small>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const subIds = subcities.map((o: any) => o.id);
                        setSelectedOfferingOrgs((prev) => Array.from(new Set([...prev, ...subIds])));
                      }}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        color: '#00485a',
                        cursor: 'pointer',
                      }}
                    >
                      + All Sub-cities
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedOfferingOrgs([])}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        fontSize: '11.5px',
                        color: '#64748b',
                        cursor: 'pointer',
                      }}
                    >
                      Clear
                    </button>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '12px',
                        background: selectedOrgsCount > 0 ? '#dcfce7' : '#f1f5f9',
                        color: selectedOrgsCount > 0 ? '#15803d' : '#64748b',
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      {selectedOrgsCount} Branches
                    </span>
                  </div>
                </div>

                {/* Sub-cities Group */}
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                    🏛 Municipal Sub-cities ({subcities.length})
                  </span>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: '8px',
                    }}
                  >
                    {subcities.map((org: any) => {
                      const isChecked = selectedOfferingOrgs.includes(org.id);
                      return (
                        <label
                          key={org.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            background: isChecked ? '#f0fdf4' : '#ffffff',
                            border: `1px solid ${isChecked ? '#86efac' : '#e2e8f0'}`,
                            cursor: 'pointer',
                            fontSize: '12.5px',
                            fontWeight: isChecked ? 700 : 500,
                            color: isChecked ? '#15803d' : '#334155',
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
                            style={{ accentColor: '#00485a' }}
                          />
                          <span>{org.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Central Bureaus Group */}
                {bureaus.length > 0 && (
                  <div>
                    <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                      🏢 Central Bureaus & Agencies ({bureaus.length})
                    </span>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '8px',
                      }}
                    >
                      {bureaus.map((org: any) => {
                        const isChecked = selectedOfferingOrgs.includes(org.id);
                        return (
                          <label
                            key={org.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 10px',
                              borderRadius: '6px',
                              background: isChecked ? '#f0fdf4' : '#ffffff',
                              border: `1px solid ${isChecked ? '#86efac' : '#e2e8f0'}`,
                              cursor: 'pointer',
                              fontSize: '12.5px',
                              fontWeight: isChecked ? 700 : 500,
                              color: isChecked ? '#15803d' : '#334155',
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
                              style={{ accentColor: '#00485a' }}
                            />
                            <span>{org.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="modal-footer"
            style={{
              padding: '1rem 1.75rem',
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {isMaster ? (
                <span>🏛 Master Domain Category</span>
              ) : (
                <span>
                  📄 Citizen Subservice · <strong>{selectedDocsCount} documents</strong> ·{' '}
                  <strong>{selectedOrgsCount} offering branches</strong>
                </span>
              )}
            </span>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="button secondary" onClick={onClose} disabled={isLoading}>
                Cancel
              </button>
              <button type="submit" className="button primary" disabled={isLoading}>
                {isLoading
                  ? 'Saving...'
                  : service
                  ? (isMaster ? 'Save Master Category' : 'Save Subservice Standard')
                  : (isMaster ? 'Create Master Category' : 'Create Subservice Standard')}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>,
    window.document.body
  );
};

export default ServiceModal;
