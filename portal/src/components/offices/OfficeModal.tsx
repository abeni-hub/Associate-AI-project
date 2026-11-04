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
}

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const OfficeModal: React.FC<OfficeModalProps> = ({
  office,
  officeTypes: propTypes,
  offices: propOffices,
  isOpen,
  onClose,
  onSave,
}) => {
  const { data: apiOrgTypes } = useGetOrganizationTypesQuery(undefined, { skip: !isOpen });
  const { data: apiOrgs } = useGetOrganizationsQuery(undefined, { skip: !isOpen });

  // Form states strictly matching organizations table schema
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [typeId, setTypeId] = useState<number>(2); // 1 = Sub-City, 2 = Woreda, 3 = Bureau
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
      const initialType = Number(office?.organization_type_id || office?.typeId || 2);
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
    const raw = propTypes?.length ? propTypes : apiOrgTypes?.data;
    if (raw?.length) {
      return raw.map((t: any) => ({
        value: t.id,
        label: t.name,
        code: t.code,
        badge: `Level ${t.level}`,
        badgeTone: t.level === 1 ? 'sage' : t.level === 2 ? 'blue' : 'gold',
        secondary: t.description || (t.can_be_root || t.level === 1 ? 'Root platform tier' : 'Requires parent organization'),
      }));
    }
    return [
      { value: 1, label: 'Sub-City', code: 'sub_city', badge: 'Level 1', badgeTone: 'sage', secondary: 'Chartered administration (Root tier)' },
      { value: 2, label: 'Woreda', code: 'woreda', badge: 'Level 2', badgeTone: 'blue', secondary: 'Local administrative district (Reports to Sub-City)' },
      { value: 3, label: 'Bureau', code: 'bureau', badge: 'Level 3', badgeTone: 'gold', secondary: 'Sectoral municipal office (Reports to Sub-City or Woreda)' },
    ];
  }, [propTypes, apiOrgTypes]);

  const isSubCity = Number(typeId) === 1;
  const isWoreda = Number(typeId) === 2;
  const isBureau = Number(typeId) === 3;

  // Filter eligible parents: Sub-City (none), Woreda (Sub-City only), Bureau (Sub-City or Woreda)
  const parentOptions: SearchSelectOption[] = useMemo(() => {
    if (isSubCity) {
      return [{ value: 0, label: 'None (Root Organization)', code: 'root', badge: 'Root', badgeTone: 'sage', secondary: 'Sub-Cities have no parent organization.' }];
    }

    const orgsList: any[] = propOffices?.length ? propOffices : apiOrgs?.data || [];
    return orgsList
      .filter((org) => {
        if (office && org.id === office.id) return false;
        const orgTypeId = org.organization_type_id ?? org.typeId;
        if (isWoreda) return orgTypeId === 1;
        if (isBureau) return orgTypeId === 1 || orgTypeId === 2;
        return true;
      })
      .map((org) => ({
        value: org.id,
        label: org.name,
        code: org.code,
        badge: (org.organization_type_id ?? org.typeId) === 1 ? 'Sub-City' : 'Woreda',
        badgeTone: (org.organization_type_id ?? org.typeId) === 1 ? 'sage' : 'blue',
      }));
  }, [propOffices, apiOrgs, isSubCity, isWoreda, isBureau, office]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!office) setCode(slugify(val));
  };

  const handleTypeSelect = (val: string | number | null) => {
    const nextTypeId = Number(val) || 2;
    setTypeId(nextTypeId);
    setErrorMsg(null);
    if (nextTypeId === 1) setParentId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setErrorMsg('Office name is required.');
    if (!code.trim()) return setErrorMsg('Office code identifier is required.');
    if (isWoreda && (!parentId || Number(parentId) === 0)) {
      return setErrorMsg('A Woreda must have a parent Sub-City selected.');
    }
    if (isBureau && (!parentId || Number(parentId) === 0)) {
      return setErrorMsg('A Bureau must be linked to a Sub-City or Woreda parent.');
    }
    setErrorMsg(null);

    const payload = {
      ...(office?.id ? { id: office.id } : {}),
      name: name.trim(),
      code: code.toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-'),
      organization_type_id: Number(typeId),
      parent_organization_id: isSubCity ? null : Number(parentId),
      description: description.trim() || null,
      address: address.trim() || null,
      phone: phone.trim() || null,
      email: email.trim() || null,
      status,
    };

    onSave?.(payload);
    onClose();
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
                label="Parent Organization"
                required={!isSubCity}
                value={isSubCity ? 0 : parentId}
                onChange={(val) => {
                  setParentId(val ? Number(val) : null);
                  setErrorMsg(null);
                }}
                options={parentOptions}
                disabled={isSubCity}
                placeholder={isSubCity ? 'None (Sub-City is Root Tier)' : 'Select parent organization...'}
                helperText={isSubCity ? 'Sub-Cities are root-level tiers with no parent organization.' : undefined}
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
              <button type="button" className="button secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="button primary">
                {office ? 'Save changes' : 'Create office'} <Icon name="arrow" size={15} />
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
