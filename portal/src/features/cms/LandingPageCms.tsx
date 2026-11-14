import React from 'react';
import { Icon, PageHeading } from '../shared';
import LiveLandingPreview from './components/LiveLandingPreview.jsx';
import { CmsSectionTabs } from './components/CmsSectionTabs';
import { CmsEditItemModal } from './components/CmsEditItemModal';
import { AnnouncementSection } from './components/sections/AnnouncementSection';
import { HeroSection } from './components/sections/HeroSection';
import { QuickSearchSection } from './components/sections/QuickSearchSection';
import { ServiceGuideSection } from './components/sections/ServiceGuideSection';
import { JourneySection } from './components/sections/JourneySection';
import { NewsEventsSection } from './components/sections/NewsEventsSection';
import { FeedbackSection } from './components/sections/FeedbackSection';
import { FooterSection } from './components/sections/FooterSection';
import { useLandingPageCms, type UseLandingPageCmsProps } from './hooks/useLandingPageCms';
import { CMS_SECTIONS } from './constants';

export { CMS_SECTIONS };

export interface LandingPageCmsProps extends UseLandingPageCmsProps {}

export const LandingPageCms: React.FC<LandingPageCmsProps> = (props) => {
  const {
    cms,
    setCms,
    activeTab,
    setActiveTab,
    previewDevice,
    setPreviewDevice,
    toastMessage,
    setToastMessage,
    modalItem,
    setModalItem,
    heroSubTab,
    setHeroSubTab,
    copyLang,
    setCopyLang,
    activeSlideIndex,
    setActiveSlideIndex,
    isUploadingImage,
    isPublishing,
    canManageCms,
    currentSlide,
    getFieldVal,
    setFieldVal,
    updateSection,
    updateSlide,
    updateJourneyStep,
    handleAddSlide,
    handleDeleteSlide,
    handleFileUpload,
    handlePublish,
    refetchCms,
    apiCmsResponse,
    uploadImageTrigger,
  } = useLandingPageCms(props);

  return (
    <>
      <PageHeading
        eyebrow="CITIZEN INTERFACE MANAGEMENT"
        title="Landing page CMS"
        subtitle="Edit public notice banners, hero visuals & copy, and all citizen landing page sections."
        action={canManageCms ? (isPublishing ? 'Publishing...' : 'Publish changes') : undefined}
        onAction={canManageCms ? handlePublish : undefined}
        secondary={canManageCms ? 'Reload from database' : undefined}
        onSecondary={() => {
          if (window.confirm('Discard unsaved edits and reload CMS from backend database?')) {
            refetchCms();
            if (apiCmsResponse?.data) {
              setCms(apiCmsResponse.data);
            }
          }
        }}
      />

      {toastMessage && (
        <div className="cms-toast-alert">
          <Icon name="checkCircle" size={18} />
          <span>{toastMessage}</span>
          <button type="button" onClick={() => setToastMessage('')} aria-label="Dismiss toast">
            <Icon name="close" size={14} />
          </button>
        </div>
      )}

      <div className="cms-studio-layout">
        {/* Editor Column */}
        <div className="cms-editor-card panel">
          {/* Navigation Tabs Bar for all 8 landing page sections */}
          <CmsSectionTabs activeTab={activeTab} setActiveTab={setActiveTab} cms={cms} />

          {/* Active Editing Language Selector Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="globe" size={16} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f2a36' }}>
                Content Editing Language:
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: copyLang === 'am' ? '#fef3c7' : '#e0f2fe',
                  color: copyLang === 'am' ? '#92400e' : '#0369a1',
                }}
              >
                {copyLang === 'am' ? 'Editing Amharic Version (አማርኛ)' : 'Editing English Version (English)'}
              </span>
            </div>

            <div style={{ display: 'inline-flex', background: '#e2e8f0', padding: '2px', borderRadius: '6px' }}>
              <button
                type="button"
                onClick={() => setCopyLang('en')}
                style={{
                  padding: '5px 14px',
                  borderRadius: '5px',
                  border: 'none',
                  background: copyLang === 'en' ? '#ffffff' : 'transparent',
                  color: copyLang === 'en' ? '#00485a' : '#64748b',
                  fontWeight: copyLang === 'en' ? 700 : 500,
                  fontSize: '12px',
                  cursor: 'pointer',
                  boxShadow: copyLang === 'en' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                English (EN)
              </button>
              <button
                type="button"
                onClick={() => setCopyLang('am')}
                style={{
                  padding: '5px 14px',
                  borderRadius: '5px',
                  border: 'none',
                  background: copyLang === 'am' ? '#ffffff' : 'transparent',
                  color: copyLang === 'am' ? '#00485a' : '#64748b',
                  fontWeight: copyLang === 'am' ? 700 : 500,
                  fontSize: '12px',
                  cursor: 'pointer',
                  boxShadow: copyLang === 'am' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                Amharic (አማርኛ)
              </button>
            </div>
          </div>

          {activeTab === 'announcement' && (
            <AnnouncementSection
              cms={cms}
              copyLang={copyLang}
              getFieldVal={getFieldVal}
              setFieldVal={setFieldVal}
              updateSection={updateSection}
              setActiveTab={setActiveTab}
              handlePublish={handlePublish}
              isPublishing={isPublishing}
            />
          )}

          {activeTab === 'hero' && (
            <HeroSection
              cms={cms}
              heroSubTab={heroSubTab}
              setHeroSubTab={setHeroSubTab}
              copyLang={copyLang}
              activeSlideIndex={activeSlideIndex}
              setActiveSlideIndex={setActiveSlideIndex}
              currentSlide={currentSlide}
              isUploadingImage={isUploadingImage}
              getFieldVal={getFieldVal}
              setFieldVal={setFieldVal}
              updateSection={updateSection}
              updateSlide={updateSlide}
              handleAddSlide={handleAddSlide}
              handleDeleteSlide={handleDeleteSlide}
              handleFileUpload={handleFileUpload}
              setActiveTab={setActiveTab}
              handlePublish={handlePublish}
              isPublishing={isPublishing}
            />
          )}

          {activeTab === 'quickSearch' && (
            <QuickSearchSection
              cms={cms}
              copyLang={copyLang}
              getFieldVal={getFieldVal}
              setFieldVal={setFieldVal}
              updateSection={updateSection}
              setActiveTab={setActiveTab}
              handlePublish={handlePublish}
              isPublishing={isPublishing}
            />
          )}

          {activeTab === 'serviceGuide' && (
            <ServiceGuideSection
              cms={cms}
              copyLang={copyLang}
              getFieldVal={getFieldVal}
              setFieldVal={setFieldVal}
              updateSection={updateSection}
              setActiveTab={setActiveTab}
              handlePublish={handlePublish}
              isPublishing={isPublishing}
            />
          )}

          {activeTab === 'journey' && (
            <JourneySection
              cms={cms}
              copyLang={copyLang}
              getFieldVal={getFieldVal}
              setFieldVal={setFieldVal}
              updateSection={updateSection}
              setModalItem={setModalItem}
              setActiveTab={setActiveTab}
              handlePublish={handlePublish}
              isPublishing={isPublishing}
            />
          )}

          {activeTab === 'newsEvents' && (
            <NewsEventsSection
              cms={cms}
              copyLang={copyLang}
              getFieldVal={getFieldVal}
              setFieldVal={setFieldVal}
              updateSection={updateSection}
              setActiveTab={setActiveTab}
              handlePublish={handlePublish}
              isPublishing={isPublishing}
            />
          )}

          {activeTab === 'feedback' && (
            <FeedbackSection
              cms={cms}
              copyLang={copyLang}
              getFieldVal={getFieldVal}
              setFieldVal={setFieldVal}
              updateSection={updateSection}
              setActiveTab={setActiveTab}
              handlePublish={handlePublish}
              isPublishing={isPublishing}
            />
          )}

          {activeTab === 'footer' && (
            <FooterSection
              cms={cms}
              copyLang={copyLang}
              getFieldVal={getFieldVal}
              setFieldVal={setFieldVal}
              updateSection={updateSection}
              setActiveTab={setActiveTab}
              handlePublish={handlePublish}
              isPublishing={isPublishing}
            />
          )}
        </div>

        {/* Live Preview Column */}
        <div className="cms-preview-column">
          <LiveLandingPreview
            config={cms}
            previewDevice={previewDevice}
            onToggleDevice={setPreviewDevice}
            previewLang={copyLang}
          />
        </div>
      </div>

      {/* Edit Modal for Spotlight Card or Journey Step */}
      <CmsEditItemModal
        modalItem={modalItem}
        setModalItem={setModalItem}
        copyLang={copyLang}
        setCms={setCms}
        updateJourneyStep={updateJourneyStep}
        uploadImageTrigger={uploadImageTrigger}
      />
    </>
  );
};

export default LandingPageCms;
