import React from 'react';
import { Icon } from '../../shared';
import { CMS_SECTIONS } from '../constants';

export interface CmsFlowFooterProps {
  currentTabId: string;
  setActiveTab: (tabId: string) => void;
  handlePublish: () => void;
  isPublishing: boolean;
}

export const CmsFlowFooter: React.FC<CmsFlowFooterProps> = ({
  currentTabId,
  setActiveTab,
  handlePublish,
  isPublishing,
}) => {
  const currentIndex = CMS_SECTIONS.findIndex((s) => s.id === currentTabId);
  const prevSection = currentIndex > 0 ? CMS_SECTIONS[currentIndex - 1] : null;
  const nextSection = currentIndex < CMS_SECTIONS.length - 1 ? CMS_SECTIONS[currentIndex + 1] : null;

  return (
    <div className="cms-tab-flow-footer">
      {prevSection ? (
        <button
          type="button"
          className="button secondary small-button"
          onClick={() => setActiveTab(prevSection.id)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Icon name="arrow" size={13} className="flip-horizontal" />
          <span>Back: {prevSection.label}</span>
        </button>
      ) : (
        <div />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
          Section {currentIndex + 1} of {CMS_SECTIONS.length}
        </span>
        {nextSection ? (
          <button
            type="button"
            className="button secondary small-button"
            onClick={() => setActiveTab(nextSection.id)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
          >
            <span>Next: {nextSection.label}</span>
            <Icon name="arrow" size={13} />
          </button>
        ) : (
          <button
            type="button"
            className="button primary small-button"
            onClick={handlePublish}
            disabled={isPublishing}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Icon name="check" size={13} />
            <span>{isPublishing ? 'Publishing...' : 'Save & publish all'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default CmsFlowFooter;

