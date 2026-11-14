import React from 'react';
import { CmsFlowFooter } from '../CmsFlowFooter';

export interface FeedbackSectionProps {
  cms: any;
  copyLang: 'en' | 'am';
  getFieldVal: (section: string, field: string) => any;
  setFieldVal: (section: string, field: string, val: any) => void;
  updateSection: (section: string, key: string, val: any) => void;
  setActiveTab: (tabId: string) => void;
  handlePublish: () => void;
  isPublishing: boolean;
}

export const FeedbackSection: React.FC<FeedbackSectionProps> = ({
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
          <h3>Citizen voice & feedback intake</h3>
          <p>The citizen feedback section for complaints, service recommendations, and satisfaction ratings.</p>
        </div>
        <label className="cms-toggle-label">
          <input
            type="checkbox"
            checked={Boolean(cms.feedback?.enabled !== false)}
            onChange={(e) => updateSection('feedback', 'enabled', e.target.checked)}
          />
          <span>{cms.feedback?.enabled !== false ? 'Visible' : 'Hidden'}</span>
        </label>
      </div>

      <div className="cms-fields-grid">
        <label className="modal-field">
          <span>Section step number</span>
          <input
            value={cms.feedback?.kickerNum || '05'}
            onChange={(e) => updateSection('feedback', 'kickerNum', e.target.value)}
          />
        </label>

        <label className="modal-field">
          <span>Section kicker {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
          <input
            value={getFieldVal('feedback', 'kicker')}
            placeholder={copyLang === 'am' ? 'የዜጎች ድምፅ' : 'YOUR VOICE HELPS'}
            onChange={(e) => setFieldVal('feedback', 'kicker', e.target.value)}
          />
        </label>

        <label className="modal-field full">
          <span>Section headline {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
          <input
            value={getFieldVal('feedback', 'title')}
            placeholder={
              copyLang === 'am'
                ? 'እያንዳንዱ አስተያየት አገልግሎቱን የተሻለ ያደርገዋል።'
                : 'Every experience can make things better.'
            }
            onChange={(e) => setFieldVal('feedback', 'title', e.target.value)}
          />
        </label>

        <label className="modal-field full">
          <span>Description paragraph {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
          <textarea
            rows={2}
            value={getFieldVal('feedback', 'description')}
            placeholder={
              copyLang === 'am'
                ? 'ጉብኝትዎ እንዴት እንደነበር ያሳውቁን። አስተያየትዎ ለሚመለከተው ቢሮ ይደርሳል።'
                : 'Tell us how your visit went. Your feedback reaches the right bureau and helps improve services for everyone.'
            }
            onChange={(e) => setFieldVal('feedback', 'description', e.target.value)}
          />
        </label>

        <label className="modal-field">
          <span>Perk point 1 {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
          <input
            value={getFieldVal('feedback', 'pointOne')}
            placeholder={copyLang === 'am' ? 'መለያ መክፈት አያስፈልግም' : 'No account needed'}
            onChange={(e) => setFieldVal('feedback', 'pointOne', e.target.value)}
          />
        </label>

        <label className="modal-field">
          <span>Perk point 2 {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
          <input
            value={getFieldVal('feedback', 'pointTwo')}
            placeholder={copyLang === 'am' ? 'የቢሮውን QR ኮድ ይቃኙ' : 'Scan a bureau QR code'}
            onChange={(e) => setFieldVal('feedback', 'pointTwo', e.target.value)}
          />
        </label>

        <label className="modal-field full">
          <span>Callout quote {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
          <textarea
            rows={2}
            value={getFieldVal('feedback', 'quote')}
            placeholder={
              copyLang === 'am'
                ? 'ከጉብኝትዎ በፊት ግልጽ መመሪያ። በኋላም በቀላሉ ድምፅዎን የሚያሰሙበት መንገድ።'
                : 'Clear guidance before your visit. A simple way to be heard afterward.'
            }
            onChange={(e) => setFieldVal('feedback', 'quote', e.target.value)}
          />
        </label>
      </div>

      <CmsFlowFooter
        currentTabId="feedback"
        setActiveTab={setActiveTab}
        handlePublish={handlePublish}
        isPublishing={isPublishing}
      />
    </div>
  );
};

export default FeedbackSection;

