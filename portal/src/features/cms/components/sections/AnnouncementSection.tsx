import React from 'react';
import { CmsFlowFooter } from '../CmsFlowFooter';

export interface AnnouncementSectionProps {
  cms: any;
  copyLang: 'en' | 'am';
  getFieldVal: (section: string, field: string) => any;
  setFieldVal: (section: string, field: string, val: any) => void;
  updateSection: (section: string, key: string, val: any) => void;
  setActiveTab: (tabId: string) => void;
  handlePublish: () => void;
  isPublishing: boolean;
}

export const AnnouncementSection: React.FC<AnnouncementSectionProps> = ({
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
          <h3>Emergency & public notice banner</h3>
          <p>Displays at the very top of the citizen portal above the header navigation.</p>
        </div>
        <label className="cms-toggle-label">
          <input
            type="checkbox"
            checked={Boolean(cms.announcement?.enabled)}
            onChange={(e) => updateSection('announcement', 'enabled', e.target.checked)}
          />
          <span>{cms.announcement?.enabled ? 'Visible' : 'Hidden'}</span>
        </label>
      </div>

      <div className="cms-fields-grid">
        <label className="modal-field full">
          <span>Notice message {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
          <input
            value={getFieldVal('announcement', 'message')}
            placeholder={copyLang === 'am' ? 'የማስታወቂያውን መልእክት ያስገቡ' : 'Enter announcement text shown to citizens'}
            onChange={(e) => setFieldVal('announcement', 'message', e.target.value)}
          />
        </label>

        <label className="modal-field">
          <span>Link button text {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
          <input
            value={getFieldVal('announcement', 'linkText')}
            placeholder={copyLang === 'am' ? 'ለምሳሌ፡ መመሪያውን ይመልከቱ' : 'e.g. Explore the guide'}
            onChange={(e) => setFieldVal('announcement', 'linkText', e.target.value)}
          />
        </label>

        <label className="modal-field">
          <span>Link target URL or hash</span>
          <input
            value={cms.announcement?.linkUrl || ''}
            placeholder="e.g. #find-service or /services"
            onChange={(e) => updateSection('announcement', 'linkUrl', e.target.value)}
          />
        </label>
      </div>

      <CmsFlowFooter
        currentTabId="announcement"
        setActiveTab={setActiveTab}
        handlePublish={handlePublish}
        isPublishing={isPublishing}
      />
    </div>
  );
};

export default AnnouncementSection;

