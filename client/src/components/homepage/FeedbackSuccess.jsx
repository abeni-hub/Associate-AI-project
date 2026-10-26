import Icon from '../ui/Icon.jsx'

export default function FeedbackSuccess({ t, onReset }) {
  return (
    <div className="feedback-success" role="status">
      <span className="success-icon"><Icon name="check" size={27} /></span>
      <span className="form-eyebrow">{t('THANK YOU FOR SPEAKING UP')}</span>
      <h3>{t('Your voice matters.')}</h3>
      <p>{t('This interactive preview has completed. Connect the form to your feedback system to securely route submissions to bureau admins.')}</p>
      <button className="button button-secondary" type="button" onClick={onReset}>{t('Send another response')} <Icon name="arrow" size={16} /></button>
    </div>
  )
}
