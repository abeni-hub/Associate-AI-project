import React from 'react';
import { Icon } from '../../../shared';
import { CmsFlowFooter } from '../CmsFlowFooter';

export interface HeroSectionProps {
  cms: any;
  heroSubTab: 'copy' | 'slides';
  setHeroSubTab: (subTab: 'copy' | 'slides') => void;
  copyLang: 'en' | 'am';
  activeSlideIndex: number;
  setActiveSlideIndex: (idx: number) => void;
  currentSlide: any;
  isUploadingImage: boolean;
  getFieldVal: (section: string, field: string) => any;
  setFieldVal: (section: string, field: string, val: any) => void;
  updateSection: (section: string, key: string, val: any) => void;
  updateSlide: (idx: number, key: string, val: any) => void;
  handleAddSlide: () => void;
  handleDeleteSlide: (idx: number) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, idx: number) => void;
  setActiveTab: (tabId: string) => void;
  handlePublish: () => void;
  isPublishing: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  cms,
  heroSubTab,
  setHeroSubTab,
  copyLang,
  activeSlideIndex,
  setActiveSlideIndex,
  currentSlide,
  isUploadingImage,
  getFieldVal,
  setFieldVal,
  updateSection,
  updateSlide,
  handleAddSlide,
  handleDeleteSlide,
  handleFileUpload,
  setActiveTab,
  handlePublish,
  isPublishing,
}) => {
  return (
    <div className="cms-tab-pane">
      {/* Sub-Tabs: Copy vs Spotlight Slides */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '12px',
          marginBottom: '18px',
        }}
      >
        <button
          type="button"
          onClick={() => setHeroSubTab('copy')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: heroSubTab === 'copy' ? '1.5px solid #00485a' : '1px solid #e2e8f0',
            background: heroSubTab === 'copy' ? '#e8f2ed' : '#ffffff',
            color: heroSubTab === 'copy' ? '#00485a' : '#64748b',
            fontWeight: heroSubTab === 'copy' ? 700 : 500,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
          }}
        >
          <Icon name="edit" size={15} />
          <span>Headlines & Call-to-Action</span>
        </button>

        <button
          type="button"
          onClick={() => setHeroSubTab('slides')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: heroSubTab === 'slides' ? '1.5px solid #00485a' : '1px solid #e2e8f0',
            background: heroSubTab === 'slides' ? '#e8f2ed' : '#ffffff',
            color: heroSubTab === 'slides' ? '#00485a' : '#64748b',
            fontWeight: heroSubTab === 'slides' ? 700 : 500,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
          }}
        >
          <Icon name="image" size={15} />
          <span>Spotlight Slides & Photos</span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '1px 7px',
              borderRadius: '10px',
              background: heroSubTab === 'slides' ? '#00485a' : '#f1f5f9',
              color: heroSubTab === 'slides' ? '#ffffff' : '#64748b',
            }}
          >
            {cms.hero?.slides?.length || 0}
          </span>
        </button>
      </div>

      {/* Sub-Tab 1: Headlines & Call-to-Action */}
      {heroSubTab === 'copy' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label className="modal-field">
            <span>Hero badge / eyebrow {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
            <input
              value={getFieldVal('hero', 'badge')}
              placeholder={copyLang === 'am' ? 'ለምሳሌ፡ ይፋዊ የዜጎች መግቢያ' : 'e.g. OFFICIAL CITIZEN PORTAL'}
              onChange={(e) => setFieldVal('hero', 'badge', e.target.value)}
            />
          </label>

          {/* Bilingual Messaging Card with Language Switcher */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
              Primary Headline & Subheading
            </span>

            {copyLang === 'en' ? (
              <>
                <label className="modal-field full">
                  <span>Main Headline (English)</span>
                  <input
                    value={cms.hero?.titleEn || ''}
                    placeholder="e.g. Know where to go. Arrive prepared."
                    onChange={(e) => updateSection('hero', 'titleEn', e.target.value)}
                  />
                </label>
                <label className="modal-field full">
                  <span>Subheading (English)</span>
                  <textarea
                    rows={3}
                    value={cms.hero?.subtitleEn || ''}
                    placeholder="e.g. Find the right government bureau, required documents, and step-by-step room navigation before you visit."
                    onChange={(e) => updateSection('hero', 'subtitleEn', e.target.value)}
                  />
                </label>
              </>
            ) : (
              <>
                <label className="modal-field full">
                  <span>Main Headline (Amharic · አማርኛ)</span>
                  <input
                    value={cms.hero?.titleAm || ''}
                    placeholder="አገልግሎት የት እንደሚሰጥ ይወቁ። ተዘጋጅተው ይድረሱ።"
                    onChange={(e) => updateSection('hero', 'titleAm', e.target.value)}
                  />
                </label>
                <label className="modal-field full">
                  <span>Subheading (Amharic · አማርኛ)</span>
                  <textarea
                    rows={3}
                    value={cms.hero?.subtitleAm || ''}
                    placeholder="ከመሄድዎ በፊት ትክክለኛውን የመንግስት ቢሮ፣ የሚያስፈልጉ ሰነዶችን እና የክፍል ቅደም ተከተል አቅጣጫዎችን ያግኙ።"
                    onChange={(e) => updateSection('hero', 'subtitleAm', e.target.value)}
                  />
                </label>
              </>
            )}
          </div>

          {/* Citizen Action Buttons */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
              Citizen Action Buttons
            </span>
            <div className="cms-fields-grid">
              <label className="modal-field">
                <span>Primary button text {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
                <input
                  value={getFieldVal('hero', 'primaryCtaText')}
                  placeholder={copyLang === 'am' ? 'አገልግሎት ይፈልጉ' : 'Find a service'}
                  onChange={(e) => setFieldVal('hero', 'primaryCtaText', e.target.value)}
                />
              </label>

              <label className="modal-field">
                <span>Secondary button text {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
                <input
                  value={getFieldVal('hero', 'secondaryCtaText')}
                  placeholder={copyLang === 'am' ? 'ቢሮውን ጎብኝቻለሁ' : 'I’ve already visited'}
                  onChange={(e) => setFieldVal('hero', 'secondaryCtaText', e.target.value)}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Spotlight Slides & Photos */}
      {heroSubTab === 'slides' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Visual Slide Cards Strip */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div>
                <strong style={{ fontSize: '13px', color: '#0f2a36' }}>
                  Featured Bureau Slides ({cms.hero?.slides?.length || 0})
                </strong>
                <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#64748b' }}>
                  Select a slide card below to edit its bureau name, headline, and background photo.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  className="button secondary small-button"
                  style={{ fontSize: '12px', padding: '5px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  onClick={handleAddSlide}
                  title="Add a new spotlight slide"
                >
                  <Icon name="plus" size={13} /> Add slide
                </button>

                {(cms.hero?.slides?.length || 0) > 1 && (
                  <button
                    type="button"
                    className="button secondary small-button"
                    style={{ fontSize: '12px', padding: '5px 10px', color: '#b91c1c', borderColor: '#fca5a5' }}
                    onClick={() => handleDeleteSlide(activeSlideIndex)}
                    title="Remove current slide"
                  >
                    <Icon name="close" size={13} /> Delete slide
                  </button>
                )}
              </div>
            </div>

            <div className="cms-slide-strip" role="tablist" aria-label="Hero Spotlight Slides">
              {cms.hero?.slides?.map((slide: any, idx: number) => {
                const isSelected = activeSlideIndex === idx;
                const bureauDisplay =
                  (copyLang === 'am' ? slide.bureauAm : slide.bureau) || slide.bureau || `Slide ${idx + 1}`;
                const titleDisplay =
                  (copyLang === 'am' ? slide.titleAm : slide.title) || slide.title || 'Untitled service';
                return (
                  <button
                    key={slide.id || idx}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`cms-slide-card-item${isSelected ? ' active' : ''}`}
                  >
                    {slide.image ? (
                      <img src={slide.image} alt={bureauDisplay} className="cms-slide-card-thumb" />
                    ) : (
                      <div
                        className="cms-slide-card-thumb"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#e2e8f0',
                          color: '#94a3b8',
                        }}
                      >
                        <Icon name="image" size={16} />
                      </div>
                    )}
                    <div className="cms-slide-card-info">
                      <span className="cms-slide-card-num">0{idx + 1}</span>
                      <span className="cms-slide-card-title">{bureauDisplay}</span>
                      <small
                        style={{
                          fontSize: '10px',
                          color: '#64748b',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {titleDisplay}
                      </small>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Unified Active Slide Editor Card */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #d8e5df',
              borderRadius: '10px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            {/* Section A: Slide Text & Jurisdiction */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '4px',
                    background: '#00485a',
                    color: '#fff',
                  }}
                >
                  SLIDE 0{activeSlideIndex + 1}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f2a36' }}>
                  Bureau Text & Messaging {copyLang === 'am' ? '(አማርኛ)' : '(English)'}
                </span>
              </div>

              <div className="cms-fields-grid">
                <label className="modal-field">
                  <span>Bureau jurisdiction {copyLang === 'am' ? '(አማርኛ)' : '(English)'} <i>*</i></span>
                  <input
                    value={copyLang === 'am' ? currentSlide.bureauAm ?? '' : currentSlide.bureau ?? ''}
                    placeholder={copyLang === 'am' ? 'ለምሳሌ፡ የገቢዎች ቢሮ' : 'e.g. REVENUE BUREAU'}
                    onChange={(e) =>
                      updateSlide(activeSlideIndex, copyLang === 'am' ? 'bureauAm' : 'bureau', e.target.value)
                    }
                  />
                </label>

                <label className="modal-field">
                  <span>Service headline {copyLang === 'am' ? '(አማርኛ)' : '(English)'} <i>*</i></span>
                  <input
                    value={copyLang === 'am' ? currentSlide.titleAm ?? '' : currentSlide.title ?? ''}
                    placeholder={copyLang === 'am' ? 'ለምሳሌ፡ የገቢ አገልግሎቶችን በቀላሉ ይረዱ።' : 'e.g. Revenue services, made clearer.'}
                    onChange={(e) =>
                      updateSlide(activeSlideIndex, copyLang === 'am' ? 'titleAm' : 'title', e.target.value)
                    }
                  />
                </label>

                <label className="modal-field full">
                  <span>Caption / Preparation guide {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
                  <input
                    value={
                      copyLang === 'am'
                        ? currentSlide.descriptionAm ?? currentSlide.categoryAm ?? ''
                        : currentSlide.description ?? currentSlide.category ?? ''
                    }
                    placeholder={
                      copyLang === 'am'
                        ? 'የአካባቢዎን የገቢዎች ቢሮ ከመጎብኘትዎ በፊት ማዘጋጀት ያለብዎትን ይወቁ።'
                        : 'Know what to prepare before you visit your local revenue office.'
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      updateSlide(activeSlideIndex, copyLang === 'am' ? 'descriptionAm' : 'description', val);
                      updateSlide(activeSlideIndex, copyLang === 'am' ? 'categoryAm' : 'category', val);
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Section B: Slide Photo & Visual Studio */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div
                    style={{
                      position: 'relative',
                      width: '88px',
                      height: '58px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      background: '#e2e8f0',
                      flexShrink: 0,
                    }}
                  >
                    {currentSlide.image ? (
                      <img
                        src={currentSlide.image}
                        alt={currentSlide.alt || 'Slide photo'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          color: '#94a3b8',
                        }}
                      >
                        <Icon name="image" size={20} />
                      </div>
                    )}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: currentSlide.tint || '#164d58',
                        opacity: 0.35,
                        pointerEvents: 'none',
                      }}
                    />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '3px',
                        background: '#e2e8f0',
                        color: '#0f2a36',
                        textTransform: 'uppercase',
                      }}
                    >
                      Current Photo
                    </span>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: '12.5px',
                        color: '#0f2a36',
                        marginTop: '2px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {currentSlide.credit || currentSlide.bureau || 'Civic Office Photo'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Local File Upload Dropzone */}
              <div>
                <label
                  className={`cms-upload-dropzone${isUploadingImage ? ' is-uploading' : ''}`}
                  style={{ cursor: isUploadingImage ? 'wait' : 'pointer', opacity: isUploadingImage ? 0.75 : 1 }}
                >
                  <Icon name="upload" size={28} />
                  {isUploadingImage ? (
                    <p style={{ color: '#00485a', fontWeight: 600 }}>Uploading & optimizing photo...</p>
                  ) : (
                    <>
                      <p>Click to choose a photo from your computer</p>
                      <small>Supports JPG, PNG, WEBP. Loads immediately into live preview.</small>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    disabled={isUploadingImage}
                    onChange={(e) => handleFileUpload(e, activeSlideIndex)}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      <CmsFlowFooter
        currentTabId="hero"
        setActiveTab={setActiveTab}
        handlePublish={handlePublish}
        isPublishing={isPublishing}
      />
    </div>
  );
};

export default HeroSection;

