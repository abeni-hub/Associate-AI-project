import { ArrowUp } from 'lucide-react'

export default function FloatingBackToTop({ language }) {
  return (
    <button
      type="button"
      className="floating-top-pill"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll back to top"
    >
      <ArrowUp size={15} />
      <span>{language === 'am' ? 'ወደ ላይ' : 'Top'}</span>
    </button>
  )
}
