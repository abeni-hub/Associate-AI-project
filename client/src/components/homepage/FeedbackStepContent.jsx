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
  const bureauList =
    orgData?.data && Array.isArray(orgData.data) && orgData.data.length > 0
      ? orgData.data.map((o) => ({ id: String(o.id), label: o.name }))
      : bureauOptions
  const activeServices = serviceCatalog[feedback.bureau] ?? []

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
            {subCityOptions.map((name) => <option key={name} value={name}>{t(name)}</option>)}
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
            {bureauList.map((bureau) => <option key={bureau.id} value={bureau.id}>{t(bureau.label)}</option>)}
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
            {activeServices.map((service) => <option key={service.id} value={service.id}>{t(service.label)}</option>)}
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
          rows={4}
        />
      </label>
      <p className="privacy-note"><Icon name="shield" size={15} /> {t('Please don’t include personal or sensitive information.')}</p>
    </div>
  )
}
