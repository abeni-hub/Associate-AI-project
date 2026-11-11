import React, { useMemo } from 'react';
import Icon from '../ui/Icon.jsx';
import type { FeedbackReportData, DashboardFeedbackOverview } from '../../services/dashboardApi';

export interface SatisfactionPanelProps {
  onNavigate: (path: string) => void;
  feedbackReport?: FeedbackReportData;
  feedbackOverview?: DashboardFeedbackOverview;
}

export const SatisfactionPanel: React.FC<SatisfactionPanelProps> = ({
  onNavigate,
  feedbackReport,
  feedbackOverview,
}) => {
  const summary = feedbackReport?.summary;
  const breakdown = feedbackReport?.type_breakdown;

  const totalFeedback = summary?.total_feedback ?? feedbackOverview?.total ?? 0;
  const satisfactionCount = summary?.satisfaction_count ?? feedbackOverview?.by_type?.satisfaction ?? 0;
  const generalCount = summary?.general_feedback_count ?? feedbackOverview?.by_type?.feedback ?? 0;
  const complaintsCount = summary?.complaints_count ?? feedbackOverview?.by_type?.complaint ?? 0;

  // Calculate dynamic average score from real backend report data ONLY
  const score = totalFeedback > 0
    ? Math.min(5.0, Math.max(1.0, (satisfactionCount * 5 + generalCount * 4 + complaintsCount * 2) / totalFeedback)).toFixed(1)
    : '—';

  // Stars rendering
  const numericScore = parseFloat(score);
  const fullStars = isNaN(numericScore) ? 0 : Math.round(numericScore);
  const starString = totalFeedback > 0
    ? '★'.repeat(fullStars) + '☆'.repeat(Math.max(0, 5 - fullStars))
    : '☆☆☆☆☆';

  // Determine distribution bars from real backend breakdown ONLY (no mock fallbacks)
  const ratingBars = useMemo(() => {
    if (breakdown && breakdown.length > 0) {
      return breakdown.map((item) => ({
        label: item.label,
        percentage: Math.round(item.percentage || 0),
        count: item.count,
      }));
    }

    if (totalFeedback > 0) {
      const satPct = Math.round((satisfactionCount / totalFeedback) * 100);
      const genPct = Math.round((generalCount / totalFeedback) * 100);
      const compPct = Math.max(0, 100 - satPct - genPct);

      return [
        { label: 'Satisfaction', percentage: satPct, count: satisfactionCount },
        { label: 'General feedback', percentage: genPct, count: generalCount },
        { label: 'Complaints', percentage: compPct, count: complaintsCount },
      ];
    }

    return [
      { label: 'Satisfaction', percentage: 0, count: 0 },
      { label: 'General feedback', percentage: 0, count: 0 },
      { label: 'Complaints', percentage: 0, count: 0 },
    ];
  }, [breakdown, totalFeedback, satisfactionCount, generalCount, complaintsCount]);

  return (
    <article className="panel satisfaction-panel">
      <div className="panel-heading">
        <div>
          <span className="panel-eyebrow">CITIZEN SENTIMENT</span>
          <h2>Service satisfaction</h2>
        </div>
        <span className="subtle-icon">
          <Icon name="message" size={17} />
        </span>
      </div>
      <div className="satisfaction-score">
        <strong>{score}</strong>
        {totalFeedback > 0 && <span className="score-out-of">/ 5</span>}
        <span className="score-stars" aria-label={`Rating: ${score} out of 5`}>
          {starString}
        </span>
      </div>
      <p className="satisfaction-copy">
        {totalFeedback > 0
          ? `Based on ${totalFeedback} citizen submission${totalFeedback === 1 ? '' : 's'} from live backend`
          : 'No citizen feedback recorded in database yet'}
      </p>
      <div className="rating-bars">
        {ratingBars.map(({ label, percentage, count }) => (
          <div className="rating-row" key={label}>
            <span>{label}</span>
            <div className="rating-track">
              <i style={{ width: `${Math.min(100, percentage)}%` }} />
            </div>
            <small>{percentage}%{count > 0 ? ` (${count})` : ''}</small>
          </div>
        ))}
      </div>
      <button className="panel-link" onClick={() => onNavigate('feedback')}>
        Explore citizen feedback <Icon name="arrow" size={15} />
      </button>
    </article>
  );
};

export default SatisfactionPanel;
