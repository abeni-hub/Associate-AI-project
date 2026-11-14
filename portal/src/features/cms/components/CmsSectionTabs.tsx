import React from 'react';
import { Icon } from '../../shared';
import { CMS_SECTIONS } from '../constants';

export interface CmsSectionTabsProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  cms: any;
}

export const CmsSectionTabs: React.FC<CmsSectionTabsProps> = ({
  activeTab,
  setActiveTab,
  cms,
}) => {
  return (
    <div className="cms-tabs-bar" role="tablist">
      {CMS_SECTIONS.map((sec) => (
        <button
          key={sec.id}
          type="button"
          role="tab"
          aria-selected={activeTab === sec.id}
          className={`cms-tab-btn${activeTab === sec.id ? ' active' : ''}`}
          onClick={() => setActiveTab(sec.id)}
        >
          <div className="tab-icon-wrapper">
            <Icon name={sec.icon} size={15} />
          </div>
          <div className="tab-label-group">
            <span className="tab-num">SEC {sec.num}</span>
            <span className="tab-title">{sec.label}</span>
          </div>
          {sec.id === 'announcement' && cms.announcement?.enabled && (
            <span className="tab-badge-indicator" title="Active banner" />
          )}
          {sec.id === 'hero' && (
            <span className="tab-counter-pill">{cms.hero?.slides?.length || 0}</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default CmsSectionTabs;

