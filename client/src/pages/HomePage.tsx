import { useEffect, useMemo, useState, type FormEvent } from 'react'
import AdminStrip from '../components/homepage/AdminStrip.jsx'
import FeedbackSection from '../components/homepage/FeedbackSection.jsx'
import HeroSection from '../components/homepage/HeroSection.jsx'
import HomeNewsSection from '../components/homepage/HomeNewsSection.jsx'
import JourneySection from '../components/homepage/JourneySection.jsx'
import QuickSearchSection from '../components/homepage/QuickSearchSection.jsx'
import ServiceGuideSection from '../components/homepage/ServiceGuideSection.jsx'
import { bureauOptions as fallbackBureaus, heroSlides, serviceCatalog, serviceFor, subCityOptions as fallbackSubCities } from '../data/homePageData.js'
import type { FeedType, LandingPageCmsConfig, Language, NewsEventItem } from '../types/newsEvents'
import { useGetLandingPageCmsQuery } from '../services/cmsApi.js'
import { useGetOrganizationsQuery } from '../services/organizationsApi.js'
import { useGetServicesQuery, useGetServiceByIdQuery, useGetServiceStepsQuery } from '../services/servicesApi.js'

interface HomePageProps {
  language: Language;
  t: (text: string) => string;
  onNavigateToHub: (tab?: FeedType) => void;
  onSelectItem: (item: NewsEventItem) => void;
  cmsConfig?: LandingPageCmsConfig | null;
  documentRef?: Document;
}
type BureauId = keyof typeof serviceCatalog;
interface ServiceGuideSelection {
  subCity: string;
  bureauId: BureauId;
  serviceId: string;
}

export default function HomePage({ language, t, onNavigateToHub, onSelectItem, cmsConfig: propCmsConfig, documentRef }: HomePageProps) {
  const pageDocument = documentRef || document

  // Live queries
  const { data: apiCmsData } = useGetLandingPageCmsQuery()
  const { data: orgData } = useGetOrganizationsQuery()
  const { data: servicesData } = useGetServicesQuery()

  const cmsConfig = propCmsConfig || (apiCmsData?.data as LandingPageCmsConfig | null) || null

  const subCityOptions = useMemo(() => {
    if (orgData?.data) {
      const list = orgData.data
        .filter((o: any) => o.organization_type_id === 1 || o.type?.code === 'sub_city')
        .map((o: any) => o.name)
      if (list.length > 0) return list
    }
    return fallbackSubCities
  }, [orgData])

  const bureauOptions = useMemo(() => {
    if (orgData?.data) {
      const list = orgData.data
        .filter((o: any) => o.organization_type_id === 3 || o.type?.code === 'bureau')
        .map((o: any) => ({
          id: String(o.id),
          label: o.name,
          shortLabel: o.name.replace(/Bureau|Office|Agency/i, '').trim(),
        }))
      if (list.length > 0) return list
    }
    return fallbackBureaus
  }, [orgData])

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
  const [bureauId, setBureauId] = useState<string>('civil')
  const [serviceId, setServiceId] = useState('birth-copy')
  const [serviceGuide, setServiceGuide] = useState<ServiceGuideSelection>({ subCity: 'Bole', bureauId: 'civil' as BureauId, serviceId: 'birth-copy' })

  // Query service details and steps for selected guide service
  const { data: liveServiceDetail } = useGetServiceByIdQuery(serviceGuide.serviceId, {
    skip: !serviceGuide.serviceId,
  })
  const { data: liveServiceSteps } = useGetServiceStepsQuery(serviceGuide.serviceId, {
    skip: !serviceGuide.serviceId,
  })

  const activeServiceList = useMemo(() => {
    if (servicesData?.data && servicesData.data.length > 0) {
      return servicesData.data.map((s: any) => ({
        id: s.code || String(s.id),
        label: s.name,
      }))
    }
    return (serviceCatalog as any)[bureauId] ?? []
  }, [servicesData, bureauId])

  const guideService = useMemo(() => {
    if (liveServiceDetail?.data) {
      const s = liveServiceDetail.data as any
      const steps = liveServiceSteps?.data && Array.isArray(liveServiceSteps.data) && liveServiceSteps.data.length > 0
        ? (liveServiceSteps.data as any[]).map((st) => ({
            room: st.room_number || `Room ${st.step_number}`,
            title: st.title,
            detail: st.instruction,
          }))
        : [
            { room: '01', title: 'Intake Desk', detail: 'Verify identity and submitted documents.' },
            { room: '02', title: 'Processing Counter', detail: 'Officer reviews application and confirms fee payment.' },
            { room: '03', title: 'Issuance Counter', detail: 'Receive certified service delivery and receipt.' },
          ]

      return {
        id: s.code || String(s.id),
        label: s.name,
        summary: s.description || 'Official Government Citizen Service.',
        documents: s.required_documents?.length
          ? s.required_documents.map((d: any) => d.name)
          : ['Valid Kebele Resident ID or Fayda Digital ID', 'Application reference form or proof of residency'],
        steps,
        visitNote: s.estimated_duration_minutes
          ? `Estimated processing time: ${s.estimated_duration_minutes} minutes. Standard fee: ${s.fee_amount || 'Free'} ${s.fee_currency || 'ETB'}.`
          : 'Service requirements and hours may be subject to administrative updates.',
      }
    }
    return serviceFor(serviceGuide.bureauId, serviceGuide.serviceId)
  }, [liveServiceDetail, liveServiceSteps, serviceGuide])

  const guideBureau = useMemo(() => {
    return bureauOptions.find((b: any) => b.id === serviceGuide.bureauId) || fallbackBureaus[0]
  }, [bureauOptions, serviceGuide.bureauId])

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

  function handleFindService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setServiceGuide({ subCity, bureauId: bureauId as any, serviceId })
    window.setTimeout(() => pageDocument.getElementById('service-guide')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30)
  }

  function changeBureau(nextBureau: any) {
    setBureauId(nextBureau)
    const nextList = (serviceCatalog as any)[nextBureau]
    if (activeServiceList && activeServiceList.length > 0) {
      setServiceId(activeServiceList[0].id)
    } else if (nextList?.[0]?.id) {
      setServiceId(nextList[0].id)
    }
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
