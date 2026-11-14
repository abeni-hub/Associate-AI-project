import React, { useMemo, useState } from 'react';
import {
  Building2,
  Landmark,
  MapPin,
  ChevronDown,
  ChevronRight,
  Pencil,
  Network,
  Search,
  CheckCircle2,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '../../i18n/i18nContext';
import { getLocalizedText } from '../../i18n/utils/getLocalized';
import type { OfficeItem, OfficeType } from '../../types/portal.types';

export interface OfficeTreeNode {
  office: OfficeItem;
  children: OfficeTreeNode[];
  depth: number;
}

export interface OfficeHierarchyTreeProps {
  offices: OfficeItem[];
  officeTypes?: OfficeType[];
  matchingOfficeIds?: ReadonlySet<number>;
  onEdit?: (office: OfficeItem) => void;
  onEditOffice?: (office: OfficeItem) => void;
  canEdit?: boolean;
}

const buildOfficeForest = (offices: OfficeItem[]): OfficeTreeNode[] => {
  const officesById = new Map(offices.map((office) => [office.id, office]));
  const childrenByParentId = new Map<number, OfficeItem[]>();

  offices.forEach((office) => {
    if (office.parentId === null || !officesById.has(office.parentId)) return;
    const children = childrenByParentId.get(office.parentId) || [];
    children.push(office);
    childrenByParentId.set(office.parentId, children);
  });

  const visited = new Set<number>();
  const makeNode = (office: OfficeItem, depth: number, ancestors: ReadonlySet<number>): OfficeTreeNode => {
    visited.add(office.id);
    const nextAncestors = new Set(ancestors).add(office.id);
    const children = (childrenByParentId.get(office.id) || [])
      .filter((child) => !nextAncestors.has(child.id))
      .map((child) => makeNode(child, depth + 1, nextAncestors));
    return { office, children, depth };
  };

  const roots = offices
    .filter((office) => office.parentId === null || !officesById.has(office.parentId))
    .map((office) => makeNode(office, 1, new Set<number>()));

  // Keep malformed or cyclic records visible instead of silently dropping them
  offices
    .filter((office) => !visited.has(office.id))
    .forEach((office) => roots.push(makeNode(office, 1, new Set<number>())));

  return roots;
};

const filterTree = (
  node: OfficeTreeNode,
  matchingOfficeIds?: ReadonlySet<number>
): OfficeTreeNode | null => {
  const children = node.children
    .map((child) => filterTree(child, matchingOfficeIds))
    .filter((child): child is OfficeTreeNode => child !== null);

  const isSelfMatching = !matchingOfficeIds || matchingOfficeIds.has(node.office.id);
  if (!isSelfMatching && children.length === 0) return null;
  return { office: node.office, children, depth: node.depth };
};

export const OfficeHierarchyTree: React.FC<OfficeHierarchyTreeProps> = ({
  offices,
  officeTypes = [],
  matchingOfficeIds,
  onEdit,
  onEditOffice,
  canEdit = true,
}) => {
  const { language, t } = useLanguage();
  const handleEdit = onEdit || onEditOffice;

  const [activeTab, setActiveTab] = useState<'all' | 'subcities' | 'bureaus'>('all');
  const [collapsedNodes, setCollapsedNodes] = useState<Record<number, boolean>>({});

  const toggleCollapse = (id: number) => {
    setCollapsedNodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => setCollapsedNodes({});
  const collapseAll = () => {
    const all: Record<number, boolean> = {};
    offices.forEach((o) => {
      all[o.id] = true;
    });
    setCollapsedNodes(all);
  };

  const rawForest = useMemo(() => buildOfficeForest(offices), [offices]);

  const visibleTree = useMemo(() => {
    return rawForest
      .map((node) => filterTree(node, matchingOfficeIds))
      .filter((node): node is OfficeTreeNode => node !== null);
  }, [rawForest, matchingOfficeIds]);

  // Separate Sub-Cities from Central Bureaus for clearer visual hierarchy
  const { subcityNodes, bureauNodes } = useMemo(() => {
    const subcities: OfficeTreeNode[] = [];
    const bureaus: OfficeTreeNode[] = [];

    visibleTree.forEach((node) => {
      const typeStr = String(node.office.typeName || '').toLowerCase();
      const codeStr = String(node.office.code || '').toLowerCase();
      const isSubcity =
        node.office.typeId === 1 ||
        typeStr.includes('sub-city') ||
        typeStr.includes('subcity') ||
        codeStr.includes('subcity');

      if (isSubcity) {
        subcities.push(node);
      } else {
        bureaus.push(node);
      }
    });

    return { subcityNodes: subcities, bureauNodes: bureaus };
  }, [visibleTree]);

  const displayedRoots = useMemo(() => {
    if (activeTab === 'subcities') return subcityNodes;
    if (activeTab === 'bureaus') return bureauNodes;
    return visibleTree;
  }, [activeTab, subcityNodes, bureauNodes, visibleTree]);

  const totalVisibleCount = useMemo(() => {
    const countNodes = (n: OfficeTreeNode): number =>
      1 + n.children.reduce((acc, c) => acc + countNodes(c), 0);
    return visibleTree.reduce((acc, n) => acc + countNodes(n), 0);
  }, [visibleTree]);

  const totalWoredasCount = useMemo(() => {
    let count = 0;
    const walk = (n: OfficeTreeNode) => {
      const typeStr = String(n.office.typeName || '').toLowerCase();
      if (n.office.typeId === 2 || typeStr.includes('woreda')) count++;
      n.children.forEach(walk);
    };
    visibleTree.forEach(walk);
    return count;
  }, [visibleTree]);

  return (
    <div className="space-y-6">
      {/* Top Controls Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 shadow-sm text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'all'
                  ? 'bg-[#064552] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('common.all', 'All Branches')} ({visibleTree.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('subcities')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'subcities'
                  ? 'bg-[#064552] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('offices.subcities', 'Sub-Cities')} ({subcityNodes.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bureaus')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'bureaus'
                  ? 'bg-[#064552] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('offices.centralBureaus', 'Central Bureaus')} ({bureauNodes.length})
            </button>
          </div>

          <span className="text-xs text-slate-500 font-medium hidden md:inline">
            {totalVisibleCount} {t('offices.totalOffices', 'offices visible')}
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={expandAll}
            className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-all"
          >
            {t('common.expandAll', 'Expand all')}
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-all"
          >
            {t('common.collapseAll', 'Collapse all')}
          </button>
        </div>
      </div>

      {visibleTree.length === 0 ? (
        <div className="py-20 text-center max-w-sm mx-auto">
          <Search size={36} className="mx-auto text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-700">
            {t('offices.emptyNotice', 'No hierarchy branches match current filters')}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {t('offices.emptyNoticeDesc', 'Try selecting another classification tier or broadening your search.')}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* 1. Apex Root: Addis Ababa City Administration */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-xl bg-gradient-to-r from-[#003946] to-[#00485a] text-white rounded-2xl p-5 shadow-lg border border-teal-800/40 text-center relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full pointer-events-none" />
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-2 border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {t('offices.adminTag', 'City Administration Apex')}
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight">
                {t('offices.cityAdminTitle', 'Addis Ababa City Administration')}
              </h2>
              <p className="text-xs text-teal-100/80 mt-1 max-w-md mx-auto">
                {t('offices.cityAdminDesc', 'Apex municipal governing body administering sub-cities, woredas, and central sector bureaus.')}
              </p>
              <div className="flex items-center justify-center gap-4 mt-3.5 pt-3 border-t border-white/10 text-xs text-teal-100 font-medium flex-wrap">
                <span><b>{subcityNodes.length}</b> {t('offices.subcities', 'Sub-Cities')}</span>
                <span>•</span>
                <span><b>{bureauNodes.length}</b> {t('offices.centralBureaus', 'Bureaus')}</span>
                <span>•</span>
                <span><b>{totalWoredasCount}</b> {t('offices.woredas', 'Woredas')}</span>
              </div>
            </div>

            {/* Vertical connector stem */}
            <div className="w-0.5 h-6 bg-slate-300" />
            <div className="w-4 h-4 rounded-full border-2 border-slate-300 bg-white" />
            <div className="w-0.5 h-6 bg-slate-300" />
          </div>

          {/* 2. Hierarchical Forest Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {displayedRoots.map((node) => (
              <TreeNodeCard
                key={node.office.id}
                node={node}
                isCollapsed={Boolean(collapsedNodes[node.office.id])}
                onToggleCollapse={() => toggleCollapse(node.office.id)}
                collapsedNodes={collapsedNodes}
                onToggleChildCollapse={toggleCollapse}
                onEdit={handleEdit}
                canEdit={canEdit}
                matchingOfficeIds={matchingOfficeIds}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface TreeNodeCardProps {
  node: OfficeTreeNode;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  collapsedNodes: Record<number, boolean>;
  onToggleChildCollapse: (id: number) => void;
  onEdit?: (office: OfficeItem) => void;
  canEdit: boolean;
  matchingOfficeIds?: ReadonlySet<number>;
}

const TreeNodeCard: React.FC<TreeNodeCardProps> = ({
  node,
  isCollapsed,
  onToggleCollapse,
  collapsedNodes,
  onToggleChildCollapse,
  onEdit,
  canEdit,
  matchingOfficeIds,
}) => {
  const { language, t } = useLanguage();
  const { office, children } = node;

  const typeStr = String(office.typeName || '').toLowerCase();
  const isSubcity = office.typeId === 1 || typeStr.includes('sub-city') || typeStr.includes('subcity');
  const isBureau = office.typeId === 3 || typeStr.includes('bureau');
  const isWoreda = office.typeId === 2 || typeStr.includes('woreda');
  const isActive = office.status.toLowerCase() === 'active';
  const hasChildren = children.length > 0;
  const isMatched = matchingOfficeIds && matchingOfficeIds.has(office.id);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* Root Node Header */}
      <div
        className={`p-4 sm:p-5 flex items-start justify-between gap-3 border-b ${
          isSubcity
            ? 'bg-gradient-to-r from-blue-50/50 to-white border-blue-100'
            : isBureau
            ? 'bg-gradient-to-r from-purple-50/50 to-white border-purple-100'
            : 'bg-slate-50/50 border-slate-100'
        } ${isMatched ? 'ring-2 ring-teal-500/40 ring-inset' : ''}`}
      >
        <div className="flex items-start gap-3.5 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 border ${
              isSubcity
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : isBureau
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : isWoreda
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-teal-50 text-teal-700 border-teal-200'
            }`}
          >
            {isSubcity ? (
              <Building2 size={20} className="stroke-[2.2]" />
            ) : isBureau ? (
              <Landmark size={20} className="stroke-[2.2]" />
            ) : (
              <MapPin size={20} className="stroke-[2.2]" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <span className="font-mono text-[10px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                {office.code}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isSubcity
                    ? 'bg-blue-100/70 text-blue-800'
                    : isBureau
                    ? 'bg-purple-100/70 text-purple-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {office.typeName || (isSubcity ? 'Sub-City' : isBureau ? 'Bureau' : 'Office')}
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
              </span>
            </div>

            <h3 className="text-base font-extrabold text-slate-900 truncate">
              {getLocalizedText(office.name, language) || office.name}
            </h3>

            {office.address && (
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {getLocalizedText(office.address, language) || office.address}
              </p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {canEdit && onEdit && (
            <button
              type="button"
              onClick={() => onEdit(office)}
              className="p-1.5 text-slate-400 hover:text-[#064552] hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
              title={`Edit ${office.name}`}
            >
              <Pencil size={15} />
            </button>
          )}

          {hasChildren && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
              title={isCollapsed ? 'Expand child branches' : 'Collapse child branches'}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Children Section */}
      {hasChildren ? (
        !isCollapsed && (
          <div className="p-4 sm:p-5 bg-slate-50/40 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-1">
              <span className="flex items-center gap-1.5">
                <ArrowRight size={12} className="text-slate-400" />
                <span>{t('offices.subordinateOffices', 'Subordinate Offices')} ({children.length})</span>
              </span>
              <span className="text-[11px] font-normal text-slate-400">
                {isSubcity ? 'Municipal woredas & desks' : 'Sector divisions'}
              </span>
            </div>

            <div className="space-y-2.5">
              {children.map((childNode) => (
                <ChildOfficeItem
                  key={childNode.office.id}
                  node={childNode}
                  collapsedNodes={collapsedNodes}
                  onToggleCollapse={onToggleChildCollapse}
                  onEdit={onEdit}
                  canEdit={canEdit}
                  matchingOfficeIds={matchingOfficeIds}
                />
              ))}
            </div>
          </div>
        )
      ) : isSubcity ? (
        <div className="p-3 bg-slate-50/30 text-center text-xs text-slate-400 border-t border-slate-100">
          {t('offices.noChildrenYet', 'No subordinate woredas configured under this sub-city.')}
        </div>
      ) : null}
    </div>
  );
};

interface ChildOfficeItemProps {
  node: OfficeTreeNode;
  collapsedNodes: Record<number, boolean>;
  onToggleCollapse: (id: number) => void;
  onEdit?: (office: OfficeItem) => void;
  canEdit: boolean;
  matchingOfficeIds?: ReadonlySet<number>;
}

const ChildOfficeItem: React.FC<ChildOfficeItemProps> = ({
  node,
  collapsedNodes,
  onToggleCollapse,
  onEdit,
  canEdit,
  matchingOfficeIds,
}) => {
  const { language, t } = useLanguage();
  const { office, children } = node;
  const isCollapsed = Boolean(collapsedNodes[office.id]);
  const hasChildren = children.length > 0;
  const isActive = office.status.toLowerCase() === 'active';
  const isMatched = matchingOfficeIds && matchingOfficeIds.has(office.id);

  return (
    <div className="space-y-2">
      <div
        className={`p-3 bg-white border border-slate-200/80 rounded-xl hover:border-slate-300 transition-all flex items-center justify-between gap-3 shadow-xs ${
          isMatched ? 'ring-2 ring-teal-500/40' : ''
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/70 flex items-center justify-center flex-shrink-0">
            <MapPin size={15} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-900 truncate">
                {getLocalizedText(office.name, language) || office.name}
              </span>
              <span className="font-mono text-[9px] font-semibold text-slate-500 bg-slate-100 px-1 py-0.2 rounded">
                {office.code}
              </span>
              <span
                className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
              </span>
            </div>
            {office.phone && (
              <span className="text-[11px] text-slate-400 block truncate">
                {office.phone}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {canEdit && onEdit && (
            <button
              type="button"
              onClick={() => onEdit(office)}
              className="p-1 text-slate-400 hover:text-[#064552] rounded hover:bg-slate-50 transition-colors"
              title={`Edit ${office.name}`}
            >
              <Pencil size={13} />
            </button>
          )}

          {hasChildren && (
            <button
              type="button"
              onClick={() => onToggleCollapse(office.id)}
              className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-50 transition-colors"
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
      </div>

      {hasChildren && !isCollapsed && (
        <div className="pl-6 border-l-2 border-slate-200 ml-4 space-y-2">
          {children.map((grandchild) => (
            <ChildOfficeItem
              key={grandchild.office.id}
              node={grandchild}
              collapsedNodes={collapsedNodes}
              onToggleCollapse={onToggleCollapse}
              onEdit={onEdit}
              canEdit={canEdit}
              matchingOfficeIds={matchingOfficeIds}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OfficeHierarchyTree;
