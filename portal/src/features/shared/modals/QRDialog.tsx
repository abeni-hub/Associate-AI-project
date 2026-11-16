import React, { useMemo, useState } from 'react';
import { usePortal } from '../hooks/usePortal';
import { useLanguage } from '../i18n';
import { Icon } from '../components/Icon';
import { QRPattern } from '../components/QRPattern';
import type { QRModalConfig } from '../../../types/portal.types';
import { useCreateQrCodeMutation } from '../../qr-codes/api/qrCodesApi';
import { useGetOrganizationsQuery, type OrganizationItem } from '../../organizations/api/organizationsApi';
import { useGetServicesQuery } from '../../services/api/servicesApi';
import { getClientBaseUrl } from '../../../app/baseApi';

export interface QRDialogProps {
  modal?: QRModalConfig;
  onClose: () => void;
  onGenerate?: () => void;
}

export const QRDialog: React.FC<QRDialogProps> = ({
  modal,
  onClose,
  onGenerate: propOnGenerate,
}) => {
  const { t } = useLanguage();
  const portal = usePortal();
  const existingQr = modal?.qr;
  const userOrg = portal.session?.user?.organization;

  const { data: orgsData } = useGetOrganizationsQuery({ per_page: 100 });
  const [createQrTrigger, { isLoading: isCreating }] = useCreateQrCodeMutation();

  const organizations: OrganizationItem[] = useMemo(() => {
    if (!orgsData?.data) return [];
    if (Array.isArray(orgsData.data)) return orgsData.data;
    if (Array.isArray((orgsData.data as any).data)) return (orgsData.data as any).data;
    return [];
  }, [orgsData]);

  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(userOrg?.id || null);
  const effectiveOrgId = selectedOrgId || organizations[0]?.id || 1;

  const { data: servicesData } = useGetServicesQuery(
    { per_page: 100, organization_id: effectiveOrgId },
    { skip: !effectiveOrgId }
  );

  const activeOrg = useMemo(() => {
    return organizations.find((o) => o.id === effectiveOrgId) || userOrg || null;
  }, [organizations, effectiveOrgId, userOrg]);

  const serviceOptions = useMemo(() => {
    const raw = Array.isArray(servicesData?.data) ? servicesData.data : [];
    return raw.flatMap((service: any) => {
      if (service.subservices && Array.isArray(service.subservices) && service.subservices.length > 0) {
        return service.subservices.map((sub: any) => ({
          id: String(sub.code || sub.id),
          label: sub.name || sub.code || 'Service',
        }));
      }

      return [{
        id: String(service.code || service.id),
        label: service.name || service.code || 'Service',
      }];
    });
  }, [servicesData]);

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const buildDefaultTargetUrl = (org?: OrganizationItem | null, serviceId?: string | null) => {
    const clientBase = getClientBaseUrl();
    if (!org) return `${clientBase}/#feedback?type=complaint`;
    const params = new URLSearchParams({
      type: 'complaint',
      org: org.code || String(org.id),
      bureau: String(org.id),
    });
    const subCityName = org.parent?.name || (org.type?.code === 'sub_city' ? org.name : '');
    if (subCityName) {
      params.set('sub_city', subCityName);
    }
    if (serviceId) {
      params.set('service', serviceId);
    }
    return `${clientBase}/#feedback?${params.toString()}`;
  };

  const [label, setLabel] = useState(existingQr?.label || 'Public Service Reception Desk');
  const [code, setCode] = useState(
    existingQr?.code ||
      `QR-${(activeOrg?.code || userOrg?.code || 'OFFICE').toUpperCase().replace(/[^A-Z0-9]/g, '')}-${Date.now().toString().slice(-4)}`
  );
  const [targetUrl, setTargetUrl] = useState(
    existingQr?.target_url || buildDefaultTargetUrl(activeOrg as any, selectedServiceId)
  );

  const activeService = useMemo(() => {
    if (!serviceOptions.length) return null;
    return serviceOptions.find((service) => service.id === selectedServiceId) || serviceOptions[0];
  }, [selectedServiceId, serviceOptions]);

  const handleServiceChange = (newServiceId: string) => {
    setSelectedServiceId(newServiceId);
    if (activeOrg) {
      setTargetUrl(buildDefaultTargetUrl(activeOrg, newServiceId));
    }
  };

  React.useEffect(() => {
    if (existingQr || !activeOrg) return;
    if (!serviceOptions.length) {
      setSelectedServiceId(null);
      setTargetUrl(buildDefaultTargetUrl(activeOrg, null));
      return;
    }

    const nextServiceId = serviceOptions.some((service) => service.id === selectedServiceId)
      ? selectedServiceId
      : serviceOptions[0].id;

    if (selectedServiceId !== nextServiceId) {
      setSelectedServiceId(nextServiceId);
    }
    setTargetUrl(buildDefaultTargetUrl(activeOrg, nextServiceId));
  }, [activeOrg, existingQr, selectedServiceId, serviceOptions]);
  const [status, setStatus] = useState<'active' | 'inactive'>(
    (existingQr?.status as 'active' | 'inactive') || 'active'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOrgChange = (newOrgId: number) => {
    setSelectedOrgId(newOrgId);
    const org = organizations.find((o) => o.id === newOrgId);
    if (org) {
      const cleanPrefix = (org.code || 'OFFICE').toUpperCase().replace(/[^A-Z0-9]/g, '');
      setCode(`QR-${cleanPrefix}-${Date.now().toString().slice(-4)}`);
      setSelectedServiceId(null);
      setTargetUrl(buildDefaultTargetUrl(org, null));
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanLabel = label.trim();
    const cleanCode = code.trim().toUpperCase().replace(/[^A-Za-z0-9\-]/g, '');
    const cleanUrl = targetUrl.trim();

    if (!effectiveOrgId) {
      setErrorMessage('Please select an organization for this QR poster.');
      return;
    }
    if (!cleanLabel) {
      setErrorMessage('Please enter a descriptive label for the QR poster.');
      return;
    }
    if (!cleanCode) {
      setErrorMessage('Please enter a unique alphanumeric QR code identifier.');
      return;
    }
    if (!cleanUrl || !cleanUrl.startsWith('http')) {
      setErrorMessage('Please enter a valid HTTP/HTTPS destination URL.');
      return;
    }

    try {
      const res = await createQrTrigger({
        organization_id: effectiveOrgId,
        label: cleanLabel,
        code: cleanCode,
        target_url: cleanUrl,
        status,
      }).unwrap();

      if (modal?.onCreated) {
        modal.onCreated(res.data);
      }
      if (propOnGenerate || modal?.onGenerate) {
        (propOnGenerate || modal?.onGenerate)?.();
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(
        err?.data?.message || err?.error || 'Failed to generate QR poster. Ensure the code is unique.'
      );
    }
  };

  // Preview Mode for an existing QR poster (Clean QR Code Only)
  if (existingQr) {
    return (
      <div>
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .qr-printable-area, .qr-printable-area * {
              visibility: visible;
            }
            .qr-printable-area {
              position: fixed;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%);
              width: 320px !important;
              height: 320px !important;
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
            }
          }
        `}</style>
        <div className="modal-header" style={{ justifyContent: 'flex-end', borderBottom: 'none', padding: '12px 16px 0' }}>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <Icon name="close" />
          </button>
        </div>
        <div
          className="qr-dialog-body"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 24px 32px',
          }}
        >
          <div
            className="qr-printable-area"
            style={{
              width: '240px',
              height: '240px',
              background: '#ffffff',
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <QRPattern data={existingQr.target_url} />
          </div>
        </div>
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            className="button secondary"
            onClick={onClose}
          >
            {t('common.close', 'Close')}
          </button>
          <button
            type="button"
            className="button primary"
            onClick={() => {
              window.print();
              onClose();
            }}
          >
            <Icon name="download" size={15} /> {t('qr.printPoster', 'Print poster')}
          </button>
        </div>
      </div>
    );
  }

  // Generate Mode Form
  return (
    <form onSubmit={handleGenerate}>
      <div className="modal-header">
        <div>
          <span className="panel-eyebrow">CITIZEN ACCESS & POSTERS</span>
          <h2>Generate feedback QR poster</h2>
          <p>Create a physical access token linking citizens directly to your service feedback portal.</p>
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

      {errorMessage && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '13px',
          }}
        >
          {errorMessage}
        </div>
      )}

      <div className="modal-form-grid" style={{ marginBottom: '16px' }}>
        <label className="modal-field full">
          <span>
            Assigned Organization / Bureau <i>*</i>
          </span>
          <select
            value={effectiveOrgId}
            onChange={(e) => handleOrgChange(Number(e.target.value))}
            required
          >
            {organizations.length === 0 && (
              <option value={effectiveOrgId}>
                {userOrg?.name || 'Default Administrative Office'}
              </option>
            )}
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name} {org.type?.name ? `(${org.type.name})` : `(${org.code})`}
              </option>
            ))}
          </select>
        </label>

        <label className="modal-field full">
          <span>
            Poster Location / Desk Label <i>*</i>
          </span>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Main Public Service Reception Desk"
            maxLength={150}
            required
          />
        </label>

        {serviceOptions.length > 0 && (
          <label className="modal-field full">
            <span>
              Service linked to this QR poster <i>*</i>
            </span>
            <select
              value={activeService?.id ?? ''}
              onChange={(e) => handleServiceChange(e.target.value)}
              required
            >
              {serviceOptions.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.label}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="modal-field">
          <span>
            Unique QR Code ID <i>*</i>
          </span>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Za-z0-9\-]/g, ''))}
            placeholder="e.g. QR-BOLE-001"
            maxLength={64}
            required
          />
        </label>

        <label className="modal-field">
          <span>Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
          >
            <option value="active">Active (Scannable)</option>
            <option value="inactive">Inactive (Disabled)</option>
          </select>
        </label>

        <label className="modal-field full">
          <span>
            Destination Target URL <i>*</i>
          </span>
          <input
            type="url"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="https://..."
            maxLength={2048}
            required
          />
        </label>
      </div>

      {/* Live Scannable Preview Box */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          background: '#f8fafc',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            width: '100px',
            height: '100px',
            flex: '0 0 auto',
            background: '#fff',
            padding: '6px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
          }}
        >
          <QRPattern data={targetUrl} />
        </div>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#00485a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {activeOrg?.name || 'Selected Office'}
          </span>
          <b style={{ display: 'block', fontSize: '15px', color: '#1e293b', marginTop: '2px' }}>
            {code || 'QR-CODE'}
          </b>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
            {label || 'Desk Poster'} · {targetUrl}
          </p>
        </div>
      </div>

      <div className="modal-footer">
        <span>
          <Icon name="globe" size={14} /> Citizens can scan to submit feedback without login.
        </span>
        <div>
          <button
            type="button"
            className="button secondary"
            onClick={onClose}
            disabled={isCreating}
          >
            {t('common.cancel', 'Cancel')}
          </button>
          <button
            type="submit"
            className="button primary"
            disabled={isCreating}
          >
            {isCreating ? t('qr.generating', 'Generating poster...') : t('qr.generateQr', 'Generate QR code')}{' '}
            <Icon name="arrow" size={15} />
          </button>
        </div>
      </div>
    </form>
  );
};

export default QRDialog;
