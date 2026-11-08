import React, { useMemo, useState } from 'react';
import { usePortal } from '../context';
import { usePermissions } from '../hooks/usePermissions';
import { Icon } from '../components/shared/Icon';
import { PageHeading } from '../components/shared/PageHeading';
import { StatusPill } from '../components/shared/StatusPill';
import { MetricCard } from '../components/shared/MetricCard';
import { SearchBox } from '../components/shared/SearchBox';
import {
  useGetQrCodesQuery,
  useDeleteQrCodeMutation,
  type QrCodeItem,
} from '../services/qrCodesApi';
import { useGetOrganizationsQuery } from '../services/organizationsApi';

export interface QRPageProps {
  onGenerate?: () => void;
  onCopy?: () => void;
}

export const QRPage: React.FC<QRPageProps> = ({
  onGenerate: propOnGenerate,
  onCopy: propOnCopy,
}) => {
  const portal = usePortal();
  const { hasPermission } = usePermissions();
  const canManageQrCodes = hasPermission('qr_codes.manage');

  const [copied, setCopied] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [officeFilter, setOfficeFilter] = useState('All offices');
  const [statusFilter, setStatusFilter] = useState('All statuses');

  const { data: apiQrResponse, isLoading } = useGetQrCodesQuery();
  const { data: orgsResponse } = useGetOrganizationsQuery({ per_page: 100 });
  const [deleteQrTrigger] = useDeleteQrCodeMutation();

  const qrList: QrCodeItem[] = useMemo(() => {
    if (!apiQrResponse?.data) return [];
    if (Array.isArray(apiQrResponse.data)) return apiQrResponse.data;
    if (Array.isArray((apiQrResponse.data as any).data)) return (apiQrResponse.data as any).data;
    return [];
  }, [apiQrResponse]);

  const organizations = useMemo(() => {
    if (!orgsResponse?.data) return [];
    if (Array.isArray(orgsResponse.data)) return orgsResponse.data;
    if (Array.isArray((orgsResponse.data as any).data)) return (orgsResponse.data as any).data;
    return [];
  }, [orgsResponse]);

  // Filtered list based on search, office, and status filters
  const filtered = useMemo(() => {
    return qrList.filter((qr) => {
      const matchesSearch = `${qr.label} ${qr.code} ${qr.organization?.name || ''} ${qr.target_url}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesOffice =
        officeFilter === 'All offices' ||
        (qr.organization?.name && qr.organization.name === officeFilter) ||
        (qr.organization?.code && qr.organization.code === officeFilter);

      const matchesStatus =
        statusFilter === 'All statuses' ||
        (statusFilter === 'Active' ? qr.status === 'active' : qr.status !== 'active');

      return matchesSearch && matchesOffice && matchesStatus;
    });
  }, [qrList, search, officeFilter, statusFilter]);

  const activeQr = useMemo(() => {
    if (selectedId) {
      const match = qrList.find((q) => q.id === selectedId);
      if (match) return match;
    }
    return filtered[0] || qrList[0] || null;
  }, [filtered, qrList, selectedId]);

  const targetUrl = activeQr?.target_url || `${window.location.origin}/#feedback`;

  // Metrics
  const activeCount = qrList.filter((q) => q.status === 'active').length;
  const totalScans = qrList.reduce((acc, q) => acc + (q.scan_count || 0), 0);
  const bureauCount = new Set(qrList.map((q) => q.organization_id)).size;

  const onGenerate =
    propOnGenerate ||
    (() => {
      portal.setModal({
        kind: 'qr',
        onCreated: (createdQr: QrCodeItem) => {
          if (createdQr?.id) {
            setSelectedId(createdQr.id);
          }
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        },
      });
    });

  const onCopy =
    propOnCopy ||
    (() => {
      void navigator.clipboard?.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });

  const handleDelete = async (e: React.MouseEvent, id: number, code: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete QR poster "${code}"?`)) {
      try {
        await deleteQrTrigger(id).unwrap();
        if (selectedId === id) setSelectedId(null);
      } catch (err) {
        console.warn('Failed to delete QR poster:', err);
      }
    }
  };

  return (
    <>
      <PageHeading
        eyebrow="CITIZEN ACCESS"
        title="Feedback QR codes"
        subtitle="Help citizens open the right feedback form from a physical poster or service desk."
        action={canManageQrCodes ? 'Generate QR code' : undefined}
        onAction={onGenerate}
        secondary="Export list"
        onSecondary={() => window.alert('QR poster access directory exported.')}
      />

      {/* Metrics Grid matching other portal pages */}
      <div className="metric-grid compact-metrics">
        <MetricCard
          icon="qr"
          label="Total posters"
          value={isLoading && !apiQrResponse ? '...' : qrList.length}
          note="Configured citizen touchpoints"
          tone="teal"
        />
        <MetricCard
          icon="check"
          label="Active posters"
          value={isLoading && !apiQrResponse ? '...' : activeCount}
          note="Live scannable display tokens"
          tone="sage"
        />
        <MetricCard
          icon="message"
          label="Citizen scans"
          value={isLoading && !apiQrResponse ? '...' : totalScans}
          note="Total feedback visits recorded"
          trend={totalScans > 0 ? 'Live' : undefined}
          tone="gold"
        />
        <MetricCard
          icon="building"
          label="Connected offices"
          value={isLoading && !apiQrResponse ? '...' : bureauCount}
          note="Jurisdictions with active posters"
          tone="blue"
        />
      </div>

      {isLoading && !apiQrResponse ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '56px 24px',
            gap: '12px',
          }}
        >
          <div className="loading-spinner" />
          <p style={{ margin: 0, color: '#00485a', fontWeight: 600, fontSize: '14px' }}>
            Loading feedback QR posters...
          </p>
          <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>
            Connecting to bureau access points
          </p>
        </div>
      ) : (
        <>
          {/* Configured Posters List Panel matching table-panel on other pages */}
          <section className="panel table-panel">
            <div className="table-toolbar">
              <div>
                <h2>Configured QR posters ({filtered.length})</h2>
                <p>Physical display tokens and scannable citizen touchpoints across jurisdictions.</p>
              </div>
              <div className="toolbar-tools">
                <SearchBox value={search} onChange={setSearch} placeholder="Search posters or codes" />
                <select
                  className="filter-select"
                  value={officeFilter}
                  onChange={(e) => setOfficeFilter(e.target.value)}
                  aria-label="Filter by office"
                >
                  <option>All offices</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.name}>
                      {org.name}
                    </option>
                  ))}
                </select>
                <select
                  className="filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Filter by status"
                >
                  <option>All statuses</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
                {canManageQrCodes && (
                  <button className="button secondary small-button" onClick={onGenerate}>
                    <Icon name="plus" size={14} /> Add poster
                  </button>
                )}
              </div>
            </div>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '220px' }}>CODE & LABEL</th>
                    <th>OFFICE / BUREAU</th>
                    <th>DESTINATION TARGET URL</th>
                    <th style={{ width: '90px' }}>SCANS</th>
                    <th style={{ width: '100px' }}>STATUS</th>
                    <th style={{ width: '140px', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
                        <b>No QR posters found</b>
                        <p style={{ margin: '4px 0 0', fontSize: '12px' }}>
                          {qrList.length === 0
                            ? 'No posters have been generated yet. Click "Generate QR code" above to create one.'
                            : 'No posters match your current search or filters.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((qr) => {
                      const isSelected = activeQr?.id === qr.id;
                      return (
                        <tr
                          key={qr.id}
                          className={`clickable-row ${isSelected ? 'active-row' : ''}`}
                          onClick={() => setSelectedId(qr.id)}
                          style={{
                            background: isSelected ? 'rgba(0, 72, 90, 0.05)' : undefined,
                            cursor: 'pointer',
                          }}
                        >
                          <td>
                            <b style={{ color: '#00485a' }}>{qr.code}</b>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                              {qr.label}
                            </p>
                          </td>
                          <td>
                            <b>{qr.organization?.name || 'Public Bureau'}</b>
                            <small style={{ display: 'block', color: '#94a3b8' }}>
                              {qr.organization?.code || 'bureau'}
                            </small>
                          </td>
                          <td style={{ fontSize: '12px', color: '#475569', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {qr.target_url}
                          </td>
                          <td>
                            <b>{qr.scan_count ?? 0}</b>
                          </td>
                          <td>
                            <StatusPill>{qr.status === 'active' ? 'Active' : 'Inactive'}</StatusPill>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button
                                type="button"
                                className="button secondary small-button"
                                title="Preview and Print"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedId(qr.id);
                                  portal.setModal({ kind: 'qr', qr });
                                }}
                              >
                                <Icon name="download" size={13} />
                              </button>
                              {canManageQrCodes && (
                                <button
                                  type="button"
                                  className="button secondary small-button"
                                  title="Delete poster"
                                  style={{ color: '#dc2626' }}
                                  onClick={(e) => handleDelete(e, qr.id, qr.code)}
                                >
                                  <Icon name="close" size={13} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </>
  );
};

export default QRPage;
