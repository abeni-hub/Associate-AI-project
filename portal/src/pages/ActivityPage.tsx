import React from 'react';
import { PageHeading } from '../components/shared/PageHeading';
import { Icon } from '../components/shared/Icon';

export const ActivityPage: React.FC = () => {
  const events: [string, string, string, string][] = [
    ['Today · 10:14 AM', 'Service standard published', 'Business license renewal · Lemi Kura', 'sage'],
    ['Today · 9:42 AM', 'Sub-city admin signed in', 'Aster Bekele · Lemi Kura', 'teal'],
    ['Today · 9:24 AM', 'New complaint received', 'Feedback FB-2048 · Revenues Bureau', 'gold'],
    ['Yesterday · 4:06 PM', 'New bureau added', 'Planning & Development · Kirkos', 'blue'],
    ['Oct 20 · 2:31 PM', 'Account invitation created', 'Tewodros Kassa · Lemi Kura', 'teal'],
    ['Oct 20 · 11:18 AM', 'Citizen guide updated', 'Residence ID card · Yeka', 'sage'],
  ];

  return (
    <>
      <PageHeading
        eyebrow="PLATFORM OVERSIGHT"
        title="Activity log"
        subtitle="A clear record of the updates and access events across CivicLink."
        secondary="Download log"
        onSecondary={() => window.alert('Activity log download is ready in this preview.')}
      />
      <div className="panel activity-log">
        <div className="table-toolbar">
          <div>
            <h2>Recent platform activity</h2>
            <p>Showing updates from the past 30 days.</p>
          </div>
          <button className="button secondary small-button">
            <Icon name="filter" size={16} /> All activity
          </button>
        </div>
        <div className="log-list">
          {events.map(([time, title, detail, tone], i) => (
            <div className="log-item" key={`${title}-${i}`}>
              <span className={`log-icon ${tone}`}>
                <Icon
                  name={
                    title.includes('signed')
                      ? 'users'
                      : title.includes('complaint')
                        ? 'message'
                        : title.includes('Account')
                          ? 'lock'
                          : title.includes('bureau')
                            ? 'building'
                            : 'layers'
                  }
                  size={16}
                />
              </span>
              <div>
                <b>{title}</b>
                <p>{detail}</p>
              </div>
              <small>{time}</small>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
