import React, { useMemo, useState } from 'react';
import { usePortal } from '../context';
import { Icon } from '../components/shared/Icon';
import { PageHeading } from '../components/shared/PageHeading';
import type { BureauProfile } from '../types/portal.types';
import { useUpdateOrganizationMutation } from '../services/organizationsApi';

export interface OfficePageProps {
  profile?: BureauProfile;
  onEdit?: () => void;
}

export const OfficePage: React.FC<OfficePageProps> = ({
  profile: propProfile,
  onEdit: propOnEdit,
}) => {
  const portal = usePortal();
  const user = portal.session?.user;
  const org = user?.organization;
  const [updateOrgTrigger] = useUpdateOrganizationMutation();

  const defaultProfile: BureauProfile = useMemo(
    () => ({
      bureau: org?.name || 'Public Service Bureau',
      hours: 'Monday – Friday · 8:30 AM – 5:30 PM',
      location: (org as any)?.address || 'Addis Ababa City Administration',
      admin: user?.name || 'Bureau Administrator',
      contact: (org as any)?.phone || user?.phone || user?.email || '+251 11 000 0000',
    }),
    [user, org]
  );

  const [localProfile, setLocalProfile] = useState<BureauProfile | null>(null);
  const data = propProfile || localProfile || defaultProfile;

  const onEdit =
    propOnEdit ||
    (() => {
      portal.setModal({
        kind: 'form',
        eyebrow: 'BUREAU SETTINGS',
        title: 'Edit office profile',
        description: 'Update public service hours, physical location, and contact information.',
        submit: 'Save profile',
        fields: [
          { name: 'bureau', label: 'Bureau name', required: true, value: data.bureau },
          { name: 'hours', label: 'Public service hours', required: true, value: data.hours },
          { name: 'location', label: 'Office location', required: true, value: data.location },
          { name: 'admin', label: 'Bureau administrator', required: true, value: data.admin },
          { name: 'contact', label: 'Public contact phone', required: true, value: data.contact },
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

  return (
    <>
      <PageHeading
        eyebrow="BUREAU SETTINGS"
        title="Office profile"
        subtitle="Keep your bureau details clear and consistent for the citizens you serve."
        action="Edit profile"
        onAction={onEdit}
      />
      <section className="panel office-profile-card">
        <div className="office-profile-banner">
          <span className="office-emblem">
            <Icon name="building" size={28} />
          </span>
          <span className="office-status">
            <i /> ACTIVE BUREAU
          </span>
        </div>
        <div className="office-profile-body">
          <div>
            <span className="panel-eyebrow">
              {(org?.name || 'PUBLIC SERVICE BUREAU').toUpperCase()} · PUBLIC OFFICE
            </span>
            <h2>{data.bureau}</h2>
            <p>Support for public citizen services, verification, and administrative clearance.</p>
          </div>
          <div className="office-detail-grid">
            <div>
              <small>PUBLIC SERVICE HOURS</small>
              <b>{data.hours}</b>
            </div>
            <div>
              <small>LOCATION</small>
              <b>{data.location}</b>
            </div>
            <div>
              <small>BUREAU ADMINISTRATOR</small>
              <b>{data.admin}</b>
            </div>
            <div>
              <small>PUBLIC CONTACT</small>
              <b>{data.contact}</b>
            </div>
          </div>
          <div className="office-profile-note">
            <Icon name="shield" size={16} /> Public profile changes should be reviewed by your sub-city administrator before publishing.
          </div>
        </div>
      </section>
    </>
  );
};

export default OfficePage;
