import React, { useMemo, useState } from 'react';
import {
  FileText,
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Download,
  Link2,
} from 'lucide-react';
import { usePermissions } from '../shared/hooks/usePermissions';
import { useLanguage, getLocalizedText } from '../shared/i18n';
import { DocumentModal } from './components/DocumentModal';
import { DocumentMetrics } from './components/DocumentMetrics';
import {
  useGetDocumentsQuery,
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
  type DocumentItem,
} from './api/documentsApi';

export const DocumentsPage: React.FC = () => {
  const { language, t } = useLanguage();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const canManage = isSuperAdmin || hasPermission('documents.manage') || hasPermission('documents.view');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [usageFilter, setUsageFilter] = useState<'all' | 'linked' | 'unlinked'>('all');

  const { data: response, isLoading, refetch } = useGetDocumentsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [createDoc, { isLoading: isCreating }] = useCreateDocumentMutation();
  const [updateDoc, { isLoading: isUpdating }] = useUpdateDocumentMutation();
  const [deleteDoc, { isLoading: isDeleting }] = useDeleteDocumentMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  const documents: DocumentItem[] = useMemo(() => {
    return response?.data || [];
  }, [response]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const q = search.trim().toLowerCase();
      const localizedName = (getLocalizedText(doc.name, language) || '').toLowerCase();
      const localizedDesc = (getLocalizedText(doc.description, language) || '').toLowerCase();
      const code = (doc.code || '').toLowerCase();

      const matchSearch =
        q === '' ||
        localizedName.includes(q) ||
        code.includes(q) ||
        localizedDesc.includes(q);

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' ? doc.is_active : !doc.is_active);

      const count = doc.services_count ?? 0;
      const matchUsage =
        usageFilter === 'all' ||
        (usageFilter === 'linked' ? count > 0 : count === 0);

      return matchSearch && matchStatus && matchUsage;
    });
  }, [documents, search, statusFilter, usageFilter, language]);

  const activeCount = documents.filter((d) => d.is_active).length;
  const linkedDocsCount = documents.filter((d) => (d.services_count ?? 0) > 0).length;
  const totalServiceLinks = documents.reduce((sum, d) => sum + (d.services_count ?? 0), 0);

  const handleOpenAdd = () => {
    setSelectedDoc(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (doc: DocumentItem) => {
    setSelectedDoc(doc);
    setIsModalOpen(true);
  };

  const handleSave = async (payload: {
    id?: number;
    name: string;
    name_amh?: string;
    name_oro?: string;
    code: string;
    description?: string;
    description_amh?: string;
    description_oro?: string;
    sample_file_url?: string;
    is_active: boolean;
  }) => {
    try {
      if (payload.id) {
        await updateDoc(payload as any).unwrap();
      } else {
        await createDoc(payload).unwrap();
      }
      await refetch();
      setIsModalOpen(false);
      setSelectedDoc(null);
    } catch (err: any) {
      window.alert(err?.data?.message || 'Failed to save document standard.');
    }
  };

  const handleToggleStatus = async (doc: DocumentItem) => {
    try {
      await updateDoc({
        id: doc.id,
        is_active: !doc.is_active,
      } as any).unwrap();
      await refetch();
    } catch (err: any) {
      window.alert(err?.data?.message || 'Failed to update document status.');
    }
  };

  const handleDelete = async (doc: DocumentItem) => {
    const title = getLocalizedText(doc.name, language) || doc.code;
    if (window.confirm(`Are you sure you want to delete document "${title}"?`)) {
      try {
        await deleteDoc(doc.id).unwrap();
        await refetch();
      } catch (err: any) {
        window.alert(err?.data?.message || 'Failed to delete document.');
      }
    }
  };

  const handleExportDocuments = () => {
    const headers = ['ID', 'Code', 'Name', 'Description', 'Active', 'ServicesCount'];
    const rows = documents.map((d) => [
      d.id,
      `"${d.code || ''}"`,
      `"${getLocalizedText(d.name, language) || ''}"`,
      `"${getLocalizedText(d.description, language) || ''}"`,
      d.is_active ? 'Yes' : 'No',
      d.services_count || 0,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `documents_catalog_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div className="page-heading !mb-8 sm:!mb-9">
        <div>
          <div className="eyebrow">
            <span />
            {t('documents.eyebrow')}
          </div>
          <h1>{t('documents.title')}</h1>
          <p>{t('documents.subtitle')}</p>
        </div>

        <div className="heading-actions">
          <button
            type="button"
            onClick={handleExportDocuments}
            className="button secondary"
            title="Export document checklist to CSV"
          >
            <Download size={15} />
            <span>{t('common.export', 'Export checklist')}</span>
          </button>

          {canManage && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="primary-button"
            >
              <Plus size={16} />
              <span>{t('documents.addDocument')}</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <DocumentMetrics
        isLoading={isLoading}
        totalCount={documents.length}
        activeCount={activeCount}
        linkedDocsCount={linkedDocsCount}
        totalServiceLinks={totalServiceLinks}
      />

      {/* Main Catalog Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        {/* Toolbar Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                {t('documents.catalogTitle', 'Document Catalog')}
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">
                {filteredDocuments.length} {t('common.of', 'of')} {documents.length}
              </span>
            </div>

            {/* Usage Filter Pills */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-medium">{t('documents.linkage', 'Linkage:')}</span>
              {(['all', 'linked', 'unlinked'] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUsageFilter(u)}
                  className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition-all ${
                    usageFilter === u
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {u === 'all'
                    ? t('common.all', 'All')
                    : u === 'linked'
                    ? t('documents.linkedOnly', 'Linked')
                    : t('documents.unlinkedOnly', 'Unlinked')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('documents.searchPlaceholder', 'Search document name, code, description...')}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#064552] transition-all"
              />
            </div>

            {/* Status Tabs */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/70 text-xs font-semibold self-end sm:self-auto">
              {(['all', 'active', 'inactive'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                    statusFilter === status
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {status === 'all'
                    ? t('documents.allStatuses', 'All statuses')
                    : status === 'active'
                    ? t('common.active', 'Active')
                    : t('common.inactive', 'Inactive')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content List */}
        <div className="p-4 sm:p-5">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              {t('common.loading', 'Loading document catalog...')}
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="py-16 text-center max-w-sm mx-auto">
              <FileText size={36} className="mx-auto text-slate-300 mb-2" />
              <h3 className="text-sm font-bold text-slate-700">{t('documents.emptyNotice', 'No documents found')}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {search
                  ? `No documents match your search "${search}".`
                  : t('documents.emptyNoticeDesc', 'Start cataloging required citizen application documents.')}
              </p>
              {canManage && !search && (
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#064552] text-white hover:bg-[#085a6a]"
                >
                  <Plus size={14} />
                  <span>{t('documents.addFirstDoc', 'Add first document')}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocuments.map((doc) => {
                const title = getLocalizedText(doc.name, language) || 'Untitled Document';
                const description = getLocalizedText(doc.description, language) || '';
                const servicesCount = doc.services_count ?? 0;

                return (
                  <div
                    key={doc.id}
                    className="border border-slate-200/80 rounded-xl p-4 bg-white hover:border-slate-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#064552] flex-shrink-0 mt-0.5">
                        <FileText size={20} className="stroke-[2.2]" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-mono text-[10px] font-semibold tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {doc.code}
                          </span>

                          <span
                            className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                              doc.is_active
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {doc.is_active ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                          </span>

                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                            <Link2 size={11} />
                            <span>
                              {servicesCount} {t('documents.servicesLinked', 'services linked')}
                            </span>
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 leading-snug tracking-tight">
                          {title}
                        </h3>

                        {description && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 flex-shrink-0">
                      {doc.sample_file_url && (
                        <a
                          href={doc.sample_file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                          title="Download sample template"
                        >
                          <Download size={13} />
                          <span>Sample</span>
                        </a>
                      )}

                      {canManage && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(doc)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-[#064552] hover:text-white transition-colors"
                          >
                            <Pencil size={13} />
                            <span>{t('common.edit', 'Edit')}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(doc)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              doc.is_active
                                ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={doc.is_active ? 'Deactivate document' : 'Activate document'}
                          >
                            {doc.is_active ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(doc)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete document"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <DocumentModal
          isOpen={isModalOpen}
          document={selectedDoc}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDoc(null);
          }}
          onSave={handleSave}
          isLoading={isCreating || isUpdating}
        />
      )}
    </div>
  );
};

export default DocumentsPage;
