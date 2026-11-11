import { ArrowUp } from 'lucide-react'

export interface FloatingBackToTopProps {
  language?: string
  visible?: boolean
  onClick?: () => void
}

export default function FloatingBackToTop({ language, visible = true, onClick }: FloatingBackToTopProps) {
  if (!visible) return null

  return (
    <button
      type="button"
      className="floating-top-pill"
      onClick={onClick || (() => window.scrollTo({ top: 0, behavior: 'smooth' }))}
      aria-label="Scroll back to top"
    >
      <ArrowUp size={15} />
      <span>{language === 'am' ? 'ወደ ላይ' : 'Top'}</span>
    </button>
  )
}
