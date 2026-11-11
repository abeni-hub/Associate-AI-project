import React, { useMemo } from 'react';
import { Icon } from '../shared/Icon';
import type { OfficeItem, OfficeType } from '../../types/portal.types';

interface OfficeTreeNode {
  office: OfficeItem;
  children: OfficeTreeNode[];
}

interface OfficeHierarchyTreeProps {
  offices: OfficeItem[];
  officeTypes: OfficeType[];
  matchingOfficeIds: ReadonlySet<number>;
  onEdit: (office: OfficeItem) => void;
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
  const makeNode = (office: OfficeItem, ancestors: ReadonlySet<number>): OfficeTreeNode => {
    visited.add(office.id);
    const nextAncestors = new Set(ancestors).add(office.id);
    const children = (childrenByParentId.get(office.id) || [])
      .filter((child) => !nextAncestors.has(child.id))
      .map((child) => makeNode(child, nextAncestors));
    return { office, children };
  };

  const roots = offices
    .filter((office) => office.parentId === null || !officesById.has(office.parentId))
    .map((office) => makeNode(office, new Set<number>()));

  // Keep malformed or cyclic records visible instead of silently dropping them.
  offices.filter((office) => !visited.has(office.id)).forEach((office) => roots.push(makeNode(office, new Set<number>())));
  return roots;
};

const filterTree = (
  node: OfficeTreeNode,
  matchingOfficeIds: ReadonlySet<number>
): OfficeTreeNode | null => {
  const children = node.children
    .map((child) => filterTree(child, matchingOfficeIds))
    .filter((child): child is OfficeTreeNode => child !== null);

  if (!matchingOfficeIds.has(node.office.id) && children.length === 0) return null;
  return { office: node.office, children };
};

const countNodes = (node: OfficeTreeNode): number =>
  1 + node.children.reduce((total, child) => total + countNodes(child), 0);

const OfficeTreeBranch: React.FC<{
  node: OfficeTreeNode;
  officeTypes: OfficeType[];
  depth: number;
  officesById: Map<number, OfficeItem>;
  onEdit: (office: OfficeItem) => void;
}> = ({ node, officeTypes, depth, officesById, onEdit }) => {
  const { office, children } = node;
  const type = officeTypes.find((item) => item.id === office.typeId);
  const isActive = office.status.toLowerCase() === 'active';
  const levelLabel = type?.name || `Office level ${office.typeId}`;
  const parentOffice = office.parentId !== null ? officesById.get(office.parentId) : null;
  const parentName = parentOffice?.name || (depth === 1 ? 'City Administration' : null);

  return (
    <div className={`office-tree-branch office-tree-depth-${Math.min(depth, 4)}`}>
      <article className={`office-tree-card office-tree-card-level-${Math.min(depth, 4)}`}>
        <div className="office-tree-card-topline">
          <span className="office-tree-icon" aria-hidden="true">
            <Icon name={office.typeId === 1 ? 'map' : office.typeId === 2 ? 'building' : 'layers'} size={15} />
          </span>
          <span className="office-tree-card-heading-copy">
            {parentName && (
              <span className="office-tree-kicker" title={`Parent: ${parentName}`}>
                Parent: {parentName}
              </span>
            )}
            <strong title={office.name}>{office.name}</strong>
          </span>
          <span className={`office-tree-status${isActive ? ' is-active' : ' is-inactive'}`} title={`Status: ${office.status}`}>
            <i className="office-tree-status-dot" aria-hidden="true" />
          </span>
          <button
            type="button"
            className="office-tree-edit"
            onClick={() => onEdit(office)}
            aria-label={`Edit ${office.name}`}
            title={`Edit ${office.name}`}
          >
            <Icon name="arrow" size={13} />
          </button>
        </div>

        {children.length > 0 && (
          <div className="office-tree-children-preview">
            <span className="office-tree-children-label">
              Child Offices ({children.length}):
            </span>
            <div className="office-tree-children-tags">
              {children.map((child) => (
                <span
                  key={child.office.id}
                  className="office-tree-child-chip"
                  title={child.office.name}
                >
                  {child.office.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>

      {children.length > 0 && (
        <ul className="office-tree-children" aria-label={`${office.name} offices`}>
          {children.map((child) => (
            <li key={child.office.id}>
              <OfficeTreeBranch
                node={child}
                officeTypes={officeTypes}
                depth={depth + 1}
                officesById={officesById}
                onEdit={onEdit}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const OfficeHierarchyTree: React.FC<OfficeHierarchyTreeProps> = ({
  offices,
  officeTypes,
  matchingOfficeIds,
  onEdit,
}) => {
  const officesById = useMemo(() => new Map(offices.map((office) => [office.id, office])), [offices]);
  const visibleTree = useMemo(
    () => buildOfficeForest(offices).map((node) => filterTree(node, matchingOfficeIds)).filter((node): node is OfficeTreeNode => node !== null),
    [offices, matchingOfficeIds]
  );
  const visibleOfficeCount = useMemo(() => visibleTree.reduce((total, node) => total + countNodes(node), 0), [visibleTree]);
  const subcityCount = visibleTree.filter((node) => node.office.typeId === 1).length;

  return (
    <section className="office-hierarchy" id="office-hierarchy-panel" role="region" aria-labelledby="office-hierarchy-tab" tabIndex={0} aria-label="Office hierarchy">
      <div className="office-hierarchy-heading">
        <div className="office-hierarchy-intro">
          <span className="office-hierarchy-mark"><Icon name="layers" size={18} /></span>
          <span>
            <b>Administrative hierarchy</b>
            <small>Trace each branch from city leadership to its local service offices.</small>
          </span>
        </div>
        <div className="office-hierarchy-actions">
          <span><i className="office-hierarchy-live-dot" /> {visibleOfficeCount} offices visible</span>
        </div>
      </div>

      <div className="office-hierarchy-legend" aria-label="Hierarchy levels">
        <span className="office-level-legend level-city"><i />City administration</span>
        {officeTypes.map((type, index) => (
          <span className={`office-level-legend level-${index + 1}`} key={type.id}>
            <i />{type.name}
          </span>
        ))}
      </div>

      {visibleTree.length ? (
        <div className="office-tree-canvas">
          <div className="office-tree-city-root">
            <span className="office-city-emblem"><Icon name="map" size={18} /></span>
            <span className="office-city-copy">
              <small>ADDIS ABABA · CITY GOVERNMENT</small>
              <b>Addis Ababa City Administration</b>
              <span>{subcityCount} sub-cities branching into local offices</span>
            </span>
            <span className="office-city-root-badge">CITYWIDE</span>
          </div>
          <div className="office-city-trunk" aria-hidden="true" />
          <ul
            className="office-tree-subcities"
            aria-label="Sub-cities and their offices"
            style={{
              gridTemplateColumns: `repeat(${visibleTree.length}, minmax(0, 1fr))`,
              '--branch-inset': `${50 / visibleTree.length}%`,
            } as React.CSSProperties}
          >
            {visibleTree.map((node) => (
              <li className="office-tree-subcity-column" key={node.office.id}>
                <OfficeTreeBranch node={node} officeTypes={officeTypes} depth={1} officesById={officesById} onEdit={onEdit} />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="office-tree-empty">
          <span><Icon name="search" size={19} /></span>
          <b>No hierarchy matches these filters</b>
          <small>Try another classification or a broader search.</small>
        </div>
      )}
    </section>
  );
};

export default OfficeHierarchyTree;
