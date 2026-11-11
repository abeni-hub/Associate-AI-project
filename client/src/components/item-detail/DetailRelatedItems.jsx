import { ArrowRight, Building2 } from 'lucide-react'

export default function DetailRelatedItems({isAm, item, related, onBackToHub, onNavigateToDetail}) {
  return (
    <>
        {/* Related Items Section */}
        {related.length > 0 && (
          <section className="detail-related-section">
            <div className="related-section-header">
              <h3>
                {item.type === 'event'
                  ? (isAm ? 'ሌሎች ተዛማጅ የህዝብ ዝግጅቶች' : 'More Upcoming Community Events')
                  : (isAm ? 'ተጨማሪ ይፋዊ ዜናዎችና ማስታወቂያዎች' : 'More Civic News & Announcements')
                }
              </h3>
              <button type="button" className="nep-back-btn" onClick={onBackToHub}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  {isAm ? 'ሁሉንም ይመልከቱ' : 'View All Hub Items'}
                  <ArrowRight size={14} />
                </span>
              </button>
            </div>

            <div className="home-cards-grid">
              {related.map((rel) => {
                const relTitle = isAm && rel.titleAm ? rel.titleAm : rel.title
                const relSummary = isAm && rel.summaryAm ? rel.summaryAm : rel.summary
                const relCategory = isAm && rel.categoryAm ? rel.categoryAm : rel.category
                const relBureau = isAm && rel.bureauAm ? rel.bureauAm : rel.bureau

                return (
                  <article
                    key={rel.id}
                    className="ne-card"
                    onClick={() => onNavigateToDetail && onNavigateToDetail(rel)}
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && onNavigateToDetail) onNavigateToDetail(rel)
                    }}
                  >
                    <div className="ne-card-media">
                      <img src={rel.coverImage} alt={relTitle} className="ne-card-img" loading="lazy" />
                      <div className="ne-card-scrim" />
                      <div className="ne-card-badges">
                        <span className="ne-pill ne-pill-category">{relCategory}</span>
                      </div>
                    </div>
                    <div className="ne-card-body">
                      <div className="ne-card-subinfo">
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Building2 size={13} />
                          <span>{relBureau}</span>
                        </span>
                      </div>
                      <h4 className="ne-card-title">{relTitle}</h4>
                      <p className="ne-card-summary">{relSummary}</p>
                      <div className="ne-card-footer">
                        <span className="ne-card-action">
                          {isAm ? 'ሙሉውን ገጽ እይ' : 'View full page'}
                          <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        )}
    </>
  )
}
