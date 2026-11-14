import React from 'react';
import { CmsFlowFooter } from '../CmsFlowFooter';

export interface ServiceGuideSectionProps {
  cms: any;
  copyLang: 'en' | 'am';
  getFieldVal: (section: string, field: string) => any;
  setFieldVal: (section: string, field: string, val: any) => void;
  updateSection: (section: string, key: string, val: any) => void;
  setActiveTab: (tabId: string) => void;
  handlePublish: () => void;
  isPublishing: boolean;
}

export const ServiceGuideSection: React.FC<ServiceGuideSectionProps> = ({
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
          <h3>Service guide & room-by-room route</h3>
          <p>The sample visit guide preview showing requirements checklist and room directions.</p>
        </div>
        <label className="cms-toggle-label">
          <input
            type="checkbox"
            checked={Boolean(cms.serviceGuide?.enabled !== false)}
            onChange={(e) => updateSection('serviceGuide', 'enabled', e.target.checked)}
          />
          <span>{cms.serviceGuide?.enabled !== false ? 'Visible' : 'Hidden'}</span>
        </label>
      </div>

      <div className="cms-fields-grid">
        <label className="modal-field">
          <span>Section step number</span>
          <input
            value={cms.serviceGuide?.kickerNum || '02'}
            onChange={(e) => updateSection('serviceGuide', 'kickerNum', e.target.value)}
          />
        </label>

        <label className="modal-field">
          <span>Section kicker badge {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
          <input
            value={getFieldVal('serviceGuide', 'kicker')}
            placeholder={copyLang === 'am' ? 'የጉብኝት መመሪያዎ' : 'YOUR VISIT GUIDE'}
            onChange={(e) => setFieldVal('serviceGuide', 'kicker', e.target.value)}
          />
        </label>

        <label className="modal-field">
          <span>Title lead {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
          <input
            value={getFieldVal('serviceGuide', 'titleLead')}
            placeholder={copyLang === 'am' ? 'ግልጽ መንገድ፣' : 'A clearer path,'}
            onChange={(e) => setFieldVal('serviceGuide', 'titleLead', e.target.value)}
          />
        </label>

        <label className="modal-field">
          <span>Title emphasis {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
          <input
            value={getFieldVal('serviceGuide', 'titleEmphasis')}
            placeholder={copyLang === 'am' ? 'ደረጃ በደረጃ።' : 'step by step.'}
            onChange={(e) => setFieldVal('serviceGuide', 'titleEmphasis', e.target.value)}
          />
        </label>

        <label className="modal-field full">
          <span>Section introduction description {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
          <textarea
            rows={2}
            value={getFieldVal('serviceGuide', 'description')}
            placeholder={
              copyLang === 'am'
                ? 'ከመነሳትዎ በፊት ምን እንደሚያመጡና ወደ የትኛው ክፍል እንደሚሄዱ ይወቁ።'
                : 'Know what to bring and which room to visit, before you set off.'
            }
            onChange={(e) => setFieldVal('serviceGuide', 'description', e.target.value)}
          />
        </label>

        <label className="modal-field">
          <span>Sample guide badge label {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
          <input
            value={getFieldVal('serviceGuide', 'sampleBadgeText')}
            placeholder={copyLang === 'am' ? 'የመመሪያ ምሳሌ' : 'SAMPLE GUIDE'}
            onChange={(e) => setFieldVal('serviceGuide', 'sampleBadgeText', e.target.value)}
          />
        </label>

        <label className="modal-field">
          <span>Requirements checklist heading {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
          <input
            value={getFieldVal('serviceGuide', 'whatToBringTitle')}
            placeholder={copyLang === 'am' ? 'ማምጣት ያለብዎት' : 'What to bring'}
            onChange={(e) => setFieldVal('serviceGuide', 'whatToBringTitle', e.target.value)}
          />
        </label>

        <label className="modal-field full">
          <span>Document expectations note {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
          <input
            value={getFieldVal('serviceGuide', 'expectationsNote')}
            placeholder={
              copyLang === 'am'
                ? 'የዋና ሰነዶችን ካሉ ይዘው ይምጡ። መስፈርቶቹ መቀየራቸውን ከቢሮው ያረጋግጡ።'
                : 'Bring original documents where available. Ask the bureau if requirements have changed.'
            }
            onChange={(e) => setFieldVal('serviceGuide', 'expectationsNote', e.target.value)}
          />
        </label>

        <label className="modal-field full">
          <span>Route panel heading {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
          <input
            value={getFieldVal('serviceGuide', 'routeHeading')}
            placeholder={copyLang === 'am' ? 'በቢሮው ውስጥ የሚከተሉት የአገልግሎት ሂደት' : 'Your room-by-room route'}
            onChange={(e) => setFieldVal('serviceGuide', 'routeHeading', e.target.value)}
          />
        </label>

        <label className="modal-field full">
          <span>Illustrative disclaimer {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
          <input
            value={getFieldVal('serviceGuide', 'disclaimerText')}
            placeholder={
              copyLang === 'am'
                ? 'የአገልግሎት መረጃ ሊቀየር ይችላል። እርግጠኛ ካልሆኑ ከቢሮው ያረጋግጡ።'
                : 'Illustrative example only. Bureaus will publish and maintain official requirements and room numbers in the live system.'
            }
            onChange={(e) => setFieldVal('serviceGuide', 'disclaimerText', e.target.value)}
          />
        </label>
      </div>

      <CmsFlowFooter
        currentTabId="serviceGuide"
        setActiveTab={setActiveTab}
        handlePublish={handlePublish}
        isPublishing={isPublishing}
      />
    </div>
  );
};

export default ServiceGuideSection;

