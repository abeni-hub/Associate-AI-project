import Icon from '../ui/Icon.jsx'
import { bureauOptions, serviceCatalog, subCityOptions } from '../../data/homePageData.js'
import { useGetOrganizationsQuery } from '../../services/organizationsApi.js'

const feedbackTypes = [
  { value: 'Complaint', icon: 'news', label: 'A complaint', copy: 'Something needs attention' },
  { value: 'Suggestion', icon: 'sparkle', label: 'A suggestion', copy: 'An idea for improvement' },
  { value: 'Satisfaction', icon: 'heart', label: 'A rating', copy: 'Share how it went' },
]

export default function FeedbackStepContent({ step, feedback, actions, t }) {
  const { data: orgData } = useGetOrganizationsQuery()

  // Dynamic live sub-cities from organizations API (organization_type_id === 1)
  const apiSubCities = orgData?.data
    ? orgData.data.filter((o) => o.organization_type_id === 1).map((o) => ({ id: o.id, name: o.name }))
    : []

  const availableSubCities =
    apiSubCities.length > 0
      ? apiSubCities
      : subCityOptions.map((name, idx) => ({ id: idx + 1, name }))

  // Find currently selected sub-city ID
  const selectedSubCityObj = availableSubCities.find(
    (c) => String(c.id) === String(feedback.city) || c.name.toLowerCase().includes(String(feedback.city).toLowerCase())
  )

  // Bureaus list filtered by sub-city or general bureaus
  const bureauList = (() => {
    if (orgData?.data && Array.isArray(orgData.data) && orgData.data.length > 0) {
      const filtered = orgData.data.filter((o) => {
        if (o.organization_type_id === 1) return false // exclude sub-cities
        if (selectedSubCityObj && o.parent_organization_id) {
          return o.parent_organization_id === selectedSubCityObj.id
        }
        return true
      })
      if (filtered.length > 0) {
        return filtered.map((o) => ({ id: String(o.id), label: o.name }))
      }
      return orgData.data.filter((o) => o.organization_type_id !== 1).map((o) => ({ id: String(o.id), label: o.name }))
    }
    return bureauOptions
  })()

  const activeServices = serviceCatalog[feedback.bureau] ?? [
    { id: 'general-inquiry', label: 'General Inquiry & Front Desk' },
    { id: 'document-attestation', label: 'Document Verification' },
    { id: 'service-application', label: 'Service Application' },
  ]

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
      <label className="feedback-select-label">
        {t('Select the sub-city')}
        <span className="feedback-select-wrap">
          <Icon name="pin" size={18} />
          <select value={feedback.city} onChange={(event) => actions.setCity(event.target.value)}>
            {availableSubCities.map((subCity) => (
              <option key={subCity.id} value={subCity.name}>
                {t(subCity.name)}
              </option>
            ))}
          </select>
          <Icon name="chevron" size={16} />
        </span>
      </label>
    )
  }

  if (step === 3) {
    return (
      <label className="feedback-select-label">
        {t('Select the city office / bureau')}
        <span className="feedback-select-wrap">
          <Icon name="building" size={18} />
          <select value={feedback.bureau} onChange={(event) => actions.changeBureau(event.target.value)}>
            {bureauList.map((bureau) => (
              <option key={bureau.id} value={bureau.id}>
                {t(bureau.label)}
              </option>
            ))}
          </select>
          <Icon name="chevron" size={16} />
        </span>
      </label>
    )
  }

  if (step === 4) {
    return (
      <label className="feedback-select-label">
        {t('Select the service')}
        <span className="feedback-select-wrap">
          <Icon name="file" size={18} />
          <select value={feedback.service} onChange={(event) => actions.setService(event.target.value)}>
            {activeServices.map((service) => (
              <option key={service.id} value={service.id}>
                {t(service.label)}
              </option>
            ))}
          </select>
          <Icon name="chevron" size={16} />
        </span>
      </label>
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
