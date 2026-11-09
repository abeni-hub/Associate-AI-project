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
  const [bureauId, setBureauId] = useState<string>('all')
  const [serviceId, setServiceId] = useState<string>('')
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [serviceGuide, setServiceGuide] = useState<ServiceGuideSelection>({ subCity: '', bureauId: 'all', serviceId: '' })

  // Service list strictly from database
  const allServices = useMemo(() => {
    if (servicesData?.data && Array.isArray(servicesData.data)) {
      return servicesData.data.map((s: any) => ({
        id: String(s.id),
        code: s.code || String(s.id),
        label: s.name,
        organizationId: s.organization_id ? String(s.organization_id) : (s.organization?.id ? String(s.organization.id) : undefined),
        organizationName: s.organization?.name || '',
        parentId: s.parent_id ? String(s.parent_id) : (s.parent?.id ? String(s.parent.id) : null),
        parentName: s.parent?.name || null,
        parentCode: s.parent?.code || null,
        isMaster: Boolean(s.is_master ?? (s.parent_id === null)),
        description: s.description || '',
        offeringOrganizations: s.offering_organizations || [],
        subservicesCount: s.subservices_count || 0,
        raw: s,
      }))
    }
    return []
  }, [servicesData])

  // Filtered service list based on selected Sub-city, Bureau, keyword search, and category
  const activeServiceList = useMemo(() => {
    // Prioritize actionable subservices (and standalone services that have no child subservices)
    let list = allServices.filter((s) => !s.isMaster || s.subservicesCount === 0)
    if (list.length === 0) {
      list = allServices
    }

    // 1. Sub-city filter
    if (subCity && subCity !== 'all') {
      const cleanSubCity = subCity.toLowerCase().replace(/sub-city|sub city|subcity/g, '').trim()
      const inSubCity = list.filter((s) => {
        if (!s.offeringOrganizations || s.offeringOrganizations.length === 0) return true
        return s.offeringOrganizations.some((o: any) =>
          o.name?.toLowerCase().includes(cleanSubCity) ||
          o.code?.toLowerCase().includes(cleanSubCity)
        )
      })
      if (inSubCity.length > 0) {
        list = inSubCity
      }
    }

    // 2. Bureau filter
    if (bureauId && bureauId !== 'all') {
      const inBureau = list.filter((s) =>
        String(s.organizationId) === String(bureauId) ||
        s.offeringOrganizations?.some((o: any) => String(o.id) === String(bureauId))
      )
      if (inBureau.length > 0) {
        list = inBureau
      }
    }

    // 3. Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      const catLower = selectedCategory.toLowerCase()
      list = list.filter((s) => {
        const text = `${s.label} ${s.description} ${s.organizationName} ${s.parentName || ''} ${s.code}`.toLowerCase()
        if (catLower === 'vital') {
          return s.code.startsWith('CIV') || s.parentCode === 'CIV-REC' || text.includes('birth') || text.includes('marriage') || text.includes('death') || text.includes('civil') || text.includes('residence') || text.includes('id') || text.includes('vital')
        }
        if (catLower === 'tax') {
          return s.code.startsWith('REV') || s.parentCode === 'REV-TAX' || text.includes('tax') || text.includes('tin') || text.includes('revenue') || text.includes('clearance') || text.includes('turnover')
        }
        if (catLower === 'business') {
          return s.code.startsWith('TRD') || s.parentCode === 'TRD-LIC' || text.includes('business') || text.includes('license') || text.includes('trade') || text.includes('commercial')
        }
        if (catLower === 'land') {
          return s.code.startsWith('LND') || s.parentCode === 'LND-ADM' || text.includes('land') || text.includes('property') || text.includes('lease') || text.includes('holding') || text.includes('cadastre')
        }
        if (catLower === 'plan') {
          return s.code.startsWith('PLN') || s.parentCode === 'PLN-DEV' || text.includes('plan') || text.includes('urban') || text.includes('building') || text.includes('permit') || text.includes('structure') || text.includes('infrastructure')
        }
        return text.includes(catLower)
      })
    }

    // 4. Keyword search filter
    if (searchKeyword.trim()) {
      const q = searchKeyword.trim().toLowerCase()
      list = list.filter((s) =>
        s.label.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.organizationName.toLowerCase().includes(q) ||
        (s.parentName && s.parentName.toLowerCase().includes(q))
      )
    }

    return list
  }, [allServices, subCity, bureauId, selectedCategory, searchKeyword])

  // Automatically sync initial sub-city selection with live backend options
  useEffect(() => {
    if (subCityOptions.length > 0 && (!subCity || !subCityOptions.includes(subCity))) {
      setSubCity(subCityOptions[0])
    }
  }, [subCityOptions, subCity])

  // Automatically sync serviceId with activeServiceList
  useEffect(() => {
    if (activeServiceList.length > 0 && (!serviceId || !activeServiceList.some((s: any) => s.id === serviceId))) {
      const nextId = activeServiceList[0].id
      setServiceId(nextId)
      setServiceGuide((prev) => ({
        subCity: subCity || prev.subCity || subCityOptions[0] || '',
        bureauId: bureauId || prev.bureauId || 'all',
        serviceId: nextId,
      }))
    }
  }, [activeServiceList, serviceId, subCity, bureauId, subCityOptions])

  // Initial service guide bootstrap
  useEffect(() => {
    if (subCity && serviceId && (!serviceGuide.serviceId || !serviceGuide.subCity)) {
      setServiceGuide({ subCity, bureauId: bureauId || 'all', serviceId })
    }
  }, [subCity, bureauId, serviceId, serviceGuide])

  // Query service details and steps for selected guide service
  const effectiveGuideServiceId = serviceGuide.serviceId || serviceId

  // Resolve target organization ID for organization-level room steps filtering
  const selectedOrgId = useMemo(() => {
    if (serviceGuide.bureauId && serviceGuide.bureauId !== 'all') {
      const matchBureau = orgData?.data?.find((o: any) => String(o.id) === String(serviceGuide.bureauId))
      if (matchBureau) return matchBureau.id
    }
    if (serviceGuide.subCity && serviceGuide.subCity !== 'all') {
      const matchSubCity = orgData?.data?.find(
        (o: any) => o.name === serviceGuide.subCity || o.name?.toLowerCase().includes(serviceGuide.subCity.toLowerCase())
      )
      if (matchSubCity) return matchSubCity.id
    }
    return undefined
  }, [serviceGuide.bureauId, serviceGuide.subCity, orgData])

  const stepsQueryArg = useMemo(() => {
    if (!effectiveGuideServiceId) return null
    return selectedOrgId
      ? { serviceId: effectiveGuideServiceId, organization_id: selectedOrgId }
      : effectiveGuideServiceId
  }, [effectiveGuideServiceId, selectedOrgId])

  const { data: liveServiceDetail } = useGetServiceByIdQuery(effectiveGuideServiceId, {
    skip: !effectiveGuideServiceId,
  })
  const { data: liveServiceSteps } = useGetServiceStepsQuery(stepsQueryArg, {
    skip: !stepsQueryArg,
  })

  const guideService = useMemo(() => {
    const targetId = serviceGuide.serviceId || serviceId
    if (!targetId) return null

    const s = (liveServiceDetail?.data || servicesData?.data?.find((item: any) => String(item.id) === String(targetId) || item.code === targetId)) as any

    if (s) {
      const steps = liveServiceSteps?.data && Array.isArray(liveServiceSteps.data) && liveServiceSteps.data.length > 0
        ? (liveServiceSteps.data as any[]).map((st) => ({
            room: st.room_number || `Room ${st.step_number}`,
            title: st.title,
            detail: st.instruction,
            floor: st.floor,
            building: st.building,
            department: st.department_name,
            responsible: st.responsible_title,
            duration: st.estimated_duration_minutes,
          }))
        : (s.steps && Array.isArray(s.steps) && s.steps.length > 0
            ? s.steps.map((st: any) => ({
                room: st.room_number || `Room ${st.step_number}`,
                title: st.title,
                detail: st.instruction,
                floor: st.floor,
                building: st.building,
                department: st.department_name,
                responsible: st.responsible_title,
                duration: st.estimated_duration_minutes,
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
        durationMinutes: s.estimated_duration_minutes,
        feeAmount: s.fee_amount,
        feeCurrency: s.fee_currency || 'ETB',
        feeNotes: s.fee_notes,
        eligibility: s.eligibility_criteria,
        organizationName: s.organization?.name || '',
        visitNote: s.estimated_duration_minutes
          ? `Estimated processing time: ${s.estimated_duration_minutes} minutes. Standard fee: ${s.fee_amount || 'Free'} ${s.fee_currency || 'ETB'}.`
          : (s.fee_amount ? `Standard fee: ${s.fee_amount} ${s.fee_currency || 'ETB'}.` : ''),
      }
    }

    return null
  }, [liveServiceDetail, servicesData, liveServiceSteps, serviceGuide.serviceId, serviceId])

  const guideBureau = useMemo(() => {
    if (serviceGuide.bureauId && serviceGuide.bureauId !== 'all') {
      const match = bureauOptions.find((b: any) => String(b.id) === String(serviceGuide.bureauId))
      if (match) return match
    }

    // Resolve automatically from service's parent bureau
    const s = liveServiceDetail?.data || servicesData?.data?.find((item: any) => String(item.id) === String(serviceGuide.serviceId || serviceId) || item.code === (serviceGuide.serviceId || serviceId))
    if (s?.organization) {
      return {
        id: String(s.organization.id),
        label: s.organization.name,
        shortLabel: s.organization.name.replace(/Bureau|Office|Agency/i, '').trim() || s.organization.name,
      }
    }

    return bureauOptions[0] || null
  }, [bureauOptions, serviceGuide.bureauId, liveServiceDetail, servicesData, serviceGuide.serviceId, serviceId])

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
    setServiceGuide({
      subCity: subCity || subCityOptions[0] || '',
      bureauId: bureauId || 'all',
      serviceId,
    })
    window.setTimeout(() => {
      pageDocument.getElementById('service-guide')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 40)
  }

  function changeSubCity(nextSubCity: string) {
    setSubCity(nextSubCity)
    setServiceGuide((prev) => ({
      ...prev,
      subCity: nextSubCity,
    }))
  }

  function changeBureau(nextBureau: string) {
    setBureauId(nextBureau)
    if (nextBureau && nextBureau !== 'all') {
      const matchingService = allServices.find((s) => String(s.organizationId) === String(nextBureau) && !s.isMaster)
        || allServices.find((s) => String(s.organizationId) === String(nextBureau))
      if (matchingService) {
        setServiceId(matchingService.id)
        setServiceGuide((prev) => ({
          ...prev,
          bureauId: nextBureau,
          serviceId: matchingService.id,
        }))
      }
    } else {
      setServiceGuide((prev) => ({
        ...prev,
        bureauId: 'all',
      }))
    }
  }

  function changeService(nextServiceId: string) {
    setServiceId(nextServiceId)
    const srv = allServices.find((s) => String(s.id) === String(nextServiceId) || s.code === nextServiceId)
    if (srv) {
      if (srv.organizationId && bureauOptions.some((b: any) => String(b.id) === String(srv.organizationId))) {
        setBureauId(String(srv.organizationId))
      }
      setServiceGuide({
        subCity: subCity || subCityOptions[0] || '',
        bureauId: srv.organizationId ? String(srv.organizationId) : (bureauId || 'all'),
        serviceId: String(srv.id),
      })
    }
  }

  function changeCategory(catId: string) {
    setSelectedCategory(catId)

    if (catId === 'all') {
      setBureauId('all')
      return
    }

    // Auto-match corresponding bureau for category convenience
    const catLower = catId.toLowerCase()
    let targetBureauCode = ''
    if (catLower === 'vital') targetBureauCode = 'civil-registration-agency'
    if (catLower === 'tax') targetBureauCode = 'revenues-bureau'
    if (catLower === 'business') targetBureauCode = 'trade-industry-bureau'
    if (catLower === 'land') targetBureauCode = 'land-development-bureau'
    if (catLower === 'plan') targetBureauCode = 'urban-planning-bureau'

    if (targetBureauCode && orgData?.data) {
      const matchOrg = orgData.data.find((o: any) => o.code === targetBureauCode)
      if (matchOrg) {
        setBureauId(String(matchOrg.id))
      } else {
        setBureauId('all')
      }
    } else {
      setBureauId('all')
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
          subCity={subCity}
          onSubCityChange={changeSubCity}
          bureauId={bureauId}
          onBureauChange={changeBureau}
          serviceId={serviceId}
          onServiceChange={changeService}
          searchKeyword={searchKeyword}
          onSearchKeywordChange={setSearchKeyword}
          selectedCategory={selectedCategory}
          onSelectCategory={changeCategory}
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
          serviceGuide={serviceGuide}
          guideService={guideService}
          guideBureau={guideBureau}
          serviceGuideContent={cmsConfig?.serviceGuide}
        />
      )}
      <JourneySection t={t} onGoToFeedback={goToFeedback} journey={cmsConfig?.journey} />
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
        <AdminStrip t={t} adminStripContent={cmsConfig?.footer} />
      )}
    </main>
  )
}
