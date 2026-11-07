import {
  ArrowRight,
  Building2,
} from 'lucide-react'
import { formatDate } from './homeNewsFormatting.js'

export default function HomeNewsArticleCard({ item, language, onSelectItem }) {
  const isAm = language === 'am'
  const title = isAm && item.titleAm ? item.titleAm : item.title
  const summary = isAm && item.summaryAm ? item.summaryAm : item.summary
  const category = isAm && item.categoryAm ? item.categoryAm : item.category
  const bureau = isAm && item.bureauAm ? item.bureauAm : item.bureau

  function openItem() {
    if (onSelectItem) onSelectItem(item)
  }

  return (
    <article className="ne-card" onClick={openItem} tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter') openItem() }}>
      <div className="ne-card-media">
        <img
          src={item.coverImage}
          alt={title}
          className="ne-card-img"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'
          }}
        />
        <div className="ne-card-scrim" />
        <div className="ne-card-badges">
          <span className="ne-pill ne-pill-category">{category}</span>
          <span className="ne-pill" style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}>
            {formatDate(item.publishedAt, language)}
          </span>
        </div>
      </div>

      <div className="ne-card-body">
        <div className="ne-card-subinfo">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Building2 size={13} />
            <span>{bureau}</span>
          </span>
          <span>·</span>
          <span>{item.readTimeMinutes} {isAm ? 'ደቂቃ ንባብ' : 'min read'}</span>
        </div>
        <h3 className="ne-card-title">{title}</h3>
        <p className="ne-card-summary">{summary}</p>
        <div className="ne-card-footer">
          <div className="ne-card-author">
            {item.author?.avatar && (
              <img src={item.author.avatar} alt="" className="ne-card-avatar" />
            )}
            <span>{isAm && item.author?.nameAm ? item.author.nameAm : item.author?.name}</span>
          </div>
          <span className="ne-card-action">
            {isAm ? 'ሙሉውን አንብብ' : 'Read story'}
            <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </article>
  )
}
