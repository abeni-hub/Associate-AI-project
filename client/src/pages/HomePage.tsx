import { useEffect, useMemo, useState, type FormEvent } from 'react'
import AdminStrip from '../components/homepage/AdminStrip.jsx'
import FeedbackSection from '../components/homepage/FeedbackSection.jsx'
import HeroSection from '../components/homepage/HeroSection.jsx'
import HomeNewsSection from '../components/homepage/HomeNewsSection.jsx'
import JourneySection from '../components/homepage/JourneySection.jsx'
import QuickSearchSection from '../components/homepage/QuickSearchSection.jsx'
import ServiceGuideSection from '../components/homepage/ServiceGuideSection.jsx'
import { heroSlides } from '../data/homePageData.js'
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

interface ServiceGuideSelection {
  subCity: string;
  bureauId: string;
  serviceId: string;
}

export default function HomePage({ language, t, onNavigateToHub, onSelectItem, cmsConfig: propCmsConfig, documentRef }: HomePageProps) {
  const pageDocument = documentRef || document

  // Live queries from backend
  const { data: apiCmsData } = useGetLandingPageCmsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  })
  const { data: orgData, isLoading: isOrgsLoading } = useGetOrganizationsQuery({ per_page: 100 })
  const { data: servicesData, isLoading: isServicesLoading } = useGetServicesQuery({ per_page: 100 })
  const isDropdownsLoading = isOrgsLoading || isServicesLoading

  const liveCms = (apiCmsData && ('data' in (apiCmsData as any) ? (apiCmsData as any).data : apiCmsData)) as LandingPageCmsConfig | null
  const cmsConfig = propCmsConfig || liveCms || null

  // Sub-city options strictly from database organizations
  const subCityOptions = useMemo(() => {
    if (orgData?.data && Array.isArray(orgData.data)) {
      const list = orgData.data
        .filter((o: any) =>
          o.organization_type_id === 1 ||
          o.type?.code === 'sub_city' ||
          o.type?.name?.toLowerCase().includes('sub') ||
          o.type?.level === 1 ||
          o.name?.toLowerCase().includes('sub-city') ||
          o.name?.toLowerCase().includes('sub city') ||
          o.name?.toLowerCase().includes('subcity') ||
          (!o.parent_organization_id && o.is_root)
        )
        .map((o: any) => o.name)
      if (list.length > 0) return list
      return orgData.data.map((o: any) => o.name)
    }
    return []
  }, [orgData])

  // Bureau options strictly from database organizations (excluding sub-cities)
  const bureauOptions = useMemo(() => {
    if (orgData?.data && Array.isArray(orgData.data) && orgData.data.length > 0) {
      const nonSubCities = orgData.data.filter((o: any) =>
        o.organization_type_id !== 1 &&
        o.type?.code !== 'sub_city' &&
        !o.name?.toLowerCase().includes('sub-city') &&
        !o.name?.toLowerCase().includes('sub city') &&
        !o.name?.toLowerCase().includes('subcity')
      )
      const list = nonSubCities.length > 0 ? nonSubCities : orgData.data
      return list.map((o: any) => ({
        id: String(o.id),
        label: o.name,
        shortLabel: o.name.replace(/Bureau|Office|Agency/i, '').trim() || o.name,
        parent_organization_id: o.parent_organization_id || o.parent?.id,
      }))
    }
    return []
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
  const [subCity, setSubCity] = useState<string>('')
  const [bureauId, setBureauId] = useState<string>('')
  const [serviceId, setServiceId] = useState<string>('')
  const [serviceGuide, setServiceGuide] = useState<ServiceGuideSelection>({ subCity: '', bureauId: '', serviceId: '' })

  // Service list strictly from database
  const activeServiceList = useMemo(() => {
    if (servicesData?.data && Array.isArray(servicesData.data)) {
      return servicesData.data.map((s: any) => ({
        id: String(s.id),
        code: s.code || String(s.id),
        label: s.name,
        organizationId: s.organization_id ? String(s.organization_id) : (s.organization?.id ? String(s.organization.id) : undefined),
        raw: s,
      }))
    }
    return []
  }, [servicesData])

  // Automatically sync initial selections with live backend options
  useEffect(() => {
    if (subCityOptions.length > 0 && (!subCity || !subCityOptions.includes(subCity))) {
      setSubCity(subCityOptions[0])
    }
  }, [subCityOptions, subCity])

  useEffect(() => {
    if (bureauOptions.length > 0 && (!bureauId || !bureauOptions.some((b: any) => b.id === bureauId))) {
      setBureauId(bureauOptions[0].id)
    }
  }, [bureauOptions, bureauId])

  useEffect(() => {
    if (activeServiceList.length > 0 && (!serviceId || !activeServiceList.some((s: any) => s.id === serviceId))) {
      setServiceId(activeServiceList[0].id)
    }
  }, [activeServiceList, serviceId])

  useEffect(() => {
    if (subCity && bureauId && serviceId && (!serviceGuide.serviceId || !serviceGuide.bureauId)) {
      setServiceGuide({ subCity, bureauId, serviceId })
    }
  }, [subCity, bureauId, serviceId, serviceGuide])

  // Query service details and steps for selected guide service
  const { data: liveServiceDetail } = useGetServiceByIdQuery(serviceGuide.serviceId, {
    skip: !serviceGuide.serviceId,
  })
  const { data: liveServiceSteps } = useGetServiceStepsQuery(serviceGuide.serviceId, {
    skip: !serviceGuide.serviceId,
  })

  const guideService = useMemo(() => {
    const s = (liveServiceDetail?.data || servicesData?.data?.find((item: any) => String(item.id) === String(serviceGuide.serviceId) || item.code === serviceGuide.serviceId)) as any

    if (s) {
      const steps = liveServiceSteps?.data && Array.isArray(liveServiceSteps.data) && liveServiceSteps.data.length > 0
        ? (liveServiceSteps.data as any[]).map((st) => ({
            room: st.room_number || `Room ${st.step_number}`,
            title: st.title,
            detail: st.instruction,
          }))
        : (s.steps && Array.isArray(s.steps) && s.steps.length > 0
            ? s.steps.map((st: any) => ({
                room: st.room_number || `Room ${st.step_number}`,
                title: st.title,
                detail: st.instruction,
              }))
            : [])

      const rawDocs = s.required_documents || s.requiredDocuments || []
      const documents = Array.isArray(rawDocs)
        ? rawDocs.map((d: any) => (typeof d === 'string' ? d : d.name)).filter(Boolean)
        : []

      return {
        id: String(s.id),
        code: s.code || String(s.id),
        label: s.name,
        summary: s.description || '',
        documents,
        steps,
        visitNote: s.estimated_duration_minutes
          ? (language === 'am'
              ? `የሚፈጀው ግምታዊ ጊዜ፦ ${s.estimated_duration_minutes} ደቂቃ። መደበኛ ክፍያ፦ ${s.fee_amount ? `${s.fee_amount} ${s.fee_currency || 'ብር'}` : 'ነፃ'}።`
              : `Estimated processing time: ${s.estimated_duration_minutes} minutes. Standard fee: ${s.fee_amount || 'Free'} ${s.fee_currency || 'ETB'}.`)
          : (s.fee_amount
              ? (language === 'am' ? `መደበኛ ክፍያ፦ ${s.fee_amount} ${s.fee_currency || 'ብር'}።` : `Standard fee: ${s.fee_amount} ${s.fee_currency || 'ETB'}.`)
              : ''),
      }
    }

    return null
  }, [liveServiceDetail, servicesData, liveServiceSteps, serviceGuide.serviceId])

  const guideBureau = useMemo(() => {
    return bureauOptions.find((b: any) => b.id === serviceGuide.bureauId) || bureauOptions[0] || null
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
    setServiceGuide({ subCity, bureauId, serviceId })
    window.setTimeout(() => pageDocument.getElementById('service-guide')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30)
  }

  function changeBureau(nextBureau: string) {
    setBureauId(nextBureau)
    const matchingService = activeServiceList.find((s) => s.organizationId === nextBureau)
    if (matchingService) {
      setServiceId(matchingService.id)
    } else if (activeServiceList[0]) {
      setServiceId(activeServiceList[0].id)
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
      {cmsConfig?.quickSearch?.enabled !== false && (
        <QuickSearchSection
          t={t}
          language={language}
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
          quickSearchContent={cmsConfig?.quickSearch}
          isLoading={isDropdownsLoading}
        />
      )}
      {cmsConfig?.serviceGuide?.enabled !== false && (
        <ServiceGuideSection
          t={t}
          language={language}
          serviceGuide={serviceGuide}
          guideService={guideService}
          guideBureau={guideBureau}
          serviceGuideContent={cmsConfig?.serviceGuide}
        />
      )}
      <JourneySection t={t} language={language} onGoToFeedback={goToFeedback} journey={cmsConfig?.journey} />
      {cmsConfig?.newsEvents?.enabled !== false && (
        <HomeNewsSection
          language={language}
          t={t}
          onNavigateToHub={onNavigateToHub}
          onSelectItem={onSelectItem}
          newsEventsContent={cmsConfig?.newsEvents}
        />
      )}
      {cmsConfig?.feedback?.enabled !== false && (
        <FeedbackSection
          language={language}
          t={t}
          feedbackContent={cmsConfig?.feedback}
        />
      )}
      {cmsConfig?.footer?.enabled !== false && (
        <AdminStrip t={t} language={language} adminStripContent={cmsConfig?.footer} />
      )}
    </main>
  )
}
