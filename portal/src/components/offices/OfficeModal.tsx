import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../shared/Icon';
import { SearchSelect, type SearchSelectOption } from '../shared/SearchSelect';
import type { OfficeType } from '../../types/portal.types';
import {
  useGetOrganizationsQuery,
  useGetOrganizationTypesQuery,
} from '../../services/organizationsApi';

export interface OfficeModalProps {
  office?: any;
  officeTypes?: OfficeType[];
  offices?: any[];
  isOpen: boolean;
  onClose: () => void;
  onSave?: (saved: any) => void;
  isLoading?: boolean;
}

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-+|-+$)/g, '');

const formatApiError = (err: any): string => {
  if (err?.data?.errors && typeof err.data.errors === 'object') {
    const errorEntries = Object.entries(err.data.errors);
    if (errorEntries.length > 0) {
      return errorEntries
        .map(([_, msgs]) => (Array.isArray(msgs) ? msgs.join(' ') : String(msgs)))
        .join(' • ');
    }
  }
  return err?.data?.message || err?.message || 'Validation failed. Please verify the office details.';
};

export const OfficeModal: React.FC<OfficeModalProps> = ({
  office,
  officeTypes: propTypes,
  offices: propOffices,
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}) => {
  const { data: apiOrgTypes } = useGetOrganizationTypesQuery(undefined, { skip: !isOpen });
  const { data: apiOrgs } = useGetOrganizationsQuery(undefined, { skip: !isOpen });

  // Form states strictly matching organizations table schema
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [typeId, setTypeId] = useState<number>(1); // 1 = Sub-City (Root), 2 = Woreda, 3 = Bureau
  const [parentId, setParentId] = useState<number | null>(null);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync form fields when opening or switching office
  useEffect(() => {
    if (isOpen) {
      setName(office?.name || '');
      setCode(office?.code || (office?.name ? slugify(office.name) : ''));
      const initialType = Number(office?.organization_type_id || office?.typeId || 1);
      setTypeId(initialType);
      setParentId(office?.parent_organization_id ?? office?.parentId ?? null);
      setAddress(office?.address || '');
      setPhone(office?.phone || '');
      setEmail(office?.email || '');
      setDescription(office?.description || '');
      setStatus(office?.status?.toLowerCase() === 'inactive' ? 'inactive' : 'active');
      setErrorMsg(null);
    }
  }, [isOpen, office]);

  // Classification options
  const classificationOptions: SearchSelectOption[] = useMemo(() => {
    const raw: any[] = propTypes?.length ? propTypes : apiOrgTypes?.data || [];
    return raw.map((t: any) => ({
      value: t.id,
      label: t.name,
      code: t.code,
      badge: `Level ${t.level ?? (t.id === 1 ? 1 : t.id === 2 ? 2 : 3)}`,
      badgeTone: (t.level === 1 || t.id === 1) ? 'sage' : (t.level === 2 || t.id === 2) ? 'blue' : 'gold',
      secondary: t.description || (t.can_be_root || t.level === 1 ? 'Root platform tier' : 'Requires parent organization'),
    }));
  }, [propTypes, apiOrgTypes]);

  // Resolve currently selected classification tier
  const selectedType = useMemo(() => {
    const list: any[] = propTypes?.length ? propTypes : apiOrgTypes?.data || [];
    return list.find((t: any) => Number(t.id) === Number(typeId)) || null;
  }, [propTypes, apiOrgTypes, typeId]);

  const isRootType = useMemo(() => {
    if (!selectedType) return Number(typeId) === 1;
    return Boolean(selectedType.can_be_root || selectedType.level === 1 || selectedType.code === 'sub_city');
  }, [selectedType, typeId]);

  const currentLevel = useMemo(() => {
    if (selectedType?.level) return Number(selectedType.level);
    return isRootType ? 1 : Number(typeId) === 3 ? 3 : 2;
  }, [selectedType, isRootType, typeId]);

  // Filter eligible parents: parent must have higher statutory rank (lower level number)
  const parentOptions: SearchSelectOption[] = useMemo(() => {
    if (isRootType) {
      return [
        {
          value: 0,
          label: 'None (Root Organization)',
          code: 'root',
          badge: 'Root',
          badgeTone: 'sage',
          secondary: `${selectedType?.name || 'Sub-Cities'} have no parent organization.`,
        },
      ];
    }

    const orgsList: any[] = propOffices?.length ? propOffices : apiOrgs?.data || [];

    const eligible = orgsList.filter((org) => {
      if (office && (org.id === office.id || org.id === office?.id)) return false;
      const orgLevel =
        org.type?.level ??
        (org.typeId === 1 || org.organization_type_id === 1
          ? 1
          : org.typeId === 2 || org.organization_type_id === 2
            ? 2
            : 3);
      return orgLevel < currentLevel;
    });

    return eligible.map((org) => {
      const orgLevel =
        org.type?.level ?? (org.typeId === 1 || org.organization_type_id === 1 ? 1 : 2);
      return {
        value: org.id,
        label: org.name,
        code: org.code,
        badge: orgLevel === 1 ? 'Sub-City' : 'Woreda',
        badgeTone: orgLevel === 1 ? 'sage' : 'blue',
        secondary: org.address || `${org.code || ''} office`,
      };
    });
  }, [propOffices, apiOrgs, isRootType, currentLevel, selectedType, office]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!office) setCode(slugify(val));
  };

  const handleTypeSelect = (val: string | number | null) => {
    const nextTypeId = Number(val) || 2;
    setTypeId(nextTypeId);
    setErrorMsg(null);
    const targetType = (propTypes?.length ? propTypes : apiOrgTypes?.data || []).find(
      (t: any) => Number(t.id) === nextTypeId
    );
    const targetIsRoot = targetType
      ? Boolean(targetType.can_be_root || targetType.level === 1 || targetType.code === 'sub_city')
      : nextTypeId === 1;
    if (targetIsRoot) setParentId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setErrorMsg('Office name is required.');
    const cleanCode = code.toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-').replace(/(^-+|-+$)/g, '');
    if (!cleanCode) return setErrorMsg('Office code identifier is required.');
    if (!isRootType && (!parentId || Number(parentId) <= 0)) {
      const parentLabel = Number(typeId) === 2 ? 'Sub-City' : 'Sub-City or Woreda';
      return setErrorMsg(`A ${selectedType?.name || 'child office'} must have a parent ${parentLabel} selected.`);
    }
    const cleanEmail = email.trim();
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return setErrorMsg('Please enter a valid email address (e.g., info@office.gov.et).');
    }
    setErrorMsg(null);

    const resolvedParentId =
      isRootType || !parentId || Number(parentId) <= 0 ? null : Number(parentId);

    const payload = {
      ...(office?.id ? { id: office.id } : {}),
      name: name.trim(),
      code: cleanCode,
      organization_type_id: Number(typeId),
      parent_organization_id: resolvedParentId,
      description: description.trim() || null,
      address: address.trim() || null,
      phone: phone.trim() || null,
      email: cleanEmail || null,
      status,
    };

    try {
      if (onSave) {
        await onSave(payload);
      }
      onClose();
    } catch (err: any) {
      const msg = formatApiError(err);
      setErrorMsg(msg);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay">
      <section
        className="modal-card modal-form"
        role="dialog"
        aria-modal="true"
        aria-label={office ? 'Edit office' : 'Create new office'}
        style={{ maxWidth: '640px', width: '92%' }}
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <div>
              <span className="panel-eyebrow">ORGANIZATION DIRECTORY</span>
              <h2>{office ? 'Edit administrative office' : 'Create new administrative office'}</h2>
              <p>Configure office details, hierarchy tier, and contact information.</p>
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
            {/* Name */}
            <label className="modal-field full">
              <span>Office name <i>*</i></span>
              <input
                required
                placeholder="e.g. Bole Sub-City Administration or Revenues Bureau"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </label>

            {/* Code */}
            <label className="modal-field full">
              <span>Unique code slug <i>*</i></span>
              <input
                required
                placeholder="e.g. subcity-bole or woreda-01"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </label>

            {/* Type */}
            <div className="modal-field full">
              <SearchSelect
                label="Classification Tier"
                required
                value={typeId}
                onChange={handleTypeSelect}
                options={classificationOptions}
                placeholder="Select tier..."
              />
            </div>

            {/* Parent */}
            <div className="modal-field full">
              <SearchSelect
                label={
                  isRootType
                    ? 'Parent Organization'
                    : Number(typeId) === 2
                      ? 'Parent Sub-City'
                      : 'Parent Organization'
                }
                required={!isRootType}
                value={isRootType ? 0 : parentId}
                onChange={(val) => {
                  setParentId(val && Number(val) > 0 ? Number(val) : null);
                  setErrorMsg(null);
                }}
                options={parentOptions}
                disabled={isRootType}
                placeholder={
                  isRootType
                    ? 'None (Sub-City is Root Tier)'
                    : Number(typeId) === 2
                      ? 'Select governing Sub-City...'
                      : 'Select parent office...'
                }
                helperText={
                  isRootType
                    ? `${selectedType?.name || 'Sub-Cities'} are root-level platform anchors and do not have a parent.`
                    : Number(typeId) === 2
                      ? 'Every Woreda must be assigned to its governing Sub-City (e.g., Bole, Yeka, Kirkos).'
                      : 'Bureaus must report to an administrative Sub-City or Woreda.'
                }
              />
            </div>

            {/* Address */}
            <label className="modal-field">
              <span>Physical address / location</span>
              <input
                placeholder="e.g. Bole Road, Building B, Floor 2"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </label>

            {/* Status */}
            <label className="modal-field">
              <span>Status</span>
              <select value={status} onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>

            {/* Phone */}
            <label className="modal-field">
              <span>Official phone number</span>
              <input
                type="tel"
                placeholder="+251 11 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>

            {/* Email */}
            <label className="modal-field">
              <span>Official contact email</span>
              <input
                type="email"
                placeholder="contact@office.gov.et"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            {/* Description */}
            <label className="modal-field full">
              <span>Description / office mandate</span>
              <textarea
                rows={2}
                placeholder="Brief summary of office mission and public services..."
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
                {isLoading ? 'Saving...' : (office ? 'Save changes' : 'Create office')} <Icon name="arrow" size={15} />
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
