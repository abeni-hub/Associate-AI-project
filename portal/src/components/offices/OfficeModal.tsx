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
  const [typeId, setTypeId] = useState<number>(0);
  const [parentId, setParentId] = useState<number | null>(null);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Dynamic organization types lookup
  const allTypes: any[] = useMemo(() => {
    const fromApi = apiOrgTypes?.data;
    if (fromApi && Array.isArray(fromApi) && fromApi.length > 0) return fromApi;
    if (propTypes && Array.isArray(propTypes) && propTypes.length > 0) return propTypes;
    return [];
  }, [propTypes, apiOrgTypes]);

  const typeMap = useMemo(() => {
    const map = new Map<number, any>();
    allTypes.forEach((t) => map.set(Number(t.id), t));
    return map;
  }, [allTypes]);

  // Root platform classification tier (level 1 or can_be_root)
  const rootType = useMemo(() => {
    return allTypes.find((t: any) => Boolean(t.can_be_root || Number(t.level) === 1)) || allTypes[0] || null;
  }, [allTypes]);

  // Sync form fields when opening or switching office
  useEffect(() => {
    if (isOpen) {
      setName(office?.name || '');
      setCode(office?.code || (office?.name ? slugify(office.name) : ''));
      const initialType = Number(
        office?.organization_type_id ||
          office?.typeId ||
          rootType?.id ||
          (allTypes[0]?.id ?? 0)
      );
      setTypeId(initialType);
      setParentId(office?.parent_organization_id ?? office?.parentId ?? null);
      setAddress(office?.address || '');
      setPhone(office?.phone || '');
      setEmail(office?.email || '');
      setDescription(office?.description || '');
      setStatus(office?.status?.toLowerCase() === 'inactive' ? 'inactive' : 'active');
      setErrorMsg(null);
    }
  }, [isOpen, office, allTypes, rootType]);

  // Ensure typeId resolves to a valid tier once allTypes loads
  useEffect(() => {
    if (isOpen && !office && allTypes.length > 0) {
      if (!typeId || !typeMap.has(Number(typeId))) {
        const bestRootId = rootType?.id ?? allTypes[0]?.id;
        if (bestRootId) setTypeId(Number(bestRootId));
      }
    }
  }, [isOpen, office, allTypes, typeId, typeMap, rootType]);

  // Classification options
  const classificationOptions: SearchSelectOption[] = useMemo(() => {
    return allTypes.map((t: any) => ({
      value: t.id,
      label: t.name,
      code: t.code,
      badge: `Level ${t.level ?? 1}`,
      badgeTone: t.level === 1 ? 'sage' : t.level === 2 ? 'blue' : 'gold',
      secondary: t.description || (t.can_be_root || t.level === 1 ? 'Root platform tier' : 'Requires parent organization'),
    }));
  }, [allTypes]);

  // Resolve currently selected classification tier
  const selectedType = useMemo(() => {
    return typeMap.get(Number(typeId)) || allTypes.find((t: any) => Number(t.id) === Number(typeId)) || allTypes[0] || null;
  }, [typeMap, allTypes, typeId]);

  const isRootType = useMemo(() => {
    if (!selectedType) return false;
    return Boolean(selectedType.can_be_root || Number(selectedType.level) === 1);
  }, [selectedType]);

  const currentLevel = useMemo(() => {
    if (selectedType?.level != null) return Number(selectedType.level);
    return isRootType ? 1 : 2;
  }, [selectedType, isRootType]);

  // Helper to reliably determine any organization's hierarchy level depth
  const getOrgLevel = (org: any): number => {
    if (org.type?.level != null) return Number(org.type.level);
    if (org.level != null) return Number(org.level);
    const tId = Number(org.organization_type_id || org.typeId || org.type?.id || 0);
    if (tId && typeMap.has(tId)) {
      const found = typeMap.get(tId);
      if (found?.level != null) return Number(found.level);
    }
    const typeName = (org.typeName || org.type?.name || org.typeCode || org.type?.code || '').toLowerCase();
    for (const t of allTypes) {
      if (t.name?.toLowerCase() === typeName || t.code?.toLowerCase() === typeName) {
        return Number(t.level);
      }
    }
    return 1;
  };

  // Immediate parent tier (strictly Level - 1)
  const parentTier = useMemo(() => {
    if (isRootType) return null;
    return (
      allTypes.find((t) => Number(t.level) === currentLevel - 1) ||
      allTypes.find((t) => Number(t.level) < currentLevel) ||
      rootType ||
      null
    );
  }, [allTypes, isRootType, currentLevel, rootType]);

  const targetParentLevel = parentTier?.level != null ? Number(parentTier.level) : currentLevel - 1;
  const parentTierName = parentTier?.name || `Level ${targetParentLevel}`;

  // Filter eligible parents strictly for the immediate supervising parent tier (Level - 1)
  const parentOptions: SearchSelectOption[] = useMemo(() => {
    if (isRootType) {
      return [
        {
          value: 0,
          label: 'None (Root Organization)',
          code: 'root',
          badge: 'Root',
          badgeTone: 'sage',
          secondary: `${selectedType?.name || 'Root organizations'} have no parent organization.`,
        },
      ];
    }

    // Combine both direct live API organizations and passed prop organizations
    const rawList: any[] = [];
    const seenIds = new Set<number>();

    const addOrg = (org: any) => {
      if (!org || typeof org !== 'object') return;
      const id = Number(org.id);
      if (!id || seenIds.has(id)) return;
      if (office && (id === Number(office.id) || id === Number(office?.id))) return;
      seenIds.add(id);
      rawList.push(org);
    };

    (apiOrgs?.data || []).forEach(addOrg);
    (propOffices || []).forEach(addOrg);

    const eligible = rawList.filter((org) => {
      const orgLvl = getOrgLevel(org);
      return orgLvl === targetParentLevel;
    });

    if (eligible.length === 0) {
      return [
        {
          value: 0,
          label: `No ${parentTierName} (Level ${targetParentLevel}) parent offices exist yet`,
          code: 'none',
          disabled: true,
          badge: 'Notice',
          badgeTone: 'gray',
          secondary: `A supervising ${parentTierName} office must be created first before a ${selectedType?.name || 'child office'} can be registered.`,
        },
      ];
    }

    return eligible.map((org) => {
      const orgType = org.type || typeMap.get(Number(org.organization_type_id || org.typeId));
      const orgLevel = getOrgLevel(org);
      const typeName = org.typeName || orgType?.name || parentTierName;
      return {
        value: org.id,
        label: org.name,
        code: org.code,
        badge: typeName,
        badgeTone: orgLevel === 1 ? 'sage' : orgLevel === 2 ? 'blue' : 'gold',
        secondary: org.address ? `${typeName}: ${org.address}` : `${org.code || ''} (${typeName})`,
      };
    });
  }, [propOffices, apiOrgs, isRootType, currentLevel, selectedType, office, typeMap, targetParentLevel, parentTierName]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!office) setCode(slugify(val));
  };

  const handleTypeSelect = (val: string | number | null) => {
    const nextTypeId = Number(val);
    setTypeId(nextTypeId);
    setErrorMsg(null);
    const targetType = typeMap.get(nextTypeId);
    const targetIsRoot = targetType ? Boolean(targetType.can_be_root || Number(targetType.level) === 1) : false;
    if (targetIsRoot) {
      setParentId(null);
    } else if (parentId) {
      const currentParentOrg = (propOffices?.length ? propOffices : apiOrgs?.data || []).find(
        (o: any) => o.id === parentId
      );
      const parentLevel = currentParentOrg ? getOrgLevel(currentParentOrg) : 1;
      const expectedParentLevel = (targetType?.level ? Number(targetType.level) : 2) - 1;
      if (parentLevel !== expectedParentLevel) {
        setParentId(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setErrorMsg('Office name is required.');
    const cleanCode = code.toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-').replace(/(^-+|-+$)/g, '');
    if (!cleanCode) return setErrorMsg('Office code identifier is required.');
    if (!isRootType && (!parentId || Number(parentId) <= 0)) {
      return setErrorMsg(
        `A ${selectedType?.name || 'child office'} must have a parent ${parentTierName || 'organization'} selected.`
      );
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

            {/* Parent Organization SearchSelect */}
            <div className="modal-field full">
              <SearchSelect
                label={`Governing Parent ${isRootType ? '(Not required - Root Level)' : 'Organization'}`}
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
                    ? `None (${selectedType?.name || 'Tier'} is a Root Organization)`
                    : parentOptions.some((o) => !o.disabled && o.value !== 0)
                      ? `Select governing ${parentTierName} parent office for this ${selectedType?.name || 'unit'}...`
                      : `No ${parentTierName} (Level ${targetParentLevel}) parent offices exist yet`
                }
                helperText={
                  isRootType
                    ? `${selectedType?.name || 'Root organizations'} have the highest administrative authority and have no parent.`
                    : parentOptions.some((o) => !o.disabled && o.value !== 0)
                      ? `Select an office of ${parentTierName} authority that supervises this ${selectedType?.name || 'office'}.`
                      : `A ${parentTierName} (Level ${targetParentLevel}) office must be created first before a ${selectedType?.name || 'child office'} can be registered.`
                }
              />
              {!isRootType && !parentOptions.some((o) => !o.disabled && o.value !== 0) && (
                <div
                  style={{
                    marginTop: '6px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: '#fffbeb',
                    border: '1px solid #fef3c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                  }}
                >
                  <span style={{ fontSize: '12px', color: '#92400e', lineHeight: 1.4 }}>
                    No {parentTierName} (Level {targetParentLevel}) parent offices exist yet. Please register a {parentTierName} office first.
                  </span>
                  {parentTier && (
                    <button
                      type="button"
                      onClick={() => handleTypeSelect(parentTier.id)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        background: '#164a54',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Create {parentTier.name} first
                    </button>
                  )}
                </div>
              )}
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
