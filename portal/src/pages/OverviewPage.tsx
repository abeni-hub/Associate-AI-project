import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortal } from '../context';
import { Icon } from '../components/shared/Icon';
import { MetricCard } from '../components/shared/MetricCard';
import ActivityChart from '../components/overview/ActivityChart.jsx';
import SatisfactionPanel from '../components/overview/SatisfactionPanel.jsx';
import FeedbackFocusList from '../components/overview/FeedbackFocusList.jsx';
import QuickActions from '../components/overview/QuickActions.jsx';
import { ROLE } from '../data/portalData.js';
import type { FeedbackItem, RoleKey } from '../types/portal.types';

export interface OverviewPageProps {
  role?: RoleKey | string;
  onNavigate?: (path: string) => void;
  feedback?: FeedbackItem[];
  onFeedback?: (item: FeedbackItem) => void;
  onCreate?: (targetPage?: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  role: propRole,
  onNavigate: propOnNavigate,
  feedback: propFeedback,
  onFeedback: propOnFeedback,
  onCreate: propOnCreate,
}) => {
  const portal = usePortal();
  const navigate = useNavigate();
  const [period, setPeriod] = useState('This week');

  const role = (propRole || portal.role || 'super') as RoleKey;
  const onNavigate = propOnNavigate || ((path: string) => navigate(path.startsWith('/') ? path : `/${path}`));
  const feedback = propFeedback || portal.feedback || [];
  const onFeedback = propOnFeedback || ((item: FeedbackItem) => portal.openFeedback(item));
  const onCreate =
    propOnCreate ||
    (() => {
      const target = role === 'super' ? 'subcities' : role === 'subcity' ? 'bureaus' : 'routes';
      portal.createForPage?.(target);
    });

  const info =
    role === 'super'
      ? {
          title: 'Good morning, Mekdes',
          subtitle: 'Here’s the latest across the citizen service platform.',
          metrics: [
            ['map', 'Sub-cities', '11', 'All city administrations', ''],
            ['building', 'Bureaus', '86', 'Across all sub-cities', ''],
            ['layers', 'Published services', '248', '12 added this month', '12%'],
            ['message', 'Feedback to review', '156', '23 need attention', ''],
          ],
        }
      : role === 'subcity'
        ? {
            title: 'Good morning, Aster',
            subtitle: 'Here’s what’s happening across Lemi Kura today.',
            metrics: [
              ['building', 'Active bureaus', '9', 'All bureau offices', ''],
              ['layers', 'Service guides', '32', '28 published to citizens', '8%'],
              ['message', 'Feedback this month', '284', '18% more than September', '18%'],
              ['clock', 'Needs your review', '8', '2 high-priority items', ''],
            ],
          }
        : {
            title: 'Good morning, Dawit',
            subtitle: 'A clear view of your office services and citizen experience.',
            metrics: [
              ['layers', 'Service guides', '8', '6 published to citizens', ''],
              ['route', 'Room routes', '6', '1 route needs an update', ''],
              ['message', 'Feedback this month', '64', '12% more than September', '12%'],
              ['clock', 'Needs your review', '5', '1 high-priority item', ''],
            ],
          };

  const quick =
    role === 'super'
      ? [
          { text: 'Add a sub-city', icon: 'map', page: 'subcities' },
          { text: 'Create an account', icon: 'users', page: 'accounts' },
          { text: 'Review feedback', icon: 'message', page: 'feedback' },
        ]
      : role === 'subcity'
        ? [
            { text: 'Add a bureau', icon: 'building', page: 'bureaus' },
            { text: 'Create a service', icon: 'layers', page: 'services' },
            { text: 'Post an update', icon: 'news', page: 'news' },
          ]
        : [
            { text: 'Update a room route', icon: 'route', page: 'routes' },
            { text: 'Review feedback', icon: 'message', page: 'feedback' },
            { text: 'Open QR codes', icon: 'qr', page: 'qr' },
          ];

  const focus =
    role === 'super'
      ? feedback.filter((f) => f.status !== 'Resolved').slice(0, 3)
      : feedback
          .filter(
            (f) =>
              f.status !== 'Resolved' &&
              (role === 'subcity'
                ? f.subcity === 'Lemi Kura'
                : f.bureau === 'Revenues Bureau' && f.subcity === 'Lemi Kura')
          )
          .slice(0, 3);

  const roleMeta = ROLE[role] || ROLE.super;

  return (
    <>
      <div className="page-heading dashboard-heading">
        <div>
          <span className="eyebrow page-eyebrow">
            <span className="eyebrow-line" />
            THURSDAY, OCTOBER 22, 2026
          </span>
          <h1>
            {info.title}
            <span>.</span>
          </h1>
          <p>{info.subtitle}</p>
        </div>
        <div className="heading-actions">
          <button
            className="button secondary"
            onClick={() => window.alert('Dashboard report is ready in this preview.')}
          >
            <Icon name="download" size={16} /> Export report
          </button>
          <button className="button primary" onClick={() => onCreate()}>
            <Icon name="plus" size={16} />{' '}
            {role === 'super'
              ? 'New sub-city'
              : role === 'subcity'
                ? 'Add a bureau'
                : 'Update room route'}
          </button>
        </div>
      </div>
      <section className="metric-grid">
        {info.metrics.map(([icon, label, value, note, trend], i) => (
          <MetricCard
            key={label}
            icon={icon}
            label={label}
            value={value}
            note={note}
            trend={trend}
            tone={(['teal', 'sage', 'gold', 'blue'] as const)[i]}
          />
        ))}
      </section>
      <section className="dashboard-grid">
        <article className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">PLATFORM PULSE</span>
              <h2>Citizen engagement</h2>
            </div>
            <button
              className="select-like"
              onClick={() =>
                setPeriod((current) => (current === 'This week' ? 'Last week' : 'This week'))
              }
            >
              {period} <Icon name="chevron" size={14} />
            </button>
          </div>
          <ActivityChart period={period} />
        </article>
        <SatisfactionPanel onNavigate={onNavigate} />
      </section>
      <section className="dashboard-grid lower-grid">
        <FeedbackFocusList items={focus} onFeedback={onFeedback} onNavigate={onNavigate} />
        <QuickActions items={quick} onNavigate={onNavigate} onCreate={onCreate} />
      </section>
      <p className="data-footnote">
        This dashboard shows illustrative sample information for the{' '}
        {roleMeta.label.toLowerCase()} workspace.
      </p>
    </>
  );
};

export default OverviewPage;
