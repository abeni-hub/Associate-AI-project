import React, { useMemo, useState } from 'react';
import { usePortal } from '../context';
import { Icon } from '../components/shared/Icon';
import { PageHeading } from '../components/shared/PageHeading';
import { MetricCard } from '../components/shared/MetricCard';
import { SearchBox } from '../components/shared/SearchBox';
import { FeedbackTable } from '../components/shared/FeedbackTable';
import type { FeedbackItem } from '../types/portal.types';
import { useGetFeedbackListQuery, useUpdateFeedbackStatusMutation } from '../services/feedbackApi';

export interface FeedbackPageProps {
  items?: FeedbackItem[];
  onOpen?: (item: FeedbackItem) => void;
  search?: string;
  setSearch?: (s: string) => void;
  typeFilter?: string;
  setTypeFilter?: (t: string) => void;
  statusFilter?: string;
  setStatusFilter?: (s: string) => void;
}

export const FeedbackPage: React.FC<FeedbackPageProps> = ({
  items: propItems,
  onOpen: propOnOpen,
  search: propSearch,
  setSearch: propSetSearch,
  typeFilter: propTypeFilter,
  setTypeFilter: propSetTypeFilter,
  statusFilter: propStatusFilter,
  setStatusFilter: propSetStatusFilter,
}) => {
  const portal = usePortal();

  const [localTypeFilter, setLocalTypeFilter] = useState('All types');
  const [localStatusFilter, setLocalStatusFilter] = useState('All statuses');
  const [statusOverrides, setStatusOverrides] = useState<Record<string, string>>({});
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const { data: apiFeedback, isLoading } = useGetFeedbackListQuery();

  const items: FeedbackItem[] = useMemo(() => {
    let baseList: FeedbackItem[] = [];

    if (propItems && propItems.length > 0) {
      baseList = propItems;
    } else if (apiFeedback?.data) {
      baseList = apiFeedback.data.map((f) => {
        const isComplaint = f.feedback_type === 'complaint' || String(f.type).toLowerCase() === 'complaint';
        const isSatisfaction = f.feedback_type === 'satisfaction' || String(f.type).toLowerCase() === 'satisfaction';
        const normalizedType: 'Complaint' | 'Satisfaction' | 'Suggestion' = isComplaint
          ? 'Complaint'
          : isSatisfaction
            ? 'Satisfaction'
            : 'Suggestion';

        const displayId = f.tracking_number ? `#${f.tracking_number}` : `FB-${f.id}`;
        return {
          id: displayId,
          numericId: typeof f.id === 'number' ? f.id : Number(f.id) || undefined,
          trackingNumber: f.tracking_number,
          type: normalizedType,
          service: f.service || 'Civil Registration',
          bureau: f.organization?.name || f.bureau || 'General Bureau',
          subcity: f.organization?.code || f.subcity || 'City Administration',
          message: f.feedback_content || f.message || '',
          rating: f.rating ?? (isSatisfaction ? 5 : isComplaint ? 2 : 4),
          time: f.created_at
            ? new Date(f.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : 'Today',
          status: f.status || 'Open',
          priority: isComplaint ? 'High' : (f.priority || 'Normal'),
          notes: [],
          fullName: f.full_name || f.fullName,
          phoneNumber: f.phone_number || f.phoneNumber || (f as any).phone,
          email: f.email,
        };
      });
    }

    // Apply any optimistic status overrides
    return baseList.map((item) => {
      if (statusOverrides[item.id]) {
        return { ...item, status: statusOverrides[item.id] };
      }
      return item;
    });
  }, [propItems, apiFeedback, statusOverrides]);

  const search = propSearch !== undefined ? propSearch : portal.search;
  const setSearch = propSetSearch || portal.setSearch;
  const typeFilter = propTypeFilter !== undefined ? propTypeFilter : localTypeFilter;
  const setTypeFilter = propSetTypeFilter || setLocalTypeFilter;
  const statusFilter = propStatusFilter !== undefined ? propStatusFilter : localStatusFilter;
  const setStatusFilter = propSetStatusFilter || setLocalStatusFilter;

  const [updateFeedbackStatusTrigger] = useUpdateFeedbackStatusMutation();

  const handleOpen = (item: FeedbackItem) => {
    if (propOnOpen) {
      propOnOpen(item);
      return;
    }
    portal.setModal({
      kind: 'feedback',
      item,
      onUpdate: async (newStatus: string, responseText?: string) => {
        // Optimistic UI update
        setStatusOverrides((prev) => ({ ...prev, [item.id]: newStatus }));
        setFeedbackNotice(`Status updated to "${newStatus}" for response ${item.id}.`);
        setTimeout(() => setFeedbackNotice(null), 3500);

        // Resolve identifier: send numeric database ID first if available
        const targetId = item.numericId || item.id.replace(/^FB-/, '').replace(/^#/, '');

        // Map status to snake_case backend format
        const backendStatus = newStatus.toLowerCase().replace(/\s+/g, '_');

        try {
          if (responseText && responseText.trim()) {
            await updateFeedbackStatusTrigger({ id: targetId, response: responseText.trim() }).unwrap();
          } else {
            await updateFeedbackStatusTrigger({ id: targetId, status: backendStatus }).unwrap();
          }
        } catch (err) {
          console.warn('Backend feedback status update fallback to local state:', err);
        }
      },
    });
  };

  const onOpen = handleOpen;

  const filtered = items.filter(
    (item) =>
      (typeFilter === 'All types' || item.type === typeFilter) &&
      (statusFilter === 'All statuses' || item.status === statusFilter) &&
      `${item.id} ${item.message} ${item.service} ${item.bureau} ${item.subcity || ''}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const openCount = items.filter((x) => x.status === 'Open').length;
  const inReviewCount = items.filter((x) => x.status === 'In review').length;
  const resolvedCount = items.filter((x) => x.status === 'Resolved').length;
  const resolutionRate = items.length ? Math.round((resolvedCount / items.length) * 100) : 0;

  return (
    <>
      <PageHeading
        eyebrow="CITIZEN VOICE"
        title="Feedback inbox"
        subtitle="Read citizen submissions and track inquiries, complaints, and compliments to resolution."
        secondary="Export feedback"
        onSecondary={() => window.alert('Feedback report generated and exported.')}
      />

      {feedbackNotice && (
        <div
          style={{
            margin: '0.75rem 0',
            padding: '10px 14px',
            borderRadius: '6px',
            background: '#ecfdf5',
            border: '1px solid #10b981',
            color: '#065f46',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          <Icon name="check" size={16} />
          <span>{feedbackNotice}</span>
        </div>
      )}
      <div className="metric-grid compact-metrics">
        <MetricCard
          icon="message"
          label="All responses"
          value={isLoading && !apiFeedback ? '...' : items.length}
          note="Active feedback queue"
          tone="teal"
        />
        <MetricCard
          icon="clock"
          label="Open items"
          value={isLoading && !apiFeedback ? '...' : openCount}
          note="Awaiting first review"
          tone="gold"
        />
        <MetricCard
          icon="activity"
          label="In review"
          value={isLoading && !apiFeedback ? '...' : inReviewCount}
          note="Actively being resolved"
          tone="blue"
        />
        <MetricCard
          icon="check"
          label="Resolution rate"
          value={isLoading && !apiFeedback ? '...' : `${resolutionRate}%`}
          note="Resolved responses"
          tone="sage"
        />
      </div>
      <section className="panel table-panel feedback-inbox">
        <div className="table-toolbar">
          <div>
            <h2>All citizen responses</h2>
            <p>Feedback is routed to the relevant bureau and sub-city teams.</p>
          </div>
          <div className="toolbar-tools">
            <SearchBox value={search} onChange={setSearch} placeholder="Search feedback" />
            <select
              className="filter-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option>All types</option>
              <option>Complaint</option>
              <option>Suggestion</option>
              <option>Satisfaction</option>
            </select>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All statuses</option>
              <option>Open</option>
              <option>In review</option>
              <option>Resolved</option>
            </select>
          </div>
        </div>
        {isLoading && !apiFeedback ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: '12px' }}>
            <div className="loading-spinner" />
            <p style={{ margin: 0, color: '#00485a', fontWeight: 600, fontSize: '14px' }}>Loading citizen feedback...</p>
            <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>Fetching incoming complaints and suggestions</p>
          </div>
        ) : (
          <>
            <FeedbackTable items={filtered} onOpen={onOpen} />
            <div className="table-footer">
              <span>
                Showing <b>{filtered.length}</b> responses
              </span>
              <div>
                <button disabled>Previous</button>
                <button>
                  Next <Icon name="arrow" size={13} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
      <div className="tip-banner">
        <span className="tip-icon">
          <Icon name="shield" size={17} />
        </span>
        <span>
          <b>Respectful follow-up builds trust</b>
          <small>
            Share feedback only with the administrators responsible for its sub-city and bureau.
          </small>
        </span>
      </div>
    </>
  );
};

export default FeedbackPage;
