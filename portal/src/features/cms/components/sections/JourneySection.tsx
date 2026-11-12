import React from 'react';
import { CmsFlowFooter } from '../CmsFlowFooter';

export interface JourneySectionProps {
  cms: any;
  copyLang: 'en' | 'am';
  getFieldVal: (section: string, field: string) => any;
  setFieldVal: (section: string, field: string, val: any) => void;
  updateSection: (section: string, key: string, val: any) => void;
  setModalItem: (item: any) => void;
  setActiveTab: (tabId: string) => void;
  handlePublish: () => void;
  isPublishing: boolean;
}

export const JourneySection: React.FC<JourneySectionProps> = ({
  cms,
  copyLang,
  getFieldVal,
  setFieldVal,
  updateSection,
  setModalItem,
  setActiveTab,
  handlePublish,
  isPublishing,
}) => {
  return (
    <div className="cms-tab-pane">
      <div className="form-section-header">
        <div>
          <h3>Citizen journey 3-phase workflow</h3>
          <p>Walks citizens through the 3 phases of an office visit: before, at the bureau, and afterward.</p>
        </div>
        <label className="cms-toggle-label">
          <input
            type="checkbox"
            checked={Boolean(cms.journey?.enabled !== false)}
            onChange={(e) => updateSection('journey', 'enabled', e.target.checked)}
          />
          <span>{cms.journey?.enabled !== false ? 'Visible' : 'Hidden'}</span>
        </label>
      </div>

      <div className="cms-fields-grid" style={{ marginBottom: '1.25rem' }}>
        <label className="modal-field">
          <span>Section step number</span>
          <input
            value={cms.journey?.kickerNum || '03'}
            onChange={(e) => updateSection('journey', 'kickerNum', e.target.value)}
          />
        </label>

        <label className="modal-field">
          <span>Section kicker {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
          <input
            value={getFieldVal('journey', 'kicker')}
            placeholder={copyLang === 'am' ? 'አጠቃቀሙ እንዴት ነው?' : 'HOW IT WORKS'}
            onChange={(e) => setFieldVal('journey', 'kicker', e.target.value)}
          />
        </label>

        <label className="modal-field full">
          <span>Journey introduction {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
          <textarea
            rows={2}
            value={getFieldVal('journey', 'title')}
            placeholder={
              copyLang === 'am'
                ? 'ከመነሳትዎ በፊት ምን እንደሚያስፈልግ ይወቁ'
                : 'Three moments. One smoother journey.'
            }
            onChange={(e) => setFieldVal('journey', 'title', e.target.value)}
          />
        </label>
      </div>

      <div className="cms-journey-editor">
        {cms.journey?.steps?.map((step: any, idx: number) => (
          <div key={step.step || idx} className="cms-journey-card">
            <div
              className="journey-card-header"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <span className="step-tag">Step {step.step}</span>
              <button
                type="button"
                className="button secondary small-button"
                onClick={() =>
                  setModalItem({
                    type: 'journey',
                    index: idx,
                    title: step.title,
                    titleAm: step.titleAm,
                    detail: step.detail,
                    detailAm: step.detailAm,
                  })
                }
              >
                Edit step
              </button>
            </div>
            <b
              style={{
                color: '#164a54',
                fontSize: '13px',
                display: 'block',
                marginTop: '6px',
              }}
            >
              {(copyLang === 'am' && step.titleAm) || step.title}
            </b>
            <p
              style={{
                color: '#748780',
                fontSize: '11px',
                margin: '4px 0 0',
                lineHeight: 1.5,
              }}
            >
              {(copyLang === 'am' && step.detailAm) || step.detail}
            </p>
          </div>
        ))}
      </div>

      <CmsFlowFooter
        currentTabId="journey"
        setActiveTab={setActiveTab}
        handlePublish={handlePublish}
        isPublishing={isPublishing}
      />
    </div>
  );
};

export default JourneySection;

