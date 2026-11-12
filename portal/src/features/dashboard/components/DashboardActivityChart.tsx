import React, { useMemo } from 'react';
import { Icon } from '../../shared';
import type { DashboardActivityChartProps } from '../types/dashboard.types';
import styles from '../styles/activityChart.module.css';

export const DashboardActivityChart: React.FC<DashboardActivityChartProps> = ({
  period,
  totalCount,
  recentActivities = [],
  feedbackReport,
  onTogglePeriod,
}) => {
  const { data, labels, totalDisplay, max, hasData } = useMemo(() => {
    const dayLabels: string[] = [];
    const dateKeys: string[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      dayLabels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
      dateKeys.push(d.toISOString().slice(0, 10));
    }

    const counts = [0, 0, 0, 0, 0, 0, 0];
    let foundAny = false;

    if (recentActivities?.length) {
      recentActivities.forEach((act) => {
        if (act.created_at) {
          const idx = dateKeys.indexOf(act.created_at.slice(0, 10));
          if (idx !== -1) {
            counts[idx] = (counts[idx] || 0) + 1;
            foundAny = true;
          }
        }
      });
    }

    if (feedbackReport?.recent_feedback?.length) {
      feedbackReport.recent_feedback.forEach((rf) => {
        if (rf.created_at) {
          const idx = dateKeys.indexOf(rf.created_at.slice(0, 10));
          if (idx !== -1) {
            counts[idx] = (counts[idx] || 0) + 1;
            foundAny = true;
          }
        }
      });
    }

    const resolvedTotal =
      totalCount ?? (foundAny ? counts.reduce((a, b) => a + b, 0) : recentActivities.length);
    const calculatedMax = Math.max(...counts, 4);

    return {
      data: counts,
      labels: dayLabels,
      totalDisplay: resolvedTotal.toLocaleString(),
      max: calculatedMax,
      hasData: foundAny || resolvedTotal > 0,
    };
  }, [recentActivities, feedbackReport, totalCount]);

  const yLabels = [max, Math.round(max * 0.75), Math.round(max * 0.5), Math.round(max * 0.25), 0];
  const pathD = data
    .map((n, i) => `${i ? 'L' : 'M'} ${(i / (data.length - 1)) * 680 + 10} ${170 - (n / max) * 155}`)
    .join(' ');

  return (
    <article className={styles.panel}>
      <div className={styles.panelHeading}>
        <div>
          <span className={styles.eyebrow}>PLATFORM PULSE</span>
          <h2 className={styles.title}>Citizen engagement</h2>
        </div>
        <button className={styles.periodButton} onClick={onTogglePeriod} type="button">
          {period} <Icon name="chevron" size={14} />
        </button>
      </div>

      <div className={styles.chartWrap}>
        <div className={styles.chartSummary}>
          <div>
            <span className={styles.chartTotal}>{totalDisplay}</span>
            <span className={styles.chartPeriod}>interactions {period.toLowerCase()}</span>
          </div>
          <span className={styles.chartChange} style={{ color: hasData ? '#164a54' : '#64748b' }}>
            <Icon name="activity" size={13} />{' '}
            {hasData ? `${totalDisplay} logged in backend` : 'Live activity tracking'}
          </span>
        </div>

        <div className={styles.chart} role="img" aria-label="Citizen interaction trends">
          <div className={styles.chartYlabels}>
            {yLabels.map((yl, idx) => (
              <span key={idx}>{yl}</span>
            ))}
          </div>
          <div className={styles.chartPlot}>
            <div className={styles.chartGrid}>
              <i /><i /><i /><i /><i />
            </div>
            <svg viewBox="0 0 700 182" preserveAspectRatio="none" className={styles.chartSvg}>
              <defs>
                <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#76a6a5" stopOpacity=".24" />
                  <stop offset="100%" stopColor="#76a6a5" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={`${pathD} L 690 182 L 10 182 Z`} fill="url(#chartFill)" />
              <path d={pathD} fill="none" stroke="#367b7d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
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
            <div className={styles.chartXlabels}>
              {labels.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default DashboardActivityChart;

