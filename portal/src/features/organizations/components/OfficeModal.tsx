import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Icon, SearchSelect, getModalContainer, type SearchSelectOption } from '../../shared';
import type { OfficeType } from '../../../types/portal.types';
import { useLanguage, getLocalizedText } from '../../shared/i18n';
import {
  useGetOrganizationsQuery,
  useGetOrganizationTypesQuery,
} from '../api/organizationsApi';

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
  const { language, t } = useLanguage();
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
  const [logo, setLogo] = useState<File | null>(null);
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
      const initialName = typeof office?.name === 'string' ? office.name : getLocalizedText(office?.name, language);
      const initialAddress = typeof office?.address === 'string' ? office.address : getLocalizedText(office?.address, language);
      const initialDesc = typeof office?.description === 'string' ? office.description : getLocalizedText(office?.description, language);
      setName(initialName);
      setCode(office?.code || (initialName ? slugify(initialName) : ''));
      const initialType = Number(
        office?.organization_type_id ||
          office?.typeId ||
          rootType?.id ||
          (allTypes[0]?.id ?? 0)
      );
      setTypeId(initialType);
      setParentId(office?.parent_organization_id ?? office?.parentId ?? null);
      setAddress(initialAddress);
      setPhone(office?.phone || '');
      setEmail(office?.email || '');
      setDescription(initialDesc);
      setStatus(office?.status?.toLowerCase() === 'inactive' ? 'inactive' : 'active');
      setLogo(null);
      setErrorMsg(null);
    }
  }, [isOpen, office, allTypes, rootType, language]);

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
    return allTypes.map((tType: any) => ({
      value: tType.id,
      label: typeof tType.name === 'string' ? tType.name : getLocalizedText(tType.name, language) || tType.code || 'Tier',
      code: tType.code,
      badge: `${t('levels.levelWord', 'Level')} ${tType.level ?? 1}`,
      badgeTone: tType.level === 1 ? 'sage' : tType.level === 2 ? 'blue' : 'gold',
      secondary: (typeof tType.description === 'string' ? tType.description : getLocalizedText(tType.description, language)) || (tType.can_be_root || tType.level === 1 ? 'Root platform tier' : 'Requires parent organization'),
    }));
  }, [allTypes, language, t]);

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
    const orgTypeNameStr = typeof org.typeName === 'string' ? org.typeName : getLocalizedText(org.typeName || org.type?.name, 'en') || org.typeCode || org.type?.code || '';
    const typeName = orgTypeNameStr.toLowerCase();
    for (const t of allTypes) {
      const tNameStr = typeof t.name === 'string' ? t.name : getLocalizedText(t.name, 'en') || '';
      if (tNameStr.toLowerCase() === typeName || (t.code && t.code.toLowerCase() === typeName)) {
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
  const parentTierName = (typeof parentTier?.name === 'string' ? parentTier.name : getLocalizedText(parentTier?.name, language)) || `Level ${targetParentLevel}`;
  const selTypeName = (typeof selectedType?.name === 'string' ? selectedType.name : getLocalizedText(selectedType?.name, language)) || 'unit';

  // Filter eligible parents strictly for the immediate supervising parent tier (Level - 1)
  const parentOptions: SearchSelectOption[] = useMemo(() => {
    if (isRootType) {
      return [
        {
          value: 0,
          label: t('offices.noneRoot', 'None (Root Organization)'),
          code: 'root',
          badge: 'Root',
          badgeTone: 'sage',
          secondary: t('offices.rootNoParentDesc', 'Root organizations have no parent organization.'),
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
      const selTypeName = typeof selectedType?.name === 'string' ? selectedType.name : getLocalizedText(selectedType?.name, language) || 'child office';
      return [
        {
          value: 0,
          label: `No ${parentTierName} (Level ${targetParentLevel}) parent offices exist yet`,
          code: 'none',
          disabled: true,
          badge: 'Notice',
          badgeTone: 'gray',
          secondary: `A supervising ${parentTierName} office must be created first before a ${selTypeName} can be registered.`,
        },
      ];
    }

    return eligible.map((org) => {
      const orgType = org.type || typeMap.get(Number(org.organization_type_id || org.typeId));
      const orgLevel = getOrgLevel(org);
      const typeName = typeof org.typeName === 'string' ? org.typeName : getLocalizedText(org.typeName || orgType?.name, language) || parentTierName;
      const orgName = typeof org.name === 'string' ? org.name : getLocalizedText(org.name, language) || 'Office';
      const orgAddress = typeof org.address === 'string' ? org.address : getLocalizedText(org.address, language) || '';
      return {
        value: org.id,
        label: orgName,
        code: org.code,
        badge: typeName,
        badgeTone: orgLevel === 1 ? 'sage' : orgLevel === 2 ? 'blue' : 'gold',
        secondary: orgAddress ? `${typeName}: ${orgAddress}` : `${org.code || ''} (${typeName})`,
      };
    });
  }, [propOffices, apiOrgs, isRootType, currentLevel, selectedType, office, typeMap, targetParentLevel, parentTierName, language, t]);

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
    if (!name.trim()) return setErrorMsg(t('offices.nameRequired', 'Office name is required.'));
    if (!office?.id && !logo) return setErrorMsg(t('offices.logoRequired', 'Office logo image is required.'));
    const cleanCode = code.toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-').replace(/(^-+|-+$)/g, '');
    if (!cleanCode) return setErrorMsg(t('offices.codeRequired', 'Office code identifier is required.'));
    if (!isRootType && (!parentId || Number(parentId) <= 0)) {
      return setErrorMsg(t('offices.parentRequired', 'A child office must have a parent organization selected.'));
    }
    const cleanEmail = email.trim();
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return setErrorMsg(t('offices.emailInvalid', 'Please enter a valid email address (e.g., info@office.gov.et).'));
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
      ...(logo ? { logo } : {}),
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
        aria-label={office ? t('offices.editOffice', 'Edit administrative office') : t('offices.createOffice', 'Create new administrative office')}
        style={{ maxWidth: '640px', width: '92%' }}
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <div>
              <span className="panel-eyebrow">{t('offices.modalEyebrow', 'ORGANIZATION DIRECTORY')}</span>
              <h2>{office ? t('offices.editOffice', 'Edit administrative office') : t('offices.createOffice', 'Create new administrative office')}</h2>
              <p>{t('offices.modalSubtitle', 'Configure office details, hierarchy tier, and contact information.')}</p>
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
              <span>{t('offices.officeName', 'Office name')} <i>*</i></span>
              <input
                required
                placeholder={t('offices.officeNamePlaceholder', 'e.g. Bole Sub-City Administration or Revenues Bureau')}
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </label>

            {/* Logo */}
            {!office && (
              <label className="modal-field full">
                <span>{t('offices.officeLogo', 'Office logo')} <i>*</i></span>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setLogo(e.target.files?.[0] || null)}
                />
              </label>
            )}

            {/* Unique code slug — auto-generated from name */}
            <input type="hidden" value={code} readOnly />

            {/* Type */}
            <div className="modal-field full">
              <SearchSelect
                label={t('offices.classificationTier', 'Classification Tier')}
                required
                value={typeId}
                onChange={handleTypeSelect}
                options={classificationOptions}
                placeholder={t('offices.selectTierPlaceholder', 'Select tier...')}
              />
            </div>

            {/* Parent Organization SearchSelect */}
            <div className="modal-field full">
              <SearchSelect
                label={`${t('offices.governingParent', 'Governing Parent')} ${isRootType ? t('offices.notRequiredRoot', '(Not required - Root Level)') : t('offices.organization', 'Organization')}`}
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
                    ? `None (${selTypeName} is a Root Organization)`
                    : parentOptions.some((o) => !o.disabled && o.value !== 0)
                      ? `Select governing ${parentTierName} parent office for this ${selTypeName}...`
                      : `No ${parentTierName} (Level ${targetParentLevel}) parent offices exist yet`
                }
                helperText={
                  isRootType
                    ? `${selTypeName} has the highest administrative authority and has no parent.`
                    : parentOptions.some((o) => !o.disabled && o.value !== 0)
                      ? `Select an office of ${parentTierName} authority that supervises this ${selTypeName}.`
                      : `A ${parentTierName} (Level ${targetParentLevel}) office must be created first before a ${selTypeName} can be registered.`
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
                      Create {parentTierName} first
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Address */}
            <label className="modal-field">
              <span>{t('offices.physicalAddress', 'Physical address / location')}</span>
              <input
                placeholder={t('offices.addressPlaceholder', 'e.g. Bole Road, Building B, Floor 2')}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </label>

            {/* Status */}
            <label className="modal-field">
              <span>{t('common.status', 'Status')}</span>
              <select value={status} onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}>
                <option value="active">{t('common.active', 'Active')}</option>
                <option value="inactive">{t('common.inactive', 'Inactive')}</option>
              </select>
            </label>

            {/* Phone */}
            <label className="modal-field">
              <span>{t('offices.phone', 'Official phone number')}</span>
              <input
                type="tel"
                placeholder="+251 11 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>

            {/* Email */}
            <label className="modal-field">
              <span>{t('offices.email', 'Official contact email')}</span>
              <input
                type="email"
                placeholder="contact@office.gov.et"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            {/* Description */}
            <label className="modal-field full">
              <span>{t('offices.descriptionLabel', 'Description / office mandate')}</span>
              <textarea
                rows={2}
                placeholder={t('offices.descriptionPlaceholder', 'Brief summary of office mission and public services...')}
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
                {t('common.cancel', 'Cancel')}
              </button>
              <button type="submit" className="button primary" disabled={isLoading}>
                {isLoading ? t('common.saving', 'Saving...') : (office ? t('common.saveChanges', 'Save changes') : t('offices.addOffice', 'Create office'))} <Icon name="arrow" size={15} />
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>,
    getModalContainer()
  );
};

export default OfficeModal;
