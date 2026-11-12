import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardList,
  FileText,
  Building2,
  Folder,
  Search,
  X,
  Globe,
} from 'lucide-react';
import { useGetDocumentsQuery } from '../../documents/api/documentsApi';
import { useGetOrganizationsQuery } from '../../organizations/api/organizationsApi';
import { useGetServicesQuery } from '../api/servicesApi';
import { useLanguage, getLocalizedText, type SupportedLanguage } from '../../shared/i18n';

export interface ServiceEditorModalProps {
  isOpen: boolean;
  service?: any | null;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export const ServiceEditorModal: React.FC<ServiceEditorModalProps> = ({
  isOpen,
  service,
  onClose,
  onSave,
  isLoading = false,
}) => {
  const { language, t } = useLanguage();

  const [step, setStep] = useState(0);
  const [formLang, setFormLang] = useState<SupportedLanguage>('en');

  // Form State
  const [isMaster, setIsMaster] = useState(false);
  const [parentId, setParentId] = useState<number | null>(null);
  const [primaryOrgId, setPrimaryOrgId] = useState<number | null>(null);

  // Localized Titles & Descriptions
  const [nameEn, setNameEn] = useState('');
  const [nameAm, setNameAm] = useState('');
  const [nameOm, setNameOm] = useState('');
  const [code, setCode] = useState('');

  const [descEn, setDescEn] = useState('');
  const [descAm, setDescAm] = useState('');
  const [descOm, setDescOm] = useState('');

  const [estimatedDuration, setEstimatedDuration] = useState('30');
  const [feeAmount, setFeeAmount] = useState('0.00');
  const [isActive, setIsActive] = useState(true);

  // Step 2: Documents selection & mandatory flags
  const [docSearch, setDocSearch] = useState('');
  const [selectedDocs, setSelectedDocs] = useState<
    Record<number, { is_mandatory: boolean; notes: string }>
  >({});

  // Step 3: Offering Organizations (branches)
  const [selectedOrgs, setSelectedOrgs] = useState<number[]>([]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Queries
  const { data: docsResponse, isLoading: isLoadingDocs } = useGetDocumentsQuery(undefined, {
    skip: !isOpen,
  });
  const { data: orgsResponse } = useGetOrganizationsQuery({ per_page: 100 }, { skip: !isOpen });
  const { data: servicesResponse } = useGetServicesQuery({ scope: 'master' }, { skip: !isOpen });

  const catalogDocs = useMemo(() => docsResponse?.data || [], [docsResponse]);
  const allOrganizations = useMemo(() => orgsResponse?.data || [], [orgsResponse]);
  const masterServices = useMemo(() => {
    return (servicesResponse?.data || []).filter((s: any) => s.is_master || !s.parent_id);
  }, [servicesResponse]);

  // Pre-fill state when editing existing service
  useEffect(() => {
    if (service && isOpen) {
      const isM = Boolean(service.is_master || !service.parent_id);
      setIsMaster(isM);
      setParentId(service.parent_id || null);
      setPrimaryOrgId(service.organization_id || service.organization?.id || null);

      // Localized Names
      setNameEn(getLocalizedText(service.name, 'en'));
      setNameAm(getLocalizedText(service.name, 'am') || service.name_amh || '');
      setNameOm(getLocalizedText(service.name, 'om') || service.name_oro || '');

      // Code
      setCode(service.code || '');

      // Localized Descriptions
      setDescEn(getLocalizedText(service.description, 'en'));
      setDescAm(getLocalizedText(service.description, 'am') || service.description_amh || '');
      setDescOm(getLocalizedText(service.description, 'om') || service.description_oro || '');

      setEstimatedDuration(String(service.estimated_duration_minutes ?? 30));
      setFeeAmount(String(service.fee_amount ?? 0));
      setIsActive(Boolean(service.is_active));

      // Existing documents
      const existingDocs: Record<number, { is_mandatory: boolean; notes: string }> = {};
      if (Array.isArray(service.required_documents)) {
        service.required_documents.forEach((d: any) => {
          existingDocs[d.id] = {
            is_mandatory: Boolean(d.pivot?.is_mandatory ?? true),
            notes: d.pivot?.instructions || '',
          };
        });
      }
      setSelectedDocs(existingDocs);

      // Existing offering orgs
      if (Array.isArray(service.offering_organizations)) {
        setSelectedOrgs(service.offering_organizations.map((o: any) => o.id));
      } else if (service.organization_id) {
        setSelectedOrgs([service.organization_id]);
      } else {
        setSelectedOrgs([]);
      }
    } else if (isOpen) {
      // Reset form
      setIsMaster(false);
      setParentId(null);
      setPrimaryOrgId(null);
      setNameEn('');
      setNameAm('');
      setNameOm('');
      setCode('');
      setDescEn('');
      setDescAm('');
      setDescOm('');
      setEstimatedDuration('30');
      setFeeAmount('0.00');
      setIsActive(true);
      setSelectedDocs({});
      setSelectedOrgs([]);
      setStep(0);
      setErrorMsg(null);
    }
  }, [service, isOpen]);

  // Handle auto slug from English name
  const handleNameEnChange = (val: string) => {
    setNameEn(val);
    if (!service && !code) {
      const slug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 30);
      setCode(slug);
    }
  };

  const filteredDocs = useMemo(() => {
    const q = docSearch.trim().toLowerCase();
    if (!q) return catalogDocs;
    return catalogDocs.filter((d: any) => {
      const name = getLocalizedText(d.name, language).toLowerCase();
      return name.includes(q) || (d.code && d.code.toLowerCase().includes(q));
    });
  }, [catalogDocs, docSearch, language]);

  const handleToggleDoc = (docId: number) => {
    setSelectedDocs((prev) => {
      const next = { ...prev };
      if (next[docId]) {
        delete next[docId];
      } else {
        next[docId] = { is_mandatory: true, notes: '' };
      }
      return next;
    });
  };

  const handleToggleOrg = (orgId: number) => {
    setSelectedOrgs((prev) =>
      prev.includes(orgId) ? prev.filter((id) => id !== orgId) : [...prev, orgId]
    );
  };

  const handleSelectAllOrgs = () => {
    setSelectedOrgs(allOrganizations.map((o: any) => o.id));
  };

  const handleClearAllOrgs = () => {
    setSelectedOrgs([]);
  };

  const handleSubmit = async () => {
    const activeName = nameEn.trim() || nameAm.trim() || nameOm.trim();
    if (!activeName) {
      setErrorMsg('Please enter a service name.');
      setStep(0);
      return;
    }

    if (!code.trim()) {
      setErrorMsg('Please provide a unique code slug.');
      setStep(0);
      return;
    }

    if (!isMaster && !parentId && masterServices.length > 0) {
      setErrorMsg('Please select a Parent Master Service Category.');
      setStep(0);
      return;
    }

    if (!primaryOrgId && allOrganizations.length > 0) {
      setErrorMsg('Please select a Governing Organization.');
      setStep(0);
      return;
    }

    setErrorMsg(null);

    const docPayload = Object.entries(selectedDocs).map(([docId, meta]) => ({
      document_id: Number(docId),
      is_mandatory: meta.is_mandatory,
      instructions: meta.notes,
    }));

    const payload = {
      name: nameEn.trim() || activeName,
      name_amh: nameAm.trim() || '',
      name_oro: nameOm.trim() || '',
      code: code.trim().toLowerCase(),
      description: descEn.trim(),
      description_amh: descAm.trim() || '',
      description_oro: descOm.trim() || '',
      is_master: isMaster,
      parent_id: isMaster ? null : parentId,
      organization_id: primaryOrgId,
      estimated_duration_minutes: isMaster ? 0 : Number(estimatedDuration) || 0,
      fee_amount: isMaster ? 0 : parseFloat(feeAmount) || 0,
      fee_currency: 'ETB',
      is_active: isActive,
      documents: docPayload,
      offering_organizations: selectedOrgs,
    };

    try {
      await onSave(payload);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.data?.message || err?.message || 'Failed to save service standard.');
    }
  };

  if (!isOpen) return null;

  const stepsList = [
    t('services.editor.basics', 'Basics'),
    t('services.editor.documents', 'Documents'),
    t('services.editor.locations', 'Locations'),
  ];

  const selectedDocsCount = Object.keys(selectedDocs).length;
  const selectedOrgsCount = selectedOrgs.length;

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="editor"
        role="dialog"
        aria-modal="true"
        aria-labelledby="editor-title"
      >
        {/* Editor Header */}
        <header className="editor-header">
          <div>
            <button className="back-link" type="button" onClick={onClose}>
              <ArrowLeft />
              <span>{t('services.backToServices', 'Back to services')}</span>
            </button>

            <div className="editor-title-row">
              <div className="editor-mark">
                <ClipboardList />
              </div>
              <div>
                <p>{isMaster ? 'MASTER SERVICE CATALOG' : 'SERVICE SETUP'}</p>
                <h2 id="editor-title">
                  {service
                    ? isMaster
                      ? 'Edit Master Category'
                      : 'Edit Subservice'
                    : isMaster
                    ? 'Create Master Category'
                    : 'Create Citizen Service'}
                </h2>
              </div>
            </div>
            <p className="editor-subtitle">
              Add the essentials, then configure documents and delivery branches.
            </p>
          </div>
          <button
            className="icon-button close-editor"
            type="button"
            aria-label="Close editor"
            onClick={onClose}
          >
            <X />
          </button>
        </header>

        {/* Progress Stepper Bar */}
        {!isMaster && (
          <div className="progress-area">
            <div className="step-track">
              {stepsList.map((label, idx) => (
                <button
                  type="button"
                  key={label}
                  className={`step-item ${step === idx ? 'step-current' : ''} ${
                    step > idx ? 'step-done' : ''
                  }`}
                  onClick={() => setStep(idx)}
                >
                  <span className="step-number">
                    {step > idx ? <Check /> : idx + 1}
                  </span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
            <div className="progress-line">
              <span style={{ width: `${step * 50}%` }} />
            </div>
          </div>
        )}

        {/* Error banner */}
        {errorMsg && (
          <div
            style={{
              margin: '12px 28px 0',
              padding: '10px 14px',
              borderRadius: '7px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Editor Body */}
        <div className="editor-body">
          {/* STEP 0: BASICS (Or Master Category) */}
          {(isMaster || step === 0) && (
            <div className="step-content">
              <div className="step-intro">
                <span className="step-kicker">STEP 1 OF 3</span>
                <h3>{isMaster ? 'Master Domain Category' : 'Start with the essentials'}</h3>
                <p>These details help citizens find, identify, and understand this public service.</p>
              </div>

              {/* Service Type Switcher (Master vs Subservice) */}
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  marginBottom: '18px',
                  padding: '4px',
                  background: '#f0f5f3',
                  borderRadius: '8px',
                  width: 'fit-content',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsMaster(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: 0,
                    background: !isMaster ? '#ffffff' : 'transparent',
                    color: !isMaster ? '#075363' : '#64748b',
                    fontWeight: !isMaster ? 700 : 500,
                    fontSize: '11.5px',
                    boxShadow: !isMaster ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  <FileText style={{ width: '13px', height: '13px' }} />
                  <span>{t('services.editor.subserviceType', 'Citizen Subservice')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMaster(true);
                    setParentId(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: 0,
                    background: isMaster ? '#ffffff' : 'transparent',
                    color: isMaster ? '#075363' : '#64748b',
                    fontWeight: isMaster ? 700 : 500,
                    fontSize: '11.5px',
                    boxShadow: isMaster ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Folder style={{ width: '13px', height: '13px' }} />
                  <span>{t('services.editor.masterCategoryType', 'Master Category')}</span>
                </button>
              </div>

              {/* Multilingual Input Tabs (English | Amharic | Oromo) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '14px',
                  padding: '6px 12px',
                  background: '#ffffff',
                  border: '1px solid #dce7e3',
                  borderRadius: '7px',
                }}
              >
                <Globe style={{ width: '14px', height: '14px', color: '#075363' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#334155' }}>
                  Input Language:
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {(['en', 'am', 'om'] as SupportedLanguage[]).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setFormLang(l)}
                      style={{
                        padding: '3px 10px',
                        borderRadius: '4px',
                        border: 0,
                        background: formLang === l ? '#075363' : '#edf4f2',
                        color: formLang === l ? '#ffffff' : '#475569',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {l === 'en' ? 'English' : l === 'am' ? 'አማርኛ' : 'Oromoo'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Grid */}
              <div className="form-grid">
                {/* Localized Service Name */}
                <label className="field full-field">
                  <span>
                    Service name ({formLang === 'en' ? 'English' : formLang === 'am' ? 'አማርኛ' : 'Afaan Oromoo'}) <i>*</i>
                  </span>
                  {formLang === 'en' && (
                    <input
                      required
                      value={nameEn}
                      onChange={(e) => handleNameEnChange(e.target.value)}
                      placeholder="e.g. Birth Certificate Issuance"
                    />
                  )}
                  {formLang === 'am' && (
                    <input
                      value={nameAm}
                      onChange={(e) => setNameAm(e.target.value)}
                      placeholder="ምሳሌ፦ የልደት ምስክር ወረቀት አሰጣጥ"
                    />
                  )}
                  {formLang === 'om' && (
                    <input
                      value={nameOm}
                      onChange={(e) => setNameOm(e.target.value)}
                      placeholder="fkn. Waraqaa ragaa dhalootaa kennuu"
                    />
                  )}
                </label>

                {/* Code Slug */}
                <label className="field">
                  <span>Code identifier <i>*</i></span>
                  <input
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. birth-cert"
                    style={{ fontFamily: 'monospace' }}
                  />
                </label>

                {/* Parent Category (Subservice only) */}
                {!isMaster && (
                  <label className="field">
                    <span>Parent category <i>*</i></span>
                    <select
                      required
                      value={parentId ?? ''}
                      onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value="">Select a category...</option>
                      {masterServices.map((ms: any) => (
                        <option key={ms.id} value={ms.id}>
                          {getLocalizedText(ms.name, language)} ({ms.code})
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {/* Governing Organization */}
                <label className="field full-field">
                  <span>Responsible organization / bureau <i>*</i></span>
                  <select
                    required
                    value={primaryOrgId ?? ''}
                    onChange={(e) => setPrimaryOrgId(e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">Select responsible organization...</option>
                    {allOrganizations.map((org: any) => (
                      <option key={org.id} value={org.id}>
                        {getLocalizedText(org.name, language)} ({org.code})
                      </option>
                    ))}
                  </select>
                </label>

                {/* Duration & Fee (Subservice only) */}
                {!isMaster && (
                  <>
                    <label className="field">
                      <span>Turnaround time</span>
                      <div className="input-suffix">
                        <input
                          type="number"
                          min="0"
                          value={estimatedDuration}
                          onChange={(e) => setEstimatedDuration(e.target.value)}
                        />
                        <span>minutes</span>
                      </div>
                    </label>

                    <label className="field">
                      <span>Standard citizen fee</span>
                      <div className="input-suffix">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={feeAmount}
                          onChange={(e) => setFeeAmount(e.target.value)}
                        />
                        <span>ETB</span>
                      </div>
                    </label>
                  </>
                )}

                {/* Description */}
                <label className="field full-field">
                  <span>
                    Citizen overview & description ({formLang === 'en' ? 'English' : formLang === 'am' ? 'አማርኛ' : 'Oromoo'})
                  </span>
                  {formLang === 'en' && (
                    <textarea
                      rows={3}
                      value={descEn}
                      onChange={(e) => setDescEn(e.target.value)}
                      placeholder="A short, clear description of the service and who can apply..."
                    />
                  )}
                  {formLang === 'am' && (
                    <textarea
                      rows={3}
                      value={descAm}
                      onChange={(e) => setDescAm(e.target.value)}
                      placeholder="ስለ አገልግሎቱ አጭርና ግልጽ ማብራሪያ ይጻፉ..."
                    />
                  )}
                  {formLang === 'om' && (
                    <textarea
                      rows={3}
                      value={descOm}
                      onChange={(e) => setDescOm(e.target.value)}
                      placeholder="Ibsa gabaabaa fi ifa ta'e barreessaa..."
                    />
                  )}
                </label>
              </div>

              {/* Publish Toggle */}
              <label className="publish-toggle">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <span className="toggle-check">
                  <Check />
                </span>
                <span>
                  <b>Publish this service</b>
                  <small>Citizens can see published services in the public directory.</small>
                </span>
              </label>
            </div>
          )}

          {/* STEP 1: DOCUMENTS (Subservice only) */}
          {!isMaster && step === 1 && (
            <div className="step-content">
              <div className="step-intro">
                <span className="step-kicker">STEP 2 OF 3</span>
                <h3>What should citizens bring?</h3>
                <p>Select the documents required to complete this service. You can update this anytime.</p>
              </div>

              <label className="search-box doc-search">
                <Search />
                <input
                  value={docSearch}
                  onChange={(e) => setDocSearch(e.target.value)}
                  placeholder="Search documents by name or code..."
                  aria-label="Search documents"
                />
              </label>

              <div className="selection-list">
                {isLoadingDocs ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                    Loading documents catalog...
                  </div>
                ) : filteredDocs.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                    No documents found matching search.
                  </div>
                ) : (
                  filteredDocs.map((doc: any) => {
                    const isSelected = Boolean(selectedDocs[doc.id]);
                    const meta = selectedDocs[doc.id] || { is_mandatory: true, notes: '' };

                    return (
                      <div
                        key={doc.id}
                        className={`selection-row ${isSelected ? 'selection-picked' : ''}`}
                        onClick={() => handleToggleDoc(doc.id)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleDoc(doc.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="check-mark">
                          <Check />
                        </span>
                        <span className="selection-icon">
                          <FileText />
                        </span>
                        <span className="selection-label">
                          <b>{getLocalizedText(doc.name, language)}</b>
                          <small>{doc.code}</small>
                        </span>
                        <span className="attach-action">
                          {isSelected ? 'Added ✓' : '+ Add'}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="selection-summary">
                <span>
                  <Check /> {selectedDocsCount} document{selectedDocsCount === 1 ? '' : 's'} selected
                </span>
                <button type="button" onClick={() => setSelectedDocs({})}>
                  Clear selection
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: LOCATIONS (Subservice only) */}
          {!isMaster && step === 2 && (
            <div className="step-content">
              <div className="step-intro">
                <span className="step-kicker">STEP 3 OF 3</span>
                <h3>Where is this service available?</h3>
                <p>Choose the municipal offices and sub-cities that deliver this service to citizens.</p>
              </div>

              <div className="location-toolbar">
                <span>Available offices & sub-cities</span>
                <button
                  type="button"
                  onClick={
                    selectedOrgs.length === allOrganizations.length
                      ? handleClearAllOrgs
                      : handleSelectAllOrgs
                  }
                >
                  {selectedOrgs.length === allOrganizations.length ? 'Clear all' : 'Select all'}
                </button>
              </div>

              <div className="location-grid">
                {allOrganizations.map((org: any) => {
                  const isSelected = selectedOrgs.includes(org.id);
                  return (
                    <label
                      key={org.id}
                      className={`location-option ${isSelected ? 'location-selected' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleOrg(org.id)}
                      />
                      <span className="check-mark">
                        <Check />
                      </span>
                      <Building2 />
                      <span>{getLocalizedText(org.name, language)}</span>
                    </label>
                  );
                })}
              </div>

              <div className="selection-summary">
                <span>
                  <Building2 style={{ width: '13px', height: '13px' }} />
                  {selectedOrgsCount} location{selectedOrgsCount === 1 ? '' : 's'} selected
                </span>
                <button type="button" onClick={handleClearAllOrgs}>
                  {t('services.editor.clearSelection', 'Clear selection')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Editor Footer */}
        <footer className="editor-footer">
          <div className="footer-summary">
            {!isMaster ? (
              <>
                <FileText />
                <span>{selectedDocsCount} documents</span>
                <span className="summary-dot">·</span>
                <span>{selectedOrgsCount} locations</span>
              </>
            ) : (
              <span>Master Service Category</span>
            )}
          </div>

          <div className="footer-actions">
            <button className="cancel-button" type="button" onClick={onClose} disabled={isLoading}>
              {t('common.cancel', 'Cancel')}
            </button>

            {!isMaster && step > 0 && (
              <button
                className="outline-button"
                type="button"
                onClick={() => setStep(step - 1)}
                disabled={isLoading}
              >
                <ArrowLeft />
                <span>{t('common.back', 'Back')}</span>
              </button>
            )}

            {!isMaster && step < 2 ? (
              <button
                className="primary-button"
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={isLoading}
              >
                <span>{t('common.continue', 'Continue')}</span>
                <ArrowRight />
              </button>
            ) : (
              <button
                className="primary-button"
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                <span>{isLoading ? t('common.saving', 'Saving...') : t('services.editor.saveService', 'Save service')}</span>
                <Check />
              </button>
            )}
          </div>
        </footer>
      </section>
    </div>
  );
};

