import React, { useMemo, useState } from 'react';
import { usePortal } from '../shared';
import { Icon } from '../shared';
import { PageHeading } from '../shared';
import { useLanguage, getLocalizedText } from '../shared/i18n';
import type { BureauProfile } from '../../types/portal.types';
import { useUpdateOrganizationMutation } from './api/organizationsApi';

export interface OfficePageProps {
  profile?: BureauProfile;
  onEdit?: () => void;
}

export const OfficePage: React.FC<OfficePageProps> = ({
  profile: propProfile,
  onEdit: propOnEdit,
}) => {
  const { language, t } = useLanguage();
  const portal = usePortal();
  const user = portal.session?.user;
  const org = user?.organization;
  const [updateOrgTrigger] = useUpdateOrganizationMutation();

  const orgName = getLocalizedText(org?.name, language) || (typeof org?.name === 'string' ? org.name : t('office.defaultBureau', 'Public Service Bureau'));
  const orgAddress = getLocalizedText((org as any)?.address, language) || (typeof (org as any)?.address === 'string' ? (org as any).address : t('office.defaultLocation', 'Addis Ababa City Administration'));
  const adminName = getLocalizedText(user?.name, language) || (typeof user?.name === 'string' ? user.name : t('office.defaultAdmin', 'Bureau Administrator'));

  const defaultProfile: BureauProfile = useMemo(
    () => ({
      bureau: orgName,
      hours: t('office.defaultHours', 'Monday – Friday · 8:30 AM – 5:30 PM'),
      location: orgAddress,
      admin: adminName,
      contact: (org as any)?.phone || user?.phone || user?.email || '+251 11 000 0000',
    }),
    [orgName, orgAddress, adminName, org, user, t]
  );

  const [localProfile, setLocalProfile] = useState<BureauProfile | null>(null);
  const data = propProfile || localProfile || defaultProfile;

  const onEdit =
    propOnEdit ||
    (() => {
      portal.setModal({
        kind: 'form',
        eyebrow: t('office.eyebrow', 'BUREAU SETTINGS'),
        title: t('office.title', 'Office profile'),
        description: t('office.subtitle', 'Keep your bureau details clear and consistent for the citizens you serve.'),
        submit: t('common.save', 'Save'),
        fields: [
          { name: 'bureau', label: t('office.defaultBureau', 'Bureau name'), required: true, value: getLocalizedText(data.bureau, language) || (typeof data.bureau === 'string' ? data.bureau : '') },
          { name: 'hours', label: t('office.serviceHours', 'Public service hours'), required: true, value: getLocalizedText(data.hours, language) || (typeof data.hours === 'string' ? data.hours : '') },
          { name: 'location', label: t('office.location', 'Office location'), required: true, value: getLocalizedText(data.location, language) || (typeof data.location === 'string' ? data.location : '') },
          { name: 'admin', label: t('office.administrator', 'Bureau administrator'), required: true, value: getLocalizedText(data.admin, language) || (typeof data.admin === 'string' ? data.admin : '') },
          { name: 'contact', label: t('office.publicContact', 'Public contact phone'), required: true, value: getLocalizedText(data.contact, language) || (typeof data.contact === 'string' ? data.contact : '') },
        ],
        onSubmit: async (v: any) => {
          setLocalProfile((prev) => ({ ...(prev || defaultProfile), ...v }));
          if (org?.id) {
            try {
              await updateOrgTrigger({
                id: org.id,
                name: v.bureau,
                address: v.location,
                phone: v.contact,
              }).unwrap();
            } catch (err) {
              console.warn('API error updating organization profile:', err);
            }
          }
        },
      });
    });

  const displayBureau = getLocalizedText(data.bureau, language) || (typeof data.bureau === 'string' ? data.bureau : '');
  const displayHours = getLocalizedText(data.hours, language) || (typeof data.hours === 'string' ? data.hours : '');
  const displayLocation = getLocalizedText(data.location, language) || (typeof data.location === 'string' ? data.location : '');
  const displayAdmin = getLocalizedText(data.admin, language) || (typeof data.admin === 'string' ? data.admin : '');
  const displayContact = getLocalizedText(data.contact, language) || (typeof data.contact === 'string' ? data.contact : '');

  return (
    <>
      <PageHeading
        eyebrow={t('office.eyebrow', 'BUREAU SETTINGS')}
        title={t('office.title', 'Office profile')}
        subtitle={t('office.subtitle', 'Keep your bureau details clear and consistent for the citizens you serve.')}
        action={t('office.editProfile', 'Edit profile')}
        onAction={onEdit}
      />
      <section className="panel office-profile-card">
        <div className="office-profile-banner">
          <span className="office-emblem">
            <Icon name="building" size={28} />
          </span>
          <span className="office-status">
            <i /> {t('office.activeBureau', 'ACTIVE BUREAU')}
          </span>
        </div>
        <div className="office-profile-body">
          <div>
            <span className="panel-eyebrow">
              {orgName.toUpperCase()} · {t('office.publicOffice', 'PUBLIC OFFICE')}
            </span>
            <h2>{displayBureau}</h2>
            <p>{t('office.supportDesc', 'Support for public citizen services, verification, and administrative clearance.')}</p>
          </div>
          <div className="office-detail-grid">
            <div>
              <small>{t('office.serviceHours', 'PUBLIC SERVICE HOURS')}</small>
              <b>{displayHours}</b>
            </div>
            <div>
              <small>{t('office.location', 'LOCATION')}</small>
              <b>{displayLocation}</b>
            </div>
            <div>
              <small>{t('office.administrator', 'BUREAU ADMINISTRATOR')}</small>
              <b>{displayAdmin}</b>
            </div>
            <div>
              <small>{t('office.publicContact', 'PUBLIC CONTACT')}</small>
              <b>{displayContact}</b>
            </div>
          </div>
          <div className="office-profile-note">
            <Icon name="shield" size={16} /> {t('office.reviewNote', 'Public profile changes should be reviewed by your sub-city administrator before publishing.')}
          </div>
        </div>
      </section>
    </>
  );
};

export default OfficePage;
