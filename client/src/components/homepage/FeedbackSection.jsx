import Icon from '../ui/Icon.jsx'
import FeedbackFormCard from './FeedbackFormCard.jsx'

export default function FeedbackSection({ language, t }) {
  return (
    <section className="feedback-section" id="feedback">
      <div className="feedback-backdrop" />
      <div className="feedback-layout section-wrap">
        <div className="feedback-copy scroll-reveal">
          <div className="section-kicker section-kicker-light"><span>05</span> {t('YOUR VOICE HELPS')}</div>
          <h2>{t('Every experience')}<br />{t('can make things')} <em>{t('better.')}</em></h2>
          <p>{t('Tell us how your visit went. Your feedback reaches the right bureau and helps improve services for everyone.')}</p>
          <div className="feedback-points">
            <span><Icon name="shield" size={17} /> {t('No account needed')}</span>
            <span><Icon name="qr" size={17} /> {t('Scan a bureau QR code')}</span>
          </div>
          <div className="feedback-quote"><span className="quote-mark">“</span><p>{t('Clear guidance before your visit. A simple way to be heard afterward.')}</p></div>
        </div>
        <FeedbackFormCard language={language} t={t} />
      </div>
    </section>
  )
}
