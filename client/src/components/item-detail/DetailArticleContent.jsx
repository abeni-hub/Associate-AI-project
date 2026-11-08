import { ShieldCheck } from 'lucide-react'

export default function DetailArticleContent({isAm, item, content, bureau}) {
  return (
    <>
        {/* Prose Article Body */}
        <article className="detail-article-content">
          <div className="prose-body">
            {content}
          </div>

          {/* Multi-Image Gallery */}
          {item.images && item.images.length > 1 && (
            <div className="detail-gallery-section" style={{ margin: '28px 0 20px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#00485a', marginBottom: '12px' }}>
                {isAm ? 'ተጨማሪ ፎቶዎች እና ማብራሪያዎች' : 'Additional Photos & Event Media'}
              </h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
                  gap: '12px',
                }}
              >
                {item.images.slice(1).map((imgUrl, idx) => (
                  <div
                    key={idx}
                    style={{
                      borderRadius: '8px',
                      overflow: 'hidden',
                      height: '140px',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    }}
                  >
                    <img
                      src={imgUrl}
                      alt={`Photo ${idx + 2}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="detail-tags-bar">
              <span className="tags-label">{isAm ? 'ቁልፍ ቃላት፡' : 'Related Topics:'}</span>
              <div className="tags-list">
                {item.tags.map((tag) => (
                  <span key={tag} className="detail-tag-pill">#{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Official Verification Callout */}
          <div className="detail-verification-box">
            <ShieldCheck size={24} color="#00485a" style={{ flexShrink: 0 }} />
            <div>
              <strong>{isAm ? 'ይፋዊ የመንግሥት አገልግሎት መረጃ' : 'Verified Public Information'}</strong>
              <p>
                {isAm
                  ? `ይህ መረጃ በቀጥታ በ${bureau} እና በሲቪክሊንክ የህዝብ አገልግሎት መድረክ በኩል የተረጋገጠ ነው።`
                  : `Published and verified by ${bureau} in coordination with the CivicLink Citizen Engagement Platform.`
                }
              </p>
            </div>
          </div>
        </article>
    </>
  )
}
