import { ShieldCheck } from 'lucide-react'

export default function DetailArticleContent({isAm, item, content, bureau}) {
  return (
    <>
        {/* Prose Article Body */}
        <article className="detail-article-content">
          <div className="prose-body">
            {content}
          </div>

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
