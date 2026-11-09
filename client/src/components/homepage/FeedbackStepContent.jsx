import { useEffect, useMemo } from 'react'
import Icon from '../ui/Icon.jsx'
import SearchableSelect from '../ui/SearchableSelect.jsx'
import { useGetOrganizationsQuery } from '../../services/organizationsApi.js'
import { useGetServicesQuery } from '../../services/servicesApi.js'

const feedbackTypes = [
  { value: 'Complaint', icon: 'news', label: 'A complaint', copy: 'Something needs attention' },
  { value: 'Suggestion', icon: 'sparkle', label: 'A suggestion', copy: 'An idea for improvement' },
  { value: 'Satisfaction', icon: 'heart', label: 'A rating', copy: 'Share how it went' },
]

export default function FeedbackStepContent({
  step,
  feedback,
  actions,
  orgData: propOrgData,
  servicesData: propServicesData,
  isOrgsLoading: propIsOrgsLoading,
  isServicesLoading: propIsServicesLoading,
  t,
}) {
  const { data: apiOrgData, isLoading: apiOrgsLoading } = useGetOrganizationsQuery({ per_page: 100 })
  const { data: apiServicesData, isLoading: apiServicesLoading } = useGetServicesQuery({ per_page: 100 })

  const orgData = propOrgData || apiOrgData
  const servicesData = propServicesData || apiServicesData
  const isOrgsLoading = propIsOrgsLoading !== undefined ? propIsOrgsLoading : apiOrgsLoading
  const isServicesLoading = propIsServicesLoading !== undefined ? propIsServicesLoading : apiServicesLoading

  // Unpack organizations safely regardless of payload structure
  const rawOrgs = useMemo(() => {
    if (!orgData) return []
    if (Array.isArray(orgData)) return orgData
    if (Array.isArray(orgData.data)) return orgData.data
    if (Array.isArray(orgData.data?.data)) return orgData.data.data
    return []
  }, [orgData])

  // Live sub-cities strictly from database
  const availableSubCities = useMemo(() => {
    if (rawOrgs.length > 0) {
      const filtered = rawOrgs.filter((o) => {
        const typeCode = (o.type?.code || '').toLowerCase()
        const name = (o.name || '').toLowerCase()
        const isSubcity =
          Number(o.organization_type_id) === 1 ||
          typeCode === 'sub_city' ||
          name.includes('sub-city') ||
          name.includes('subcity') ||
          name.includes('sub city')
        const isBureau =
          Number(o.organization_type_id) === 3 ||
          typeCode === 'bureau' ||
          name.includes('bureau') ||
          name.includes('agency')
        const isWoreda =
          Number(o.organization_type_id) === 2 ||
          typeCode === 'woreda' ||
          name.includes('woreda')
        return isSubcity && !isBureau && !isWoreda
      })
      if (filtered.length > 0) {
        return filtered.map((o) => ({ id: o.id, name: o.name }))
      }
      return rawOrgs.map((o) => ({ id: o.id, name: o.name }))
    }
    return []
  }, [rawOrgs])

  // Find currently selected sub-city object
  const selectedSubCityObj =
    availableSubCities.find(
      (c) => String(c.id) === String(feedback.city) || c.name.toLowerCase().includes(String(feedback.city).toLowerCase())
    ) || availableSubCities[0]

  // Bureaus list strictly from database, contextualized by selected sub-city
  const bureauList = useMemo(() => {
    if (rawOrgs.length > 0) {
      // Find currently selected sub-city ID
      const selectedSubCityId = selectedSubCityObj?.id

      // 1. Try to find child bureaus whose parent is this sub-city
      if (selectedSubCityId) {
        const childBureaus = rawOrgs.filter((o) => {
          const parentId = o.parent_organization_id || o.parent?.id
          return parentId && Number(parentId) === Number(selectedSubCityId)
        })
        if (childBureaus.length > 0) {
          return childBureaus.map((o) => ({ id: String(o.id), label: o.name }))
        }
      }

      // 2. All organizations that are not sub-cities
      const nonSubCities = rawOrgs.filter((o) => {
        const isSub =
          Number(o.organization_type_id) === 1 ||
          o.type?.code === 'sub_city' ||
          Number(o.type?.level) === 1 ||
          o.name?.toLowerCase().includes('sub-city') ||
          o.name?.toLowerCase().includes('sub city') ||
          o.name?.toLowerCase().includes('subcity')
        return !isSub
      })
      if (nonSubCities.length > 0) {
        return nonSubCities.map((o) => ({ id: String(o.id), label: o.name }))
      }

      // 3. Fallback to all organizations from database
      return rawOrgs.map((o) => ({ id: String(o.id), label: o.name }))
    }
    return []
  }, [rawOrgs, selectedSubCityObj])

  // Unpack services safely regardless of payload structure
  const rawServices = useMemo(() => {
    if (!servicesData) return []
    if (Array.isArray(servicesData)) return servicesData
    if (Array.isArray(servicesData.data)) return servicesData.data
    if (Array.isArray(servicesData.data?.data)) return servicesData.data.data
    return []
  }, [servicesData])

  // Services strictly from database
  const activeServices = useMemo(() => {
    if (rawServices.length > 0) {
      return rawServices.map((s) => ({
        id: s.code || String(s.id),
        label: s.name,
      }))
    }
    return []
  }, [rawServices])

  // Auto-sync initial selections with live options
  useEffect(() => {
    if (availableSubCities.length > 0 && !feedback.city) {
      actions.setCity(availableSubCities[0].name)
    }
  }, [availableSubCities, feedback.city])

  useEffect(() => {
    if (bureauList.length > 0) {
      const hasMatch = bureauList.some((b) => String(b.id) === String(feedback.bureau))
      if (!hasMatch && bureauList[0]) {
        actions.changeBureau(bureauList[0].id)
      }
    }
  }, [bureauList, feedback.bureau])

  useEffect(() => {
    if (activeServices.length > 0) {
      const hasMatch = activeServices.some((s) => String(s.id) === String(feedback.service))
      if (!hasMatch && activeServices[0]) {
        actions.setService(activeServices[0].id)
      }
    }
  }, [activeServices, feedback.service])

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
          isLoading={isOrgsLoading}
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
          isLoading={isOrgsLoading}
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
          options={activeServices.map((service) => ({
            id: service.id,
            label: service.label,
          }))}
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
          <span>{t('Your name')} <small style={{ fontWeight: 400, color: '#64748b' }}>({t('optional')})</small></span>
          <input
            type="text"
            placeholder={t('e.g. Abebe Bekele')}
            value={feedback.fullName || ''}
            onChange={(e) => actions.setFullName?.(e.target.value)}
            style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
          <span>{t('Phone number')} <small style={{ fontWeight: 400, color: '#64748b' }}>({t('for SMS updates')})</small></span>
          <input
            type="tel"
            placeholder={t('+251 91 100 0000')}
            value={feedback.phoneNumber || ''}
            onChange={(e) => actions.setPhoneNumber?.(e.target.value)}
            style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
        </label>
      </div>

      <p className="privacy-note">
        <Icon name="shield" size={15} /> {t('Your contact information is only used for official case follow-up and SMS notifications.')}
      </p>
    </div>
  )
}
