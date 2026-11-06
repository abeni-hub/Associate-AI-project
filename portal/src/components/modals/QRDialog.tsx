import React, { useState } from 'react';
import { usePortal } from '../../context';
import { Icon } from '../shared/Icon';
import { StatusPill } from '../shared/StatusPill';
import { QRPattern } from '../shared/QRPattern';
import type { QRModalConfig } from '../../types/portal.types';
import { useCreateQrCodeMutation } from '../../services/qrCodesApi';
import { useGetOrganizationsQuery } from '../../services/organizationsApi';

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
  const portal = usePortal();
  const existingQr = modal?.qr;
  const userOrg = portal.session?.user?.organization;

  const { data: orgsData } = useGetOrganizationsQuery();
  const [createQrTrigger, { isLoading: isCreating }] = useCreateQrCodeMutation();

  const organizations = orgsData?.data || [];
  const defaultOrgId = userOrg?.id || (organizations[0]?.id ?? 2);

  const [orgId, setOrgId] = useState<number>(defaultOrgId);
  const [label, setLabel] = useState(existingQr?.label || 'Public Service Reception Desk');
  const [code, setCode] = useState(
    existingQr?.code ||
      `QR-${(userOrg?.code || 'BUREAU').toUpperCase().replace(/[^A-Z0-9]/g, '')}-${Date.now().toString().slice(-4)}`
  );
  const [targetUrl, setTargetUrl] = useState(
    existingQr?.target_url || `${window.location.origin}/#feedback`
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!label.trim()) {
      setErrorMessage('Please enter a descriptive label for the QR poster.');
      return;
    }
    if (!code.trim()) {
      setErrorMessage('Please enter a unique QR code identifier.');
      return;
    }
    if (!targetUrl.trim() || !targetUrl.startsWith('http')) {
      setErrorMessage('Please enter a valid HTTP/HTTPS destination URL.');
      return;
    }

    try {
      const res = await createQrTrigger({
        organization_id: Number(orgId),
        label: label.trim(),
        code: code.trim(),
        target_url: targetUrl.trim(),
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

  // Preview Mode for an existing QR poster
  if (existingQr) {
    return (
      <div>
        <div className="modal-header">
          <div>
            <span className="panel-eyebrow">OFFICE POSTER PREVIEW</span>
            <h2>{existingQr.label}</h2>
            <p>{existingQr.organization?.name || 'Public Service Bureau'}</p>
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
        <div className="qr-dialog-body" style={{ display: 'flex', gap: '24px', alignItems: 'center', padding: '24px 0' }}>
          <div style={{ width: '140px', height: '140px', background: '#fff', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <QRPattern data={existingQr.target_url} />
          </div>
          <div>
            <b style={{ fontSize: '18px', color: '#00485a' }}>{existingQr.code}</b>
            <p style={{ margin: '4px 0 12px', fontSize: '13px', color: '#64748b' }}>
              Target: {existingQr.target_url}
            </p>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <StatusPill>{existingQr.status}</StatusPill>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                {existingQr.scan_count ?? 0} scans recorded
              </span>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <span>
            <Icon name="globe" size={14} /> Scannable from any mobile camera without app installation.
          </span>
          <div>
            <button
              type="button"
              className="button secondary"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="button"
              className="button primary"
              onClick={() => {
                window.print();
                onClose();
              }}
            >
              <Icon name="download" size={15} /> Print poster
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Generate Mode Form
  return (
    <form onSubmit={handleGenerate}>
      <div className="modal-header">
        <div>
          <span className="panel-eyebrow">CITIZEN ENGAGEMENT</span>
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
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
          {errorMessage}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', margin: '20px 0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {organizations.length > 1 && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Assigned Office / Bureau
              </label>
              <select
                className="filter-select"
                style={{ width: '100%', padding: '8px 12px' }}
                value={orgId}
                onChange={(e) => setOrgId(Number(e.target.value))}
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} ({org.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Poster Location / Desk Label *
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Main Public Service Reception Desk"
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Unique QR Code ID *
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. QR-BOLE-001"
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Destination Target URL *
            </label>
            <input
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://..."
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              required
            />
          </div>
        </div>

        {/* Live Scannable Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ width: '130px', height: '130px', background: '#fff', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '12px' }}>
            <QRPattern data={targetUrl} />
          </div>
          <b style={{ fontSize: '13px', color: '#00485a' }}>{code || 'QR-CODE'}</b>
          <small style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
            Live preview of scannable poster
          </small>
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
            Cancel
          </button>
          <button
            type="submit"
            className="button primary"
            disabled={isCreating}
          >
            {isCreating ? 'Generating poster...' : 'Generate QR code'}{' '}
            <Icon name="arrow" size={15} />
          </button>
        </div>
      </div>
    </form>
  );
};

export default QRDialog;
