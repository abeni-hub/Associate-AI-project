import React from 'react';
import { Icon, StatusPill } from '../../shared';
import type { MasterTreeNode } from '../hooks/useServices';

export interface ServicesTreeViewProps {
  filteredTreeNodes: MasterTreeNode[];
  expandedMasterIds: Set<number>;
  toggleExpand: (id: number) => void;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  togglingId: number | null;
  onAddSubservice: (master: any) => void;
  onEdit: (item: any) => void;
  handleDelete: (id: number, title?: string) => void;
  onTogglePublish: (id: number) => void;
  handleOpenRoute: (item: any) => void;
  isLoading: boolean;
}

export const ServicesTreeView: React.FC<ServicesTreeViewProps> = ({
  filteredTreeNodes,
  expandedMasterIds,
  toggleExpand,
  canCreate,
  canUpdate,
  canDelete,
  togglingId,
  onAddSubservice,
  onEdit,
  handleDelete,
  onTogglePublish,
  handleOpenRoute,
  isLoading,
}) => {
  return (
    <section className="service-tree-container">
      {filteredTreeNodes.map((master) => {
        const isExpanded = expandedMasterIds.has(master.id);
        const hasChildren = master.children.length > 0;

        return (
          <article
            key={master.id}
            className={`service-tree-node${isExpanded ? ' is-expanded' : ''}`}
          >
            {/* Master Node Header Row */}
            <div
              className="master-node-header"
              onClick={() => toggleExpand(master.id)}
            >
              <div className="master-node-left">
                <span
                  className={`tree-chevron${isExpanded ? ' expanded' : ''}`}
                  title={isExpanded ? 'Collapse' : 'Expand'}
                >
                  <Icon name="chevron" size={16} />
                </span>
                <span className="master-node-icon">
                  <Icon name="folder" size={18} />
                </span>
                <div className="master-node-title-group">
                  <div className="master-node-topline">
                    <span className="master-category-badge">MASTER DOMAIN</span>
                    <span className="master-code-badge">{master.code}</span>
                    {master.organization && (
                      <span className="master-bureau-badge">
                        🏛 {master.organization.name}
                      </span>
                    )}
                    <StatusPill>{master.is_active ? 'Active' : 'Inactive'}</StatusPill>
                  </div>
                  <h3 className="master-node-title">{master.title}</h3>
                  {master.description && (
                    <p
                      style={{
                        margin: '3px 0 0',
                        fontSize: '12.5px',
                        color: '#657b72',
                        maxWidth: '750px',
                      }}
                    >
                      {master.description}
                    </p>
                  )}
                </div>
              </div>

              <div
                className="master-node-right"
                onClick={(e) => e.stopPropagation()}
              >
                <span className={`subservice-counter-chip${hasChildren ? '' : ' empty'}`}>
                  <Icon name="layers" size={13} />
                  {master.children.length} {master.children.length === 1 ? 'subservice' : 'subservices'}
                </span>

                {/* Master Actions */}
                <div className="master-node-actions">
                  {canCreate && (
                    <button
                      className="button secondary small-button"
                      onClick={() => onAddSubservice(master)}
                      title="Add a citizen subservice under this master category"
                      style={{
                        borderColor: '#c6ded4',
                        background: '#f4fbf8',
                        color: '#00485a',
                        fontWeight: 700,
                      }}
                    >
                      <Icon name="plus" size={13} />
                      Add Subservice
                    </button>
                  )}
                  {canUpdate && (
                    <button
                      className="button secondary small-button"
                      onClick={() => onEdit(master)}
                      title="Edit master category standard"
                    >
                      <Icon name="edit" size={13} />
                      Edit
                    </button>
                  )}
                  {canDelete && master.children.length === 0 && (
                    <button
                      className="button secondary small-button"
                      style={{ color: '#e53e3e', borderColor: '#feb2b2' }}
                      onClick={() => handleDelete(master.id, master.title)}
                      title="Delete master service"
                    >
                      <Icon name="trash" size={13} />
                    </button>
                  )}
                  {canUpdate && (
                    <button
                      className={`publish-toggle${master.is_active ? ' is-on' : ''}`}
                      title={master.is_active ? 'Deactivate' : 'Activate'}
                      aria-label={master.is_active ? 'Deactivate' : 'Activate'}
                      disabled={togglingId === master.id}
                      onClick={() => onTogglePublish(master.id)}
                    >
                      <i />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Subservices Collapsible Branch */}
            {isExpanded && (
              <div className="tree-subservices-branch">
                {hasChildren ? (
                  master.children.map((subservice) => {
                    const hasRoute = subservice.steps && subservice.steps.length > 0;
                    const docCount = subservice.required_documents?.length ?? 0;
                    const officeCount = subservice.offering_organizations?.length ?? 0;

                    return (
                      <div key={subservice.id} className="tree-subservice-card">
                        <div className="tree-subservice-card-main">
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div className="tree-subservice-title-row">
                              <span
                                style={{
                                  fontFamily: 'monospace',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  background: '#f0f5f2',
                                  color: '#285660',
                                  border: '1px solid #d4e3dc',
                                }}
                              >
                                {subservice.code}
                              </span>
                              <h4 className="tree-subservice-title">{subservice.title}</h4>
                              <StatusPill>{subservice.is_active ? 'Active' : 'Inactive'}</StatusPill>
                            </div>
                            <p className="tree-subservice-desc">
                              {subservice.description || 'Public municipal citizen service.'}
                            </p>

                            {/* Specification Badges */}
                            <div className="tree-subservice-badges">
                              <span className="tree-badge">
                                <Icon name="clock" size={12} />
                                {subservice.estimated_duration_minutes
                                  ? `${subservice.estimated_duration_minutes} min`
                                  : 'Standard queue'}
                              </span>
                              <span className="tree-badge fee">
                                {subservice.fee_amount && subservice.fee_amount > 0
                                  ? `${subservice.fee_amount} ${subservice.fee_currency}`
                                  : 'Free citizen service'}
                              </span>
                              <span
                                className="tree-badge"
                                title={
                                  subservice.required_documents?.map((d: any) => d.name).join(', ') ||
                                  'Required documents'
                                }
                              >
                                <Icon name="file" size={12} />
                                {docCount} {docCount === 1 ? 'document' : 'documents'}
                              </span>
                              <span
                                className="tree-badge"
                                title={
                                  subservice.offering_organizations?.map((o: any) => o.name).join(', ') ||
                                  'Delivery offices'
                                }
                              >
                                <Icon name="building" size={12} />
                                {officeCount} {officeCount === 1 ? 'office' : 'offices'}
                              </span>
                              <span className={`tree-badge ${hasRoute ? 'route-ready' : 'route-missing'}`}>
                                <Icon name="route" size={12} />
                                {hasRoute ? `${subservice.steps?.length} room steps` : 'No route configured'}
                              </span>
                            </div>
                          </div>

                          {/* Subservice Actions */}
                          <div className="tree-subservice-actions">
                            <button
                              className="button secondary small-button"
                              onClick={() => handleOpenRoute(subservice)}
                              title="Configure physical room navigation steps"
                              style={{
                                borderColor: hasRoute ? '#b5d5de' : '#ebdcc5',
                                background: hasRoute ? '#edf7fa' : '#fdf9f2',
                                color: hasRoute ? '#00485a' : '#8c6014',
                              }}
                            >
                              <Icon name="route" size={13} />
                              Room Route
                            </button>
                            {canUpdate && (
                              <button
                                className="button secondary small-button"
                                onClick={() => onEdit(subservice)}
                                title="Edit subservice standard"
                              >
                                <Icon name="edit" size={13} />
                                Edit
                              </button>
                            )}
                            {canDelete && (
                              <button
                                className="button secondary small-button"
                                style={{ color: '#e53e3e', borderColor: '#feb2b2' }}
                                onClick={() => handleDelete(subservice.id, subservice.title)}
                                title="Delete subservice"
                              >
                                <Icon name="trash" size={13} />
                              </button>
                            )}
                            {canUpdate && (
                              <button
                                className={`publish-toggle${subservice.is_active ? ' is-on' : ''}`}
                                title={subservice.is_active ? 'Deactivate' : 'Activate'}
                                aria-label={subservice.is_active ? 'Deactivate' : 'Activate'}
                                disabled={togglingId === subservice.id}
                                onClick={() => onTogglePublish(subservice.id)}
                              >
                                <i />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="tree-empty-subservices">
                    <p>No subservices registered under this category yet.</p>
                    {canCreate && (
                      <button
                        className="button secondary small-button"
                        onClick={() => onAddSubservice(master)}
                        style={{
                          margin: '0 auto',
                          borderColor: '#c6ded4',
                          background: '#ffffff',
                          color: '#00485a',
                          fontWeight: 700,
                        }}
                      >
                        <Icon name="plus" size={13} />
                        Add the First Subservice
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </article>
        );
      })}

      {!filteredTreeNodes.length && !isLoading && (
        <div className="panel empty-state">
          <b>No services found</b>
          <p>Try adjusting your search query, status filters, or organization view.</p>
        </div>
      )}
    </section>
  );
};

export default ServicesTreeView;

