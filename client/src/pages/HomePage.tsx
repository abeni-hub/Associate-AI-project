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

  const [subCity, setSubCity] = useState<string>('all');
  const [bureauId, setBureauId] = useState<string>('all');
  const [serviceId, setServiceId] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [serviceGuide, setServiceGuide] = useState<ServiceGuideSelection>({ subCity: 'all', bureauId: 'all', serviceId: '' });

  // 1. Live Organizations from backend API
  const { data: allOrgsData, isLoading: isOrgsLoading } = useGetOrganizationsQuery({
    per_page: 100,
  });

  const allOrganizations = useMemo(() => {
    return (allOrgsData?.data && Array.isArray(allOrgsData.data)) ? allOrgsData.data : [];
  }, [allOrgsData]);

  // Sub-cities from backend API
  const subCityList = useMemo(() => {
    return allOrganizations.filter(
      (o: any) =>
        o.parent_organization_id === null &&
        (o.type?.code === 'sub_city' ||
          o.name?.toLowerCase().includes('sub-city') ||
          o.name?.toLowerCase().includes('subcity'))
    );
  }, [allOrganizations]);

  const subCityOptions = useMemo(() => {
    return subCityList.map((o: any) => o.name);
  }, [subCityList]);

  // Selected sub-city object
  const selectedSubCityObj = useMemo(() => {
    if (!subCity || subCity === 'all') return null;
    return subCityList.find(
      (o: any) =>
        o.name.toLowerCase() === subCity.toLowerCase() ||
        String(o.id) === String(subCity) ||
        o.code === subCity
    );
  }, [subCity, subCityList]);

  // 2. Municipal Bureaus / Offices grouped and filtered under their parent
  const { bureauOptions, bureauGroups } = useMemo(() => {
    if (!allOrganizations.length) return { bureauOptions: [], bureauGroups: null };

    // Central bureaus (no parent and bureau/agency type or naming)
    const centralBureaus = allOrganizations.filter(
      (o: any) =>
        o.parent_organization_id === null &&
        (o.type?.code === 'bureau' ||
          o.type?.code === 'agency' ||
          o.name?.toLowerCase().includes('bureau') ||
          o.name?.toLowerCase().includes('agency'))
    );

    // If a sub-city is selected: filter child offices under that parent
    if (selectedSubCityObj) {
      const childOffices = allOrganizations.filter(
        (o: any) => o.parent_organization_id === selectedSubCityObj.id
      );

      const options = [
        ...childOffices.map((o: any) => ({
          id: String(o.id),
          label: o.name,
          shortLabel: `Under ${selectedSubCityObj.name}`,
          code: o.code,
        })),
        ...centralBureaus.map((o: any) => ({
          id: String(o.id),
          label: o.name,
          shortLabel: o.name.replace(/Bureau|Office|Agency/i, '').trim() || o.name,
          code: o.code,
        })),
      ];

      const groups: Record<string, any[]> = {};
      if (childOffices.length > 0) {
        groups[`${selectedSubCityObj.name} Offices`] = childOffices.map((o: any) => ({
          id: String(o.id),
          label: o.name,
          subtext: `Under ${selectedSubCityObj.name}`,
          code: o.code,
        }));
      }
      groups['Central Bureaus & Authorities'] = centralBureaus.map((o: any) => ({
        id: String(o.id),
        label: o.name,
        subtext: o.code || '',
        code: o.code,
      }));

      return { bureauOptions: options, bureauGroups: groups };
    }

    // When "all" sub-cities are selected: show all bureaus and child offices grouped under their parent
    const childOffices = allOrganizations.filter((o: any) => o.parent_organization_id !== null);

    const options = [
      ...centralBureaus.map((o: any) => ({
        id: String(o.id),
        label: o.name,
        shortLabel: o.name.replace(/Bureau|Office|Agency/i, '').trim() || o.name,
        code: o.code,
      })),
      ...childOffices.map((o: any) => ({
        id: String(o.id),
        label: o.parent ? `${o.parent.name} › ${o.name}` : o.name,
        shortLabel: o.parent ? `Under ${o.parent.name}` : '',
        code: o.code,
      })),
    ];

    const groups: Record<string, any[]> = {};
    groups['Central Bureaus & Authorities'] = centralBureaus.map((o: any) => ({
      id: String(o.id),
      label: o.name,
      subtext: o.code || '',
      code: o.code,
    }));

    // Group child offices under their parent organization name
    childOffices.forEach((o: any) => {
      const parentName = o.parent?.name || 'Local Sub-city Offices';
      const groupKey = `${parentName} Offices`;
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push({
        id: String(o.id),
        label: o.name,
        subtext: `Under ${parentName}`,
        code: o.code,
      });
    });

    return { bureauOptions: options, bureauGroups: groups };
  }, [allOrganizations, selectedSubCityObj]);

  // 3. Live Services with Subservices queried with backend filtering
  const servicesQueryParams = useMemo(() => {
    const params: Record<string, any> = { per_page: 100, tree: true };
    if (subCity && subCity !== 'all') {
      params.sub_city = subCity;
    }
    if (bureauId && bureauId !== 'all') {
      params.organization_id = bureauId;
    }
    if (selectedCategory && selectedCategory !== 'all') {
      params.category = selectedCategory;
    }
    if (searchKeyword && searchKeyword.trim()) {
      params.search = searchKeyword.trim();
    }
    return params;
  }, [subCity, bureauId, selectedCategory, searchKeyword]);

  const { data: servicesData, isLoading: isServicesLoading } = useGetServicesQuery(servicesQueryParams);
  const isDropdownsLoading = isOrgsLoading || isServicesLoading;

  // Live CMS configuration
  const { data: apiCmsData } = useGetLandingPageCmsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });
  const liveCms = (apiCmsData && ('data' in (apiCmsData as any) ? (apiCmsData as any).data : apiCmsData)) as LandingPageCmsConfig | null;
  const cmsConfig = propCmsConfig || liveCms || null;

  const configuredSlides = cmsConfig?.hero?.slides;
  const slides = configuredSlides?.length
    ? configuredSlides.map((slide, index) => {
        const fallback = heroSlides[index % heroSlides.length];
        return {
          ...fallback,
          ...slide,
          bureau: slide.bureau || fallback.bureau,
          title: slide.title || fallback.title,
          description: slide.category || slide.description || fallback.description,
        };
      })
    : heroSlides;

  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [heroCarouselPlaying, setHeroCarouselPlaying] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // Extract actionable services (and subservices) returned by backend filtering
  const activeServiceList = useMemo(() => {
    if (!servicesData?.data || !Array.isArray(servicesData.data)) return [];

    const list: any[] = [];
    const seenIds = new Set<string>();

    servicesData.data.forEach((s: any) => {
      // If backend returned nested subservices, include them
      if (s.subservices && Array.isArray(s.subservices) && s.subservices.length > 0) {
        s.subservices.forEach((sub: any) => {
          const subId = String(sub.id);
          if (!seenIds.has(subId)) {
            seenIds.add(subId);
            list.push({
              id: subId,
              code: sub.code || subId,
              label: sub.name,
              organizationId: sub.organization_id ? String(sub.organization_id) : (s.organization_id ? String(s.organization_id) : undefined),
              organizationName: sub.organization?.name || s.organization?.name || '',
              parentId: String(s.id),
              parentName: s.name,
              parentCode: s.code,
              isMaster: false,
              description: sub.description || '',
              offeringOrganizations: sub.offering_organizations || s.offering_organizations || [],
              raw: sub,
            });
          }
        });
      } else {
        // Standalone service or direct subservice returned by backend
        const sId = String(s.id);
        if (!seenIds.has(sId)) {
          seenIds.add(sId);
          list.push({
            id: sId,
            code: s.code || sId,
            label: s.name,
            organizationId: s.organization_id ? String(s.organization_id) : undefined,
            organizationName: s.organization?.name || '',
            parentId: s.parent_id ? String(s.parent_id) : null,
            parentName: s.parent?.name || null,
            parentCode: s.parent?.code || null,
            isMaster: Boolean(s.is_master ?? (s.parent_id === null)),
            description: s.description || '',
            offeringOrganizations: s.offering_organizations || [],
            raw: s,
          });
        }
      }
    });

    return list;
  }, [servicesData]);

  // Automatically sync serviceId with activeServiceList
  useEffect(() => {
    if (activeServiceList.length > 0) {
      const exists = activeServiceList.some((s) => s.id === serviceId);
      if (!exists) {
        const nextId = activeServiceList[0].id;
        setServiceId(nextId);
        setServiceGuide((prev) => ({
          ...prev,
          serviceId: nextId,
        }));
      }
    } else {
      setServiceId('');
      setServiceGuide((prev) => ({
        ...prev,
        serviceId: '',
      }));
    }
  }, [activeServiceList, serviceId]);

  // Initial service guide bootstrap
  useEffect(() => {
    if (serviceId && !serviceGuide.serviceId) {
      setServiceGuide({
        subCity: subCity || 'all',
        bureauId: bureauId || 'all',
        serviceId,
      });
    }
  }, [subCity, bureauId, serviceId, serviceGuide]);

  // Query service details and steps for selected guide service
  const effectiveGuideServiceId = serviceGuide.serviceId || serviceId;

  // Resolve target organization ID for organization-level room steps filtering
  const selectedOrgId = useMemo(() => {
    // 1. If citizen selected a specific sub-city, prioritize that sub-city's organization ID
    if (serviceGuide.subCity && serviceGuide.subCity !== 'all') {
      const cleanSubCity = serviceGuide.subCity.toLowerCase().replace(/sub-city|sub city|subcity/g, '').trim();
      const matchSubCity = subCityList.find((o: any) => {
        const name = (o.name || '').toLowerCase();
        const code = (o.code || '').toLowerCase();
        return name.includes(cleanSubCity) || code.includes(cleanSubCity);
      });
      if (matchSubCity) return matchSubCity.id;
    }
    // 2. Otherwise if bureau is selected, use bureau ID
    if (serviceGuide.bureauId && serviceGuide.bureauId !== 'all') {
      const matchBureau = allOrganizations.find((o: any) => String(o.id) === String(serviceGuide.bureauId));
      if (matchBureau) return matchBureau.id;
    }
    return undefined;
  }, [serviceGuide.subCity, serviceGuide.bureauId, subCityList, allOrganizations]);

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
          ? (language === 'am'
              ? `የሚፈጀው ግምታዊ ጊዜ፦ ${s.estimated_duration_minutes} ደቂቃ። መደበኛ ክፍያ፦ ${s.fee_amount ? `${s.fee_amount} ${s.fee_currency || 'ብር'}` : 'ነፃ'}።`
              : `Estimated processing time: ${s.estimated_duration_minutes} minutes. Standard fee: ${s.fee_amount || 'Free'} ${s.fee_currency || 'ETB'}.`)
          : (s.fee_amount
              ? (language === 'am' ? `መደበኛ ክፍያ፦ ${s.fee_amount} ${s.fee_currency || 'ብር'}።` : `Standard fee: ${s.fee_amount} ${s.fee_currency || 'ETB'}.`)
              : ''),
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
      subCity: subCity || 'all',
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
    // If current bureau is a child of another sub-city, reset it
    if (bureauId && bureauId !== 'all') {
      const matchOrg = allOrganizations.find((o: any) => String(o.id) === String(bureauId))
      if (matchOrg && matchOrg.parent_organization_id) {
        setBureauId('all')
      }
    }
  }

  function changeBureau(nextBureau: string) {
    setBureauId(nextBureau)
    if (nextBureau === 'all') {
      setSelectedCategory('all')
      setServiceGuide((prev) => ({
        ...prev,
        bureauId: 'all',
      }))
    } else if (allOrganizations.length) {
      const org = allOrganizations.find((o: any) => String(o.id) === String(nextBureau))
      if (org) {
        if (org.code === 'civil-registration-agency') setSelectedCategory('vital')
        else if (org.code === 'revenues-bureau') setSelectedCategory('tax')
        else if (org.code === 'trade-industry-bureau') setSelectedCategory('business')
        else if (org.code === 'land-development-bureau') setSelectedCategory('land')
        else if (org.code === 'urban-planning-bureau') setSelectedCategory('plan')
      }
      setServiceGuide((prev) => ({
        ...prev,
        bureauId: nextBureau,
      }))
    }
  }

  function changeService(nextServiceId: string) {
    setServiceId(nextServiceId)
    setServiceGuide((prev) => ({
      ...prev,
      serviceId: nextServiceId,
    }))
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

    if (targetBureauCode && allOrganizations.length) {
      const matchOrg = allOrganizations.find((o: any) => o.code === targetBureauCode)
      if (matchOrg) {
        setBureauId(String(matchOrg.id))
      }
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
          bureauGroups={bureauGroups}
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
