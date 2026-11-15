import React, { useMemo } from 'react';
import { Icon } from '../../shared';
import type { DashboardSatisfactionPanelProps } from '../types/dashboard.types';
import styles from '../styles/satisfactionPanel.module.css';

export const DashboardSatisfactionPanel: React.FC<DashboardSatisfactionPanelProps> = ({
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

  const score =
    totalFeedback > 0
      ? Math.min(
          5.0,
          Math.max(1.0, (satisfactionCount * 5 + generalCount * 4 + complaintsCount * 2) / totalFeedback)
        ).toFixed(1)
      : '—';

  const numericScore = parseFloat(score);
  const fullStars = isNaN(numericScore) ? 0 : Math.round(numericScore);
  const starString =
    totalFeedback > 0
      ? '★'.repeat(fullStars) + '☆'.repeat(Math.max(0, 5 - fullStars))
      : '☆☆☆☆☆';

  const ratingBars = useMemo(() => {
    if (breakdown?.length) {
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
    <article className={styles.panel}>
      <div className={styles.panelHeading}>
        <div>
          <span className={styles.eyebrow}>CITIZEN SENTIMENT</span>
          <h2 className={styles.title}>Service satisfaction</h2>
        </div>
        <span className={styles.subtleIcon}>
          <Icon name="message" size={17} />
        </span>
      </div>

      <div className={styles.satisfactionScore}>
        <strong>{score}</strong>
        {totalFeedback > 0 && <span className={styles.scoreOutOf}>/ 5</span>}
        <span className={styles.scoreStars} aria-label={`Rating: ${score} out of 5`}>
          {starString}
        </span>
      </div>
      <p className={styles.satisfactionCopy}>Based on verified citizen feedback and ratings.</p>

      <div className={styles.ratingBars}>
        {ratingBars.map((bar) => (
          <div key={bar.label} className={styles.ratingRow}>
            <span>{bar.label}</span>
            <div className={styles.ratingTrack}>
              <i className={styles.ratingFill} style={{ width: `${bar.percentage}%` }} />
            </div>
            <small className={styles.ratingCount}>
              {bar.count} ({bar.percentage}%)
            </small>
          </div>
        ))}
      </div>

      <button className={styles.panelLink} onClick={() => onNavigate('feedback')} type="button">
        Explore sentiment analytics <Icon name="arrow" size={15} />
      </button>
    </article>
  );
};

export default DashboardSatisfactionPanel;

