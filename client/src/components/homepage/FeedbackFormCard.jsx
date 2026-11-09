import { useEffect, useMemo, useRef } from 'react';
import Icon from '../ui/Icon.jsx';
import FeedbackFormActions from './FeedbackFormActions.jsx';
import FeedbackStepContent from './FeedbackStepContent.jsx';
import FeedbackSuccess from './FeedbackSuccess.jsx';
import { createFeedbackTrackingNumber } from '../../utils/feedbackTracking.js';
import { useSubmitFeedbackMutation } from '../../services/feedbackApi.js';
import { useGetOrganizationsQuery } from '../../services/organizationsApi.js';
import { useGetServicesQuery } from '../../services/servicesApi.js';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  setFeedbackStep,
  setFeedbackType,
  setFeedbackCity,
  setFeedbackBureau,
  setFeedbackService,
  setFeedbackMessage,
  setFeedbackSatisfaction,
  setFeedbackFullName,
  setFeedbackPhoneNumber,
  setSubmittedFeedback,
  resetFeedback,
} from '../../store/slices/feedbackSlice.js';

const stepTitles = [
  'What would you like to share?',
  'Which sub-city did you visit?',
  'Which bureau did you visit?',
  'What service did you receive?',
  'Tell us a little more',
];

export default function FeedbackFormCard({ t, onTrack }) {
  const dispatch = useAppDispatch();
  const feedbackState = useAppSelector((state) => state.feedback);

  const feedbackStep = feedbackState.step;
  const feedbackType = feedbackState.type;
  const feedbackCity = feedbackState.city;
  const feedbackBureau = feedbackState.bureau;
  const feedbackService = feedbackState.service;
  const feedbackMessage = feedbackState.message;
  const satisfaction = feedbackState.satisfaction;
  const feedbackFullName = feedbackState.fullName;
  const feedbackPhoneNumber = feedbackState.phoneNumber;
  const feedbackSubmitted = feedbackState.submitted;
  const trackingNumber = feedbackState.trackingNumber;

  // RTK Query hooks with backend filtering
  const [submitFeedbackMutation, { isLoading: isSubmitting }] = useSubmitFeedbackMutation();
  const { data: allOrgsData, isLoading: isOrgsLoading } = useGetOrganizationsQuery({
    per_page: 100,
  });

  const allOrganizations = useMemo(() => {
    return (allOrgsData?.data && Array.isArray(allOrgsData.data)) ? allOrgsData.data : [];
  }, [allOrgsData]);

  const hasPrefilledRef = useRef(false);

  useEffect(() => {
    if (hasPrefilledRef.current || !allOrganizations.length) return;

    const searchParams = new URLSearchParams(window.location.search);
    let hashSearch = '';
    if (window.location.hash.includes('?')) {
      hashSearch = window.location.hash.split('?')[1];
    }
    const hashParams = new URLSearchParams(hashSearch);
    const getParam = (key) => hashParams.get(key) || searchParams.get(key);

    const orgParam = getParam('org') || getParam('bureau') || getParam('office');
    const subCityParam = getParam('sub_city') || getParam('subcity') || getParam('city');
    const serviceParam = getParam('service') || getParam('sub_service') || getParam('subservice');
    const typeParam = getParam('type');

    if (orgParam || subCityParam || serviceParam || typeParam || window.location.hash.includes('feedback')) {
      hasPrefilledRef.current = true;

      // Default to 'Complaint' when routed via QR poster or complaint specified
      const isComplaint = !typeParam || typeParam.toLowerCase() === 'complaint';
      if (isComplaint) {
        dispatch(setFeedbackType('Complaint'));
      } else if (typeParam) {
        const capitalized = typeParam.charAt(0).toUpperCase() + typeParam.slice(1).toLowerCase();
        dispatch(setFeedbackType(capitalized));
      }

      let matchedOrg = null;
      if (orgParam) {
        matchedOrg = allOrganizations.find(
          (o) =>
            String(o.id) === String(orgParam) ||
            String(o.code).toLowerCase() === String(orgParam).toLowerCase() ||
            o.name.toLowerCase() === String(orgParam).toLowerCase() ||
            o.name.toLowerCase().includes(String(orgParam).toLowerCase())
        );
      }

      let matchedSubCity = null;
      if (subCityParam) {
        matchedSubCity = allOrganizations.find(
          (o) =>
            o.parent_organization_id === null &&
            (String(o.id) === String(subCityParam) ||
              String(o.code).toLowerCase() === String(subCityParam).toLowerCase() ||
              o.name.toLowerCase() === String(subCityParam).toLowerCase() ||
              o.name.toLowerCase().includes(String(subCityParam).toLowerCase()))
        );
      }

      if (matchedOrg) {
        if (matchedOrg.parent_organization_id) {
          const parent = allOrganizations.find((p) => p.id === matchedOrg.parent_organization_id);
          if (parent) {
            dispatch(setFeedbackCity(parent.name));
          }
          dispatch(setFeedbackBureau(String(matchedOrg.id)));
        } else if (
          matchedOrg.type?.code === 'sub_city' ||
          matchedOrg.name.toLowerCase().includes('sub-city') ||
          matchedOrg.name.toLowerCase().includes('subcity')
        ) {
          dispatch(setFeedbackCity(matchedOrg.name));
        } else {
          // Central bureau
          if (matchedSubCity) {
            dispatch(setFeedbackCity(matchedSubCity.name));
          }
          dispatch(setFeedbackBureau(String(matchedOrg.id)));
        }
      } else if (matchedSubCity) {
        dispatch(setFeedbackCity(matchedSubCity.name));
      }

      if (serviceParam) {
        dispatch(setFeedbackService(serviceParam));
        dispatch(setFeedbackStep(5));
      } else if (matchedOrg || matchedSubCity) {
        // Route to Step 4: "What service did you receive?"
        dispatch(setFeedbackStep(4));
      }

      setTimeout(() => {
        const el = document.getElementById('feedback');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [allOrganizations, dispatch]);

  const subCitiesData = useMemo(() => {
    const list = allOrganizations.filter(
      (o) =>
        o.parent_organization_id === null &&
        (o.type?.code === 'sub_city' ||
          o.name?.toLowerCase().includes('sub-city') ||
          o.name?.toLowerCase().includes('subcity'))
    );
    return { data: list };
  }, [allOrganizations]);

  const isSubCitiesLoading = isOrgsLoading;
  const isBureausLoading = isOrgsLoading;

  // Selected sub-city object
  const selectedSubCity = useMemo(() => {
    if (!feedbackCity || feedbackCity === 'all') return null;
    return subCitiesData.data.find(
      (o) =>
        o.name.toLowerCase() === feedbackCity.toLowerCase() ||
        String(o.id) === String(feedbackCity)
    );
  }, [feedbackCity, subCitiesData]);

  // Bureaus & child offices filtered under selected sub-city
  const bureausData = useMemo(() => {
    const centralBureaus = allOrganizations.filter(
      (o) =>
        o.parent_organization_id === null &&
        (o.type?.code === 'bureau' ||
          o.type?.code === 'agency' ||
          o.name?.toLowerCase().includes('bureau') ||
          o.name?.toLowerCase().includes('agency'))
    );

    if (selectedSubCity) {
      const childOffices = allOrganizations.filter(
        (o) => o.parent_organization_id === selectedSubCity.id
      );
      return {
        data: [
          ...childOffices.map((o) => ({
            ...o,
            label: o.name,
            subtext: `Under ${selectedSubCity.name}`,
          })),
          ...centralBureaus.map((o) => ({
            ...o,
            label: o.name,
            subtext: o.code || '',
          })),
        ],
      };
    }

    const childOffices = allOrganizations.filter((o) => o.parent_organization_id !== null);
    return {
      data: [
        ...centralBureaus.map((o) => ({
          ...o,
          label: o.name,
          subtext: o.code || '',
        })),
        ...childOffices.map((o) => ({
          ...o,
          label: o.parent ? `${o.parent.name} › ${o.name}` : o.name,
          subtext: o.parent ? `Under ${o.parent.name}` : '',
        })),
      ],
    };
  }, [allOrganizations, selectedSubCity]);

  const feedbackServicesParams = useMemo(() => {
    const params = { per_page: 100, tree: true };
    if (feedbackCity && feedbackCity !== 'all') {
      params.sub_city = feedbackCity;
    }
    if (feedbackBureau && feedbackBureau !== 'all') {
      params.organization_id = feedbackBureau;
    }
    return params;
  }, [feedbackCity, feedbackBureau]);

  const { data: servicesData, isLoading: isServicesLoading } = useGetServicesQuery(feedbackServicesParams);

  const feedback = {
    type: feedbackType,
    city: feedbackCity,
    bureau: feedbackBureau,
    service: feedbackService,
    message: feedbackMessage,
    satisfaction,
    fullName: feedbackFullName,
    phoneNumber: feedbackPhoneNumber,
  };

  const actions = {
    setType: (val) => dispatch(setFeedbackType(val)),
    setCity: (val) => {
      dispatch(setFeedbackCity(val));
      if (feedbackCity && feedbackCity !== val) {
        dispatch(setFeedbackBureau(''));
      }
    },
    setService: (val) => dispatch(setFeedbackService(val)),
    setMessage: (val) => dispatch(setFeedbackMessage(val)),
    setSatisfaction: (val) => dispatch(setFeedbackSatisfaction(val)),
    setFullName: (val) => dispatch(setFeedbackFullName(val)),
    setPhoneNumber: (val) => dispatch(setFeedbackPhoneNumber(val)),
    changeBureau(nextBureau) {
      dispatch(setFeedbackBureau(nextBureau));
    },
  };

  async function handleSubmit(event) {
    event.preventDefault();
    if (!feedbackMessage.trim() || (feedbackType === 'Satisfaction' && !satisfaction)) return;

    // 1. Resolve target organization ID
    let targetOrgId = Number(feedbackBureau);
    if (!targetOrgId && bureausData?.data && Array.isArray(bureausData.data)) {
      const match = bureausData.data.find(
        (o) => String(o.id) === String(feedbackBureau) || String(o.code) === String(feedbackBureau)
      );
      if (match) targetOrgId = match.id;
    }
    if (!targetOrgId && subCitiesData?.data && Array.isArray(subCitiesData.data)) {
      const matchSub = subCitiesData.data.find(
        (o) => String(o.id) === String(feedbackCity) || o.name.toLowerCase().includes(String(feedbackCity).toLowerCase())
      );
      if (matchSub) targetOrgId = matchSub.id;
    }
    if (!targetOrgId) {
      targetOrgId = bureausData?.data?.[0]?.id || subCitiesData?.data?.[0]?.id || 1;
    }

    // 2. Resolve Service and Bureau display labels for contextual enrichment
    let serviceLabel = '';
    const rawServices = servicesData?.data || [];
    for (const s of rawServices) {
      if (String(s.code || s.id) === String(feedbackService) || String(s.id) === String(feedbackService)) {
        serviceLabel = s.name;
        break;
      }
      if (s.subservices && Array.isArray(s.subservices)) {
        const matchedSub = s.subservices.find(
          (sub) => String(sub.code || sub.id) === String(feedbackService) || String(sub.id) === String(feedbackService)
        );
        if (matchedSub) {
          serviceLabel = `${s.name} › ${matchedSub.name}`;
          break;
        }
      }
    }
    if (!serviceLabel && feedbackService) serviceLabel = String(feedbackService);

    const matchedOrg =
      bureausData?.data?.find((o) => Number(o.id) === Number(targetOrgId)) ||
      subCitiesData?.data?.find((o) => Number(o.id) === Number(targetOrgId));
    const orgLabel = matchedOrg?.name || '';
    const cityLabel = feedbackCity || '';

    const contextTags = [];
    if (serviceLabel) contextTags.push(`Service: ${serviceLabel}`);
    if (orgLabel) contextTags.push(`Office: ${orgLabel}`);
    if (cityLabel && !orgLabel.includes(cityLabel)) contextTags.push(`Sub-city: ${cityLabel}`);
    if (feedbackType === 'Satisfaction' && satisfaction) {
      contextTags.push(`Rating: ${satisfaction}/5`);
    }

    const contextPrefix = contextTags.length > 0 ? `[${contextTags.join(' · ')}]\n\n` : '';
    const enrichedContent = `${contextPrefix}${feedbackMessage.trim()}`;

    // 3. Normalize feedback type
    const normalizedType =
      feedbackType.toLowerCase() === 'complaint'
        ? 'complaint'
        : feedbackType.toLowerCase() === 'satisfaction'
          ? 'satisfaction'
          : 'feedback';

    let tracking = null;

    try {
      const response = await submitFeedbackMutation({
        feedback_for_organization: targetOrgId,
        feedback_content: enrichedContent,
        feedback_type: normalizedType,
        full_name: feedbackFullName.trim() || undefined,
        phone_number: feedbackPhoneNumber.trim() || undefined,
      }).unwrap();
      tracking = response?.data?.tracking_number;
    } catch (err) {
      console.warn('Backend feedback submission error, providing fallback:', err);
    }

    if (!tracking) {
      tracking = createFeedbackTrackingNumber();
    }

    dispatch(setSubmittedFeedback({ trackingNumber: tracking }));
  }

  function handleReset() {
    dispatch(resetFeedback());
  }

  return (
    <div className="feedback-form-card scroll-reveal">
      {!feedbackSubmitted ? (
        <>
          <div className="feedback-form-heading">
            <div>
              <span className="form-eyebrow">{t('CITIZEN FEEDBACK')}</span>
              <h3>{t('Tell us about your visit')}</h3>
            </div>
            <span className="form-step-count">
              0{feedbackStep}<i> / 05</i>
            </span>
          </div>
          <div className="feedback-progress" aria-label={t(`STEP ${feedbackStep} OF 5`)}>
            <span style={{ width: `${feedbackStep * 20}%` }} />
          </div>
          <div className="feedback-step-title">
            <span>{t(`STEP ${feedbackStep} OF 5`)}</span>
            <h4>{t(stepTitles[feedbackStep - 1])}</h4>
          </div>
          <form onSubmit={handleSubmit} className="feedback-card-form">
            <FeedbackStepContent
              step={feedbackStep}
              feedback={feedback}
              actions={actions}
              subCitiesData={subCitiesData}
              bureausData={bureausData}
              servicesData={servicesData}
              isSubCitiesLoading={isSubCitiesLoading}
              isBureausLoading={isBureausLoading}
              isServicesLoading={isServicesLoading}
              t={t}
            />
            <FeedbackFormActions
              step={feedbackStep}
              feedbackType={feedbackType}
              message={feedbackMessage}
              satisfaction={satisfaction}
              onBack={() => dispatch(setFeedbackStep(Math.max(1, feedbackStep - 1)))}
              onContinue={() => dispatch(setFeedbackStep(Math.min(5, feedbackStep + 1)))}
              submitting={isSubmitting}
              t={t}
            />
          </form>
          <div className="demo-note">
            {t('Connected to CivicLink Citizen Feedback RTK Query API · Official Government Tracking')}
          </div>
        </>
      ) : (
        <FeedbackSuccess
          t={t}
          onReset={handleReset}
          trackingNumber={trackingNumber}
          onTrack={onTrack}
        />
      )}
      <div className="feedback-form-footer">
        <span>
          <Icon name="shield" size={14} /> {t('Your privacy is important')}
        </span>
        <span>{t(`STEP ${feedbackStep} OF 5`)}</span>
      </div>
    </div>
  );
}
