import { ArrowLeft } from 'lucide-react'

export default function DetailBreadcrumbs({isAm, onBackToHub, onBackToHome, title}) {
  return (
    <>
      {/* Sub-Header Breadcrumb & Hub Back Bar */}
      <div className="detail-breadcrumb-bar">
        <div className="section-wrap detail-breadcrumb-inner">
          <button type="button" className="nep-back-btn" onClick={onBackToHub}>
            <ArrowLeft size={15} />
            <span>{isAm ? 'ወደ ዜና እና ዝግጅቶች መድረክ' : 'Back to News & Events'}</span>
          </button>

          <div className="nep-breadcrumbs">
            <span onClick={onBackToHome} style={{ cursor: 'pointer' }}>CivicLink</span>
            <span>/</span>
            <span onClick={onBackToHub} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
              {isAm ? 'ዜና እና ዝግጅቶች' : 'News & Events'}
            </span>
            <span>/</span>
            <strong className="breadcrumb-title-truncate">{title}</strong>
          </div>
        </div>
      </div>
    </>
  )
}
