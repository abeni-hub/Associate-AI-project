import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortal } from '../context';
import { ROLE } from '../data/portalConstants';
import { Icon } from '../components/shared/Icon';
import { MetricCard } from '../components/shared/MetricCard';
import { ActivityChart } from '../components/shared/ActivityChart';
import { FeedbackTable } from '../components/shared/FeedbackTable';
import { TypePill } from '../components/shared/TypePill';

export const OverviewPage: React.FC = () => {
  const { role, visibleFeedback, openFeedback, createForPage } = usePortal();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<'This week' | 'Last week'>('This week');

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
          { text: 'Add a sub-city', icon: 'map', path: '/subcities', page: 'subcities' },
          { text: 'Create an account', icon: 'users', path: '/accounts', page: 'accounts' },
          { text: 'Review feedback', icon: 'message', path: '/feedback', page: 'feedback' },
        ]
      : role === 'subcity'
        ? [
            { text: 'Add a bureau', icon: 'building', path: '/bureaus', page: 'bureaus' },
            { text: 'Create a service', icon: 'layers', path: '/services', page: 'services' },
            { text: 'Post an update', icon: 'news', path: '/news', page: 'news' },
          ]
        : [
            { text: 'Update a room route', icon: 'route', path: '/routes', page: 'routes' },
            { text: 'Review feedback', icon: 'message', path: '/feedback', page: 'feedback' },
            { text: 'Open QR codes', icon: 'qr', path: '/qr', page: 'qr' },
          ];

  const focus =
    role === 'super'
      ? visibleFeedback.filter((f) => f.status !== 'Resolved').slice(0, 3)
      : visibleFeedback
          .filter(
            (f) =>
              f.status !== 'Resolved' &&
              (role === 'subcity'
                ? f.subcity === 'Lemi Kura'
                : f.bureau === 'Revenues Bureau' && f.subcity === 'Lemi Kura')
          )
          .slice(0, 3);

  const handleCreateHeader = () => {
    createForPage(role === 'super' ? 'subcities' : role === 'subcity' ? 'bureaus' : 'routes');
  };

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
          <button className="button primary" onClick={handleCreateHeader}>
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
            tone={['teal', 'sage', 'gold', 'blue'][i]}
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
        <article className="panel satisfaction-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">CITIZEN SENTIMENT</span>
              <h2>Service satisfaction</h2>
            </div>
            <span className="subtle-icon">
              <Icon name="spark" size={17} />
            </span>
          </div>
          <div className="satisfaction-score">
            <strong>4.6</strong>
            <span className="score-out-of">/ 5</span>
            <span className="score-stars">★★★★★</span>
          </div>
          <p className="satisfaction-copy">Average citizen rating from the last 30 days</p>
          <div className="rating-bars">
            {[
              ['5', 68],
              ['4', 19],
              ['3', 8],
              ['2', 3],
              ['1', 2],
            ].map(([n, width]) => (
              <div className="rating-row" key={n}>
                <span>
                  {n} <i>★</i>
                </span>
                <div className="rating-track">
                  <i style={{ width: `${width}%` }} />
                </div>
                <small>{width}%</small>
              </div>
            ))}
          </div>
          <button className="panel-link" onClick={() => navigate('/feedback')}>
            Explore citizen feedback <Icon name="arrow" size={15} />
          </button>
        </article>
      </section>

      <section className="dashboard-grid lower-grid">
        <article className="panel recent-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">VOICE OF THE COMMUNITY</span>
              <h2>Feedback needing attention</h2>
            </div>
            <button className="panel-link" onClick={() => navigate('/feedback')}>
              View all <Icon name="arrow" size={15} />
            </button>
          </div>
          <div className="focus-list">
            {focus.map((item) => (
              <button
                key={item.id}
                className="focus-item"
                onClick={() => openFeedback(item)}
              >
                <span className={`focus-type ${item.type.toLowerCase()}`}>
                  {item.type === 'Complaint' ? '!' : '↗'}
                </span>
                <span className="focus-copy">
                  <span>
                    <b>{item.id}</b>
                    <TypePill type={item.type} />
                  </span>
                  <p>{item.message}</p>
                  <small>
                    {item.bureau} · {item.time}
                  </small>
                </span>
                <span className={`priority-tag ${item.priority.toLowerCase()}`}>
                  {item.priority}
                </span>
              </button>
            ))}
            {focus.length === 0 && (
              <div className="quiet-state">
                <Icon name="check" />
                You’re all caught up.
              </div>
            )}
          </div>
        </article>
        <article className="panel quick-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">MOVE THINGS FORWARD</span>
              <h2>Quick actions</h2>
            </div>
          </div>
          <div className="quick-action-list">
            {quick.map((action) => (
              <button
                key={action.text}
                onClick={() => {
                  navigate(action.path);
                  if (
                    action.page === 'subcities' ||
                    action.page === 'bureaus' ||
                    action.page === 'services' ||
                    action.page === 'routes'
                  ) {
                    createForPage(action.page);
                  }
                }}
              >
                <span className="quick-action-icon">
                  <Icon name={action.icon} size={17} />
                </span>
                <b>{action.text}</b>
                <Icon name="arrow" size={15} />
              </button>
            ))}
          </div>
          <div className="quick-foot">
            <span className="online-indicator" /> All systems operational{' '}
            <span>Updated moments ago</span>
          </div>
        </article>
      </section>

      <section className="panel table-panel overview-table">
        <div className="panel-heading">
          <div>
            <span className="panel-eyebrow">LATEST RESPONSES</span>
            <h2>Recent citizen feedback</h2>
          </div>
          <button className="panel-link" onClick={() => navigate('/feedback')}>
            Open feedback inbox <Icon name="arrow" size={15} />
          </button>
        </div>
        <FeedbackTable items={visibleFeedback} onOpen={openFeedback} compact />
      </section>

      <p className="data-footnote">
        This dashboard shows illustrative sample information for the {ROLE[role].label.toLowerCase()}{' '}
        workspace.
      </p>
    </>
  );
};
