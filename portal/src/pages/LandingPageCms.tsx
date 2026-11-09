import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../components/shared/Icon';
import { PageHeading } from '../components/shared/PageHeading';
import { usePermissions } from '../hooks/usePermissions';
import LiveLandingPreview from '../components/cms/LiveLandingPreview.jsx';
import { INITIAL_CMS_CONFIG } from '../data/portalData.js';
import {
  useGetLandingPageCmsQuery,
  useUpdateLandingPageCmsMutation,
  useUploadCmsImageMutation,
} from '../services/cmsApi';

export interface LandingPageCmsProps {
  cmsConfig?: any;
  onSaveCms?: (cms: any) => void;
}

const CURATED_IMAGE_PRESETS = [
  {
    title: 'Yeka Subcity Office',
    bureau: 'REVENUE BUREAU',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Local_government_building%2C_Yeka_Subcity%2C_Addis_Ababa.jpg/1280px-Local_government_building%2C_Yeka_Subcity%2C_Addis_Ababa.jpg',
    alt: 'Local government office building in Yeka Subcity, Addis Ababa.',
    credit: 'Yeka Subcity Office · Mjr74 (CC BY 4.0)',
    source: 'https://commons.wikimedia.org/wiki/File:Local_government_building,_Yeka_Subcity,_Addis_Ababa.jpg',
    tint: '#164d58',
  },
  {
    title: 'Ministry of Planning',
    bureau: 'PLANNING & DEVELOPMENT',
    image: 'https://mopd.gov.et/media/492570380_994507082831520_8549139107595449985_n.jpg',
    alt: 'Officials meet at Ethiopia’s Ministry of Planning and Development.',
    credit: 'Ministry of Planning & Development',
    source: 'https://mopd.gov.et/',
    tint: '#365b63',
  },
  {
    title: 'CRRSA Main Lobby',
    bureau: 'CIVIL REGISTRATION',
    image: 'https://aacrrsa.gov.et/uploads/Blog/662a29f023bf6.438697344_821273923352047_6926469178446352208_n.jpg',
    alt: 'The Addis Ababa Civil Registration and Residency Service Agency lobby.',
    credit: 'Civil Registration & Residency Service Agency',
    source: 'https://aacrrsa.gov.et/',
    tint: '#3b625e',
  },
  {
    title: 'Lemi Kura Woreda 08',
    bureau: 'LAND ADMINISTRATION',
    image: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Lemikurasubcityworeda08.jpg',
    alt: 'Lemi Kura Woreda 08 local government office in Addis Ababa.',
    credit: 'Lemi Kura Woreda 08 · Khajitdadddy (CC BY-SA 4.0)',
    source: 'https://commons.wikimedia.org/wiki/File:Lemikurasubcityworeda08.jpg',
    tint: '#536458',
  },
  {
    title: 'Addis Ababa City Hall',
    bureau: 'MUNICIPAL SERVICES',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Addis_Ababa_City_Hall.jpg/1280px-Addis_Ababa_City_Hall.jpg',
    alt: 'Addis Ababa City Hall municipal building facade and clock tower.',
    credit: 'Addis Ababa City Government',
    source: 'https://commons.wikimedia.org/wiki/File:Addis_Ababa_City_Hall.jpg',
    tint: '#0f2a36',
  },
  {
    title: 'Bole Administration',
    bureau: 'COMMUNITY & TRADE',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Bole_sub_city_administration_office.jpg/1280px-Bole_sub_city_administration_office.jpg',
    alt: 'Bole sub-city administration center and civic service counters.',
    credit: 'Bole Sub-City Administration',
    source: 'https://commons.wikimedia.org/wiki/File:Bole_sub_city_administration_office.jpg',
    tint: '#2d4536',
  },
];

const TINT_SWATCHES = [
  { label: 'Dark Teal', color: '#164d58' },
  { label: 'Deep Slate', color: '#365b63' },
  { label: 'Forest Green', color: '#3b625e' },
  { label: 'Charcoal', color: '#536458' },
  { label: 'Midnight Blue', color: '#0f2a36' },
  { label: 'Olive Bronze', color: '#2d4536' },
];

export const LandingPageCms: React.FC<LandingPageCmsProps> = ({
  cmsConfig = INITIAL_CMS_CONFIG,
  onSaveCms,
}) => {
  const { data: apiCmsResponse, refetch: refetchCms } = useGetLandingPageCmsQuery(undefined, { refetchOnMountOrArgChange: true });
  const [updateCmsTrigger, { isLoading: isPublishing }] = useUpdateLandingPageCmsMutation();
  const [uploadImageTrigger] = useUploadCmsImageMutation();

  const [cms, setCms] = useState(() => {
    try {
      const cached = localStorage.getItem('CIVIC_LANDING_CMS_CACHE');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // ignore
    }
    return JSON.parse(JSON.stringify(cmsConfig || INITIAL_CMS_CONFIG));
  });

  useEffect(() => {
    if (apiCmsResponse?.data) {
      setCms(apiCmsResponse.data);
      try {
        localStorage.setItem('CIVIC_LANDING_CMS_CACHE', JSON.stringify(apiCmsResponse.data));
      } catch {
        // ignore
      }
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
  const [imageInputMode, setImageInputMode] = useState<'preset' | 'upload' | 'url'>('preset');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleAddSlide = () => {
    const nextIdx = cms.hero?.slides?.length || 0;
    const preset = CURATED_IMAGE_PRESETS[nextIdx % CURATED_IMAGE_PRESETS.length];
    const newSlide = {
      id: Date.now(),
      title: 'New Service Spotlight',
      bureau: 'MUNICIPAL SERVICES',
      category: 'Public Services',
      image: preset.image,
      alt: preset.alt,
      credit: preset.credit,
      source: preset.source,
      tint: preset.tint,
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

  const applyPresetToSlide = (index: number, preset: typeof CURATED_IMAGE_PRESETS[0]) => {
    setCms((prev: any) => {
      const slides = [...(prev.hero?.slides || [])];
      slides[index] = {
        ...(slides[index] || {}),
        image: preset.image,
        alt: preset.alt,
        credit: preset.credit,
        source: preset.source,
        tint: preset.tint,
      };
      return { ...prev, hero: { ...prev.hero, slides } };
    });
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
            bureau: s.bureau || 'MUNICIPAL SERVICES',
            category: s.category || '',
            image: s.image || CURATED_IMAGE_PRESETS[idx % CURATED_IMAGE_PRESETS.length].image,
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
      setToastMessage('Landing page content successfully published to citizen platform!');
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

      const isNotFound =
        err?.status === 404 ||
        err?.data?.message?.includes('could not be found') ||
        err?.data?.message?.includes('not found');

      if (isNotFound) {
        setToastMessage('Changes saved to local preview & cache! (Backend endpoint /api/v1/cms/landing-page is not deployed on this server yet)');
      } else {
        const errors = err?.data?.errors;
        const errorDetail = errors ? Object.values(errors).flat().join(', ') : err?.data?.message;
        setToastMessage(errorDetail ? `Publish notice: ${errorDetail}` : 'Changes saved locally.');
      }
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
        secondary={canManageCms ? 'Reset to default' : undefined}
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
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'announcement'}
              className={`cms-tab-btn${activeTab === 'announcement' ? ' active' : ''}`}
              onClick={() => setActiveTab('announcement')}
            >
              <Icon name="bell" size={15} /> Announcement
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'hero'}
              className={`cms-tab-btn${activeTab === 'hero' ? ' active' : ''}`}
              onClick={() => setActiveTab('hero')}
            >
              <Icon name="spark" size={15} /> Hero & slides
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'quickSearch'}
              className={`cms-tab-btn${activeTab === 'quickSearch' ? ' active' : ''}`}
              onClick={() => setActiveTab('quickSearch')}
            >
              <Icon name="search" size={15} /> Quick search
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'serviceGuide'}
              className={`cms-tab-btn${activeTab === 'serviceGuide' ? ' active' : ''}`}
              onClick={() => setActiveTab('serviceGuide')}
            >
              <Icon name="layers" size={15} /> Service guide
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'journey'}
              className={`cms-tab-btn${activeTab === 'journey' ? ' active' : ''}`}
              onClick={() => setActiveTab('journey')}
            >
              <Icon name="route" size={15} /> Citizen journey
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'newsEvents'}
              className={`cms-tab-btn${activeTab === 'newsEvents' ? ' active' : ''}`}
              onClick={() => setActiveTab('newsEvents')}
            >
              <Icon name="news" size={15} /> News & events
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'feedback'}
              className={`cms-tab-btn${activeTab === 'feedback' ? ' active' : ''}`}
              onClick={() => setActiveTab('feedback')}
            >
              <Icon name="message" size={15} /> Feedback & voice
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'footer'}
              className={`cms-tab-btn${activeTab === 'footer' ? ' active' : ''}`}
              onClick={() => setActiveTab('footer')}
            >
              <Icon name="building" size={15} /> Footer & teams
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
                      checked={Boolean(cms.announcement?.enabled)}
                      onChange={(e) => updateSection('announcement', 'enabled', e.target.checked)}
                    />
                    <span>{cms.announcement?.enabled ? 'Visible' : 'Hidden'}</span>
                  </label>
                </div>

                <div className="cms-fields-grid">
                  <label className="modal-field">
                    <span>Banner tag / badge</span>
                    <input
                      value={cms.announcement?.tag || ''}
                      placeholder="e.g. PUBLIC ADVISORY"
                      onChange={(e) => updateSection('announcement', 'tag', e.target.value)}
                    />
                  </label>

                  <label className="modal-field full">
                    <span>Notice message</span>
                    <input
                      value={cms.announcement?.message || ''}
                      placeholder="Enter announcement text shown to citizens"
                      onChange={(e) => updateSection('announcement', 'message', e.target.value)}
                    />
                  </label>

                  <label className="modal-field">
                    <span>Link button text</span>
                    <input
                      value={cms.announcement?.linkText || ''}
                      placeholder="e.g. Explore the guide"
                      onChange={(e) => updateSection('announcement', 'linkText', e.target.value)}
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
                      <span>Hero badge / eyebrow</span>
                      <input
                        value={cms.hero?.badge || ''}
                        placeholder="e.g. OFFICIAL CITIZEN PORTAL"
                        onChange={(e) => updateSection('hero', 'badge', e.target.value)}
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
                          <span>Primary button text</span>
                          <input
                            value={cms.hero?.primaryCtaText || 'Find a service'}
                            onChange={(e) => updateSection('hero', 'primaryCtaText', e.target.value)}
                          />
                        </label>

                        <label className="modal-field">
                          <span>Secondary button text</span>
                          <input
                            value={cms.hero?.secondaryCtaText || 'I’ve already visited'}
                            onChange={(e) => updateSection('hero', 'secondaryCtaText', e.target.value)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-Tab 2: Spotlight Slides & Photos (Unified Master-Detail Flow) */}
                {heroSubTab === 'slides' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Slide Selector Carousel Bar */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', flex: 1, minWidth: '240px' }}>
                        {cms.hero?.slides?.map((slide: any, idx: number) => {
                          const isSelected = activeSlideIndex === idx;
                          return (
                            <button
                              key={slide.id || idx}
                              type="button"
                              onClick={() => setActiveSlideIndex(idx)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: isSelected ? '1.5px solid #00485a' : '1px solid #cbd5e1',
                                background: isSelected ? '#00485a' : '#ffffff',
                                color: isSelected ? '#ffffff' : '#475569',
                                fontWeight: isSelected ? 700 : 500,
                                fontSize: '12px',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <span style={{ opacity: isSelected ? 0.9 : 0.6, fontSize: '10.5px', fontFamily: 'monospace' }}>
                                0{idx + 1}
                              </span>
                              <span>{slide.bureau || `Slide ${idx + 1}`}</span>
                            </button>
                          );
                        })}
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

                    {/* Unified Active Slide Editor Card */}
                    <div
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '18px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      }}
                    >
                      {/* Slide Meta Fields */}
                      <div className="cms-fields-grid">
                        <label className="modal-field full">
                          <span>Service Spotlight Title <i>*</i></span>
                          <input
                            value={currentSlide.title || ''}
                            placeholder="e.g. Business tax registration & clearance"
                            onChange={(e) => updateSlide(activeSlideIndex, 'title', e.target.value)}
                          />
                        </label>

                        <label className="modal-field">
                          <span>Bureau Jurisdiction <i>*</i></span>
                          <input
                            value={currentSlide.bureau || ''}
                            placeholder="e.g. REVENUE BUREAU"
                            onChange={(e) => updateSlide(activeSlideIndex, 'bureau', e.target.value)}
                          />
                        </label>

                        <label className="modal-field">
                          <span>Service Category Tag</span>
                          <input
                            value={currentSlide.category || ''}
                            placeholder="e.g. Tax & Compliance"
                            onChange={(e) => updateSlide(activeSlideIndex, 'category', e.target.value)}
                          />
                        </label>
                      </div>

                      {/* Photo Visual Studio */}
                      <div
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '14px',
                        }}
                      >
                        {/* Live Photo Shell Preview */}
                        <div
                          className="cms-image-preview-shell"
                          style={{ '--slide-tint': currentSlide.tint || '#164d58', height: '160px' } as React.CSSProperties}
                        >
                          {currentSlide.image ? (
                            <img
                              src={currentSlide.image}
                              alt={currentSlide.alt || 'Hero preview'}
                              className="cms-image-preview-img"
                            />
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                              <Icon name="image" size={32} /> No image selected
                            </div>
                          )}
                          <div className="cms-image-preview-scrim" />
                          <div className="cms-image-preview-meta">
                            <div>
                              <span className="bureau-badge">{currentSlide.bureau || 'Spotlight photo'}</span>
                              <div style={{ fontWeight: 600, fontSize: '13px', marginTop: '2px' }}>
                                {currentSlide.title || 'Untitled service'}
                              </div>
                            </div>
                            {currentSlide.credit && <small>{currentSlide.credit}</small>}
                          </div>
                        </div>

                        {/* Image Source Mode Buttons */}
                        <div className="cms-image-source-nav">
                          <button
                            type="button"
                            className={`cms-image-source-btn${imageInputMode === 'preset' ? ' active' : ''}`}
                            onClick={() => setImageInputMode('preset')}
                          >
                            <Icon name="building" size={13} /> Official presets ({CURATED_IMAGE_PRESETS.length})
                          </button>
                          <button
                            type="button"
                            className={`cms-image-source-btn${imageInputMode === 'upload' ? ' active' : ''}`}
                            onClick={() => setImageInputMode('upload')}
                          >
                            <Icon name="upload" size={13} /> Upload photo
                          </button>
                          <button
                            type="button"
                            className={`cms-image-source-btn${imageInputMode === 'url' ? ' active' : ''}`}
                            onClick={() => setImageInputMode('url')}
                          >
                            <Icon name="globe" size={13} /> Web image URL
                          </button>
                        </div>

                        {/* Mode 1: Presets Gallery */}
                        {imageInputMode === 'preset' && (
                          <div>
                            <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                              Click an Ethiopian government building photo to apply:
                            </span>
                            <div className="cms-image-presets-grid">
                              {CURATED_IMAGE_PRESETS.map((preset) => (
                                <button
                                  key={preset.title}
                                  type="button"
                                  className={`cms-image-preset-item${currentSlide.image === preset.image ? ' active' : ''}`}
                                  onClick={() => applyPresetToSlide(activeSlideIndex, preset)}
                                >
                                  <img src={preset.image} alt={preset.alt} className="cms-image-preset-thumb" />
                                  <div className="cms-image-preset-info">
                                    <span className="cms-image-preset-title">{preset.title}</span>
                                    <span className="cms-image-preset-bureau">{preset.bureau}</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Mode 2: Local File Upload */}
                        {imageInputMode === 'upload' && (
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
                        )}

                        {/* Mode 3: Direct Web URL */}
                        {imageInputMode === 'url' && (
                          <div className="cms-fields-grid">
                            <label className="modal-field full">
                              <span>Image web URL</span>
                              <input
                                value={currentSlide.image || ''}
                                placeholder="https://example.gov.et/photo.jpg"
                                onChange={(e) => updateSlide(activeSlideIndex, 'image', e.target.value)}
                              />
                            </label>
                          </div>
                        )}

                        {/* Alt text & Credit */}
                        <div className="cms-fields-grid" style={{ paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                          <label className="modal-field">
                            <span>Photo alt text (accessibility)</span>
                            <input
                              value={currentSlide.alt || ''}
                              placeholder="Describe image for screen readers"
                              onChange={(e) => updateSlide(activeSlideIndex, 'alt', e.target.value)}
                            />
                          </label>

                          <label className="modal-field">
                            <span>Photo credit / attribution</span>
                            <input
                              value={currentSlide.credit || ''}
                              placeholder="e.g. Yeka Subcity Office · CC BY 4.0"
                              onChange={(e) => updateSlide(activeSlideIndex, 'credit', e.target.value)}
                            />
                          </label>

                          {/* Atmospheric Color Tint Swatches */}
                          <div className="modal-field full">
                            <span style={{ marginBottom: '6px', display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                              Atmospheric photo tint overlay
                            </span>
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
                    <span>Section kicker / overline</span>
                    <input
                      value={cms.quickSearch?.kicker || 'START HERE'}
                      onChange={(e) => updateSection('quickSearch', 'kicker', e.target.value)}
                    />
                  </label>

                  <label className="modal-field full">
                    <span>Section headline</span>
                    <input
                      value={cms.quickSearch?.title || 'What do you need help with?'}
                      onChange={(e) => updateSection('quickSearch', 'title', e.target.value)}
                    />
                  </label>

                  <label className="modal-field full">
                    <span>Instructions / sub-lead</span>
                    <input
                      value={cms.quickSearch?.subtitle || 'Choose a location and service to see your visit guide.'}
                      onChange={(e) => updateSection('quickSearch', 'subtitle', e.target.value)}
                    />
                  </label>

                  <label className="modal-field">
                    <span>Search submit button text</span>
                    <input
                      value={cms.quickSearch?.buttonText || 'Show my guide'}
                      onChange={(e) => updateSection('quickSearch', 'buttonText', e.target.value)}
                    />
                  </label>

                  <label className="modal-field">
                    <span>Footnote perks & reassurance</span>
                    <input
                      value={cms.quickSearch?.footnoteText || 'Takes less than a minute · No account needed'}
                      onChange={(e) => updateSection('quickSearch', 'footnoteText', e.target.value)}
                    />
                  </label>
                </div>
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
                    <span>Section kicker badge</span>
                    <input
                      value={cms.serviceGuide?.kicker || 'YOUR VISIT GUIDE'}
                      onChange={(e) => updateSection('serviceGuide', 'kicker', e.target.value)}
                    />
                  </label>

                  <label className="modal-field">
                    <span>Title lead</span>
                    <input
                      value={cms.serviceGuide?.titleLead || 'A clearer path,'}
                      onChange={(e) => updateSection('serviceGuide', 'titleLead', e.target.value)}
                    />
                  </label>

                  <label className="modal-field">
                    <span>Title emphasis</span>
                    <input
                      value={cms.serviceGuide?.titleEmphasis || 'step by step.'}
                      onChange={(e) => updateSection('serviceGuide', 'titleEmphasis', e.target.value)}
                    />
                  </label>

                  <label className="modal-field full">
                    <span>Section introduction description</span>
                    <textarea
                      rows={2}
                      value={cms.serviceGuide?.description || 'Know what to bring and which room to visit, before you set off. The sample guide below shows how service details will appear.'}
                      onChange={(e) => updateSection('serviceGuide', 'description', e.target.value)}
                    />
                  </label>

                  <label className="modal-field">
                    <span>Sample guide badge label</span>
                    <input
                      value={cms.serviceGuide?.sampleBadgeText || 'SAMPLE GUIDE'}
                      onChange={(e) => updateSection('serviceGuide', 'sampleBadgeText', e.target.value)}
                    />
                  </label>

                  <label className="modal-field">
                    <span>Requirements checklist heading</span>
                    <input
                      value={cms.serviceGuide?.whatToBringTitle || 'What to bring'}
                      onChange={(e) => updateSection('serviceGuide', 'whatToBringTitle', e.target.value)}
                    />
                  </label>

                  <label className="modal-field full">
                    <span>Document expectations note</span>
                    <input
                      value={cms.serviceGuide?.expectationsNote || 'Bring original documents where available. Ask the bureau if requirements have changed.'}
                      onChange={(e) => updateSection('serviceGuide', 'expectationsNote', e.target.value)}
                    />
                  </label>

                  <label className="modal-field full">
                    <span>Route panel heading</span>
                    <input
                      value={cms.serviceGuide?.routeHeading || 'Your room-by-room route'}
                      onChange={(e) => updateSection('serviceGuide', 'routeHeading', e.target.value)}
                    />
                  </label>

                  <label className="modal-field full">
                    <span>Illustrative disclaimer</span>
                    <input
                      value={cms.serviceGuide?.disclaimerText || 'Illustrative example only. Bureaus will publish and maintain official requirements and room numbers in the live system.'}
                      onChange={(e) => updateSection('serviceGuide', 'disclaimerText', e.target.value)}
                    />
                  </label>
                </div>
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
                    <span>Section kicker</span>
                    <input
                      value={cms.journey?.kicker || 'HOW IT WORKS'}
                      onChange={(e) => updateSection('journey', 'kicker', e.target.value)}
                    />
                  </label>

                  <label className="modal-field full">
                    <span>Journey introduction</span>
                    <textarea
                      rows={2}
                      value={cms.journey?.title || ''}
                      onChange={(e) => updateSection('journey', 'title', e.target.value)}
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
                    <span>Section kicker</span>
                    <input
                      value={cms.newsEvents?.kicker || 'FROM YOUR COMMUNITY'}
                      onChange={(e) => updateSection('newsEvents', 'kicker', e.target.value)}
                    />
                  </label>

                  <label className="modal-field full">
                    <span>Section headline</span>
                    <input
                      value={cms.newsEvents?.title || 'What’s happening near you.'}
                      onChange={(e) => updateSection('newsEvents', 'title', e.target.value)}
                    />
                  </label>

                  <label className="modal-field">
                    <span>Attribution source tag</span>
                    <input
                      value={cms.newsEvents?.sourceLabel || 'Published by sub-city admins'}
                      onChange={(e) => updateSection('newsEvents', 'sourceLabel', e.target.value)}
                    />
                  </label>

                  <label className="modal-field">
                    <span>Hub link text</span>
                    <input
                      value={cms.newsEvents?.viewAllText || 'Explore news & events hub'}
                      onChange={(e) => updateSection('newsEvents', 'viewAllText', e.target.value)}
                    />
                  </label>

                  <label className="modal-field full">
                    <span>Empty feed fallback message</span>
                    <input
                      value={cms.newsEvents?.emptyMessage || 'No community updates published yet for this sub-city.'}
                      onChange={(e) => updateSection('newsEvents', 'emptyMessage', e.target.value)}
                    />
                  </label>
                </div>
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
                    <span>Section kicker</span>
                    <input
                      value={cms.feedback?.kicker || 'YOUR VOICE HELPS'}
                      onChange={(e) => updateSection('feedback', 'kicker', e.target.value)}
                    />
                  </label>

                  <label className="modal-field full">
                    <span>Section headline</span>
                    <input
                      value={cms.feedback?.title || 'Every experience can make things better.'}
                      onChange={(e) => updateSection('feedback', 'title', e.target.value)}
                    />
                  </label>

                  <label className="modal-field full">
                    <span>Description paragraph</span>
                    <textarea
                      rows={2}
                      value={cms.feedback?.description || 'Tell us how your visit went. Your feedback reaches the right bureau and helps improve services for everyone.'}
                      onChange={(e) => updateSection('feedback', 'description', e.target.value)}
                    />
                  </label>

                  <label className="modal-field">
                    <span>Perk point 1</span>
                    <input
                      value={cms.feedback?.pointOne || 'No account needed'}
                      onChange={(e) => updateSection('feedback', 'pointOne', e.target.value)}
                    />
                  </label>

                  <label className="modal-field">
                    <span>Perk point 2</span>
                    <input
                      value={cms.feedback?.pointTwo || 'Scan a bureau QR code'}
                      onChange={(e) => updateSection('feedback', 'pointTwo', e.target.value)}
                    />
                  </label>

                  <label className="modal-field full">
                    <span>Callout quote</span>
                    <textarea
                      rows={2}
                      value={cms.feedback?.quote || 'Clear guidance before your visit. A simple way to be heard afterward.'}
                      onChange={(e) => updateSection('feedback', 'quote', e.target.value)}
                    />
                  </label>
                </div>
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
                        <span>Admin strip kicker</span>
                        <input
                          value={cms.footer?.adminStripKicker || 'FOR PUBLIC SERVICE TEAMS'}
                          onChange={(e) => updateSection('footer', 'adminStripKicker', e.target.value)}
                        />
                      </label>
                      <label className="modal-field full">
                        <span>Admin strip title</span>
                        <input
                          value={cms.footer?.adminStripTitle || 'Manage information where it belongs.'}
                          onChange={(e) => updateSection('footer', 'adminStripTitle', e.target.value)}
                        />
                      </label>
                      <label className="modal-field full">
                        <span>Admin strip description</span>
                        <textarea
                          rows={2}
                          value={cms.footer?.adminStripDescription || 'Sub-city and bureau admins keep service guides, room routes, news, and feedback up to date.'}
                          onChange={(e) => updateSection('footer', 'adminStripDescription', e.target.value)}
                        />
                      </label>
                    </div>
                  </div>

                  <label className="modal-field">
                    <span>Footer brand tagline</span>
                    <input
                      value={cms.footer?.brandTagline || 'ETHIOPIA · CITIZEN SERVICES'}
                      onChange={(e) => updateSection('footer', 'brandTagline', e.target.value)}
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
                    <span>Footer description</span>
                    <input
                      value={cms.footer?.description || 'Clearer information for every visit. A more responsive public service.'}
                      onChange={(e) => updateSection('footer', 'description', e.target.value)}
                    />
                  </label>

                  <label className="modal-field full">
                    <span>Copyright notice</span>
                    <input
                      value={cms.footer?.copyright || '© 2026 CivicLink Ethiopia · Public service information platform'}
                      onChange={(e) => updateSection('footer', 'copyright', e.target.value)}
                    />
                  </label>

                  <label className="modal-field full">
                    <span>Bottom note</span>
                    <input
                      value={cms.footer?.bottomNote || 'Built for citizens, maintained by bureaus.'}
                      onChange={(e) => updateSection('footer', 'bottomNote', e.target.value)}
                    />
                  </label>
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
                          image: modalItem.image || (slides[modalItem.index]?.image || CURATED_IMAGE_PRESETS[0].image),
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
                              image: modalItem.image || CURATED_IMAGE_PRESETS[0].image,
                              alt: modalItem.alt || modalItem.title || '',
                              credit: modalItem.credit || 'Civic Photo',
                              tint: modalItem.tint || '#164d58',
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
                      <label className="modal-field full">
                        <span>Hero slide image URL or local photo upload</span>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            value={modalItem.image || ''}
                            onChange={(e) =>
                              setModalItem((m: any) => ({ ...m, image: e.target.value }))
                            }
                            placeholder="https://... or upload below"
                            style={{ flex: 1 }}
                          />
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
