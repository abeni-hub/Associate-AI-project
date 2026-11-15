import React from 'react';
import {
  Folder,
  FileText,
  Building2,
  Clock,
  Coins,
  FileCheck,
  ChevronDown,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Navigation,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useLanguage, getLocalizedText } from '../../shared/i18n';
import type { ServiceListItem } from '../api/servicesApi';

export interface ServiceRowProps {
  service: ServiceListItem;
  isMaster?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onEdit: (service: ServiceListItem) => void;
  onDelete?: (service: ServiceListItem) => void;
  onTogglePublish?: (id: number) => void;
  onAddSubservice?: (master: ServiceListItem) => void;
  onOpenRoute?: (service: ServiceListItem) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export const ServiceRow: React.FC<ServiceRowProps> = ({
  service,
  isMaster = false,
  isExpanded = false,
  onToggleExpand,
  onEdit,
  onDelete,
  onTogglePublish,
  onAddSubservice,
  onOpenRoute,
  canEdit = true,
  canDelete = true,
}) => {
  const { language, t } = useLanguage();

  const title = getLocalizedText(service.name, language) || 'Untitled Service';
  const description = getLocalizedText(service.description, language) || '';
  const isPublished = Boolean(service.is_active);

  const subservicesCount =
    service.subservices_count ?? service.subservices?.length ?? 0;
  const docsCount =
    service.required_documents_count ?? service.required_documents?.length ?? 0;
  const officesCount =
    service.offering_organizations_count ??
    service.offering_organizations?.length ??
    0;

  if (isMaster) {
    return (
      <div className="border border-slate-200/80 rounded-xl bg-white transition-all shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(6,69,82,0.06)] overflow-hidden mb-3">
        {/* Master Header Row */}
        <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-50/50 to-white">
          <div
            className="flex items-start gap-3.5 cursor-pointer flex-1 min-w-0"
            onClick={onToggleExpand}
          >
            <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#064552] flex-shrink-0 mt-0.5">
              <Folder size={20} className="stroke-[2.2]" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-mono text-[11px] font-semibold tracking-wider text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                  {service.code}
                </span>

                <span
                  className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                    isPublished
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                  }`}
                >
                  {isPublished ? t('services.published') : t('services.draft')}
                </span>

                <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full bg-teal-50 text-[#064552] border border-teal-100">
                  {subservicesCount}{' '}
                  {subservicesCount === 1 ? 'subservice' : 'subservices'}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug tracking-tight">
                {title}
              </h3>

              {description && (
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Master Actions */}
          <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 flex-shrink-0">
            {canEdit && onAddSubservice && (
              <button
                type="button"
                onClick={() => onAddSubservice(service)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-[#064552] hover:text-white transition-colors"
                title="Add new subservice under this master"
              >
                <Plus size={14} />
                <span>{t('services.addSubservice', 'Add Subservice')}</span>
              </button>
            )}

            {canEdit && (
              <button
                type="button"
                onClick={() => onEdit(service)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-[#064552] hover:bg-slate-100 transition-colors"
                title="Edit master category"
              >
                <Pencil size={15} />
              </button>
            )}

            {canDelete && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(service)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Delete master category"
              >
                <Trash2 size={15} />
              </button>
            )}

            <button
              type="button"
              onClick={onToggleExpand}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-1"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
          </div>
        </div>

        {/* Subservices List inside Accordion */}
        {isExpanded && (
          <div className="border-t border-slate-100 bg-slate-50/40 p-3 sm:p-4 space-y-2.5">
            {((service as any).children || service.subservices) && ((service as any).children || service.subservices).length > 0 ? (
              ((service as any).children || service.subservices).map((child: any) => (
                <ServiceRow
                  key={child.id}
                  service={child}
                  isMaster={false}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onTogglePublish={onTogglePublish}
                  onOpenRoute={onOpenRoute}
                  canEdit={canEdit}
                  canDelete={canDelete}
                />
              ))
            ) : (
              <div className="py-8 text-center bg-white rounded-lg border border-dashed border-slate-200">
                <FileText className="mx-auto text-slate-300 mb-2" size={28} />
                <p className="text-xs font-semibold text-slate-600">
                  No subservices cataloged under this category yet
                </p>
                {canEdit && onAddSubservice && (
                  <button
                    type="button"
                    onClick={() => onAddSubservice(service)}
                    className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#064552] hover:underline"
                  >
                    <Plus size={13} />
                    {t('services.addFirstSubservice', 'Add the first citizen subservice')}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Child / Standalone Subservice Row
  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 sm:p-4 transition-all hover:border-slate-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/70 flex items-center justify-center text-slate-600 flex-shrink-0 mt-0.5">
          <FileText size={16} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-mono text-[10px] font-semibold tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              {service.code}
            </span>

            <span
              className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                isPublished
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : 'bg-amber-50 text-amber-700 border border-amber-200/60'
              }`}
            >
              {isPublished ? t('services.published') : t('services.draft')}
            </span>
          </div>

          <h4 className="text-sm font-semibold text-slate-800 leading-snug">
            {title}
          </h4>

          {description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
              {description}
            </p>
          )}

          {/* Metadata Chips */}
          <div className="flex items-center gap-3 sm:gap-4 mt-2.5 flex-wrap text-[11px] text-slate-600">
            <span className="inline-flex items-center gap-1">
              <Coins size={13} className="text-slate-400" />
              <span>
                {Number(service.fee_amount) > 0
                  ? `${service.fee_amount} ${service.fee_currency || 'ETB'}`
                  : 'Free'}
              </span>
            </span>

            <span className="inline-flex items-center gap-1">
              <Clock size={13} className="text-slate-400" />
              <span>
                {service.estimated_duration_minutes
                  ? `${service.estimated_duration_minutes} min`
                  : 'Queue based'}
              </span>
            </span>

            <span className="inline-flex items-center gap-1">
              <FileCheck size={13} className="text-slate-400" />
              <span>
                {docsCount} {docsCount === 1 ? 'document' : 'documents'}
              </span>
            </span>

            <span className="inline-flex items-center gap-1">
              <Building2 size={13} className="text-slate-400" />
              <span>
                {officesCount}{' '}
                {officesCount === 1 ? 'offering office' : 'offering offices'}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Child Row Actions */}
      <div className="flex items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 flex-shrink-0">
        {/* Room route navigation commented out
        {onOpenRoute && (
          <button
            type="button"
            onClick={() => onOpenRoute(service)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-teal-800 bg-teal-50 border border-teal-200/70 hover:bg-teal-100/70 transition-colors"
            title="Edit room-by-room navigation route for citizens"
          >
            <Navigation size={13} />
            <span>Room route</span>
          </button>
        )}
        */}

        {canEdit && (
          <button
            type="button"
            onClick={() => onEdit(service)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-[#064552] hover:text-white transition-colors"
          >
            <Pencil size={13} />
            <span>{t('common.edit', 'Edit')}</span>
          </button>
        )}

        {onTogglePublish && (
          <button
            type="button"
            onClick={() => onTogglePublish(service.id)}
            className={`p-1.5 rounded-lg transition-colors ${
              isPublished
                ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
            title={isPublished ? 'Unpublish service' : 'Publish service'}
          >
            {isPublished ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}

        {canDelete && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(service)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete subservice"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
};

