import { useEffect, useState } from 'react'
import AdminStrip from '../components/homepage/AdminStrip.jsx'
import FeedbackSection from '../components/homepage/FeedbackSection.jsx'
import HeroSection from '../components/homepage/HeroSection.jsx'
import HomeNewsSection from '../components/homepage/HomeNewsSection.jsx'
import JourneySection from '../components/homepage/JourneySection.jsx'
import QuickSearchSection from '../components/homepage/QuickSearchSection.jsx'
import ServiceGuideSection from '../components/homepage/ServiceGuideSection.jsx'
import { bureauOptions, heroSlides, serviceCatalog, serviceFor, subCityOptions } from '../data/homePageData.js'

export default function HomePage({ language, t, onNavigateToHub, onSelectItem }) {
  const [heroSlideIndex, setHeroSlideIndex] = useState(0)
  const [heroCarouselPlaying, setHeroCarouselPlaying] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [subCity, setSubCity] = useState('Bole')
  const [bureauId, setBureauId] = useState('civil')
  const [serviceId, setServiceId] = useState('birth-copy')
  const [serviceGuide, setServiceGuide] = useState({ subCity: 'Bole', bureauId: 'civil', serviceId: 'birth-copy' })

  const activeServiceList = serviceCatalog[bureauId] ?? []
  const guideService = serviceFor(serviceGuide.bureauId, serviceGuide.serviceId)
  const guideBureau = bureauOptions.find((bureau) => bureau.id === serviceGuide.bureauId)
  const activeHeroSlide = heroSlides[heroSlideIndex]

  useEffect(() => {
    if (!heroCarouselPlaying) return undefined
    const timer = window.setInterval(() => {
      setHeroSlideIndex((index) => (index + 1) % heroSlides.length)
    }, 7000)
    return () => window.clearInterval(timer)
  }, [heroCarouselPlaying])

  function handleFindService(event) {
    event.preventDefault()
    setServiceGuide({ subCity, bureauId, serviceId })
    window.setTimeout(() => document.getElementById('service-guide')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30)
  }

  function changeBureau(nextBureau) {
    setBureauId(nextBureau)
    setServiceId(serviceCatalog[nextBureau]?.[0]?.id ?? '')
  }

  function goToFeedback() {
    document.getElementById('feedback')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
      <JourneySection t={t} onGoToFeedback={goToFeedback} />
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
