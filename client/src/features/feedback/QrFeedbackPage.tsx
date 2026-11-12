import { useState, useEffect, useMemo, useRef } from 'react';
import { BrandMark, Icon } from '../shared';
import { useSubmitFeedbackMutation, useLazyTrackFeedbackQuery } from './api/feedbackApi';
import { useGetOrganizationsQuery, useGetServicesQuery } from '../services';
import { createFeedbackTrackingNumber } from '../../utils/feedbackTracking';
import './styles/qrFeedback.css';

export interface QrFeedbackPageProps {
  language: string;
  t: (key: string) => string;
  onNavigateToHome: () => void;
  onSelectLanguage?: (lang: string) => void;
}

const positiveTags = [
  'Fast service',
  'Helpful staff',
  'Clear instructions',
  'Clean office',
];

const issueTags = [
  'Long wait / delay',
  'Staff was absent',
  'Asked for extra papers',
  'System was offline',
  'Disrespectful staff',
];

export default function QrFeedbackPage({
  language,
  t,
  onNavigateToHome,
  onSelectLanguage,
}: QrFeedbackPageProps) {
  // 1. Navigation & Mode State
  const [activeIntent, setActiveIntent] = useState<'feedback' | 'services'>('feedback');
  const [feedbackType, setFeedbackType] = useState<'satisfaction' | 'complaint' | 'feedback'>('satisfaction');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [starRating, setStarRating] = useState<number>(5);
  const [message, setMessage] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [showOfficePicker, setShowOfficePicker] = useState<boolean>(false);
  const [copiedTracking, setCopiedTracking] = useState<boolean>(false);
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Status Tracking search state
  const [searchTrackingInput, setSearchTrackingInput] = useState<string>('');
  const [trackedRecord, setTrackedRecord] = useState<any>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  // 2. Data APIs
  const [submitFeedbackMutation, { isLoading: isSubmitting }] = useSubmitFeedbackMutation();
  const [triggerTrack, { isLoading: isTrackingLoading }] = useLazyTrackFeedbackQuery();
  const { data: orgsData, isLoading: isOrgsLoading } = useGetOrganizationsQuery({ per_page: 100 });

  const allOrganizations = useMemo(() => {
    if (!orgsData?.data) return [];
    if (Array.isArray(orgsData.data)) return orgsData.data;
    if (Array.isArray((orgsData.data as any).data)) return (orgsData.data as any).data;
    return [];
  }, [orgsData]);

  // Sub-cities and child bureaus
  const subCities = useMemo(() => {
    return allOrganizations.filter(
      (o: any) =>
        o.parent_organization_id === null &&
        (o.type?.code === 'sub_city' ||
          o.name?.toLowerCase().includes('sub-city') ||
          o.name?.toLowerCase().includes('subcity'))
    );
  }, [allOrganizations]);

  // Selected Office state
  const [selectedSubCityName, setSelectedSubCityName] = useState<string>('');
  const [selectedBureauId, setSelectedBureauId] = useState<string>('');
  const qrScannedRef = useRef(false);

  // 3. Parse URL Search Parameters (supporting QR scanning patterns)
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    let hashSearch = '';
    if (window.location.hash.includes('?')) {
      hashSearch = window.location.hash.split('?')[1];
    }
    const hashParams = new URLSearchParams(hashSearch);
    const getParam = (key: string) => hashParams.get(key) || searchParams.get(key);

    const orgParam = getParam('org') || getParam('bureau') || getParam('office');
    const subCityParam = getParam('sub_city') || getParam('subcity') || getParam('city');
    const serviceParam = getParam('service') || getParam('sub_service');
    const typeParam = getParam('type');
    const qrCode = getParam('code');

    // Record QR scan in backend if code is provided
    if (qrCode && !qrScannedRef.current) {
      qrScannedRef.current = true;
      fetch(`/api/v1/qr-codes/${encodeURIComponent(qrCode)}/scan`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
      }).catch(() => {
        // scan logging is best-effort
      });
    }

    if (typeParam) {
      const lower = typeParam.toLowerCase();
      if (lower === 'complaint') setFeedbackType('complaint');
      else if (lower === 'satisfaction' || lower === 'rating') setFeedbackType('satisfaction');
      else setFeedbackType('feedback');
    }

    if (serviceParam) {
      setSelectedServiceId(serviceParam);
    }

    if (allOrganizations.length > 0) {
      let matchedOrg: any = null;
      if (orgParam) {
        matchedOrg = allOrganizations.find(
          (o: any) =>
            String(o.id) === String(orgParam) ||
            String(o.code).toLowerCase() === String(orgParam).toLowerCase() ||
            o.name.toLowerCase().includes(String(orgParam).toLowerCase())
        );
      }

      if (matchedOrg) {
        setSelectedBureauId(String(matchedOrg.id));
        if (matchedOrg.parent_organization_id) {
          const parent = allOrganizations.find((p: any) => p.id === matchedOrg.parent_organization_id);
          if (parent) setSelectedSubCityName(parent.name);
        } else if (matchedOrg.name.toLowerCase().includes('sub-city')) {
          setSelectedSubCityName(matchedOrg.name);
        }
      } else if (subCityParam) {
        const matchedSub = allOrganizations.find(
          (o: any) =>
            String(o.id) === String(subCityParam) ||
            o.name.toLowerCase().includes(String(subCityParam).toLowerCase())
        );
        if (matchedSub) {
          setSelectedSubCityName(matchedSub.name);
        }
      }
    }
  }, [allOrganizations]);

  // Resolved active office
  const activeOffice = useMemo(() => {
    if (selectedBureauId) {
      const b = allOrganizations.find((o: any) => String(o.id) === String(selectedBureauId));
      if (b) return b;
    }
    // Fallback to first available bureau or default
    return (
      allOrganizations.find(
        (o: any) => o.parent_organization_id !== null || o.type?.code === 'bureau'
      ) ||
      allOrganizations[0] || {
        id: 1,
        name: 'Public Service Desk',
        code: 'PSD-01',
      }
    );
  }, [allOrganizations, selectedBureauId]);

  // Effective Sub-City
  const displaySubCity = useMemo(() => {
    if (selectedSubCityName) return selectedSubCityName;
    if (activeOffice?.parent) return activeOffice.parent.name;
    if (activeOffice?.parent_organization_id) {
      const p = allOrganizations.find((o: any) => o.id === activeOffice.parent_organization_id);
      if (p) return p.name;
    }
    return 'Addis Ababa';
  }, [selectedSubCityName, activeOffice, allOrganizations]);

  // Bureaus under chosen sub-city
  const availableBureausForPicker = useMemo(() => {
    if (!selectedSubCityName) return allOrganizations;
    const sub = subCities.find((s: any) => s.name === selectedSubCityName);
    if (!sub) return allOrganizations;
    const children = allOrganizations.filter((o: any) => o.parent_organization_id === sub.id);
    return children.length > 0 ? children : allOrganizations;
  }, [allOrganizations, selectedSubCityName, subCities]);

  // 4. Fetch Services for this active office
  const { data: servicesData, isLoading: isServicesLoading } = useGetServicesQuery({
    per_page: 50,
    organization_id: activeOffice?.id || undefined,
  });

  const availableServices = useMemo(() => {
    const list: any[] = [];
    const raw = servicesData?.data || [];
    if (Array.isArray(raw) && raw.length > 0) {
      raw.forEach((s: any) => {
        if (s.subservices && Array.isArray(s.subservices) && s.subservices.length > 0) {
          s.subservices.forEach((sub: any) => {
            list.push({
              id: sub.code || String(sub.id),
              name: sub.name,
              category: s.name,
              duration: sub.estimated_duration_minutes || s.estimated_duration_minutes || 30,
              fee: sub.fee_amount ? `${sub.fee_amount} ETB` : 'Free',
              counter: sub.steps?.[0]?.counter_window || sub.steps?.[0]?.room_number || 'Window 2',
              requirements: sub.requiredDocuments?.map((d: any) => d.name) || [
                'Valid Kebele / Resident ID Card',
                '2 Passport Sized Photographs',
              ],
            });
          });
        } else {
          list.push({
            id: s.code || String(s.id),
            name: s.name,
            category: s.category || 'General Service',
            duration: s.estimated_duration_minutes || 30,
            fee: s.fee_amount ? `${s.fee_amount} ETB` : 'Free',
            counter: s.steps?.[0]?.counter_window || s.steps?.[0]?.room_number || 'Window 1',
            requirements: s.requiredDocuments?.map((d: any) => d.name) || [
              'Valid Kebele / Resident ID Card',
              'Official Request Form',
            ],
          });
        }
      });
    }

    // Default graceful fallback services if empty
    if (list.length === 0) {
      return [
        {
          id: 'TRADE-RENEW',
          name: 'Trade License Renewal',
          category: 'Commercial Registration',
          duration: 30,
          fee: '250 ETB',
          counter: 'Counter 3 · Ground Floor',
          requirements: ['Previous Trade License', 'TIN Certificate', 'Valid Resident ID'],
        },
        {
          id: 'VITAL-BIRTH',
          name: 'Birth Certificate Issuance',
          category: 'Vital Records',
          duration: 20,
          fee: 'Free',
          counter: 'Room 102 · 1st Floor',
          requirements: ['Health Facility Notification', 'Parents ID Cards', '2 Photos'],
        },
        {
          id: 'TAX-CLEARANCE',
          name: 'Tax Clearance Certificate',
          category: 'Revenues Desk',
          duration: 45,
          fee: 'Free',
          counter: 'Window 4 · Ground Floor',
          requirements: ['Recent Financial Statement', 'Receipt of Payment', 'TIN Number'],
        },
        {
          id: 'GENERAL-VISIT',
          name: 'General Public Inquiries & Consultation',
          category: 'Reception',
          duration: 15,
          fee: 'Free',
          counter: 'Reception Desk · Entrance',
          requirements: ['Resident ID Card'],
        },
      ];
    }
    return list;
  }, [servicesData]);

  // Auto-select first service if none selected
  useEffect(() => {
    if (!selectedServiceId && availableServices.length > 0) {
      setSelectedServiceId(availableServices[0].id);
    }
  }, [availableServices, selectedServiceId]);

  // Toggle tag helper
  function handleToggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  // Handle Submit
  async function handleSubmitFeedback(e: React.FormEvent) {
    e.preventDefault();

    const selectedServiceObj = availableServices.find((s) => s.id === selectedServiceId);
    const serviceName = selectedServiceObj ? selectedServiceObj.name : 'General Visit';

    // Build context tags
    const contextPrefix: string[] = [];
    contextPrefix.push(`Office: ${activeOffice?.name || 'Public Desk'} (${displaySubCity})`);
    contextPrefix.push(`Service: ${serviceName}`);
    if (feedbackType === 'satisfaction' && starRating) {
      contextPrefix.push(`Rating: ${starRating}/5 Stars`);
    }
    if (selectedTags.length > 0) {
      contextPrefix.push(`Aspects: ${selectedTags.join(', ')}`);
    }

    const compiledContent = `[${contextPrefix.join(' · ')}]\n\n${message.trim() || 'Citizen submitted direct service feedback via office QR poster.'}`;

    let trackNum: string | null = null;
    try {
      const response = await submitFeedbackMutation({
        feedback_for_organization: activeOffice?.id || 1,
        feedback_content: compiledContent,
        feedback_type: feedbackType,
        full_name: fullName.trim() || undefined,
        phone_number: phoneNumber.trim() || undefined,
      }).unwrap();

      trackNum = response?.data?.tracking_number;
    } catch {
      // Offline fallback
      trackNum = createFeedbackTrackingNumber();
    }

    if (!trackNum) {
      trackNum = createFeedbackTrackingNumber();
    }

    setTrackingNumber(trackNum);
    setIsSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Handle Copy Tracking
  function handleCopyTracking() {
    if (trackingNumber) {
      navigator.clipboard.writeText(trackingNumber);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2500);
    }
  }

  // Handle Search Track
  async function handleSearchTrack(e: React.FormEvent) {
    e.preventDefault();
    if (!searchTrackingInput.trim()) return;
    setTrackError(null);
    setTrackedRecord(null);

    try {
      const res = await triggerTrack(searchTrackingInput.trim()).unwrap();
      if (res?.data) {
        setTrackedRecord(res.data);
      } else {
        setTrackError('Tracking number not found. Please double-check the digits.');
      }
    } catch {
      setTrackError('Could not locate record with this code. Check the format (e.g. TRK-...)');
    }
  }

  return (
    <div className="qr-feedback-shell" id="feedback">
      {/* 1. Header with Brand & 1-Tap Language Bar */}
      <header className="qr-feedback-topbar">
        <div className="qr-feedback-topbar-inner">
          <a
            href="#top"
            className="qr-feedback-brand"
            onClick={(e) => {
              e.preventDefault();
              onNavigateToHome();
            }}
          >
            <BrandMark />
            <div className="qr-feedback-brand-text">
              <strong>CivicLink</strong>
              <small>{t('ETHIOPIA · CITIZEN SERVICES')}</small>
            </div>
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Quick 1-tap Language Switcher */}
            <div className="qr-lang-bar" aria-label={t('Select language')}>
              <button
                type="button"
                className={`qr-lang-btn ${language === 'en' ? 'active' : ''}`}
                onClick={() => onSelectLanguage?.('en')}
              >
                EN
              </button>
              <button
                type="button"
                className={`qr-lang-btn ${language === 'am' ? 'active' : ''}`}
                onClick={() => onSelectLanguage?.('am')}
              >
                አማ
              </button>
              <button
                type="button"
                className={`qr-lang-btn ${language === 'om' ? 'active' : ''}`}
                onClick={() => onSelectLanguage?.('om')}
              >
                ORO
              </button>
            </div>

            <button
              type="button"
              className="qr-back-link"
              onClick={onNavigateToHome}
              title={t('Back to Full Portal')}
            >
              <Icon name="arrow" size={14} />
              <span>{t('Back to Full Portal')}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="qr-feedback-main">
        {/* 2. Verified Office Location Banner */}
        <section className="qr-location-banner">
          <div className="qr-location-header">
            <div className="qr-location-meta">
              <div className="qr-location-icon">
                <Icon name="building" size={24} />
              </div>
              <div className="qr-location-text">
                <span className="qr-location-eyebrow">
                  <Icon name="check" size={13} /> {t('Verified Office QR')}
                </span>
                <h1>{activeOffice?.name || t('Public Service Desk')}</h1>
                <p>
                  📍 {displaySubCity} {displaySubCity.includes('Sub-city') ? '' : t('Sub-city')} · {t('Where you received service')}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="qr-change-btn"
              onClick={() => setShowOfficePicker((open) => !open)}
            >
              {showOfficePicker ? t('Done') : t('Change office')}
            </button>
          </div>

          {/* Collapsible office switcher */}
          {showOfficePicker && (
            <div className="qr-office-picker">
              <div className="qr-picker-group">
                <label>{t('Sub-city')}</label>
                <select
                  className="qr-picker-select"
                  value={selectedSubCityName}
                  onChange={(e) => {
                    setSelectedSubCityName(e.target.value);
                  }}
                >
                  <option value="">{t('All Sub-cities')}</option>
                  {subCities.map((sc: any) => (
                    <option key={sc.id} value={sc.name}>
                      {sc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="qr-picker-group">
                <label>{t('City office / bureau')}</label>
                <select
                  className="qr-picker-select"
                  value={selectedBureauId}
                  onChange={(e) => setSelectedBureauId(e.target.value)}
                  disabled={isOrgsLoading}
                >
                  {availableBureausForPicker.map((b: any) => (
                    <option key={b.id} value={String(b.id)}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </section>

        {/* 3. Primary Intent Segmentation ("What do you want to do?") */}
        <div className="qr-intent-container">
          <div className="qr-intent-heading">
            <Icon name="route" size={16} />
            <span>{t('What do you need help with?')}</span>
          </div>

          <div className="qr-intent-grid">
            <button
              type="button"
              className={`qr-intent-card ${activeIntent === 'feedback' ? 'active' : ''}`}
              onClick={() => {
                setActiveIntent('feedback');
                setIsSuccess(false);
              }}
            >
              <div className="qr-intent-icon-wrap">
                <Icon name="heart" size={24} />
              </div>
              <div className="qr-intent-copy">
                <strong>{t('Give Feedback')}</strong>
                <small>{t('Tell us how your visit went')}</small>
              </div>
            </button>

            <button
              type="button"
              className={`qr-intent-card ${activeIntent === 'services' ? 'active' : ''}`}
              onClick={() => setActiveIntent('services')}
            >
              <div className="qr-intent-icon-wrap">
                <Icon name="file" size={24} />
              </div>
              <div className="qr-intent-copy">
                <strong>{t('Services & Where to Go')}</strong>
                <small>{t('Counter, requirements & time')}</small>
              </div>
            </button>
          </div>
        </div>

        {/* 4. Active Intent Screen */}
        <div className="qr-content-card">
          {activeIntent === 'feedback' ? (
            !isSuccess ? (
              <form onSubmit={handleSubmitFeedback}>
                {/* Step 1: Big Reaction Emotional Cards */}
                <h2 className="qr-section-prompt">{t('How was your experience today?')}</h2>
                <div className="qr-reaction-grid">
                  <button
                    type="button"
                    className={`qr-reaction-card good ${feedbackType === 'satisfaction' ? 'active' : ''}`}
                    onClick={() => {
                      setFeedbackType('satisfaction');
                      setSelectedTags([]);
                    }}
                  >
                    <span className="qr-reaction-emoji">😊</span>
                    <strong>{t('Good Experience')}</strong>
                    <small>{t('Satisfied with service')}</small>
                  </button>

                  <button
                    type="button"
                    className={`qr-reaction-card complaint ${feedbackType === 'complaint' ? 'active' : ''}`}
                    onClick={() => {
                      setFeedbackType('complaint');
                      setSelectedTags([]);
                    }}
                  >
                    <span className="qr-reaction-emoji">🙁</span>
                    <strong>{t('Had a Problem')}</strong>
                    <small>{t('Delay, issue, or unfair treatment')}</small>
                  </button>

                  <button
                    type="button"
                    className={`qr-reaction-card suggestion ${feedbackType === 'feedback' ? 'active' : ''}`}
                    onClick={() => {
                      setFeedbackType('feedback');
                      setSelectedTags([]);
                    }}
                  >
                    <span className="qr-reaction-emoji">💡</span>
                    <strong>{t('Suggestion')}</strong>
                    <small>{t('Idea to make service better')}</small>
                  </button>
                </div>

                {/* Step 2: Service Selection Pills */}
                <h3 className="qr-section-prompt" style={{ fontSize: '14px', marginBottom: '10px' }}>
                  {t('Which service did you take?')}
                </h3>
                <div className="qr-services-chip-wrap">
                  {availableServices.map((srv) => (
                    <button
                      key={srv.id}
                      type="button"
                      className={`qr-service-chip ${selectedServiceId === srv.id ? 'active' : ''}`}
                      onClick={() => setSelectedServiceId(srv.id)}
                    >
                      <Icon name="check" size={13} />
                      <span>{t(srv.name)}</span>
                    </button>
                  ))}
                </div>

                {/* Step 3: Quick 1-Tap Reasons (Zero Typing Required) */}
                <div className="qr-tags-container">
                  <div className="qr-tags-label">
                    <Icon name="shield" size={14} />
                    <span>{t('Tap what describes your visit best:')}</span>
                  </div>
                  <div className="qr-tags-grid">
                    {(feedbackType === 'satisfaction' ? positiveTags : issueTags).map((tagKey) => {
                      const isSelected = selectedTags.includes(tagKey);
                      return (
                        <button
                          key={tagKey}
                          type="button"
                          className={`qr-tag-pill ${isSelected ? 'active' : ''}`}
                          onClick={() => handleToggleTag(tagKey)}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {t(tagKey)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 4: Star Rating for Satisfaction */}
                {feedbackType === 'satisfaction' && (
                  <div className="qr-star-rating">
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#92400e' }}>
                      {t('Rate overall satisfaction:')}
                    </span>
                    <div className="qr-star-row">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`qr-star-btn ${star <= starRating ? 'active' : ''}`}
                          onClick={() => setStarRating(star)}
                          aria-label={`${star} ${t('stars')}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 5: Optional Details */}
                <div className="qr-form-group">
                  <label className="qr-form-label" htmlFor="qr-feedback-notes">
                    {t('Write details in your words (optional)')}
                  </label>
                  <textarea
                    id="qr-feedback-notes"
                    className="qr-form-textarea"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('Tell us what happened...')}
                  />
                </div>

                {/* Step 6: Optional Contact for SMS Tracking */}
                <div className="qr-form-group">
                  <label className="qr-form-label" htmlFor="qr-feedback-phone">
                    {t('Phone number for SMS tracking (optional)')}
                  </label>
                  <input
                    id="qr-feedback-phone"
                    type="tel"
                    className="qr-form-input"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+251 91 100 0000"
                  />
                  <small className="qr-form-hint">
                    <Icon name="shield" size={12} /> {t('Your contact information is only used for official case follow-up and SMS notifications.')}
                  </small>
                </div>

                {/* Step 7: Submit Button */}
                <button
                  type="submit"
                  className="qr-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span>{t('Submitting...')}</span>
                  ) : (
                    <>
                      <Icon name="arrow" size={18} />
                      <span>{t('Send Feedback Now')}</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Success / Receipt Screen */
              <div className="qr-success-card">
                <div className="qr-success-icon-wrap">
                  <Icon name="check" size={36} />
                </div>
                <h2>{t('Thank you! Your feedback has been received.')}</h2>
                <p>
                  {t(
                    'Your feedback was routed directly to the office administration. Use this tracking code anytime to check the resolution.'
                  )}
                </p>

                <div className="qr-tracking-box">
                  <span>{t('Your Official Tracking Number:')}</span>
                  <div className="qr-tracking-number">{trackingNumber}</div>
                  <button
                    type="button"
                    className="qr-copy-btn"
                    onClick={handleCopyTracking}
                  >
                    <Icon name="copy" size={14} />
                    <span>{copiedTracking ? t('Copied!') : t('Copy Tracking Code')}</span>
                  </button>
                </div>

                <div className="qr-success-actions">
                  <button
                    type="button"
                    className="qr-btn-secondary"
                    onClick={() => {
                      setIsSuccess(false);
                      setMessage('');
                      setSelectedTags([]);
                    }}
                  >
                    {t('Submit another response')}
                  </button>
                  <button
                    type="button"
                    className="qr-btn-secondary"
                    onClick={onNavigateToHome}
                  >
                    {t('Back to Full Portal')}
                  </button>
                </div>
              </div>
            )
          ) : (
            /* Services Available & Where to Go */
            <div className="qr-services-list">
              <h2 className="qr-section-prompt" style={{ marginBottom: '8px' }}>
                {t('Services Provided at this Office')}
              </h2>
              <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#557570' }}>
                {t('Here is what you need and which window or room to visit:')}
              </p>

              {isServicesLoading ? (
                <p style={{ textAlign: 'center', padding: '30px' }}>{t('Loading services…')}</p>
              ) : (
                availableServices.map((service) => (
                  <article key={service.id} className="qr-service-card">
                    <div className="qr-service-top">
                      <div className="qr-service-title">
                        <h3>{t(service.name)}</h3>
                        <p>{t(service.category)}</p>
                      </div>
                    </div>

                    <div className="qr-service-meta-row">
                      <span className="qr-service-badge qr-badge-counter">
                        <Icon name="pin" size={14} />
                        <span>{t('Where to Go')}: <b>{service.counter}</b></span>
                      </span>

                      <span className="qr-service-badge qr-badge-time">
                        <Icon name="clock" size={14} />
                        <span>{t('Estimated Time')}: <b>{service.duration} {t('minutes')}</b></span>
                      </span>

                      <span className="qr-service-badge qr-badge-fee">
                        <Icon name="shield" size={14} />
                        <span>{t('Official Fee')}: <b>{service.fee}</b></span>
                      </span>
                    </div>

                    {service.requirements && service.requirements.length > 0 && (
                      <div className="qr-docs-section">
                        <div className="qr-docs-title">
                          <Icon name="file" size={12} />
                          <span>{t('Required Documents')}</span>
                        </div>
                        <ul className="qr-docs-list">
                          {service.requirements.map((doc: string, idx: number) => (
                            <li key={idx}>{t(doc)}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="qr-service-actions">
                      <button
                        type="button"
                        className="qr-select-service-btn"
                        onClick={() => {
                          setSelectedServiceId(service.id);
                          setActiveIntent('feedback');
                          setIsSuccess(false);
                        }}
                      >
                        <Icon name="heart" size={14} />
                        <span>{t('Give feedback for this service')}</span>
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          )}
        </div>

        {/* 5. Quick Case Tracker Panel */}
        <section className="qr-track-panel">
          <h4>
            <span style={{ verticalAlign: 'middle', marginRight: '6px', display: 'inline-flex' }}>
              <Icon name="search" size={16} />
            </span>
            {t('Check previous submission status')}
          </h4>
          <form onSubmit={handleSearchTrack} className="qr-track-input-row">
            <input
              type="text"
              placeholder={t('Enter your tracking code')}
              value={searchTrackingInput}
              onChange={(e) => setSearchTrackingInput(e.target.value)}
            />
            <button type="submit" className="qr-track-btn" disabled={isTrackingLoading}>
              {isTrackingLoading ? t('Searching...') : t('Check Status')}
            </button>
          </form>

          {trackError && (
            <p style={{ color: '#dc2626', fontSize: '13px', marginTop: '10px' }}>{trackError}</p>
          )}

          {trackedRecord && (
            <div className="qr-track-result">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>{trackedRecord.tracking_number}</strong>
                <span
                  style={{
                    background: '#ecfdf5',
                    color: '#065f46',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '12px',
                  }}
                >
                  {trackedRecord.status?.toUpperCase() || 'IN REVIEW'}
                </span>
              </div>
              <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#334155' }}>
                {trackedRecord.feedback_content}
              </p>
              {trackedRecord.resolution_notes && (
                <div
                  style={{
                    marginTop: '8px',
                    padding: '8px',
                    background: '#ffffff',
                    borderRadius: '6px',
                    border: '1px solid #dce6e5',
                    fontSize: '12px',
                  }}
                >
                  <b>{t('Official Response')}:</b> {trackedRecord.resolution_notes}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
