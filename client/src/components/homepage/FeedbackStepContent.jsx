import { useEffect, useMemo } from 'react'
import Icon from '../ui/Icon.jsx'
import SearchableSelect from '../ui/SearchableSelect.jsx'
import { useGetOrganizationsQuery } from '../../services/organizationsApi.js'
import { useGetServicesQuery } from '../../services/servicesApi.js'

const feedbackTypes = [
  { value: 'Complaint', icon: 'news', label: 'A complaint', copy: 'Something needs attention' },
  { value: 'Suggestion', icon: 'file', label: 'A suggestion', copy: 'An idea for improvement' },
  { value: 'Satisfaction', icon: 'heart', label: 'A rating', copy: 'Share how it went' },
]

export default function FeedbackStepContent({
  step,
  feedback,
  actions,
  subCitiesData: propSubCitiesData,
  bureausData: propBureausData,
  servicesData: propServicesData,
  isSubCitiesLoading: propIsSubCitiesLoading,
  isBureausLoading: propIsBureausLoading,
  isServicesLoading: propIsServicesLoading,
  t,
}) {
  const { data: apiSubCities, isLoading: apiSubCitiesLoading } = useGetOrganizationsQuery(
    { type: 'sub_city', per_page: 50 },
    { skip: Boolean(propSubCitiesData) }
  );
  const { data: apiBureaus, isLoading: apiBureausLoading } = useGetOrganizationsQuery(
    { type: 'bureau', per_page: 50 },
    { skip: Boolean(propBureausData) }
  );

  const subCitiesData = propSubCitiesData || apiSubCities;
  const bureausData = propBureausData || apiBureaus;
  const servicesData = propServicesData;
  const isSubCitiesLoading = propIsSubCitiesLoading !== undefined ? propIsSubCitiesLoading : apiSubCitiesLoading;
  const isBureausLoading = propIsBureausLoading !== undefined ? propIsBureausLoading : apiBureausLoading;
  const isServicesLoading = Boolean(propIsServicesLoading);
  const isOrgsLoading = isSubCitiesLoading || isBureausLoading;

  // Live sub-cities strictly from backend database
  const availableSubCities = useMemo(() => {
    if (subCitiesData?.data && Array.isArray(subCitiesData.data)) {
      return subCitiesData.data.map((o) => ({ id: o.id, name: o.name }));
    }
    return [];
  }, [subCitiesData]);

  // Municipal bureaus strictly from backend database
  const bureauList = useMemo(() => {
    if (bureausData?.data && Array.isArray(bureausData.data)) {
      return bureausData.data.map((o) => ({
        id: String(o.id),
        label: o.label || o.name,
        subtext: o.subtext || o.code || '',
      }));
    }
    return [];
  }, [bureausData]);

  // Services with subservices strictly from backend database
  const activeServices = useMemo(() => {
    if (!servicesData?.data || !Array.isArray(servicesData.data)) return [];

    const list = [];
    const seenIds = new Set();

    servicesData.data.forEach((s) => {
      if (s.subservices && Array.isArray(s.subservices) && s.subservices.length > 0) {
        s.subservices.forEach((sub) => {
          const subId = sub.code || String(sub.id);
          if (!seenIds.has(subId)) {
            seenIds.add(subId);
            list.push({
              id: subId,
              label: sub.name,
              subtext: s.name,
              group: s.name,
              raw: sub,
            });
          }
        });
      } else {
        const sId = s.code || String(s.id);
        if (!seenIds.has(sId)) {
          seenIds.add(sId);
          list.push({
            id: sId,
            label: s.name,
            subtext: s.organization?.name || '',
            group: s.organization?.name || 'General Services',
            raw: s,
          });
        }
      }
    });

    return list;
  }, [servicesData]);

  // Auto-sync initial selections with live options
  useEffect(() => {
    if (availableSubCities.length > 0 && !feedback.city) {
      actions.setCity(availableSubCities[0].name);
    }
  }, [availableSubCities, feedback.city]);

  useEffect(() => {
    if (bureauList.length > 0) {
      const hasMatch = bureauList.some((b) => String(b.id) === String(feedback.bureau));
      if (!hasMatch && bureauList[0]) {
        actions.changeBureau(bureauList[0].id);
      }
    }
  }, [bureauList, feedback.bureau]);

  useEffect(() => {
    if (activeServices.length > 0) {
      const hasMatch = activeServices.some((s) => String(s.id) === String(feedback.service));
      if (!hasMatch && activeServices[0]) {
        actions.setService(activeServices[0].id);
      }
    }
  }, [activeServices, feedback.service]);

  if (step === 1) {
    return (
      <div className="feedback-type-grid">
        {feedbackTypes.map((item) => (
          <button
            key={item.value}
            className={`feedback-type-option ${feedback.type === item.value ? 'selected' : ''}`}
            type="button"
            onClick={() => actions.setType(item.value)}
          >
            <span className="type-option-icon"><Icon name={item.icon} size={19} /></span>
            <span><b>{t(item.label)}</b><small>{t(item.copy)}</small></span>
            {feedback.type === item.value && <Icon name="check" size={16} className="type-option-check" />}
          </button>
        ))}
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="feedback-select-label">
        <span style={{ display: 'block', marginBottom: '8px' }}>{t('Select the sub-city')}</span>
        <SearchableSelect
          value={feedback.city || ''}
          onChange={(val) => actions.setCity(val)}
          options={availableSubCities.map((subCity) => ({
            id: subCity.name,
            label: subCity.name,
          }))}
          icon="pin"
          placeholder="Choose a sub-city…"
          searchPlaceholder="Search sub-cities (e.g. Bole, Kirkos, Arada)…"
          isLoading={isSubCitiesLoading}
          ariaLabel={t('Select the sub-city')}
          t={t}
        />
      </div>
    )
  }

  if (step === 3) {
    return (
      <div className="feedback-select-label">
        <span style={{ display: 'block', marginBottom: '8px' }}>{t('Select the city office / bureau')}</span>
        <SearchableSelect
          value={feedback.bureau || ''}
          onChange={(val) => actions.changeBureau(val)}
          options={bureauList.map((bureau) => ({
            id: bureau.id,
            label: bureau.label,
          }))}
          icon="building"
          placeholder="Choose an office…"
          searchPlaceholder="Search offices (e.g. Revenues, Trade, Land)…"
          isLoading={isBureausLoading}
          ariaLabel={t('Select the city office / bureau')}
          t={t}
        />
      </div>
    )
  }

  if (step === 4) {
    return (
      <div className="feedback-select-label">
        <span style={{ display: 'block', marginBottom: '8px' }}>{t('Select the service')}</span>
        <SearchableSelect
          value={feedback.service || ''}
          onChange={(val) => actions.setService(val)}
          options={activeServices}
          icon="file"
          placeholder="Choose a service…"
          searchPlaceholder="Search services (e.g. Birth, License, Tax)…"
          isLoading={isServicesLoading}
          ariaLabel={t('Select the service')}
          t={t}
        />
      </div>
    )
  }

  return (
    <div className="feedback-message-fields">
      {feedback.type === 'Satisfaction' && (
        <fieldset className="rating-field">
          <legend>{t('How was your experience?')}</legend>
          <div className="rating-options">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                className={feedback.satisfaction === rating ? 'rating-selected' : ''}
                type="button"
                aria-label={`${rating} ${t('out of 5')}`}
                aria-pressed={feedback.satisfaction === rating}
                onClick={() => actions.setSatisfaction(rating)}
              >
                ★
              </button>
            ))}
          </div>
          {!feedback.satisfaction && <small className="rating-hint">{t('Select a rating before submitting.')}</small>}
        </fieldset>
      )}

      <label className="message-label" htmlFor="feedback-message">
        {t('Your feedback')}
        <textarea
          id="feedback-message"
          value={feedback.message}
          onChange={(event) => actions.setMessage(event.target.value)}
          placeholder={t('Share the details that could help improve your experience…')}
          required
          rows={3}
        />
      </label>

      {/* Optional Contact Fields for Resolution Follow-up */}
      <div className="feedback-contact-grid">
        <label className="feedback-contact-label">
          <span>{t('Your name')} <small>({t('optional')})</small></span>
          <input
            type="text"
            placeholder={t('e.g. Abebe Bekele')}
            value={feedback.fullName || ''}
            onChange={(e) => actions.setFullName?.(e.target.value)}
          />
        </label>
        <label className="feedback-contact-label">
          <span>{t('Phone number')} <small>({t('for SMS updates')})</small></span>
          <input
            type="tel"
            placeholder={t('+251 91 100 0000')}
            value={feedback.phoneNumber || ''}
            onChange={(e) => actions.setPhoneNumber?.(e.target.value)}
          />
        </label>
      </div>

      <p className="privacy-note">
        <Icon name="shield" size={15} /> {t('Your contact information is only used for official case follow-up and SMS notifications.')}
      </p>
    </div>
  )
}
