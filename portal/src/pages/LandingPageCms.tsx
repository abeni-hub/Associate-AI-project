import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../components/shared/Icon';
import { PageHeading } from '../components/shared/PageHeading';
import { usePermissions } from '../hooks/usePermissions';
import LiveLandingPreview from '../components/cms/LiveLandingPreview.jsx';
import {
  useGetLandingPageCmsQuery,
  useUpdateLandingPageCmsMutation,
  useUploadCmsImageMutation,
} from '../services/cmsApi';

export interface LandingPageCmsProps {
  cmsConfig?: any;
  onSaveCms?: (cms: any) => void;
}

const TINT_SWATCHES = [
  { label: 'Dark Teal', color: '#164d58' },
  { label: 'Deep Slate', color: '#365b63' },
  { label: 'Forest Green', color: '#3b625e' },
  { label: 'Charcoal', color: '#536458' },
  { label: 'Midnight Blue', color: '#0f2a36' },
  { label: 'Olive Bronze', color: '#2d4536' },
];

export const CMS_SECTIONS = [
  { id: 'announcement', num: '01', label: 'Announcement', icon: 'bell', desc: 'Top alert banner' },
  { id: 'hero', num: '02', label: 'Hero & Spotlight', icon: 'spark', desc: 'Headlines, CTA buttons & photo slides' },
  { id: 'quickSearch', num: '03', label: 'Quick Search', icon: 'search', desc: 'Find service widget' },
  { id: 'serviceGuide', num: '04', label: 'Service Guide', icon: 'layers', desc: 'Step-by-step visitor checklist' },
  { id: 'journey', num: '05', label: 'Citizen Journey', icon: 'route', desc: '3-stage experience walkthrough' },
  { id: 'newsEvents', num: '06', label: 'News & Events', icon: 'news', desc: 'Community updates feed' },
  { id: 'feedback', num: '07', label: 'Feedback CTA', icon: 'message', desc: 'Citizen voice prompt' },
  { id: 'footer', num: '08', label: 'Footer & Teams', icon: 'building', desc: 'Admin strip & bottom note' },
] as const;

const EMPTY_CMS_CONFIG: any = {
  announcement: { enabled: true, tag: '', message: '', linkText: '', linkUrl: '' },
  hero: { badge: '', titleEn: '', titleAm: '', subtitleEn: '', subtitleAm: '', primaryCtaText: '', primaryCtaUrl: '', secondaryCtaText: '', secondaryCtaUrl: '', slides: [] },
  quickSearch: { enabled: true, kicker: '', kickerNum: '01', title: '', subtitle: '', buttonText: '', footnoteText: '' },
  serviceGuide: { enabled: true, kicker: '', kickerNum: '02', titleLead: '', titleEmphasis: '', description: '', sampleBadgeText: '', whatToBringTitle: '', expectationsNote: '', routeHeading: '', disclaimerText: '' },
  journey: { enabled: true, kicker: '', kickerNum: '03', title: '', steps: [] },
  newsEvents: { enabled: true, kicker: '', kickerNum: '04', title: '', sourceLabel: '', showEvents: true, showNews: true, viewAllText: '', emptyMessage: '' },
  feedback: { enabled: true, kicker: '', kickerNum: '05', title: '', description: '', pointOne: '', pointTwo: '', quote: '' },
  footer: { enabled: true, brandTagline: '', description: '', adminStripKicker: '', adminStripTitle: '', adminStripDescription: '', copyright: '', bottomNote: '', helplinePhone: '' },
};

export const LandingPageCms: React.FC<LandingPageCmsProps> = ({
  cmsConfig,
  onSaveCms,
}) => {
  const { data: apiCmsResponse, refetch: refetchCms } = useGetLandingPageCmsQuery(undefined, { refetchOnMountOrArgChange: true });
  const [updateCmsTrigger, { isLoading: isPublishing }] = useUpdateLandingPageCmsMutation();
  const [uploadImageTrigger] = useUploadCmsImageMutation();

  const [cms, setCms] = useState(() => {
    return cmsConfig || apiCmsResponse?.data || EMPTY_CMS_CONFIG;
  });

  useEffect(() => {
    if (apiCmsResponse?.data) {
      setCms(apiCmsResponse.data);
    }
  }, [apiCmsResponse]);

  const [activeTab, setActiveTab] = useState('announcement');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [toastMessage, setToastMessage] = useState('');
  const [modalItem, setModalItem] = useState<any>(null);

  // Hero editor states
  const [heroSubTab, setHeroSubTab] = useState<'copy' | 'slides'>('copy');
  const [copyLang, setCopyLang] = useState<'en' | 'am'>('en');
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const getFieldVal = (section: string, field: string) => {
    if (section === 'hero' && field === 'title') {
      return copyLang === 'am' ? (cms.hero?.titleAm || '') : (cms.hero?.titleEn || '');
    }
    if (section === 'hero' && field === 'subtitle') {
      return copyLang === 'am' ? (cms.hero?.subtitleAm || '') : (cms.hero?.subtitleEn || '');
    }
    const key = copyLang === 'am' ? `${field}Am` : field;
    return cms[section]?.[key] ?? '';
  };

  const setFieldVal = (section: string, field: string, value: any) => {
    if (section === 'hero' && field === 'title') {
      updateSection('hero', copyLang === 'am' ? 'titleAm' : 'titleEn', value);
      return;
    }
    if (section === 'hero' && field === 'subtitle') {
      updateSection('hero', copyLang === 'am' ? 'subtitleAm' : 'subtitleEn', value);
      return;
    }
    const key = copyLang === 'am' ? `${field}Am` : field;
    updateSection(section, key, value);
  };

  const handleAddSlide = () => {
    const nextIdx = cms.hero?.slides?.length || 0;
    const newSlide = {
      id: Date.now(),
      title: 'New Service Spotlight',
      titleAm: '',
      bureau: 'MUNICIPAL SERVICES',
      bureauAm: '',
      category: 'Public Services',
      categoryAm: '',
      image: '',
      alt: '',
      credit: '',
      source: '',
      tint: '#164d58',
    };
    setCms((prev: any) => ({
      ...prev,
      hero: {
        ...prev.hero,
        slides: [...(prev.hero?.slides || []), newSlide],
      },
    }));
    setActiveSlideIndex(nextIdx);
  };

  const handleDeleteSlide = (idx: number) => {
    if ((cms.hero?.slides?.length || 0) <= 1) return;
    setCms((prev: any) => ({
      ...prev,
      hero: {
        ...prev.hero,
        slides: prev.hero.slides.filter((_: any, i: number) => i !== idx),
      },
    }));
    setActiveSlideIndex((curr) => (curr >= idx ? Math.max(0, curr - 1) : curr));
  };

  const updateSection = (section: string, key: string, value: any) => {
    setCms((prev: any) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [key]: value,
      },
    }));
  };

  const updateSlide = (index: number, key: string, value: any) => {
    setCms((prev: any) => {
      const slides = [...(prev.hero?.slides || [])];
      slides[index] = { ...(slides[index] || {}), [key]: value };
      return { ...prev, hero: { ...prev.hero, slides } };
    });
  };

  const renderFlowFooter = (currentTabId: string) => {
    const currentIndex = CMS_SECTIONS.findIndex((s) => s.id === currentTabId);
    const prevSection = currentIndex > 0 ? CMS_SECTIONS[currentIndex - 1] : null;
    const nextSection = currentIndex < CMS_SECTIONS.length - 1 ? CMS_SECTIONS[currentIndex + 1] : null;

    return (
      <div className="cms-tab-flow-footer">
        {prevSection ? (
          <button
            type="button"
            className="button secondary small-button"
            onClick={() => setActiveTab(prevSection.id)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Icon name="arrow" size={13} className="flip-horizontal" />
            <span>Back: {prevSection.label}</span>
          </button>
        ) : <div />}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
            Section {currentIndex + 1} of {CMS_SECTIONS.length}
          </span>
          {nextSection ? (
            <button
              type="button"
              className="button secondary small-button"
              onClick={() => setActiveTab(nextSection.id)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
            >
              <span>Next: {nextSection.label}</span>
              <Icon name="arrow" size={13} />
            </button>
          ) : (
            <button
              type="button"
              className="button primary small-button"
              onClick={handlePublish}
              disabled={isPublishing}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Icon name="check" size={13} />
              <span>{isPublishing ? 'Publishing...' : 'Save & publish all'}</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, slideIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);

    // 1. Immediate local preview using FileReader
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        updateSlide(slideIndex, 'image', result);
        updateSlide(slideIndex, 'alt', file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);

    // 2. Server upload to obtain permanent media URL
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await uploadImageTrigger(formData).unwrap();
      const serverUrl = res?.data?.url || (res as any)?.url;
      if (serverUrl) {
        updateSlide(slideIndex, 'image', serverUrl);
        setToastMessage('Image uploaded and synced to server!');
        setTimeout(() => setToastMessage(''), 3500);
      }
    } catch (uploadErr) {
      console.warn('Image upload endpoint notice (retaining local photo for preview):', uploadErr);
      setToastMessage('Image loaded locally for preview & publishing.');
      setTimeout(() => setToastMessage(''), 3500);
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const updateJourneyStep = (index: number, key: string, value: any) => {
    setCms((prev: any) => {
      const steps = [...(prev.journey?.steps || [])];
      steps[index] = { ...(steps[index] || {}), [key]: value };
      return { ...prev, journey: { ...prev.journey, steps } };
    });
  };

  const handlePublish = async () => {
    try {
      // Deep clone and clean payload to ensure all validation rules are met
      const payload = JSON.parse(JSON.stringify(cms));

      // 1. Announcement
      if (payload.announcement) {
        payload.announcement.enabled = Boolean(payload.announcement.enabled);
        if (payload.announcement.enabled && (!payload.announcement.message || !payload.announcement.message.trim())) {
          payload.announcement.message = 'Public service notice';
        }
        delete payload.announcement.tag;
      }

      // 2. Hero slides: check if any slide still has a local data URL and attempt server upload
      if (payload.hero?.slides && Array.isArray(payload.hero.slides)) {
        for (let idx = 0; idx < payload.hero.slides.length; idx++) {
          const s = payload.hero.slides[idx];
          if (s.image && s.image.startsWith('data:image/')) {
            try {
              const res = await fetch(s.image);
              const blob = await res.blob();
              const ext = blob.type.split('/')[1] || 'jpg';
              const file = new File([blob], `slide_${idx + 1}.${ext}`, { type: blob.type || 'image/jpeg' });
              const fd = new FormData();
              fd.append('image', file);
              const uploadRes = await uploadImageTrigger(fd).unwrap();
              const serverUrl = uploadRes?.data?.url || (uploadRes as any)?.url;
              if (serverUrl) {
                s.image = serverUrl;
                updateSlide(idx, 'image', serverUrl);
              }
            } catch (err) {
              console.warn(`Could not sync data-url slide ${idx + 1} to server:`, err);
            }
          }
        }

        payload.hero.slides = payload.hero.slides.map((s: any, idx: number) => {
          return {
            id: s.id || idx + 1,
            title: s.title || `Slide ${idx + 1}`,
            titleAm: s.titleAm || '',
            bureau: s.bureau || 'MUNICIPAL SERVICES',
            bureauAm: s.bureauAm || '',
            category: s.category || s.description || '',
            categoryAm: s.categoryAm || s.descriptionAm || '',
            description: s.description || s.category || '',
            descriptionAm: s.descriptionAm || s.categoryAm || '',
            image: s.image || '',
            alt: s.alt || s.title || 'Civic office',
            credit: s.credit || 'CivicLink',
            source: s.source || '',
            tint: s.tint || '#164d58',
          };
        });
      }

      // Always persist to local cache so preview and client immediately receive it
      try {
        localStorage.setItem('CIVIC_LANDING_CMS_CACHE', JSON.stringify(payload));
        localStorage.setItem('CIVIC_LANDING_CMS_UPDATED', String(Date.now()));
        window.dispatchEvent(new CustomEvent('civiclink-cms-updated', { detail: payload }));
      } catch {
        // ignore
      }
      onSaveCms?.(payload);

      await updateCmsTrigger(payload).unwrap();
      await refetchCms();
      setToastMessage('Landing page content successfully published to backend database!');
    } catch (err: any) {
      console.error('Failed to update CMS on backend:', err);
      // Ensure local state and storage preserve the changes even on backend failure
      try {
        localStorage.setItem('CIVIC_LANDING_CMS_CACHE', JSON.stringify(cms));
        localStorage.setItem('CIVIC_LANDING_CMS_UPDATED', String(Date.now()));
        window.dispatchEvent(new CustomEvent('civiclink-cms-updated', { detail: cms }));
      } catch {
        // ignore
      }
      onSaveCms?.(cms);

      const errors = err?.data?.errors;
      const errorDetail = errors ? Object.values(errors).flat().join(', ') : err?.data?.message || err?.message || 'Publish failed.';
      setToastMessage(`Publish notice: ${errorDetail}`);
    }
    setTimeout(() => setToastMessage(''), 4500);
  };

  const { hasPermission } = usePermissions();
  const canManageCms = hasPermission('cms.manage');
  const currentSlide = cms.hero?.slides?.[activeSlideIndex] || cms.hero?.slides?.[0] || {};

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
          <div className="cms-tabs-bar" role="tablist">
            {CMS_SECTIONS.map((sec) => (
              <button
                key={sec.id}
                type="button"
                role="tab"
                aria-selected={activeTab === sec.id}
                className={`cms-tab-btn${activeTab === sec.id ? ' active' : ''}`}
                onClick={() => setActiveTab(sec.id)}
              >
                <span className="cms-tab-num">{sec.num}</span>
                <Icon name={sec.icon} size={15} />
                <span>{sec.label}</span>
              </button>
            ))}
          </div>

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
                አማርኛ (Amharic)
              </button>
            </div>
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
                {renderFlowFooter('announcement')}
              </div>
            )}

            {/* TAB 2: Hero Section (Streamlined 2-SubTab UX) */}
            {activeTab === 'hero' && (
              <div className="cms-tab-pane">
                <div className="form-section-header" style={{ marginBottom: '14px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#164a54' }}>Hero Section & Visual Spotlight</h3>
                    <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                      Configure primary homepage messaging, action buttons, and rotating bureau spotlight photography.
                    </p>
                  </div>
                </div>

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
                    <Icon name="spark" size={15} />
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
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
                          Primary Headline & Subheading
                        </span>

                        <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: '2px', borderRadius: '6px' }}>
                          <button
                            type="button"
                            onClick={() => setCopyLang('en')}
                            style={{
                              padding: '4px 12px',
                              borderRadius: '4px',
                              border: 'none',
                              background: copyLang === 'en' ? '#ffffff' : 'transparent',
                              color: copyLang === 'en' ? '#00485a' : '#64748b',
                              fontWeight: copyLang === 'en' ? 700 : 500,
                              fontSize: '12px',
                              cursor: 'pointer',
                              boxShadow: copyLang === 'en' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                            }}
                          >
                            English (EN)
                          </button>
                          <button
                            type="button"
                            onClick={() => setCopyLang('am')}
                            style={{
                              padding: '4px 12px',
                              borderRadius: '4px',
                              border: 'none',
                              background: copyLang === 'am' ? '#ffffff' : 'transparent',
                              color: copyLang === 'am' ? '#00485a' : '#64748b',
                              fontWeight: copyLang === 'am' ? 700 : 500,
                              fontSize: '12px',
                              cursor: 'pointer',
                              boxShadow: copyLang === 'am' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                            }}
                          >
                            አማርኛ (Amharic)
                          </button>
                        </div>
                      </div>

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

                {/* Sub-Tab 2: Spotlight Slides & Photos (Streamlined Visual Flow) */}
                {heroSubTab === 'slides' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Visual Slide Cards Strip */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
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
                          const bureauDisplay = (copyLang === 'am' ? slide.bureauAm : slide.bureau) || slide.bureau || `Slide ${idx + 1}`;
                          const titleDisplay = (copyLang === 'am' ? slide.titleAm : slide.title) || slide.title || 'Untitled service';
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
                                <img
                                  src={slide.image}
                                  alt={bureauDisplay}
                                  className="cms-slide-card-thumb"
                                />
                              ) : (
                                <div className="cms-slide-card-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', color: '#94a3b8' }}>
                                  <Icon name="image" size={16} />
                                </div>
                              )}
                              <div className="cms-slide-card-info">
                                <span className="cms-slide-card-num">0{idx + 1}</span>
                                <span className="cms-slide-card-title">{bureauDisplay}</span>
                                <small style={{ fontSize: '10px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                          <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', background: '#00485a', color: '#fff' }}>
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
                              value={copyLang === 'am' ? (currentSlide.bureauAm ?? '') : (currentSlide.bureau ?? '')}
                              placeholder={copyLang === 'am' ? 'ለምሳሌ፡ የገቢዎች ቢሮ' : 'e.g. REVENUE BUREAU'}
                              onChange={(e) => updateSlide(activeSlideIndex, copyLang === 'am' ? 'bureauAm' : 'bureau', e.target.value)}
                            />
                          </label>

                          <label className="modal-field">
                            <span>Service headline {copyLang === 'am' ? '(አማርኛ)' : '(English)'} <i>*</i></span>
                            <input
                              value={copyLang === 'am' ? (currentSlide.titleAm ?? '') : (currentSlide.title ?? '')}
                              placeholder={copyLang === 'am' ? 'ለምሳሌ፡ የገቢ አገልግሎቶችን በቀላሉ ይረዱ።' : 'e.g. Revenue services, made clearer.'}
                              onChange={(e) => updateSlide(activeSlideIndex, copyLang === 'am' ? 'titleAm' : 'title', e.target.value)}
                            />
                          </label>

                          <label className="modal-field full">
                            <span>Caption / Preparation guide {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
                            <input
                              value={copyLang === 'am' ? (currentSlide.descriptionAm ?? currentSlide.categoryAm ?? '') : (currentSlide.description ?? currentSlide.category ?? '')}
                              placeholder={copyLang === 'am' ? 'የአካባቢዎን የገቢዎች ቢሮ ከመጎብኘትዎ በፊት ማዘጋጀት ያለብዎትን ይወቁ።' : 'Know what to prepare before you visit your local revenue office.'}
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
                        {/* Current Photo Row */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                            <div style={{ position: 'relative', width: '88px', height: '58px', borderRadius: '6px', overflow: 'hidden', background: '#e2e8f0', flexShrink: 0 }}>
                              {currentSlide.image ? (
                                <img
                                  src={currentSlide.image}
                                  alt={currentSlide.alt || 'Slide photo'}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                                  <Icon name="image" size={20} />
                                </div>
                              )}
                              <div style={{ position: 'absolute', inset: 0, background: currentSlide.tint || '#164d58', opacity: 0.35, pointerEvents: 'none' }} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '3px', background: '#e2e8f0', color: '#0f2a36', textTransform: 'uppercase' }}>
                                Current Photo
                              </span>
                              <div style={{ fontWeight: 600, fontSize: '12.5px', color: '#0f2a36', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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

                        {/* Alt text, Credit & Atmospheric Color Tint */}
                        <div className="cms-fields-grid" style={{ paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                          <label className="modal-field">
                            <span>Photo credit / attribution</span>
                            <input
                              value={currentSlide.credit || ''}
                              placeholder="e.g. Yeka Subcity Office · CC BY 4.0"
                              onChange={(e) => updateSlide(activeSlideIndex, 'credit', e.target.value)}
                            />
                          </label>

                          <label className="modal-field">
                            <span>Photo alt text (accessibility)</span>
                            <input
                              value={currentSlide.alt || ''}
                              placeholder="Describe image for screen readers"
                              onChange={(e) => updateSlide(activeSlideIndex, 'alt', e.target.value)}
                            />
                          </label>

                          {/* Atmospheric Color Tint Swatches */}
                          <div className="modal-field full">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                                Atmospheric photo tint overlay
                              </span>
                              <small style={{ color: '#64748b', fontSize: '11px' }}>
                                Darkens the hero photo so white typography remains easily readable
                              </small>
                            </div>
                            <div className="cms-tint-swatches">
                              {TINT_SWATCHES.map((swatch) => (
                                <button
                                  key={swatch.color}
                                  type="button"
                                  title={swatch.label}
                                  aria-label={swatch.label}
                                  style={{ backgroundColor: swatch.color }}
                                  className={`cms-tint-swatch${currentSlide.tint === swatch.color ? ' active' : ''}`}
                                  onClick={() => updateSlide(activeSlideIndex, 'tint', swatch.color)}
                                />
                              ))}
                              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginLeft: '8px', fontSize: '11px', color: '#64748b' }}>
                                <span>Custom:</span>
                                <input
                                  type="color"
                                  value={currentSlide.tint || '#164d58'}
                                  onChange={(e) => updateSlide(activeSlideIndex, 'tint', e.target.value)}
                                  style={{ width: '28px', height: '28px', padding: 0, border: 'none', cursor: 'pointer' }}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {renderFlowFooter('hero')}
              </div>
            )}

            {/* TAB 3: Quick Search (Service Finder) */}
            {activeTab === 'quickSearch' && (
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
                      placeholder={copyLang === 'am' ? 'የጉብኝት መመሪያውን ለማየት አካባቢና አገልግሎት ይምረጡ።' : 'Choose a location and service to see your visit guide.'}
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
                      placeholder={copyLang === 'am' ? 'ከአንድ ደቂቃ በታች ይወስዳል · መለያ መክፈት አያስፈልግም' : 'Takes less than a minute · No account needed'}
                      onChange={(e) => setFieldVal('quickSearch', 'footnoteText', e.target.value)}
                    />
                  </label>
                </div>
                {renderFlowFooter('quickSearch')}
              </div>
            )}

            {/* TAB 4: Service Guide */}
            {activeTab === 'serviceGuide' && (
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
                      placeholder={copyLang === 'am' ? 'ከመነሳትዎ በፊት ምን እንደሚያመጡና ወደ የትኛው ክፍል እንደሚሄዱ ይወቁ።' : 'Know what to bring and which room to visit, before you set off.'}
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
                      placeholder={copyLang === 'am' ? 'የዋና ሰነዶችን ካሉ ይዘው ይምጡ። መስፈርቶቹ መቀየራቸውን ከቢሮው ያረጋግጡ።' : 'Bring original documents where available. Ask the bureau if requirements have changed.'}
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
                      placeholder={copyLang === 'am' ? 'የአገልግሎት መረጃ ሊቀየር ይችላል። እርግጠኛ ካልሆኑ ከቢሮው ያረጋግጡ።' : 'Illustrative example only. Bureaus will publish and maintain official requirements and room numbers in the live system.'}
                      onChange={(e) => setFieldVal('serviceGuide', 'disclaimerText', e.target.value)}
                    />
                  </label>
                </div>
                {renderFlowFooter('serviceGuide')}
              </div>
            )}

            {/* TAB 5: Citizen Journey */}
            {activeTab === 'journey' && (
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
                      placeholder={copyLang === 'am' ? 'ከመነሳትዎ በፊት ምን እንደሚያስፈልግ ይወቁ' : 'Three moments. One smoother journey.'}
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
                {renderFlowFooter('journey')}
              </div>
            )}

            {/* TAB 6: News & Events */}
            {activeTab === 'newsEvents' && (
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
                      placeholder={copyLang === 'am' ? 'ለዚህ ክፍለ ከተማ እስካሁን ምንም የተለጠፈ መረጃ የለም።' : 'No community updates published yet for this sub-city.'}
                      onChange={(e) => setFieldVal('newsEvents', 'emptyMessage', e.target.value)}
                    />
                  </label>
                </div>
                {renderFlowFooter('newsEvents')}
              </div>
            )}

            {/* TAB 7: Feedback & Voice */}
            {activeTab === 'feedback' && (
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
                      placeholder={copyLang === 'am' ? 'እያንዳንዱ አስተያየት አገልግሎቱን የተሻለ ያደርገዋል።' : 'Every experience can make things better.'}
                      onChange={(e) => setFieldVal('feedback', 'title', e.target.value)}
                    />
                  </label>

                  <label className="modal-field full">
                    <span>Description paragraph {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
                    <textarea
                      rows={2}
                      value={getFieldVal('feedback', 'description')}
                      placeholder={copyLang === 'am' ? 'ጉብኝትዎ እንዴት እንደነበር ያሳውቁን። አስተያየትዎ ለሚመለከተው ቢሮ ይደርሳል።' : 'Tell us how your visit went. Your feedback reaches the right bureau and helps improve services for everyone.'}
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
                      placeholder={copyLang === 'am' ? 'ከጉብኝትዎ በፊት ግልጽ መመሪያ። በኋላም በቀላሉ ድምፅዎን የሚያሰሙበት መንገድ።' : 'Clear guidance before your visit. A simple way to be heard afterward.'}
                      onChange={(e) => setFieldVal('feedback', 'quote', e.target.value)}
                    />
                  </label>
                </div>
                {renderFlowFooter('feedback')}
              </div>
            )}

            {/* TAB 8: Footer & Admin Strip */}
            {activeTab === 'footer' && (
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
                          placeholder={copyLang === 'am' ? 'የክፍለ ከተማ እና የቢሮ አስተዳዳሪዎች የአገልግሎት መመሪያዎችን፣ የክፍል አቅጣጫዎችንና ዜናዎችን ያዘምናሉ።' : 'Sub-city and bureau admins keep service guides, room routes, news, and feedback up to date.'}
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
                      placeholder={copyLang === 'am' ? 'ለእያንዳንዱ ጉብኝት ግልጽ መረጃ። የበለጠ ቀልጣፋ የህዝብ አገልግሎት።' : 'Clearer information for every visit. A more responsive public service.'}
                      onChange={(e) => setFieldVal('footer', 'description', e.target.value)}
                    />
                  </label>

                  <label className="modal-field full">
                    <span>Copyright notice {copyLang === 'am' ? '(አማርኛ)' : '(English)'}</span>
                    <input
                      value={getFieldVal('footer', 'copyright')}
                      placeholder={copyLang === 'am' ? '© 2026 ሲቪክሊንክ ኢትዮጵያ · የህዝብ አገልግሎት መረጃ መድረክ' : '© 2026 CivicLink Ethiopia · Public service information platform'}
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
                {renderFlowFooter('footer')}
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
            previewLang={copyLang}
          />
        </div>
      </div>

      {/* Edit Modal for Spotlight Card or Journey Step */}
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
                      setCms((prev: any) => {
                        const slides = [...(prev.hero?.slides || [])];
                        slides[modalItem.index] = {
                          ...(slides[modalItem.index] || {}),
                          title: modalItem.title || '',
                          bureau: modalItem.bureau || '',
                          category: modalItem.category || '',
                          image: modalItem.image || (slides[modalItem.index]?.image || ''),
                          alt: modalItem.alt || modalItem.title || '',
                          credit: modalItem.credit || '',
                          tint: modalItem.tint || '#164d58',
                        };
                        return { ...prev, hero: { ...prev.hero, slides } };
                      });
                    } else {
                      setCms((prev: any) => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          slides: [
                            ...(prev.hero?.slides || []),
                            {
                              id: Date.now(),
                              title: modalItem.title || 'Spotlight Service',
                              bureau: modalItem.bureau || 'MUNICIPAL SERVICES',
                              category: modalItem.category || '',
                              image: modalItem.image || '',
                              alt: modalItem.alt || modalItem.title || '',
                              credit: modalItem.credit || 'Civic Photo',
                              tint: modalItem.tint || '#164d58',
                            },
                          ],
                        },
                      }));
                    }
                  } else if (modalItem.type === 'journey') {
                    if (copyLang === 'am') {
                      updateJourneyStep(modalItem.index, 'titleAm', modalItem.titleAm);
                      updateJourneyStep(modalItem.index, 'detailAm', modalItem.detailAm);
                    } else {
                      updateJourneyStep(modalItem.index, 'title', modalItem.title);
                      updateJourneyStep(modalItem.index, 'detail', modalItem.detail);
                    }
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
                      <label className="modal-field full">
                        <span>Hero slide photo upload</span>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <label
                            className="button secondary small-button"
                            style={{ cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}
                          >
                            <Icon name="upload" size={13} /> Upload photo
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  if (ev.target?.result) {
                                    setModalItem((m: any) => ({
                                      ...m,
                                      image: ev.target!.result as string,
                                      alt: m.alt || file.name.replace(/\.[^/.]+$/, ''),
                                    }));
                                  }
                                };
                                reader.readAsDataURL(file);

                                try {
                                  const fd = new FormData();
                                  fd.append('image', file);
                                  const res = await uploadImageTrigger(fd).unwrap();
                                  const serverUrl = res?.data?.url || (res as any)?.url;
                                  if (serverUrl) {
                                    setModalItem((m: any) => ({ ...m, image: serverUrl }));
                                  }
                                } catch (err) {
                                  console.warn('Modal image upload endpoint notice:', err);
                                }
                                e.target.value = '';
                              }}
                            />
                          </label>
                        </div>
                        {modalItem.image && (
                          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img
                              src={modalItem.image}
                              alt=""
                              style={{ width: '56px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                            />
                            <small style={{ color: '#64748b', fontSize: '11px' }}>Current slide photo preview</small>
                          </div>
                        )}
                      </label>
                      <label className="modal-field">
                        <span>Photo credit</span>
                        <input
                          value={modalItem.credit || ''}
                          onChange={(e) =>
                            setModalItem((m: any) => ({ ...m, credit: e.target.value }))
                          }
                          placeholder="e.g. Yeka Subcity Office"
                        />
                      </label>
                      <label className="modal-field">
                        <span>Image alt text</span>
                        <input
                          value={modalItem.alt || ''}
                          onChange={(e) =>
                            setModalItem((m: any) => ({ ...m, alt: e.target.value }))
                          }
                          placeholder="Accessibility description"
                        />
                      </label>
                    </>
                  )}

                  {modalItem.type === 'journey' && (
                    <>
                      <label className="modal-field full">
                        <span>
                          Step title {copyLang === 'am' ? '(አማርኛ)' : '(English)'} <i>*</i>
                        </span>
                        <input
                          required
                          value={(copyLang === 'am' ? modalItem.titleAm : modalItem.title) || ''}
                          onChange={(e) =>
                            setModalItem((m: any) => ({
                              ...m,
                              [copyLang === 'am' ? 'titleAm' : 'title']: e.target.value,
                            }))
                          }
                          placeholder={copyLang === 'am' ? 'ለምሳሌ፡ ሰነዶችን ማዘጋጀት' : 'e.g. Check requirements'}
                        />
                      </label>
                      <label className="modal-field full">
                        <span>
                          Step instructions {copyLang === 'am' ? '(አማርኛ)' : '(English)'} <i>*</i>
                        </span>
                        <textarea
                          required
                          rows={3}
                          value={(copyLang === 'am' ? modalItem.detailAm : modalItem.detail) || ''}
                          onChange={(e) =>
                            setModalItem((m: any) => ({
                              ...m,
                              [copyLang === 'am' ? 'detailAm' : 'detail']: e.target.value,
                            }))
                          }
                          placeholder={copyLang === 'am' ? 'ዜጎች ምን ማድረግ እንዳለባቸው ያስረዱ...' : 'Explain what the citizen needs to do...'}
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
