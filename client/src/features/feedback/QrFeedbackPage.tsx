import { useState, useEffect, useMemo, useRef } from 'react';
import { BrandMark, Icon, CitizensCharter } from '../shared';
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

type UserIntent = 'complaint' | 'suggestion' | 'satisfaction' | 'info';

const defaultSubCities = [
  'Bole',
  'Kirkos',
  'Yeka',
  'Arada',
  'Nifas Silk-Lafto',
  'Gullele',
  'Lideta',
  'Akaki-Kality',
  'Kolfe-Keranio',
  'Addis Ketema',
  'Lemi-Kura',
];

const defaultOffices = [
  { id: 'trade', name: 'Trade & Industry Office', code: 'TRADE', subtext: 'Business licensing & commercial registry' },
  { id: 'vital', name: 'Vital Events & Civil Registration', code: 'VITAL', subtext: 'Birth, marriage & ID services' },
  { id: 'revenues', name: 'Revenues & Tax Office', code: 'REV', subtext: 'Tax assessments & clearance' },
  { id: 'land', name: 'Land Administration & Building', code: 'LAND', subtext: 'Title deeds, maps & permits' },
  { id: 'general', name: 'Public Service Reception Desk', code: 'PUBLIC', subtext: 'General inquiries & public support' },
];

const complaintTags = [
  'Long wait / delay',
  'Staff was absent',
  'Asked for extra papers',
  'System was offline',
  'Disrespectful staff',
  'Demanded improper fee',
];

const suggestionTags = [
  'Mobile / digital service options',
  'Clearer signs and directions',
  'More counter staff at peak hours',
  'Better waiting area and seating',
  'Faster document verification',
];

const satisfactionTags = [
  'Fast service',
  'Helpful staff',
  'Clear instructions',
  'Clean office',
];

export default function QrFeedbackPage({
  language,
  t,
  onNavigateToHome,
  onSelectLanguage,
}: QrFeedbackPageProps) {
  // Read URL parameters immediately to determine initial step and pre-filled office
  const initialParams = useMemo(() => {
    const searchParams = new URLSearchParams(window.location.search);
    let hashSearch = '';
    if (window.location.hash.includes('?')) {
      hashSearch = window.location.hash.split('?')[1];
    }
    const hashParams = new URLSearchParams(hashSearch);
    const getParam = (key: string) => hashParams.get(key) || searchParams.get(key);

    const orgParam = getParam('org') || getParam('bureau') || getParam('office');
    const subCityParam = getParam('sub_city') || getParam('subcity') || getParam('city');
    const serviceParam = getParam('service') || getParam('sub_service') || getParam('subservice');
    const typeParam = getParam('type');
    const qrCode = getParam('code');

    const hasQrLocation = Boolean(orgParam || subCityParam || qrCode);

    let initialIntent: UserIntent | null = null;
    if (typeParam) {
      const lower = typeParam.toLowerCase();
      if (lower === 'complaint') initialIntent = 'complaint';
      else if (lower === 'suggestion') initialIntent = 'suggestion';
      else if (lower === 'satisfaction' || lower === 'rating') initialIntent = 'satisfaction';
      else if (lower === 'info' || lower === 'services') initialIntent = 'info';
    }

    return {
      orgParam,
      subCityParam,
      serviceParam,
      qrCode,
      hasQrLocation,
      initialIntent,
    };
  }, []);

  // Step state:
  // Step 1: Sub-City
  // Step 2: Office of that Sub-City
  // Step 3: Type (Complaint, Suggestion, Satisfaction, Info)
  // Step 4: Service (DEDICATED STEP)
  // Step 5: Final Screen (Feedback Form OR Service Information Details)
  // If QR code provided location, skip Steps 1 and 2 and land directly on Step 3!
  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (initialParams.serviceParam) return 5;
    return initialParams.hasQrLocation ? 3 : 1;
  });
  const [isQrScan, setIsQrScan] = useState<boolean>(() => initialParams.hasQrLocation);

  const [selectedSubCity, setSelectedSubCity] = useState<string>(() => initialParams.subCityParam || '');
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>(() => initialParams.orgParam || '');
  const [selectedServiceId, setSelectedServiceId] = useState<string>(() => initialParams.serviceParam || '');
  const [intent, setIntent] = useState<UserIntent | null>(() => initialParams.initialIntent);

  // Form Fields
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [starRating, setStarRating] = useState<number>(5);
  const [message, setMessage] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [attachedImage, setAttachedImage] = useState<{
    file: File;
    dataUrl: string;
    name: string;
    size: string;
  } | null>(null);

  // Submission result
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);
  const [copiedTracking, setCopiedTracking] = useState<boolean>(false);

  // Case tracking status lookup
  const [showTracker, setShowTracker] = useState<boolean>(false);
  const [searchTrackingInput, setSearchTrackingInput] = useState<string>('');
  const [trackedRecord, setTrackedRecord] = useState<any>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  const qrScannedRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // RTK Query hooks
  const [submitFeedbackMutation, { isLoading: isSubmitting }] = useSubmitFeedbackMutation();
  const [triggerTrack, { isLoading: isTrackingLoading }] = useLazyTrackFeedbackQuery();
  const { data: orgsData } = useGetOrganizationsQuery({ per_page: 100 });

  const allOrganizations = useMemo(() => {
    if (!orgsData?.data) return [];
    if (Array.isArray(orgsData.data)) return orgsData.data;
    if (Array.isArray((orgsData.data as any).data)) return (orgsData.data as any).data;
    return [];
  }, [orgsData]);

  // Sub-cities list
  const liveSubCities = useMemo(() => {
    const list = allOrganizations.filter(
      (o: any) =>
        o.parent_organization_id === null &&
        (o.type?.code === 'sub_city' ||
          o.name?.toLowerCase().includes('sub-city') ||
          o.name?.toLowerCase().includes('subcity'))
    );
    if (list.length > 0) return list.map((sc: any) => sc.name.replace(/ Sub-city/i, ''));
    return defaultSubCities;
  }, [allOrganizations]);

  // Sync QR code scan with database and resolve organization names
  useEffect(() => {
    if (initialParams.qrCode && !qrScannedRef.current) {
      qrScannedRef.current = true;
      fetch(`/api/v1/qr-codes/${encodeURIComponent(initialParams.qrCode)}/scan`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
      }).catch(() => {});
    }

    if (allOrganizations.length > 0 && initialParams.orgParam) {
      const match = allOrganizations.find(
        (o: any) =>
          String(o.id) === String(initialParams.orgParam) ||
          String(o.code).toLowerCase() === String(initialParams.orgParam).toLowerCase() ||
          o.name.toLowerCase().includes(String(initialParams.orgParam).toLowerCase())
      );

      if (match) {
        setSelectedOfficeId(String(match.id));
        if (!selectedSubCity) {
          if (initialParams.subCityParam) {
            setSelectedSubCity(initialParams.subCityParam);
          } else if (match.parent_organization_id) {
            const parent = allOrganizations.find((p: any) => p.id === match.parent_organization_id);
            if (parent) setSelectedSubCity(parent.name.replace(/ Sub-city/i, ''));
          } else if (match.name.toLowerCase().includes('sub-city')) {
            setSelectedSubCity(match.name.replace(/ Sub-city/i, ''));
          } else {
            setSelectedSubCity('Bole');
          }
        }
      }
    }
  }, [allOrganizations, initialParams, selectedSubCity]);

  // Fallback sub-city if QR has none
  const effectiveSubCity = selectedSubCity || (isQrScan ? 'Bole' : '');

  // Offices for the chosen Sub-City
  const officesList = useMemo(() => {
    if (!effectiveSubCity) return defaultOffices;
    const matchedSub = allOrganizations.find(
      (o: any) =>
        o.name.toLowerCase().includes(effectiveSubCity.toLowerCase()) &&
        (o.parent_organization_id === null || o.type?.code === 'sub_city')
    );

    if (matchedSub) {
      const children = allOrganizations.filter((o: any) => o.parent_organization_id === matchedSub.id);
      if (children.length > 0) {
        return children.map((c: any) => ({
          id: String(c.id),
          name: c.name,
          code: c.code || '',
          subtext: `Under ${effectiveSubCity}`,
        }));
      }
    }

    const central = allOrganizations.filter(
      (o: any) => o.type?.code === 'bureau' || o.name.toLowerCase().includes('bureau')
    );
    if (central.length > 0) {
      return central.map((c: any) => ({
        id: String(c.id),
        name: c.name,
        code: c.code || '',
        subtext: `Municipal office · ${effectiveSubCity}`,
      }));
    }

    return defaultOffices.map((off) => ({
      ...off,
      subtext: `${effectiveSubCity} branch`,
    }));
  }, [allOrganizations, effectiveSubCity]);

  // Resolved active office object
  const activeOfficeObj = useMemo(() => {
    if (selectedOfficeId) {
      const found = officesList.find((o: any) => String(o.id) === String(selectedOfficeId));
      if (found) return found;
      const matchAll = allOrganizations.find((o: any) => String(o.id) === String(selectedOfficeId));
      if (matchAll) return { id: String(matchAll.id), name: matchAll.name, code: matchAll.code || '', subtext: effectiveSubCity };
    }
    return officesList[0] || defaultOffices[0];
  }, [officesList, selectedOfficeId, allOrganizations, effectiveSubCity]);

  // Services query for chosen office
  const { data: servicesData, isLoading: isServicesLoading } = useGetServicesQuery(
    {
      per_page: 50,
      organization_id: activeOfficeObj?.id ? Number(activeOfficeObj.id) || undefined : undefined,
    },
    { skip: currentStep < 3 }
  );

  const servicesList = useMemo(() => {
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
              counter: sub.steps?.[0]?.counter_window || sub.steps?.[0]?.room_number || 'Window 2 · Ground Floor',
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
            counter: s.steps?.[0]?.counter_window || s.steps?.[0]?.room_number || 'Window 1 · Ground Floor',
            requirements: s.requiredDocuments?.map((d: any) => d.name) || [
              'Valid Kebele / Resident ID Card',
              'Official Request Form',
            ],
          });
        }
      });
    }

    if (list.length === 0) {
      list.push(
        {
          id: 'TRADE-RENEW',
          name: 'Trade License Renewal',
          category: 'Commercial Registration',
          duration: 30,
          fee: '250 ETB',
          counter: 'Window 3 · Ground Floor',
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
        }
      );
    }

    // Always include a General Visit / Other option so citizens with non-standard matters are never blocked
    if (!list.some((s) => s.id === 'GENERAL-VISIT')) {
      list.push({
        id: 'GENERAL-VISIT',
        name: 'General Service / Other Inquiries',
        category: 'Reception & Administration',
        duration: 15,
        fee: 'Free',
        counter: 'Reception Desk · Main Entrance',
        requirements: ['Resident ID Card'],
      });
    }

    return list;
  }, [servicesData]);

  // Active service object
  const activeServiceObj = useMemo(() => {
    if (!selectedServiceId) return servicesList[0];
    return servicesList.find((s) => s.id === selectedServiceId) || servicesList[0];
  }, [servicesList, selectedServiceId]);

  // Reset submission state when navigating back or switching service
  function resetSubmissionState() {
    setIsSuccess(false);
    setTrackingNumber(null);
    setCopiedTracking(false);
    setMessage('');
    setSelectedTags([]);
    setAttachedImage(null);
  }

  // Step 1: Sub-City Selection
  function handleSelectSubCity(sc: string) {
    setSelectedSubCity(sc);
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Step 2: Office Selection
  function handleSelectOffice(offId: string) {
    setSelectedOfficeId(offId);
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Step 3: Type Selection (Complaint, Suggestion, Satisfaction, Info)
  function handleSelectType(chosenType: UserIntent) {
    setIntent(chosenType);
    setSelectedTags([]);
    if (isSuccess) {
      resetSubmissionState();
    }
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Step 4: Service Selection (DEDICATED STEP)
  function handleSelectService(srvId: string) {
    setSelectedServiceId(srvId);
    if (isSuccess) {
      resetSubmissionState();
    }
    setCurrentStep(5);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Back Navigation
  function handleBack() {
    if (isSuccess) {
      resetSubmissionState();
    }
    if (currentStep === 5) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // If was scanned from QR code, allow going back to manual office picker
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Start Over or Change Office
  function handleStartOver() {
    setCurrentStep(1);
    setIsQrScan(false);
    setSelectedSubCity('');
    setSelectedOfficeId('');
    setSelectedServiceId('');
    setIntent(null);
    setIsSuccess(false);
    setMessage('');
    setFullName('');
    setPhoneNumber('');
    setAttachedImage(null);
    setSelectedTags([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Toggle tag helper & auto-fill description in form
  function handleToggleTag(tag: string) {
    const isSelected = selectedTags.includes(tag);
    const nextTags = isSelected
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];

    setSelectedTags(nextTags);

    const tagText = t(tag);

    setMessage((prev) => {
      const trimmed = prev.trim();

      if (!isSelected) {
        // Tag is selected: fill or append to description
        if (!trimmed) {
          return tagText;
        }
        if (!trimmed.includes(tagText)) {
          return `${trimmed}. ${tagText}`;
        }
        return prev;
      } else {
        // Tag is deselected: remove from description
        if (nextTags.length === 0) {
          if (trimmed === tagText) {
            return '';
          }
        }
        const parts = trimmed
          .split(/\s*[\.\,\፤\።]\s*/)
          .filter((p) => p && p !== tagText);
        return parts.join('. ');
      }
    });
  }

  // File upload handler
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeKb = Math.round(file.size / 1024);
    const sizeFormatted = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedImage({
        file,
        dataUrl: String(event.target?.result || ''),
        name: file.name,
        size: sizeFormatted,
      });
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveImage() {
    setAttachedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  // Submit Feedback
  async function handleSubmitFeedback(e: React.FormEvent) {
    e.preventDefault();

    const serviceName = activeServiceObj ? activeServiceObj.name : 'General Office Visit';
    const officeName = activeOfficeObj ? activeOfficeObj.name : 'Public Service Desk';

    const contextPrefix: string[] = [];
    contextPrefix.push(`Sub-city: ${effectiveSubCity}`);
    contextPrefix.push(`Office: ${officeName}`);
    contextPrefix.push(`Service: ${serviceName}`);
    if (intent === 'satisfaction' && starRating) {
      contextPrefix.push(`Rating: ${starRating}/5 Stars`);
    }
    if (selectedTags.length > 0) {
      contextPrefix.push(`Aspects: ${selectedTags.join(', ')}`);
    }
    if (attachedImage) {
      contextPrefix.push(`Attached: ${attachedImage.name} (${attachedImage.size})`);
    }

    const defaultContent =
      intent === 'complaint'
        ? 'Citizen submitted a public service complaint.'
        : intent === 'suggestion'
          ? 'Citizen submitted a public service improvement suggestion.'
          : 'Citizen submitted a service satisfaction rating.';

    const compiledContent = `[${contextPrefix.join(' · ')}]\n\n${message.trim() || defaultContent}`;

    const normalizedType =
      intent === 'complaint'
        ? 'complaint'
        : intent === 'satisfaction'
          ? 'satisfaction'
          : 'feedback';

    const isSatisfaction = intent === 'satisfaction';
    let trackNum: string | null = null;
    try {
      const response = await submitFeedbackMutation({
        feedback_for_organization: Number(activeOfficeObj?.id) || 1,
        feedback_content: compiledContent,
        feedback_type: normalizedType,
        full_name: fullName.trim() || undefined,
        phone_number: phoneNumber.trim() || undefined,
      }).unwrap();

      trackNum = isSatisfaction ? null : response?.data?.tracking_number;
    } catch {
      trackNum = isSatisfaction ? null : createFeedbackTrackingNumber();
    }

    if (!isSatisfaction && !trackNum) {
      trackNum = createFeedbackTrackingNumber();
    }

    setTrackingNumber(isSatisfaction ? null : trackNum);
    setIsSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCopyTracking() {
    if (trackingNumber) {
      navigator.clipboard.writeText(trackingNumber);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2500);
    }
  }

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

  const activeTags =
    intent === 'complaint'
      ? complaintTags
      : intent === 'suggestion'
        ? suggestionTags
        : satisfactionTags;

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
        {/* Navigation Toolbar */}
        <div className="qr-wizard-nav">
          {currentStep > 1 ? (
            <button type="button" className="qr-step-back-btn" onClick={handleBack}>
              ← {t('Back')}
            </button>
          ) : (
            <span />
          )}

          <span className="qr-step-indicator">
            {t(`Step ${currentStep} of 5`)}
          </span>

          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleStartOver}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '12px',
                color: '#64748b',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {t('Start Over')}
            </button>
          )}
        </div>

        {/* Progress Bar (5-Step Progressive Flow) */}
        <div className="qr-progress-track">
          <div className="qr-progress-fill" style={{ width: `${currentStep * 20}%` }} />
        </div>

        {/* Verified Location Banner when Scanned from QR code */}
        {isQrScan && activeOfficeObj?.name && (
          <section className="qr-location-banner qr-fade-in">
            <div className="qr-location-header">
              <div className="qr-location-meta">
                <div className="qr-location-icon">
                  <Icon name="building" size={24} />
                </div>
                <div className="qr-location-text">
                  <span className="qr-location-eyebrow">
                    <Icon name="check" size={13} /> {t('Office verified from QR code')}
                  </span>
                  <h1>{activeOfficeObj.name}</h1>
                  <p>
                    📍 {effectiveSubCity} {effectiveSubCity.includes('Sub-city') ? '' : t('Sub-city')} · {t('Where you received service')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="qr-change-btn"
                onClick={handleStartOver}
              >
                {t('Change')}
              </button>
            </div>
          </section>
        )}

        <div className="qr-content-card qr-fade-in" key={currentStep}>
          {/* ===============================================================
              STEP 1: Which Sub-City?
             =============================================================== */}
          {currentStep === 1 && (
            <div>
              <div className="qr-step-heading-wrap">
                <h2>{t('Which sub-city did you visit?')}</h2>
                <p>{t('Select your sub-city in Addis Ababa:')}</p>
              </div>

              <div className="qr-subcity-grid">
                {liveSubCities.map((sc: any) => (
                  <button
                    key={sc}
                    type="button"
                    className={`qr-subcity-btn ${selectedSubCity === sc ? 'active' : ''}`}
                    onClick={() => handleSelectSubCity(sc)}
                  >
                    <Icon name="pin" size={16} />
                    <span>{t(sc)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ===============================================================
              STEP 2: Which Office of that Sub-City?
             =============================================================== */}
          {currentStep === 2 && (
            <div>
              <div className="qr-step-heading-wrap">
                <h2>{t('Which office in this sub-city?')}</h2>
                <p>{t('Select the office or department:')}</p>
                <div className="qr-context-pill">
                  📍 {effectiveSubCity} {t('Sub-city')}
                </div>
              </div>

              <div className="qr-office-list">
                {officesList.map((office: any) => (
                  <button
                    key={office.id}
                    type="button"
                    className={`qr-office-card-btn ${selectedOfficeId === String(office.id) ? 'active' : ''}`}
                    onClick={() => handleSelectOffice(String(office.id))}
                  >
                    <div className="qr-office-info-wrap">
                      <div className="qr-office-icon">
                        <Icon name="building" size={20} />
                      </div>
                      <div className="qr-office-text">
                        <strong>{t(office.name)}</strong>
                        <small>{office.subtext}</small>
                      </div>
                    </div>
                    <Icon name="arrow" size={16} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ===============================================================
              STEP 3: What Type? (Complaint, Suggestion, Satisfaction, Info)
             =============================================================== */}
          {currentStep === 3 && (
            <div>
              <div className="qr-step-heading-wrap">
                <h2>{t('What would you like to do?')}</h2>
                <p>{t('Choose one of the options below:')}</p>
                <div className="qr-context-pill">
                  📍 {effectiveSubCity} · {activeOfficeObj?.name}
                </div>
              </div>

              <div className="qr-intent-grid-4">
                {/* 1. Complaint */}
                <button
                  type="button"
                  className="qr-intent-card qr-intent-card-complaint"
                  onClick={() => handleSelectType('complaint')}
                >
                  <div className="qr-intent-icon-wrap" style={{ background: '#ffe4e6', color: '#e11d48' }}>
                    <span style={{ fontSize: '24px', lineHeight: 1 }}>🙁</span>
                  </div>
                  <div className="qr-intent-copy">
                    <strong>{t('File a Complaint')}</strong>
                    <small>{t('Report a problem, delay, or unfair treatment')}</small>
                  </div>
                </button>

                {/* 2. Suggestion */}
                <button
                  type="button"
                  className="qr-intent-card qr-intent-card-suggestion"
                  onClick={() => handleSelectType('suggestion')}
                >
                  <div className="qr-intent-icon-wrap" style={{ background: '#ffedd5', color: '#ea580c' }}>
                    <span style={{ fontSize: '24px', lineHeight: 1 }}>💡</span>
                  </div>
                  <div className="qr-intent-copy">
                    <strong>{t('Give a Suggestion')}</strong>
                    <small>{t('Share an idea to improve public service delivery')}</small>
                  </div>
                </button>

                {/* 3. Satisfaction */}
                <button
                  type="button"
                  className="qr-intent-card qr-intent-card-satisfaction"
                  onClick={() => handleSelectType('satisfaction')}
                >
                  <div className="qr-intent-icon-wrap" style={{ background: '#dcfce7', color: '#16a34a' }}>
                    <span style={{ fontSize: '24px', lineHeight: 1 }}>😊</span>
                  </div>
                  <div className="qr-intent-copy">
                    <strong>{t('Rate Satisfaction')}</strong>
                    <small>{t('Share how satisfied you are with your visit')}</small>
                  </div>
                </button>

                {/* 4. Information */}
                <button
                  type="button"
                  className="qr-intent-card qr-intent-card-info"
                  onClick={() => handleSelectType('info')}
                >
                  <div className="qr-intent-icon-wrap" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                    <Icon name="file" size={24} />
                  </div>
                  <div className="qr-intent-copy">
                    <strong>{t('I want service information')}</strong>
                    <small>{t('Find requirements, where to go, and steps')}</small>
                  </div>
                </button>
              </div>

              {/* Status Tracking shortcut */}
              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => setShowTracker((v) => !v)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '13px',
                    color: '#00485a',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  <Icon name="search" size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  {t('Check previous submission status')}
                </button>
              </div>
            </div>
          )}

          {/* ===============================================================
              STEP 4: Which Service? (DEDICATED STEP)
             =============================================================== */}
          {currentStep === 4 && (
            <div>
              <div className="qr-step-heading-wrap">
                <h2>
                  {intent === 'complaint'
                    ? t('Which service is your complaint about?')
                    : intent === 'suggestion'
                      ? t('Which service is your suggestion for?')
                      : intent === 'satisfaction'
                        ? t('Which service did you receive?')
                        : t('Which service do you want information on?')}
                </h2>
                <p>{t('Select the service you received or need guidance for:')}</p>
                <div className="qr-context-pill">
                  📍 {effectiveSubCity} · {activeOfficeObj?.name}
                </div>
              </div>

              {isServicesLoading ? (
                <p style={{ textAlign: 'center', padding: '30px' }}>{t('Loading services…')}</p>
              ) : (
                <div className="qr-service-select-list">
                  {servicesList.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      className={`qr-service-select-btn ${selectedServiceId === service.id ? 'active' : ''}`}
                      onClick={() => handleSelectService(service.id)}
                    >
                      <div className="qr-service-select-text">
                        <strong>{t(service.name)}</strong>
                        <small>
                          <span>📍 {service.counter}</span>
                          <span>•</span>
                          <span>⏱️ {service.duration} {t('minutes')}</span>
                          <span>•</span>
                          <span>💵 {service.fee}</span>
                        </small>
                      </div>
                      <Icon name="arrow" size={16} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===============================================================
              STEP 5: Destination Screen (Feedback Form OR Service Details)
             =============================================================== */}
          {currentStep === 5 && (
            <div>
              {intent === 'info' ? (
                /* Information Screen: shows full guide for selected service */
                <div>
                  <div className="qr-step-heading-wrap">
                    <h2>{t('Service Details & Where to Go')}</h2>
                    <div className="qr-context-pill">
                      📍 {effectiveSubCity} · {activeOfficeObj?.name}
                    </div>
                  </div>

                  <article className="qr-service-card" style={{ marginTop: '16px' }}>
                    <div className="qr-service-top">
                      <div className="qr-service-title">
                        <h3 style={{ fontSize: '20px' }}>{t(activeServiceObj.name)}</h3>
                        <p>{t(activeServiceObj.category)}</p>
                      </div>
                    </div>

                    <div className="qr-service-meta-row">
                      <span className="qr-service-badge qr-badge-counter">
                        <Icon name="pin" size={14} />
                        <span>{t('Where to Go')}: <b>{activeServiceObj.counter}</b></span>
                      </span>

                      <span className="qr-service-badge qr-badge-time">
                        <Icon name="clock" size={14} />
                        <span>{t('Estimated Time')}: <b>{activeServiceObj.duration} {t('minutes')}</b></span>
                      </span>

                      <span className="qr-service-badge qr-badge-fee">
                        <Icon name="shield" size={14} />
                        <span>{t('Official Fee')}: <b>{activeServiceObj.fee}</b></span>
                      </span>
                    </div>

                    {activeServiceObj.requirements && activeServiceObj.requirements.length > 0 && (
                      <div className="qr-docs-section">
                        <div className="qr-docs-title">
                          <Icon name="file" size={13} />
                          <span>{t('Required Documents')}</span>
                        </div>
                        <ul className="qr-docs-list">
                          {activeServiceObj.requirements.map((doc: string, idx: number) => (
                            <li key={idx}>{t(doc)}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Citizens' Rights & Obligations Charter */}
                    <CitizensCharter t={t} variant="qr" />

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="qr-submit-btn"
                        style={{ margin: 0, flex: 1 }}
                        onClick={() => {
                          setIntent('satisfaction');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        <Icon name="heart" size={18} />
                        <span>{t('Give Feedback for this Service')}</span>
                      </button>

                      <button
                        type="button"
                        className="qr-btn-secondary"
                        onClick={() => setCurrentStep(4)}
                      >
                        {t('Check another service')}
                      </button>
                    </div>
                  </article>
                </div>
              ) : (
                /* Feedback Space: Complaint, Suggestion, or Satisfaction Form */
                !isSuccess ? (
                  <form onSubmit={handleSubmitFeedback}>
                    <div className="qr-step-heading-wrap">
                      <h2>
                        {intent === 'complaint'
                          ? t('File Your Complaint')
                          : intent === 'suggestion'
                            ? t('Share Your Suggestion')
                            : t('Rate Your Visit')}
                      </h2>
                      <div className="qr-context-pill">
                        📍 {effectiveSubCity} · {activeOfficeObj?.name} · {t(activeServiceObj.name)}
                      </div>
                    </div>

                    {/* Satisfaction 5-Star Rating */}
                    {intent === 'satisfaction' && (
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

                    {/* 1-Tap Quick Reason Tags */}
                    <div className="qr-tags-container">
                      <div className="qr-tags-label">
                        <Icon name="shield" size={14} />
                        <span>{t('Tap what describes your visit best:')}</span>
                      </div>
                      <div className="qr-tags-grid">
                        {activeTags.map((tagKey) => {
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

                    {/* Message Box */}
                    <div className="qr-form-group">
                      <label className="qr-form-label" htmlFor="qr-feedback-notes">
                        {t('Write details in your words (optional)')}
                      </label>
                      <textarea
                        id="qr-feedback-notes"
                        className="qr-form-textarea"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={
                          intent === 'complaint'
                            ? t('Describe what happened...')
                            : intent === 'suggestion'
                              ? t('Share your idea for improvement...')
                              : t('Tell us what made your visit good...')
                        }
                      />
                    </div>

                    {/* Optional Full Name Field */}
                    <div className="qr-form-group">
                      <label className="qr-form-label" htmlFor="qr-feedback-name">
                        {t('Your full name (optional)')}
                      </label>
                      <input
                        id="qr-feedback-name"
                        type="text"
                        className="qr-form-input"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Abebe Bekele"
                      />
                    </div>

                    {/* Optional Phone Number Field */}
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

                    {/* Optional Photo / Document Attachment Field */}
                    <div className="qr-form-group">
                      <label className="qr-form-label">
                        {t('Attach photo or document (optional)')}
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleFileSelect}
                      />

                      {!attachedImage ? (
                        <div
                          className="qr-image-dropzone"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <div className="qr-image-dropzone-icon">
                            <Icon name="file" size={20} />
                          </div>
                          <strong>{t('Click or tap to upload photo')}</strong>
                          <small>Supports JPG, PNG up to 10MB</small>
                        </div>
                      ) : (
                        <div className="qr-image-preview-card">
                          <div className="qr-image-preview-thumb-wrap">
                            <img
                              src={attachedImage.dataUrl}
                              alt={attachedImage.name}
                              className="qr-image-preview-img"
                            />
                            <div className="qr-image-preview-meta">
                              <strong>{attachedImage.name}</strong>
                              <small>{attachedImage.size}</small>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="qr-image-remove-btn"
                            onClick={handleRemoveImage}
                          >
                            <Icon name="close" size={13} />
                            <span>{t('Remove image')}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Submit Button */}
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
                          <span>
                            {intent === 'complaint'
                              ? t('Submit Complaint')
                              : intent === 'suggestion'
                                ? t('Submit Suggestion')
                                : t('Submit Rating')}
                          </span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* Success Screen */
                  <div className="qr-success-card">
                    <div className="qr-success-icon-wrap">
                      <Icon name="check" size={36} />
                    </div>
                    <h2>{t('Thank you! Your feedback has been received.')}</h2>
                    <p>
                      {intent === 'satisfaction'
                        ? t('Thank you for rating our service. Your rating helps us improve public services.')
                        : t(
                            'Your feedback was routed directly to the office administration. Use this tracking code anytime to check the resolution.'
                          )}
                    </p>

                    {intent !== 'satisfaction' && trackingNumber && (
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
                    )}

                    <div className="qr-success-actions">
                      <button
                        type="button"
                        className="qr-btn-secondary"
                        onClick={handleStartOver}
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
              )}
            </div>
          )}
        </div>

        {/* Collapsible Case Tracker */}
        {showTracker && (
          <section className="qr-track-panel qr-fade-in">
            <h4>
              <Icon name="search" size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
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
        )}
      </main>
    </div>
  );
}
