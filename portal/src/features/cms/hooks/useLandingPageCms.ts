import { useState, useEffect } from 'react';
import { usePermissions } from '../../shared';
import {
  useGetLandingPageCmsQuery,
  useUpdateLandingPageCmsMutation,
  useUploadCmsImageMutation,
} from '../api/cmsApi';
import { CMS_SECTIONS, EMPTY_CMS_CONFIG } from '../constants';

export interface UseLandingPageCmsProps {
  cmsConfig?: any;
  onSaveCms?: (cms: any) => void;
}

export const useLandingPageCms = ({ cmsConfig, onSaveCms }: UseLandingPageCmsProps = {}) => {
  const { data: apiCmsResponse, refetch: refetchCms } = useGetLandingPageCmsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
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

  const [activeTab, setActiveTab] = useState<string>('announcement');
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
      return copyLang === 'am' ? cms.hero?.titleAm || '' : cms.hero?.titleEn || '';
    }
    if (section === 'hero' && field === 'subtitle') {
      return copyLang === 'am' ? cms.hero?.subtitleAm || '' : cms.hero?.subtitleEn || '';
    }
    const key = copyLang === 'am' ? `${field}Am` : field;
    return cms[section]?.[key] ?? '';
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

  const updateSlide = (index: number, key: string, value: any) => {
    setCms((prev: any) => {
      const slides = [...(prev.hero?.slides || [])];
      slides[index] = { ...(slides[index] || {}), [key]: value };
      return { ...prev, hero: { ...prev.hero, slides } };
    });
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, slideIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        updateSlide(slideIndex, 'image', result);
        updateSlide(slideIndex, 'alt', file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);

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
      const payload = JSON.parse(JSON.stringify(cms));

      if (payload.announcement) {
        payload.announcement.enabled = Boolean(payload.announcement.enabled);
        if (payload.announcement.enabled && (!payload.announcement.message || !payload.announcement.message.trim())) {
          payload.announcement.message = 'Public service notice';
        }
        delete payload.announcement.tag;
      }

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

        payload.hero.slides = payload.hero.slides.map((s: any, idx: number) => ({
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
        }));
      }

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

  return {
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
  };
};

export default useLandingPageCms;

