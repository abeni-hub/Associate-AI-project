import { useState, useEffect } from 'react'
import { getItemById, submitEventRsvp, getRelatedItems } from '../services/newsEventsService'
import DetailArticleContent from '../components/item-detail/DetailArticleContent.jsx'
import DetailBreadcrumbs from '../components/item-detail/DetailBreadcrumbs.jsx'
import DetailHeader from '../components/item-detail/DetailHeader.jsx'
import DetailHeroMedia from '../components/item-detail/DetailHeroMedia.jsx'
import DetailLoading from '../components/item-detail/DetailLoading.jsx'
import DetailNotFound from '../components/item-detail/DetailNotFound.jsx'
import DetailPageFooter from '../components/item-detail/DetailPageFooter.jsx'
import DetailRelatedItems from '../components/item-detail/DetailRelatedItems.jsx'
import EventSpecsCard from '../components/item-detail/EventSpecsCard.jsx'

export default function ItemDetailPage({
  itemId,
  language = 'en',
  onBackToHub,
  onBackToHome,
  onNavigateToDetail,
}) {
  const isAm = language === 'am'
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rsvpName, setRsvpName] = useState('')
  const [rsvpPhone, setRsvpPhone] = useState('')
  const [rsvpStatus, setRsvpStatus] = useState(null) // null | 'submitting' | 'success'
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let mounted = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
    async function loadItem() {
      setLoading(true)
      try {
        const found = await getItemById(itemId)
        if (mounted) {
          setItem(found)
        }
      } catch (err) {
        console.error('Failed to load item:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadItem()
    return () => { mounted = false }
  }, [itemId])

  async function handleRsvpSubmit(e) {
    e.preventDefault()
    if (!item || !rsvpName.trim()) return
    setRsvpStatus('submitting')
    try {
      await submitEventRsvp(item.id, {
        name: rsvpName,
        phone: rsvpPhone,
      })
      setRsvpStatus('success')
    } catch (err) {
      console.error('RSVP failed:', err)
      setRsvpStatus(null)
    }
  }

  function handleCopyLink() {
    navigator.clipboard?.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  if (loading) return <DetailLoading language={language} />

  if (!item) return <DetailNotFound language={language} onBackToHub={onBackToHub} />

  const title = isAm && item.titleAm ? item.titleAm : item.title
  const content = isAm && item.contentAm ? item.contentAm : item.content
  const summary = isAm && item.summaryAm ? item.summaryAm : item.summary
  const category = isAm && item.categoryAm ? item.categoryAm : item.category
  const bureau = isAm && item.bureauAm ? item.bureauAm : item.bureau
  const subCity = isAm && item.subCityAm ? item.subCityAm : item.subCity
  const related = getRelatedItems ? getRelatedItems(item, 3) : []

  return (
    <div className="item-detail-page" lang={language}>
      <DetailBreadcrumbs isAm={isAm} onBackToHub={onBackToHub} onBackToHome={onBackToHome} title={title} />

      {/* Main Editorial Content Container */}
      <main className="detail-page-main section-wrap">
        <DetailHeader isAm={isAm} item={item} title={title} summary={summary} category={category} bureau={bureau} subCity={subCity} language={language} copied={copied} onCopyLink={handleCopyLink} />

        <DetailHeroMedia item={item} title={title} language={language} />

        <EventSpecsCard isAm={isAm} item={item} language={language} rsvpStatus={rsvpStatus} rsvpName={rsvpName} rsvpPhone={rsvpPhone} onRsvpNameChange={(event) => setRsvpName(event.target.value)} onRsvpPhoneChange={(event) => setRsvpPhone(event.target.value)} onRsvpSubmit={handleRsvpSubmit} />

        <DetailArticleContent isAm={isAm} item={item} content={content} bureau={bureau} />

        <DetailRelatedItems isAm={isAm} item={item} related={related} onBackToHub={onBackToHub} onNavigateToDetail={onNavigateToDetail} />
      </main>

      <DetailPageFooter isAm={isAm} onBackToHome={onBackToHome} onBackToHub={onBackToHub} />
    </div>
  )
}
