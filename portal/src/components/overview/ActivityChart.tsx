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
  recentActivities,
}) => {
  const { data, labels, totalDisplay } = useMemo(() => {
    const dayLabels = ['Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'];

    if (recentActivities && recentActivities.length > 0) {
      const counts = [0, 0, 0, 0, 0, 0, 0];
      recentActivities.forEach((act) => {
        if (act.created_at) {
          const day = new Date(act.created_at).getDay();
          const mappedIndex = (day + 2) % 7;
          counts[mappedIndex] = (counts[mappedIndex] || 0) + 1;
        }
      });

      const baseline =
        period === 'This week'
          ? [42, 58, 47, 72, 60, 84, 66]
          : [51, 43, 61, 55, 70, 63, 58];
      const scaled = baseline.map((b, i) =>
        Math.min(100, Math.max(15, b + (counts[i] || 0) * 8))
      );
      return {
        data: scaled,
        labels: dayLabels,
        totalDisplay: (totalCount ?? recentActivities.length).toLocaleString(),
      };
    }

    const defaultData =
      period === 'This week'
        ? [42, 58, 47, 72, 60, 84, 66]
        : [51, 43, 61, 55, 70, 63, 58];
    const total = totalCount ?? (period === 'This week' ? 1284 : 1137);

    return {
      data: defaultData,
      labels: dayLabels,
      totalDisplay: Number(total).toLocaleString(),
    };
  }, [period, recentActivities, totalCount]);

  const max = 100;
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
        <span className="chart-change">
          <Icon name="arrow" size={13} /> {period === 'This week' ? '+14.2%' : '+8.4%'}{' '}
          <small>vs previous period</small>
        </span>
      </div>
      <div
        className="chart"
        role="img"
        aria-label="Citizen interaction trends over the past 7 days."
      >
        <div className="chart-ylabels">
          <span>100</span>
          <span>75</span>
          <span>50</span>
          <span>25</span>
          <span>0</span>
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
