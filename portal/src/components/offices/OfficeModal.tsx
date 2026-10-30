import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../shared/Icon';
import { SearchSelect, type SearchSelectOption } from '../shared/SearchSelect';
import type { OfficeItem, OfficeType } from '../../types/portal.types';
import {
  useGetOrganizationsQuery,
  useGetOrganizationTypesQuery,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
} from '../../services/organizationsApi';

export interface OfficeModalProps {
  office?: OfficeItem | null;
  officeTypes?: OfficeType[];
  offices?: OfficeItem[];
  isOpen: boolean;
  onClose: () => void;
  onSave?: (saved: any) => void;
}

export const OfficeModal: React.FC<OfficeModalProps> = ({
  office,
  isOpen,
  onClose,
  onSave,
}) => {
  const { data: apiOrgTypes } = useGetOrganizationTypesQuery();
  const { data: apiOrgs } = useGetOrganizationsQuery();
  const [createOrgTrigger, { isLoading: isCreating }] = useCreateOrganizationMutation();
  const [updateOrgTrigger, { isLoading: isUpdating }] = useUpdateOrganizationMutation();

  const isSubmitting = isCreating || isUpdating;

  // Form state
  const [name, setName] = useState(office?.name || '');
  const [code, setCode] = useState(() => {
    if (office?.name) {
      return office.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    return '';
  });
  const [typeId, setTypeId] = useState<number>(() => office?.typeId || 2); // Default to Woreda or edit value
  const [parentId, setParentId] = useState<number | null>(() => office?.parentId || null);
  const [admin, setAdmin] = useState(office?.admin || '');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>(
    office?.status === 'Inactive' ? 'Inactive' : 'Active'
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Available classification types
  const classificationOptions: SearchSelectOption[] = useMemo(() => {
    if (apiOrgTypes?.data && apiOrgTypes.data.length > 0) {
      return apiOrgTypes.data.map((t) => ({
        value: t.id,
        label: t.name,
        code: t.code,
        badge: `Level ${t.level}`,
        badgeTone: t.level === 1 ? 'sage' : t.level === 2 ? 'blue' : 'gold',
        secondary: t.description || (t.can_be_root ? 'Root platform tier (can_be_root: true)' : 'Requires parent organization'),
      }));
    }
    return [
      { value: 1, label: 'Sub-City', code: 'sub_city', badge: 'Level 1', badgeTone: 'sage', secondary: 'Chartered administration (Root tier, can_be_root: true)' },
      { value: 2, label: 'Woreda', code: 'woreda', badge: 'Level 2', badgeTone: 'blue', secondary: 'Local administrative district (Must report to Sub-City)' },
      { value: 3, label: 'Bureau', code: 'bureau', badge: 'Level 3', badgeTone: 'gold', secondary: 'Sectoral municipal office (Reports to Sub-City or Woreda)' },
    ];
  }, [apiOrgTypes]);

  // Selected classification
  const selectedType = classificationOptions.find((t) => Number(t.value) === Number(typeId));
  const isSubCity = Number(typeId) === 1;
  const isWoreda = Number(typeId) === 2;
  const isBureau = Number(typeId) === 3;

  // Filter eligible parent organizations according to PostgreSQL rules:
  // - Sub-City: can_be_root = true -> None (Root)
  // - Woreda: parent MUST be Sub-City (typeId === 1)
  // - Bureau: parent can be Sub-City (typeId === 1) or Woreda (typeId === 2)
  const parentOptions: SearchSelectOption[] = useMemo(() => {
    const list: SearchSelectOption[] = [];

    // Allow root option for Sub-City
    if (isSubCity) {
      list.push({
        value: 0,
        label: 'None (Root Organization — can_be_root: true)',
        code: 'root',
        badge: 'Root',
        badgeTone: 'sage',
        secondary: 'Sub-City serves as an independent root tier with no parent requirement.',
      });
      return list;
    }

    // From API organizations
    const rawOrgs = apiOrgs?.data || [];
    const eligibleOrgs = rawOrgs.filter((org) => {
      // Don't allow selecting itself as parent
      if (office && org.id === office.id) return false;

      if (isWoreda) {
        // Woreda only allows sub_city (ID 1) as parent
        return org.organization_type_id === 1;
      }
      if (isBureau) {
        // Bureau allows sub_city (1) or woreda (2) as parent
        return org.organization_type_id === 1 || org.organization_type_id === 2;
      }
      return true;
    });

    eligibleOrgs.forEach((org) => {
      const typeLabel = org.organization_type_id === 1 ? 'Sub-City' : 'Woreda';
      list.push({
        value: org.id,
        label: org.name,
        code: org.code,
        badge: `ID: ${org.id} · ${typeLabel}`,
        badgeTone: org.organization_type_id === 1 ? 'sage' : 'blue',
        secondary: `${org.name} (${org.code})`,
      });
    });

    // Fallback items if API returned empty
    if (list.length === 0) {
      if (isWoreda || isBureau) {
        list.push(
          { value: 1, label: 'Bole Sub-City Administration', code: 'subcity-bole', badge: 'ID: 1 · Sub-City', badgeTone: 'sage', secondary: 'Chartered Sub-City' },
          { value: 2, label: 'Kirkos Sub-City Administration', code: 'subcity-kirkos', badge: 'ID: 2 · Sub-City', badgeTone: 'sage', secondary: 'Chartered Sub-City' },
          { value: 3, label: 'Arada Sub-City Administration', code: 'subcity-arada', badge: 'ID: 3 · Sub-City', badgeTone: 'sage', secondary: 'Chartered Sub-City' },
          { value: 4, label: 'Yeka Sub-City Administration', code: 'subcity-yeka', badge: 'ID: 4 · Sub-City', badgeTone: 'sage', secondary: 'Chartered Sub-City' }
        );
      }
      if (isBureau) {
        list.push(
          { value: 10, label: 'Woreda 01 Administration', code: 'woreda-01-bole', badge: 'ID: 10 · Woreda', badgeTone: 'blue', secondary: 'Woreda district office' },
          { value: 11, label: 'Woreda 03 Administration', code: 'woreda-03-kirkos', badge: 'ID: 11 · Woreda', badgeTone: 'blue', secondary: 'Woreda district office' }
        );
      }
    }

    return list;
  }, [apiOrgs, isSubCity, isWoreda, isBureau, office]);

  // When type changes, ensure parentId validity
  const handleTypeSelect = (val: string | number | null) => {
    const nextTypeId = Number(val) || 2;
    setTypeId(nextTypeId);
    setErrorMsg(null);

    if (nextTypeId === 1) {
      setParentId(null);
    } else {
      // If current parent is invalid for new type, reset or default to first valid parent
      if (parentId) {
        const stillValid = parentOptions.some((opt) => Number(opt.value) === Number(parentId));
        if (!stillValid) {
          setParentId(null);
        }
      }
    }
  };

  // Auto-slugify code from name if user hasn't explicitly modified it
  const handleNameChange = (val: string) => {
    setName(val);
    if (!office) {
      const generatedCode = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setCode(generatedCode);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Office name is required.');
      return;
    }
    if (!code.trim()) {
      setErrorMsg('Office code identifier is required.');
      return;
    }

    // Validate PostgreSQL hierarchy constraints
    if (isWoreda && (!parentId || Number(parentId) === 0)) {
      setErrorMsg('Database Constraint: A Woreda must have a Sub-City assigned as Parent Organization.');
      return;
    }
    if (isBureau && (!parentId || Number(parentId) === 0)) {
      setErrorMsg('Database Constraint: A Bureau must be linked to either a Sub-City or Woreda parent.');
      return;
    }

    setErrorMsg(null);

    const resolvedParentId = isSubCity || Number(parentId) === 0 ? null : Number(parentId);
    const resolvedCode = code.toLowerCase().trim().replace(/\s+/g, '-');

    try {
      if (office && office.id) {
        // Edit existing office
        const res = await updateOrgTrigger({
          id: office.id,
          name: name.trim(),
          code: resolvedCode,
          organization_type_id: Number(typeId),
          parent_organization_id: resolvedParentId,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          status: status === 'Active' ? 'active' : 'inactive',
        }).unwrap();

        setSuccessMsg(`Office "${name}" updated successfully.`);
        if (onSave) {
          onSave({
            ...office,
            name: name.trim(),
            typeId: Number(typeId),
            parentId: resolvedParentId,
            admin: admin.trim() || office.admin,
            status,
          });
        }
      } else {
        // Create new office
        const res = await createOrgTrigger({
          name: name.trim(),
          code: resolvedCode,
          organization_type_id: Number(typeId),
          parent_organization_id: resolvedParentId,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          status: status === 'Active' ? 'active' : 'inactive',
        }).unwrap();

        setSuccessMsg(`New office "${name}" created in PostgreSQL directory.`);
        if (onSave) {
          onSave({
            id: res.data?.id || Date.now(),
            name: name.trim(),
            typeId: Number(typeId),
            parentId: resolvedParentId,
            admin: admin.trim() || 'Lead Administrator',
            services: 0,
            completion: 100,
            status,
            updated: 'Just now',
          });
        }
      }

      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      console.warn('API submission error:', err);
      // Fallback local save if offline
      if (onSave) {
        onSave({
          id: office?.id || Date.now(),
          name: name.trim(),
          typeId: Number(typeId),
          parentId: resolvedParentId,
          admin: admin.trim() || 'Lead Administrator',
          services: office?.services ?? 0,
          completion: office?.completion ?? 100,
          status,
          updated: 'Just now',
        });
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="modal-overlay"
      /* Backdrop clicks deliberately do not close the modal to prevent accidental loss of work */
    >
      <section
        className="modal-card modal-form"
        role="dialog"
        aria-modal="true"
        aria-label={office ? 'Edit administrative office' : 'Create new administrative office'}
        style={{ maxWidth: '640px', width: '92%' }}
      >
        <form onSubmit={handleSubmit}>
          {/* Modal Header */}
          <div className="modal-header">
            <div>
              <span className="panel-eyebrow">POSTGRESQL DIRECTORY FOUNDATION</span>
              <h2>{office ? 'Edit administrative office' : 'Create new administrative office'}</h2>
              <p>Configure classification, hierarchy parent link, and operational metadata.</p>
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

          {/* Success Banner */}
          {successMsg && (
            <div
              style={{
                margin: '1rem 1.5rem 0',
                padding: '10px 14px',
                borderRadius: '6px',
                background: '#ecfdf5',
                border: '1px solid #10b981',
                color: '#065f46',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              <Icon name="check" size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Banner */}
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

          {/* Form Content */}
          <div className="modal-form-grid" style={{ padding: '1.25rem 1.5rem' }}>
            {/* Field: Office Name */}
            <label className="modal-field full">
              <span>
                Office or bureau name <i>*</i>
              </span>
              <input
                required
                placeholder="e.g. Bole Sub-City Administration or Revenues Bureau"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </label>

            {/* Field: Unique Code (slug) */}
            <label className="modal-field full">
              <span>
                Unique code identifier (slug) <i>*</i>
              </span>
              <input
                required
                placeholder="e.g. subcity-bole or woreda-03-kirkos"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <small style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>
                Globally unique PostgreSQL identifier used for routing and audit logging.
              </small>
            </label>

            {/* Field: Office Classification (Search-Select) */}
            <div className="modal-field full">
              <SearchSelect
                label="Office classification"
                required
                value={typeId}
                onChange={handleTypeSelect}
                options={classificationOptions}
                placeholder="Search classification tier..."
                searchPlaceholder="Search Sub-City, Woreda, Bureau..."
                helperText="PostgreSQL classification tier determines allowed parent relationships."
              />
            </div>

            {/* PostgreSQL Hierarchy Rule Notice */}
            <div
              style={{
                gridColumn: '1 / -1',
                padding: '10px 12px',
                borderRadius: '6px',
                background: isSubCity ? '#ecfdf5' : isWoreda ? '#eff6ff' : '#fffbeb',
                border: `1px solid ${isSubCity ? '#a7f3d0' : isWoreda ? '#bfdbfe' : '#fde68a'}`,
                color: isSubCity ? '#065f46' : isWoreda ? '#1e40af' : '#92400e',
                fontSize: '12px',
                lineHeight: 1.45,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
              }}
            >
              <span style={{ marginTop: '2px' }}>
                <Icon name="sitemap" size={15} />
              </span>
              <div>
                <b>
                  {isSubCity && 'Sub-City Hierarchy Rule (can_be_root: true)'}
                  {isWoreda && 'Woreda Hierarchy Rule (Allowed Parent: Sub-City only)'}
                  {isBureau && 'Bureau Hierarchy Rule (Allowed Parents: Sub-City or Woreda)'}
                </b>
                <p style={{ margin: '2px 0 0' }}>
                  {isSubCity &&
                    'Sub-Cities represent the chartered top-level administrative tiers. They do not require a parent organization.'}
                  {isWoreda &&
                    'Under organization_type_allowed_parents, Woredas must be children of a Sub-City. They cannot be root units.'}
                  {isBureau &&
                    'Sector Bureaus can be attached directly to a Sub-City or anchored to a specific Woreda branch with restrictOnDelete.'}
                </p>
              </div>
            </div>

            {/* Field: Parent Organization ID (Search-Select) */}
            <div className="modal-field full">
              <SearchSelect
                label="Parent Organization ID"
                required={!isSubCity}
                value={isSubCity ? 0 : parentId}
                onChange={(val) => {
                  setParentId(val ? Number(val) : null);
                  setErrorMsg(null);
                }}
                options={parentOptions}
                disabled={isSubCity}
                allowClear={isSubCity}
                placeholder={
                  isSubCity
                    ? 'None (Sub-City is Root)'
                    : isWoreda
                      ? 'Search & select Sub-City parent...'
                      : 'Search & select Sub-City or Woreda parent...'
                }
                searchPlaceholder="Search by organization name, code, or ID..."
                helperText={
                  isSubCity
                    ? 'Sub-City is a top-level root organization in PostgreSQL.'
                    : `Showing organizations eligible to parent this ${selectedType?.label || 'unit'}.`
                }
              />
            </div>

            {/* Field: Administrator Name */}
            <label className="modal-field">
              <span>
                Lead administrator <i>*</i>
              </span>
              <input
                required
                placeholder="e.g. Sofia Lemma or Lead Director"
                value={admin}
                onChange={(e) => setAdmin(e.target.value)}
              />
            </label>

            {/* Field: Operational Status */}
            <label className="modal-field">
              <span>Operational status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </label>

            {/* Optional Email & Phone */}
            <label className="modal-field">
              <span>Official contact email</span>
              <input
                type="email"
                placeholder="contact@office.gov.et"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label className="modal-field">
              <span>Official phone number</span>
              <input
                type="tel"
                placeholder="+251 11 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <span>
              <Icon name="shield" size={14} /> Database integrity enforced via PostgreSQL restrictOnDelete.
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="button secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="button primary"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Saving...'
                  : office
                    ? 'Save changes'
                    : 'Create office'}{' '}
                <Icon name="arrow" size={15} />
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>,
    document.body
  );
};

export default OfficeModal;
