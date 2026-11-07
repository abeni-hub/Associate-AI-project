import React, { useMemo } from 'react';
import Icon from '../ui/Icon.jsx';
import type { DashboardRecentActivityItem, FeedbackReportData } from '../../services/dashboardApi';

export interface ActivityChartProps {
  period: string;
  totalCount?: number;
  recentActivities?: DashboardRecentActivityItem[];
  feedbackReport?: FeedbackReportData;
}

export const ActivityChart: React.FC<ActivityChartProps> = ({
  period,
  totalCount,
  recentActivities = [],
  feedbackReport,
}) => {
  const { data, labels, totalDisplay, max, hasData } = useMemo(() => {
    // Generate the past 7 days up to today from real system time
    const dayLabels: string[] = [];
    const dateKeys: string[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      dayLabels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
      dateKeys.push(d.toISOString().slice(0, 10)); // YYYY-MM-DD
    }

    // Count real activities by date
    const counts = [0, 0, 0, 0, 0, 0, 0];
    let foundAny = false;

    // 1. From real recentActivities
    if (recentActivities && recentActivities.length > 0) {
      recentActivities.forEach((act) => {
        if (act.created_at) {
          const actDate = act.created_at.slice(0, 10);
          const idx = dateKeys.indexOf(actDate);
          if (idx !== -1) {
            counts[idx] = (counts[idx] || 0) + 1;
            foundAny = true;
          }
        }
      });
    }

    // 2. From real feedbackReport recent items if available
    if (feedbackReport?.recent_feedback && feedbackReport.recent_feedback.length > 0) {
      feedbackReport.recent_feedback.forEach((rf) => {
        if (rf.created_at) {
          const fbDate = rf.created_at.slice(0, 10);
          const idx = dateKeys.indexOf(fbDate);
          if (idx !== -1) {
            counts[idx] = (counts[idx] || 0) + 1;
            foundAny = true;
          }
        }
      });
    }

    // Actual total count strictly from backend
    const resolvedTotal = totalCount ?? (foundAny ? counts.reduce((a, b) => a + b, 0) : recentActivities.length);
    const calculatedMax = Math.max(...counts, 4);

    return {
      data: counts,
      labels: dayLabels,
      totalDisplay: resolvedTotal.toLocaleString(),
      max: calculatedMax,
      hasData: foundAny || resolvedTotal > 0,
    };
  }, [recentActivities, feedbackReport, totalCount]);

  const yLabels = [
    max,
    Math.round(max * 0.75),
    Math.round(max * 0.5),
    Math.round(max * 0.25),
    0,
  ];

  const pathD = data
    .map(
      (n, i) =>
        `${i ? 'L' : 'M'} ${(i / (data.length - 1)) * 680 + 10} ${
          170 - (n / max) * 155
        }`
    )
    .join(' ');

  return (
    <div className="chart-wrap">
      <div className="chart-summary">
        <div>
          <span className="chart-total">{totalDisplay}</span>
          <span className="chart-period">interactions {period.toLowerCase()}</span>
        </div>
        <span className="chart-change" style={{ color: hasData ? '#164a54' : '#64748b' }}>
          <Icon name="activity" size={13} />{' '}
          {hasData ? `${totalDisplay} logged in backend` : 'Live activity tracking'}
        </span>
      </div>
      <div
        className="chart"
        role="img"
        aria-label="Citizen interaction trends over the past 7 days from live backend."
      >
        <div className="chart-ylabels">
          {yLabels.map((yl, idx) => (
            <span key={idx}>{yl}</span>
          ))}
        </div>
        <div className="chart-plot">
          <div className="chart-grid">
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <svg viewBox="0 0 700 182" preserveAspectRatio="none" className="chart-svg">
            <defs>
              <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#76a6a5" stopOpacity=".24" />
                <stop offset="100%" stopColor="#76a6a5" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={`${pathD} L 690 182 L 10 182 Z`} fill="url(#chartFill)" />
            <path
              d={pathD}
              fill="none"
              stroke="#367b7d"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {data.map((n, i) => (
              <circle
                key={i}
                cx={(i / (data.length - 1)) * 680 + 10}
                cy={170 - (n / max) * 155}
                r="4"
                fill="#fff"
                stroke="#367b7d"
                strokeWidth="2.5"
              />
            ))}
          </svg>
          <div className="chart-xlabels">
            {labels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityChart;
