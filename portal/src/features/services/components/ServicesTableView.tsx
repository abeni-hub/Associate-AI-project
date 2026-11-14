import React from 'react';
import { Icon, StatusPill } from '../../shared';

export interface ServicesTableViewProps {
  items: any[];
  canUpdate: boolean;
  canDelete: boolean;
  togglingId: number | null;
  onEdit: (item: any) => void;
  handleDelete: (id: number, title?: string) => void;
  onTogglePublish: (id: number) => void;
  isLoading: boolean;
}

export const ServicesTableView: React.FC<ServicesTableViewProps> = ({
  items,
  canUpdate,
  canDelete,
  togglingId,
  onEdit,
  handleDelete,
  onTogglePublish,
  isLoading,
}) => {
  return (
    <section className="service-list">
      {items.map((item) => {
        const raw = item.raw || {};
        const isPublished = Boolean(raw.is_active ?? (item.status === 'Published'));
        const docs = raw.required_documents || [];
        const bureaus = raw.offering_organizations?.length || item.bureau ? 1 : 0;

        return (
          <article className="panel service-card" key={item.id}>
            <div className="service-card-main">
              <span className="service-card-icon">
                <Icon name="layers" size={20} />
              </span>
              <div className="service-card-content">
                <div className="service-title-row">
                  <span className="service-category">{item.category}</span>
                  <span className="service-level-tag">
                    {raw.is_master ? 'Master Category' : 'Subservice'}
                  </span>
                  <StatusPill>{isPublished ? 'Active' : 'Inactive'}</StatusPill>
                </div>
                <h2>{item.name}</h2>
                <p>{raw.description || 'Public government service.'}</p>
                <div className="service-meta">
                  <span>
                    <Icon name="check" size={14} /> {docs.length} required documents
                  </span>
                  <span>
                    <Icon name="building" size={14} /> Shared with {bureaus} offices
                  </span>
                </div>
                {docs.length > 0 && (
                  <div className="document-chips">
                    {docs.slice(0, 3).map((d: any, idx: number) => (
                      <span key={d.id || idx}>
                        <Icon name="check" size={11} />
                        {d.name}
                      </span>
                    ))}
                    {docs.length > 3 && <small>+{docs.length - 3} more</small>}
                  </div>
                )}
              </div>
            </div>
            <div className="service-card-side">
              {canUpdate && (
                <button
                  type="button"
                  className="button secondary small-button"
                  onClick={() => onEdit(item)}
                >
                  Edit standard
                </button>
              )}
              {canDelete && (
                <button
                  type="button"
                  className="button secondary small-button"
                  style={{ color: '#e53e3e', borderColor: '#feb2b2' }}
                  onClick={() => handleDelete(item.id, item.name)}
                  title="Delete service standard"
                >
                  Delete
                </button>
              )}
              {canUpdate && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  <button
                    type="button"
                    className={`publish-toggle${isPublished ? ' is-on' : ''}`}
                    title={isPublished ? 'Deactivate service' : 'Activate service'}
                    aria-label={isPublished ? 'Deactivate service' : 'Activate service'}
                    disabled={togglingId === item.id}
                    onClick={() => onTogglePublish(item.id)}
                    style={{
                      opacity: togglingId === item.id ? 0.6 : 1,
                      cursor: togglingId === item.id ? 'wait' : 'pointer',
                    }}
                  >
                    <i />
                  </button>
                  <small
                    style={{
                      fontSize: '9.5px',
                      color: isPublished ? '#15803d' : '#94a3b8',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {isPublished ? 'ACTIVE' : 'INACTIVE'}
                  </small>
                </div>
              )}
            </div>
          </article>
        );
      })}

      {!items.length && !isLoading && (
        <div className="panel empty-state">
          <b>No services found</b>
          <p>Try adjusting your search query or filters.</p>
        </div>
      )}
    </section>
  );
};

export default ServicesTableView;

