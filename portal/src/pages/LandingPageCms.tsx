import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../components/shared/Icon';
import { PageHeading } from '../components/shared/PageHeading';
import LiveLandingPreview from '../components/cms/LiveLandingPreview.jsx';
import { INITIAL_CMS_CONFIG } from '../data/portalData.js';

export interface LandingPageCmsProps {
  cmsConfig?: any;
  onSaveCms?: (cms: any) => void;
}

export const LandingPageCms: React.FC<LandingPageCmsProps> = ({
  cmsConfig = INITIAL_CMS_CONFIG,
  onSaveCms,
}) => {
  const [cms, setCms] = useState(() => JSON.parse(JSON.stringify(cmsConfig || INITIAL_CMS_CONFIG)));
  const [activeTab, setActiveTab] = useState('announcement');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [toastMessage, setToastMessage] = useState('');
  const [modalItem, setModalItem] = useState<any>(null);

  const updateAnnouncement = (key: string, value: any) => {
    setCms((prev: any) => ({
      ...prev,
      announcement: { ...prev.announcement, [key]: value },
    }));
  };

  const updateHero = (key: string, value: any) => {
    setCms((prev: any) => ({
      ...prev,
      hero: { ...prev.hero, [key]: value },
    }));
  };

  const updateSlide = (index: number, key: string, value: any) => {
    setCms((prev: any) => {
      const slides = [...prev.hero.slides];
      slides[index] = { ...slides[index], [key]: value };
      return { ...prev, hero: { ...prev.hero, slides } };
    });
  };

  const updateJourneyStep = (index: number, key: string, value: any) => {
    setCms((prev: any) => {
      const steps = [...prev.journey.steps];
      steps[index] = { ...steps[index], [key]: value };
      return { ...prev, journey: { ...prev.journey, steps } };
    });
  };

  const handlePublish = () => {
    onSaveCms?.(cms);
    setToastMessage('Landing page content successfully published to citizen platform!');
    setTimeout(() => setToastMessage(''), 3500);
  };

  return (
    <>
      <PageHeading
        eyebrow="CITIZEN INTERFACE MANAGEMENT"
        title="Landing page CMS"
        subtitle="Edit public notice banners, hero copy, and service workflows shown to citizens."
        action="Publish changes"
        onAction={handlePublish}
        secondary="Reset to default"
        onSecondary={() => {
          if (window.confirm('Reset all CMS fields to default seed values?')) {
            setCms(JSON.parse(JSON.stringify(cmsConfig || INITIAL_CMS_CONFIG)));
          }
        }}
      />

      {toastMessage && (
        <div className="cms-toast-alert">
          <Icon name="checkCircle" size={18} />
          <span>{toastMessage}</span>
          <button type="button" onClick={() => setToastMessage('')}>
            <Icon name="close" size={14} />
          </button>
        </div>
      )}

      <div className="cms-studio-layout">
        {/* Editor Column */}
        <div className="cms-editor-card panel">
          <div className="cms-tabs-bar">
            <button
              type="button"
              className={`cms-tab-btn${activeTab === 'announcement' ? ' active' : ''}`}
              onClick={() => setActiveTab('announcement')}
            >
              <Icon name="bell" size={15} /> Announcement
            </button>
            <button
              type="button"
              className={`cms-tab-btn${activeTab === 'hero' ? ' active' : ''}`}
              onClick={() => setActiveTab('hero')}
            >
              <Icon name="spark" size={15} /> Hero & slides
            </button>
            <button
              type="button"
              className={`cms-tab-btn${activeTab === 'journey' ? ' active' : ''}`}
              onClick={() => setActiveTab('journey')}
            >
              <Icon name="route" size={15} /> Citizen journey
            </button>
          </div>

          <div className="cms-form-body">
            {/* TAB 1: Announcement */}
            {activeTab === 'announcement' && (
              <div className="cms-tab-pane">
                <div className="form-section-header">
                  <div>
                    <h3>Emergency & public notice banner</h3>
                    <p>Displays at the very top of the citizen portal above the header navigation.</p>
                  </div>
                  <label className="cms-toggle-label">
                    <input
                      type="checkbox"
                      checked={cms.announcement.enabled}
                      onChange={(e) => updateAnnouncement('enabled', e.target.checked)}
                    />
                    <span>{cms.announcement.enabled ? 'Visible' : 'Hidden'}</span>
                  </label>
                </div>

                <div className="cms-fields-grid">
                  <label className="modal-field">
                    <span>Banner tag / badge</span>
                    <input
                      value={cms.announcement.tag}
                      placeholder="e.g. PUBLIC ADVISORY"
                      onChange={(e) => updateAnnouncement('tag', e.target.value)}
                    />
                  </label>

                  <label className="modal-field full">
                    <span>Notice message</span>
                    <input
                      value={cms.announcement.message}
                      placeholder="Enter announcement text shown to citizens"
                      onChange={(e) => updateAnnouncement('message', e.target.value)}
                    />
                  </label>

                  <label className="modal-field">
                    <span>Link button text</span>
                    <input
                      value={cms.announcement.linkText}
                      placeholder="e.g. Learn more"
                      onChange={(e) => updateAnnouncement('linkText', e.target.value)}
                    />
                  </label>

                  <label className="modal-field">
                    <span>Link target URL or hash</span>
                    <input
                      value={cms.announcement.linkUrl}
                      placeholder="e.g. #find-service or /services"
                      onChange={(e) => updateAnnouncement('linkUrl', e.target.value)}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* TAB 2: Hero & Slides */}
            {activeTab === 'hero' && (
              <div className="cms-tab-pane">
                <div className="form-section-header">
                  <div>
                    <h3>Hero copy & spotlight services</h3>
                    <p>The primary headline and sliding carousel on the citizen landing page.</p>
                  </div>
                </div>

                <div className="cms-fields-grid">
                  <label className="modal-field">
                    <span>Hero badge / tag</span>
                    <input
                      value={cms.hero.badge}
                      placeholder="e.g. OFFICIAL CITIZEN PORTAL"
                      onChange={(e) => updateHero('badge', e.target.value)}
                    />
                  </label>

                  <label className="modal-field full">
                    <span>Main headline (English)</span>
                    <input
                      value={cms.hero.titleEn}
                      onChange={(e) => updateHero('titleEn', e.target.value)}
                    />
                  </label>

                  <label className="modal-field full">
                    <span>Main headline (Amharic · አማርኛ)</span>
                    <input
                      value={cms.hero.titleAm}
                      placeholder="አገልግሎት የት እንደሚሰጥ ይወቁ። ተዘጋጅተው ይድረሱ።"
                      onChange={(e) => updateHero('titleAm', e.target.value)}
                    />
                  </label>

                  <label className="modal-field full">
                    <span>Subheading (English)</span>
                    <textarea
                      rows={2}
                      value={cms.hero.subtitleEn}
                      onChange={(e) => updateHero('subtitleEn', e.target.value)}
                    />
                  </label>

                  <label className="modal-field full">
                    <span>Subheading (Amharic · አማርኛ)</span>
                    <textarea
                      rows={2}
                      value={cms.hero.subtitleAm}
                      onChange={(e) => updateHero('subtitleAm', e.target.value)}
                    />
                  </label>
                </div>

                <div
                  className="cms-subheading"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <div>
                    <h4>Spotlight service cards ({cms.hero.slides.length})</h4>
                    <p>Citizens can swipe through these service previews from the home hero.</p>
                  </div>
                  <button
                    type="button"
                    className="button secondary small-button"
                    onClick={() =>
                      setModalItem({ type: 'slide', index: null, title: '', bureau: '', category: '' })
                    }
                  >
                    <Icon name="plus" size={14} /> Add card
                  </button>
                </div>

                <div className="cms-slides-editor">
                  {cms.hero.slides.map((slide: any, idx: number) => (
                    <div key={slide.id || idx} className="cms-slide-item">
                      <span className="slide-num">0{idx + 1}</span>
                      <div className="slide-fields" style={{ flex: 1 }}>
                        <b style={{ color: '#164a54', fontSize: '12px' }}>
                          {slide.title || 'Untitled service'}
                        </b>
                        <small style={{ color: '#778a83', fontSize: '11px' }}>
                          {slide.bureau} · {slide.category}
                        </small>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="button secondary small-button"
                          onClick={() =>
                            setModalItem({
                              type: 'slide',
                              index: idx,
                              title: slide.title,
                              bureau: slide.bureau,
                              category: slide.category,
                            })
                          }
                        >
                          Edit
                        </button>
                        {cms.hero.slides.length > 1 && (
                          <button
                            type="button"
                            className="row-more"
                            aria-label="Delete card"
                            onClick={() =>
                              setCms((prev: any) => ({
                                ...prev,
                                hero: {
                                  ...prev.hero,
                                  slides: prev.hero.slides.filter((_: any, i: number) => i !== idx),
                                },
                              }))
                            }
                          >
                            <Icon name="close" size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: Citizen Journey */}
            {activeTab === 'journey' && (
              <div className="cms-tab-pane">
                <div className="form-section-header">
                  <div>
                    <h3>Citizen journey steps</h3>
                    <p>Walks citizens through the 3 phases of an office visit.</p>
                  </div>
                </div>

                <label className="modal-field full" style={{ marginBottom: '1.25rem' }}>
                  <span>Journey introduction</span>
                  <input
                    value={cms.journey.title}
                    onChange={(e) =>
                      setCms((prev: any) => ({
                        ...prev,
                        journey: { ...prev.journey, title: e.target.value },
                      }))
                    }
                  />
                </label>

                <div className="cms-journey-editor">
                  {cms.journey.steps.map((step: any, idx: number) => (
                    <div key={step.step} className="cms-journey-card">
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
                              detail: step.detail,
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
                        {step.title}
                      </b>
                      <p
                        style={{
                          color: '#748780',
                          fontSize: '11px',
                          margin: '4px 0 0',
                          lineHeight: 1.5,
                        }}
                      >
                        {step.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Preview Column */}
        <div className="cms-preview-column">
          <LiveLandingPreview
            config={cms}
            previewDevice={previewDevice}
            onToggleDevice={setPreviewDevice}
          />
        </div>
      </div>

      {modalItem &&
        createPortal(
          <div
            className="modal-overlay"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setModalItem(null);
            }}
          >
            <section
              className="modal-card modal-form"
              role="dialog"
              aria-modal="true"
              aria-label="CMS editor modal"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (modalItem.type === 'slide') {
                    if (modalItem.index !== null) {
                      updateSlide(modalItem.index, 'title', modalItem.title);
                      updateSlide(modalItem.index, 'bureau', modalItem.bureau);
                      updateSlide(modalItem.index, 'category', modalItem.category);
                    } else {
                      setCms((prev: any) => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          slides: [
                            ...prev.hero.slides,
                            {
                              id: Date.now(),
                              title: modalItem.title,
                              bureau: modalItem.bureau,
                              category: modalItem.category,
                            },
                          ],
                        },
                      }));
                    }
                  } else if (modalItem.type === 'journey') {
                    updateJourneyStep(modalItem.index, 'title', modalItem.title);
                    updateJourneyStep(modalItem.index, 'detail', modalItem.detail);
                  }
                  setModalItem(null);
                }}
              >
                <div className="modal-header">
                  <div>
                    <span className="panel-eyebrow">LANDING PAGE CMS</span>
                    <h2>
                      {modalItem.type === 'slide'
                        ? modalItem.index !== null
                          ? 'Edit spotlight card'
                          : 'Add spotlight card'
                        : `Edit journey step 0${modalItem.index + 1}`}
                    </h2>
                    <p>Changes will update the citizen landing page live preview immediately.</p>
                  </div>
                  <button
                    type="button"
                    className="modal-close"
                    onClick={() => setModalItem(null)}
                    aria-label="Close dialog"
                  >
                    <Icon name="close" />
                  </button>
                </div>

                <div className="modal-form-grid">
                  {modalItem.type === 'slide' && (
                    <>
                      <label className="modal-field full">
                        <span>
                          Service name <i>*</i>
                        </span>
                        <input
                          required
                          value={modalItem.title || ''}
                          onChange={(e) => setModalItem((m: any) => ({ ...m, title: e.target.value }))}
                          placeholder="e.g. Business tax registration"
                        />
                      </label>
                      <label className="modal-field">
                        <span>
                          Bureau jurisdiction <i>*</i>
                        </span>
                        <input
                          required
                          value={modalItem.bureau || ''}
                          onChange={(e) => setModalItem((m: any) => ({ ...m, bureau: e.target.value }))}
                          placeholder="e.g. Revenues Bureau"
                        />
                      </label>
                      <label className="modal-field">
                        <span>
                          Slide description <i>*</i>
                        </span>
                        <input
                          required
                          value={modalItem.category || ''}
                          onChange={(e) =>
                            setModalItem((m: any) => ({ ...m, category: e.target.value }))
                          }
                          placeholder="Describe the bureau spotlight"
                        />
                      </label>
                    </>
                  )}

                  {modalItem.type === 'journey' && (
                    <>
                      <label className="modal-field full">
                        <span>
                          Step title <i>*</i>
                        </span>
                        <input
                          required
                          value={modalItem.title || ''}
                          onChange={(e) => setModalItem((m: any) => ({ ...m, title: e.target.value }))}
                          placeholder="e.g. Check requirements"
                        />
                      </label>
                      <label className="modal-field full">
                        <span>
                          Step instructions <i>*</i>
                        </span>
                        <textarea
                          required
                          rows={3}
                          value={modalItem.detail || ''}
                          onChange={(e) =>
                            setModalItem((m: any) => ({ ...m, detail: e.target.value }))
                          }
                          placeholder="Explain what the citizen needs to do..."
                        />
                      </label>
                    </>
                  )}
                </div>

                <div className="modal-footer">
                  <span>
                    <Icon name="globe" size={14} /> Changes update the citizen preview live.
                  </span>
                  <div>
                    <button
                      type="button"
                      className="button secondary"
                      onClick={() => setModalItem(null)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="button primary">
                      Save changes <Icon name="arrow" size={15} />
                    </button>
                  </div>
                </div>
              </form>
            </section>
          </div>,
          document.body
        )}
    </>
  );
};

export default LandingPageCms;
