import React from 'react';
import { CmsFlowFooter } from '../CmsFlowFooter';

export interface NewsEventsSectionProps {
  cms: any;
  copyLang: 'en' | 'am';
  getFieldVal: (section: string, field: string) => any;
  setFieldVal: (section: string, field: string, val: any) => void;
  updateSection: (section: string, key: string, val: any) => void;
  setActiveTab: (tabId: string) => void;
  handlePublish: () => void;
  isPublishing: boolean;
}

export const NewsEventsSection: React.FC<NewsEventsSectionProps> = ({
  cms,
  copyLang,
  getFieldVal,
  setFieldVal,
  updateSection,
  setActiveTab,
  handlePublish,
  isPublishing,
}) => {
  return (
    <div className="cms-tab-pane">
      <div className="form-section-header">
        <div>
          <h3>Community news & events highlights</h3>
          <p>Configuration for the public community announcements section on the citizen home page.</p>
        </div>
        <label className="cms-toggle-label">
          <input
            type="checkbox"
            checked={Boolean(cms.newsEvents?.enabled !== false)}
            onChange={(e) => updateSection('newsEvents', 'enabled', e.target.checked)}
          />
          <span>{cms.newsEvents?.enabled !== false ? 'Visible' : 'Hidden'}</span>
        </label>
      </div>

      <div className="cms-fields-grid">
        <label className="modal-field">
          <span>Section step number</span>
          <input
            value={cms.newsEvents?.kickerNum || '04'}
            onChange={(e) => updateSection('newsEvents', 'kickerNum', e.target.value)}
          />
        </label>

        <label className="modal-field">
          <span>Section kicker {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
          <input
            value={getFieldVal('newsEvents', 'kicker')}
            placeholder={copyLang === 'am' ? 'ከማህበረሰብዎ' : 'FROM YOUR COMMUNITY'}
            onChange={(e) => setFieldVal('newsEvents', 'kicker', e.target.value)}
          />
        </label>

        <label className="modal-field full">
          <span>Section headline {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
          <input
            value={getFieldVal('newsEvents', 'title')}
            placeholder={copyLang === 'am' ? 'በአካባቢዎ ምን እየተከናወነ እንዳለ ይመልከቱ።' : 'What’s happening near you.'}
            onChange={(e) => setFieldVal('newsEvents', 'title', e.target.value)}
          />
        </label>

        <label className="modal-field">
          <span>Attribution source tag {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
          <input
            value={getFieldVal('newsEvents', 'sourceLabel')}
            placeholder={copyLang === 'am' ? 'በክፍለ ከተማ አስተዳዳሪዎች የታተመ' : 'Published by sub-city admins'}
            onChange={(e) => setFieldVal('newsEvents', 'sourceLabel', e.target.value)}
          />
        </label>

        <label className="modal-field">
          <span>Hub link text {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
          <input
            value={getFieldVal('newsEvents', 'viewAllText')}
            placeholder={copyLang === 'am' ? 'የዜና እና ሁነቶች ማዕከልን ይጎብኙ' : 'Explore news & events hub'}
            onChange={(e) => setFieldVal('newsEvents', 'viewAllText', e.target.value)}
          />
        </label>

        <label className="modal-field full">
          <span>Empty feed fallback message {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
          <input
            value={getFieldVal('newsEvents', 'emptyMessage')}
            placeholder={
              copyLang === 'am'
                ? 'ለዚህ ክፍለ ከተማ እስካሁን ምንም የተለጠፈ መረጃ የለም።'
                : 'No community updates published yet for this sub-city.'
            }
            onChange={(e) => setFieldVal('newsEvents', 'emptyMessage', e.target.value)}
          />
        </label>
      </div>

      <CmsFlowFooter
        currentTabId="newsEvents"
        setActiveTab={setActiveTab}
        handlePublish={handlePublish}
        isPublishing={isPublishing}
      />
    </div>
  );
};

export default NewsEventsSection;

