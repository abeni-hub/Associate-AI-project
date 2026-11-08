import React from 'react';
import { Icon } from './Icon';

export interface ActivityChartProps {
  period: string;
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ period }) => {
  const data = period === 'This week' ? [42, 58, 47, 72, 60, 84, 66] : [51, 43, 61, 55, 70, 63, 58];
  const labels = ['Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
  const max = 100;

  return (
    <div className="chart-wrap">
      <div className="chart-summary">
        <div>
          <span className="chart-total">{period === 'This week' ? '1,284' : '1,137'}</span>
          <span className="chart-period">responses {period.toLowerCase()}</span>
        </div>
        <span className="chart-change">
          <Icon name="arrow" size={13} /> {period === 'This week' ? '12.8%' : '8.4%'}{' '}
          <small>vs previous week</small>
        </span>
      </div>
      <div className="chart" role="img" aria-label="Feedback responses increased through Wednesday, with a slight dip today.">
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
            <path
              d={data.map((n, i) => `${i ? 'L' : 'M'} ${(i / (data.length - 1)) * 680 + 10} ${170 - (n / max) * 155}`).join(' ') + ' L 690 182 L 10 182 Z'}
              fill="url(#chartFill)"
            />
            <path
              d={data.map((n, i) => `${i ? 'L' : 'M'} ${(i / (data.length - 1)) * 680 + 10} ${170 - (n / max) * 155}`).join(' ')}
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
