import React from 'react';
import { Icon } from '../../shared';

interface NewsOverviewMetricsProps {
  totalCount: number;
  publishedCount: number;
  eventCount: number;
}

export const NewsOverviewMetrics: React.FC<NewsOverviewMetricsProps> = ({
  totalCount,
  publishedCount,
  eventCount,
}) => {
  return (
    <section className="feed-overview" aria-label="Public client feed status">
      <div className="feed-overview-intro">
        <div className="feed-overview-heading">
          <span className="feed-overview-icon">
            <Icon name="news" size={20} />
          </span>
          <div>
            <span className={'feed-live-status' + (publishedCount ? '' : ' is-empty')}>
              <i /> Public client feed
            </span>
            <h2>Updates residents can use</h2>
          </div>
        </div>
        <p>
          Published notices appear in the client app. Preview each update in English and Amharic before it goes live.
        </p>
      </div>
      <dl className="feed-overview-stats">
        <div>
          <dt>Total updates</dt>
          <dd>{totalCount}</dd>
        </div>
        <div>
          <dt>Published</dt>
          <dd>{publishedCount}</dd>
        </div>
        <div>
          <dt>Published events</dt>
          <dd>{eventCount}</dd>
        </div>
      </dl>
    </section>
  );
};

