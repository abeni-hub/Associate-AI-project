import React from 'react';
import { CmsFlowFooter } from '../CmsFlowFooter';

export interface FooterSectionProps {
  cms: any;
  copyLang: 'en' | 'am';
  getFieldVal: (section: string, field: string) => any;
  setFieldVal: (section: string, field: string, val: any) => void;
  updateSection: (section: string, key: string, val: any) => void;
  setActiveTab: (tabId: string) => void;
  handlePublish: () => void;
  isPublishing: boolean;
}

export const FooterSection: React.FC<FooterSectionProps> = ({
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
          <h3>Footer & public service team strip</h3>
          <p>Municipal footer, copyright notice, emergency contact, and administrative callout.</p>
        </div>
        <label className="cms-toggle-label">
          <input
            type="checkbox"
            checked={Boolean(cms.footer?.enabled !== false)}
            onChange={(e) => updateSection('footer', 'enabled', e.target.checked)}
          />
          <span>{cms.footer?.enabled !== false ? 'Visible' : 'Hidden'}</span>
        </label>
      </div>

      <div className="cms-fields-grid">
        <div className="cms-section-card full" style={{ gridColumn: '1 / -1' }}>
          <div className="cms-section-card-header">
            <b style={{ color: '#164a54', fontSize: '13px' }}>Admin Strip for Service Teams</b>
            <span className="cms-section-badge">Homepage Banner</span>
          </div>
          <div className="cms-fields-grid">
            <label className="modal-field full">
              <span>Admin strip kicker {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
              <input
                value={getFieldVal('footer', 'adminStripKicker')}
                placeholder={copyLang === 'am' ? 'ለመንግሥት አገልግሎት ሰጪ ክፍሎች' : 'FOR PUBLIC SERVICE TEAMS'}
                onChange={(e) => setFieldVal('footer', 'adminStripKicker', e.target.value)}
              />
            </label>
            <label className="modal-field full">
              <span>Admin strip title {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
              <input
                value={getFieldVal('footer', 'adminStripTitle')}
                placeholder={copyLang === 'am' ? 'መረጃን በሚመለከተው ክፍል ያስተዳድሩ።' : 'Manage information where it belongs.'}
                onChange={(e) => setFieldVal('footer', 'adminStripTitle', e.target.value)}
              />
            </label>
            <label className="modal-field full">
              <span>Admin strip description {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
              <textarea
                rows={2}
                value={getFieldVal('footer', 'adminStripDescription')}
                placeholder={
                  copyLang === 'am'
                    ? 'የክፍለ ከተማ እና የቢሮ አስተዳዳሪዎች የአገልግሎት መመሪያዎችን፣ የክፍል አቅጣጫዎችንና ዜናዎችን ያዘምናሉ።'
                    : 'Sub-city and bureau admins keep service guides, room routes, news, and feedback up to date.'
                }
                onChange={(e) => setFieldVal('footer', 'adminStripDescription', e.target.value)}
              />
            </label>
          </div>
        </div>

        <label className="modal-field">
          <span>Footer brand tagline {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
          <input
            value={getFieldVal('footer', 'brandTagline')}
            placeholder={copyLang === 'am' ? 'ኢትዮጵያ · የዜጎች አገልግሎት' : 'ETHIOPIA · CITIZEN SERVICES'}
            onChange={(e) => setFieldVal('footer', 'brandTagline', e.target.value)}
          />
        </label>

        <label className="modal-field">
          <span>Helpline / emergency phone</span>
          <input
            value={cms.footer?.helplinePhone || '7533'}
            placeholder="e.g. 7533"
            onChange={(e) => updateSection('footer', 'helplinePhone', e.target.value)}
          />
        </label>

        <label className="modal-field full">
          <span>Footer description {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
          <input
            value={getFieldVal('footer', 'description')}
            placeholder={
              copyLang === 'am'
                ? 'ለእያንዳንዱ ጉብኝት ግልጽ መረጃ። የበለጠ ቀልጣፋ የህዝብ አገልግሎት።'
                : 'Clearer information for every visit. A more responsive public service.'
            }
            onChange={(e) => setFieldVal('footer', 'description', e.target.value)}
          />
        </label>

        <label className="modal-field full">
          <span>Copyright notice {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
          <input
            value={getFieldVal('footer', 'copyright')}
            placeholder={
              copyLang === 'am'
                ? '© 2026 ሲቪክሊንክ ኢትዮጵያ · የህዝብ አገልግሎት መረጃ መድረክ'
                : '© 2026 CivicLink Ethiopia · Public service information platform'
            }
            onChange={(e) => setFieldVal('footer', 'copyright', e.target.value)}
          />
        </label>

        <label className="modal-field full">
          <span>Bottom note {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
          <input
            value={getFieldVal('footer', 'bottomNote')}
            placeholder={copyLang === 'am' ? 'ለዜጎች የተዘጋጀ፣ በቢሮዎች የሚተዳደር።' : 'Built for citizens, maintained by bureaus.'}
            onChange={(e) => setFieldVal('footer', 'bottomNote', e.target.value)}
          />
        </label>
      </div>

      <CmsFlowFooter
        currentTabId="footer"
        setActiveTab={setActiveTab}
        handlePublish={handlePublish}
        isPublishing={isPublishing}
      />
    </div>
  );
};

export default FooterSection;

