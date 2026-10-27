import { useEffect, useState } from 'react'
import AdminStrip from '../components/homepage/AdminStrip.jsx'
import FeedbackSection from '../components/homepage/FeedbackSection.jsx'
import HeroSection from '../components/homepage/HeroSection.jsx'
import HomeNewsSection from '../components/homepage/HomeNewsSection.jsx'
import JourneySection from '../components/homepage/JourneySection.jsx'
import QuickSearchSection from '../components/homepage/QuickSearchSection.jsx'
import ServiceGuideSection from '../components/homepage/ServiceGuideSection.jsx'
import { bureauOptions, heroSlides, serviceCatalog, serviceFor, subCityOptions } from '../data/homePageData.js'

export default function HomePage({ language, t, onNavigateToHub, onSelectItem, cmsConfig, documentRef }) {
  const pageDocument = documentRef || document
  const configuredSlides = cmsConfig?.hero?.slides
  const slides = configuredSlides?.length
    ? configuredSlides.map((slide, index) => {
        const fallback = heroSlides[index % heroSlides.length]
        return {
          ...fallback,
          ...slide,
          bureau: slide.bureau || fallback.bureau,
          title: slide.title || fallback.title,
          description: slide.category || slide.description || fallback.description,
        }
      })
    : heroSlides

  const [heroSlideIndex, setHeroSlideIndex] = useState(0)
  const [heroCarouselPlaying, setHeroCarouselPlaying] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [subCity, setSubCity] = useState('Bole')
  const [bureauId, setBureauId] = useState('civil')
  const [serviceId, setServiceId] = useState('birth-copy')
  const [serviceGuide, setServiceGuide] = useState({ subCity: 'Bole', bureauId: 'civil', serviceId: 'birth-copy' })

  const activeServiceList = serviceCatalog[bureauId] ?? []
  const guideService = serviceFor(serviceGuide.bureauId, serviceGuide.serviceId)
  const guideBureau = bureauOptions.find((bureau) => bureau.id === serviceGuide.bureauId)
  const activeHeroSlide = slides[heroSlideIndex] || slides[0]

  useEffect(() => {
    setHeroSlideIndex((index) => Math.min(index, slides.length - 1))
  }, [slides.length])

  useEffect(() => {
    if (!heroCarouselPlaying) return undefined
    const timer = window.setInterval(() => {
      setHeroSlideIndex((index) => (index + 1) % slides.length)
    }, 7000)
    return () => window.clearInterval(timer)
  }, [heroCarouselPlaying, slides.length])

  function handleFindService(event) {
    event.preventDefault()
    setServiceGuide({ subCity, bureauId, serviceId })
    window.setTimeout(() => pageDocument.getElementById('service-guide')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30)
  }

  function changeBureau(nextBureau) {
    setBureauId(nextBureau)
    setServiceId(serviceCatalog[nextBureau]?.[0]?.id ?? '')
  }

  function goToFeedback() {
    pageDocument.getElementById('feedback')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main id="top">
      <HeroSection
        activeHeroSlide={activeHeroSlide}
        activeIndex={heroSlideIndex}
        onSlideChange={setHeroSlideIndex}
        isPlaying={heroCarouselPlaying}
        onPlayingChange={() => setHeroCarouselPlaying((playing) => !playing)}
        onGoToFeedback={goToFeedback}
        t={t}
        heroContent={cmsConfig?.hero}
        language={language}
        slides={slides}
      />
      <QuickSearchSection
        t={t}
        subCity={subCity}
        onSubCityChange={setSubCity}
        bureauId={bureauId}
        onBureauChange={changeBureau}
        serviceId={serviceId}
        onServiceChange={setServiceId}
        activeServiceList={activeServiceList}
        onSubmit={handleFindService}
        subCityOptions={subCityOptions}
        bureauOptions={bureauOptions}
      />
      <ServiceGuideSection t={t} serviceGuide={serviceGuide} guideService={guideService} guideBureau={guideBureau} />
      <JourneySection t={t} onGoToFeedback={goToFeedback} journey={cmsConfig?.journey} />
      <HomeNewsSection
        language={language}
        t={t}
        onNavigateToHub={onNavigateToHub}
        onSelectItem={onSelectItem}
      />
      <FeedbackSection language={language} t={t} />
      <AdminStrip t={t} />
    </main>
  )
}
