import React from 'react';
import { CmsFlowFooter } from '../CmsFlowFooter';

export interface QuickSearchSectionProps {
  cms: any;
  copyLang: 'en' | 'am';
  getFieldVal: (section: string, field: string) => any;
  setFieldVal: (section: string, field: string, val: any) => void;
  updateSection: (section: string, key: string, val: any) => void;
  setActiveTab: (tabId: string) => void;
  handlePublish: () => void;
  isPublishing: boolean;
}

export const QuickSearchSection: React.FC<QuickSearchSectionProps> = ({
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
          <h3>Quick search & service finder</h3>
          <p>The interactive location and bureau filter section where citizens begin their journey.</p>
        </div>
        <label className="cms-toggle-label">
          <input
            type="checkbox"
            checked={Boolean(cms.quickSearch?.enabled !== false)}
            onChange={(e) => updateSection('quickSearch', 'enabled', e.target.checked)}
          />
          <span>{cms.quickSearch?.enabled !== false ? 'Visible' : 'Hidden'}</span>
        </label>
      </div>

      <div className="cms-fields-grid">
        <label className="modal-field">
          <span>Section step number</span>
          <input
            value={cms.quickSearch?.kickerNum || '01'}
            onChange={(e) => updateSection('quickSearch', 'kickerNum', e.target.value)}
          />
        </label>

        <label className="modal-field">
          <span>Section kicker / overline {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
          <input
            value={getFieldVal('quickSearch', 'kicker')}
            placeholder={copyLang === 'am' ? 'ከዚህ ይጀምሩ' : 'START HERE'}
            onChange={(e) => setFieldVal('quickSearch', 'kicker', e.target.value)}
          />
        </label>

        <label className="modal-field full">
          <span>Section headline {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
          <input
            value={getFieldVal('quickSearch', 'title')}
            placeholder={copyLang === 'am' ? 'በምን ጉዳይ እንርዳዎ?' : 'What do you need help with?'}
            onChange={(e) => setFieldVal('quickSearch', 'title', e.target.value)}
          />
        </label>

        <label className="modal-field full">
          <span>Instructions / sub-lead {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
          <input
            value={getFieldVal('quickSearch', 'subtitle')}
            placeholder={
              copyLang === 'am'
                ? 'የጉብኝት መመሪያውን ለማየት አካባቢና አገልግሎት ይምረጡ።'
                : 'Choose a location and service to see your visit guide.'
            }
            onChange={(e) => setFieldVal('quickSearch', 'subtitle', e.target.value)}
          />
        </label>

        <label className="modal-field">
          <span>Search submit button text {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
          <input
            value={getFieldVal('quickSearch', 'buttonText')}
            placeholder={copyLang === 'am' ? 'መመሪያዬን አሳይ' : 'Show my guide'}
            onChange={(e) => setFieldVal('quickSearch', 'buttonText', e.target.value)}
          />
        </label>

        <label className="modal-field">
          <span>Footnote perks & reassurance {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
          <input
            value={getFieldVal('quickSearch', 'footnoteText')}
            placeholder={
              copyLang === 'am'
                ? 'ከአንድ ደቂቃ በታች ይወስዳል · መለያ መክፈት አያስፈልግም'
                : 'Takes less than a minute · No account needed'
            }
            onChange={(e) => setFieldVal('quickSearch', 'footnoteText', e.target.value)}
          />
        </label>
      </div>

      <CmsFlowFooter
        currentTabId="quickSearch"
        setActiveTab={setActiveTab}
        handlePublish={handlePublish}
        isPublishing={isPublishing}
      />
    </div>
  );
};

export default QuickSearchSection;

