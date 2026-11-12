import React, { useMemo, useState } from 'react';
import {
  QrCode,
  CheckCircle2,
  ScanLine,
  Building2,
  Search,
  Plus,
  Copy,
  Check,
  Download,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { usePortal } from '../../context';
import { usePermissions } from '../../hooks/usePermissions';
import { useLanguage } from '../../i18n/i18nContext';
import { getLocalizedText } from '../../i18n/utils/getLocalized';
import { QRPattern } from '../../components/shared/QRPattern';
import {
  useGetQrCodesQuery,
  useDeleteQrCodeMutation,
  type QrCodeItem,
} from '../../services/qrCodesApi';
import { useGetOrganizationsQuery } from '../../services/organizationsApi';
import { getClientBaseUrl } from '../../config/apiConfig';

export const QRPage: React.FC = () => {
  const portal = usePortal();
  const { language, t } = useLanguage();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const canManage = isSuperAdmin || hasPermission('qr_codes.manage') || hasPermission('qr_codes.view');

  const [copied, setCopied] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'active' | 'inactive'>('All');

  const { data: apiQrResponse, isLoading, refetch: refetchQrs } = useGetQrCodesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { data: orgsResponse } = useGetOrganizationsQuery({ per_page: 100 });
  const [deleteQrTrigger] = useDeleteQrCodeMutation();

  const qrList: QrCodeItem[] = useMemo(() => {
    if (!apiQrResponse?.data) return [];
    if (Array.isArray(apiQrResponse.data)) return apiQrResponse.data;
    if (Array.isArray((apiQrResponse.data as any).data)) return (apiQrResponse.data as any).data;
    return [];
  }, [apiQrResponse]);

  const filtered = useMemo(() => {
    return qrList.filter((qr) => {
      const q = search.trim().toLowerCase();
      const orgName = (getLocalizedText(qr.organization?.name as any, language) || (typeof qr.organization?.name === 'string' ? qr.organization.name : '')).toLowerCase();
      const matchSearch =
        q === '' ||
        String(qr.label || '').toLowerCase().includes(q) ||
        String(qr.code || '').toLowerCase().includes(q) ||
        orgName.includes(q) ||
        String(qr.target_url || '').toLowerCase().includes(q);

      const matchStatus =
        statusFilter === 'All' ||
        (statusFilter === 'active' ? qr.status === 'active' : qr.status !== 'active');

      return matchSearch && matchStatus;
    });
  }, [qrList, search, statusFilter, language]);

  const activeQr = useMemo(() => {
    if (selectedId) {
      const match = qrList.find((q) => q.id === selectedId);
      if (match) return match;
    }
    return filtered[0] || qrList[0] || null;
  }, [filtered, qrList, selectedId]);

  const targetUrl = activeQr?.target_url || `${getClientBaseUrl()}/#feedback`;

  const activeCount = qrList.filter((q) => q.status === 'active').length;
  const totalScans = qrList.reduce((acc, q) => acc + (q.scan_count || 0), 0);
  const bureauCount = new Set(qrList.map((q) => q.organization_id)).size;

  const handleOpenGenerate = () => {
    portal.setModal({
      kind: 'qr',
      onCreated: (createdQr: QrCodeItem) => {
        if (createdQr?.id) {
          setSelectedId(createdQr.id);
        }
        refetchQrs();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async (qr: QrCodeItem) => {
    if (window.confirm(`Are you sure you want to delete QR deployment "${qr.label}"?`)) {
      try {
        await deleteQrTrigger(qr.id).unwrap();
        refetchQrs();
        if (selectedId === qr.id) {
          setSelectedId(null);
        }
      } catch (err: any) {
        window.alert(err?.data?.message || 'Failed to delete QR code.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span />
            {t('qr.eyebrow')}
          </div>
          <h1>{t('qr.title')}</h1>
          <p>{t('qr.subtitle')}</p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={handleOpenGenerate}
            className="primary-button"
          >
            <Plus size={16} />
            <span>{t('qr.generateQr')}</span>
          </button>
        )}
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#064552]">
            <QrCode size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {qrList.length}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {t('qr.activeQr')}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
            <CheckCircle2 size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {activeCount}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {t('common.active')}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
            <ScanLine size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {totalScans}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {t('qr.totalScans')}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
            <Building2 size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {bureauCount}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {t('qr.deployedBureaus')}
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left List (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">
                {t('qr.deploymentDirectory', 'Deployment Directory')}
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">
                {filtered.length} {t('common.total', 'total')}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('qr.searchPlaceholder', 'Search QR codes by label, code, bureau...')}
                  className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#064552] transition-all"
                />
              </div>

              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/70 text-xs font-semibold self-end sm:self-auto">
                {(['All', 'active', 'inactive'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                      statusFilter === s
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {s === 'All' ? t('common.all', 'All') : s === 'active' ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 flex-1 divide-y divide-slate-100">
            {isLoading ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                {t('common.loading', 'Loading QR deployments...')}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center max-w-sm mx-auto">
                <QrCode size={36} className="mx-auto text-slate-300 mb-2" />
                <h3 className="text-sm font-bold text-slate-700">{t('qr.emptyNotice', 'No QR codes found')}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {t('qr.subtitle', 'Generate dynamic QR codes for physical desks and citizen halls.')}
                </p>
              </div>
            ) : (
              filtered.map((qr) => {
                const isSelected = activeQr?.id === qr.id;
                return (
                  <div
                    key={qr.id}
                    onClick={() => setSelectedId(qr.id)}
                    className={`py-3.5 px-3 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-teal-50/60 border border-teal-200'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#064552] flex-shrink-0 mt-0.5">
                        <QrCode size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <span className="font-mono text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {qr.code}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              qr.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {qr.status === 'active' ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {qr.label}
                        </h4>
                        <div className="text-xs text-slate-500 truncate mt-0.5 flex items-center gap-1">
                          <Building2 size={12} className="text-slate-400 flex-shrink-0" />
                          <span className="truncate">{getLocalizedText(qr.organization?.name as any, language) || (typeof qr.organization?.name === 'string' ? qr.organization.name : 'Municipal Center')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-bold text-slate-800">
                        {qr.scan_count || 0} {t('qr.scans', 'scans')}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {qr.created_at ? new Date(qr.created_at).toLocaleDateString() : t('qr.live', 'Live')}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Preview Card (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl shadow-sm p-5 sm:p-6 flex flex-col justify-between">
          {activeQr ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    {t('qr.activeSelection', 'ACTIVE SELECTION')}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {activeQr.label}
                  </h3>
                </div>

                {canManage && (
                  <button
                    type="button"
                    onClick={() => handleDelete(activeQr)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete QR code"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {/* QR Image Frame */}
              <div className="p-6 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col items-center justify-center">
                {activeQr.image_url ? (
                  <img
                    src={activeQr.image_url}
                    alt={activeQr.label}
                    className="w-48 h-48 rounded-xl bg-white p-2 shadow-sm border border-slate-200 object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 rounded-xl bg-white p-3 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
                    <div className="w-36 h-36 flex items-center justify-center">
                      <QRPattern data={targetUrl} color="#064552" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 mt-1">{activeQr.code}</span>
                  </div>
                )}
                <span className="text-xs text-slate-500 mt-3 font-medium">
                  {t('qr.scanHint', 'Scan with any mobile camera to open citizen service')}
                </span>
              </div>

              {/* Target Link */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">{t('qr.publicScanUrl', 'Target Web Destination')}</label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2 text-xs font-mono text-slate-700">
                  <span className="truncate">{targetUrl}</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-1 text-slate-500 hover:text-[#064552] transition-colors flex-shrink-0"
                    title="Copy URL"
                  >
                    {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Link Copied' : 'Copy citizen link'}</span>
                </button>

                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-[#064552] text-white hover:bg-[#085a6a] transition-colors"
                >
                  <span>Test URL</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400">
              <QrCode size={48} className="mx-auto text-slate-200 mb-2" />
              <p className="text-xs">Select a QR code from the list to preview details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRPage;

