import { readSharedNewsEvents, writeSharedNewsEvents } from '../../../shared/newsEventsStorage.js'

/**
 * CivicLink Ethiopia — News & Events Service
 * Ready for direct backend integration (REST or GraphQL).
 * 
 * To connect to a live backend:
 * 1. Set `USE_REAL_BACKEND = true` or provide `VITE_API_URL` in .env.
 * 2. The methods below already conform to standard paginated REST APIs:
 *    GET /api/news?page=1&limit=6&category=...&subCity=...&search=...
 *    GET /api/events?page=1&limit=6&category=...&subCity=...&search=...
 */

const USE_REAL_BACKEND = false;
const API_BASE_URL = import.meta.env?.VITE_API_URL || '/api';

function getPublishedNewsEvents() {
  return readSharedNewsEvents([...MOCK_NEWS, ...MOCK_EVENTS]).filter((item) => item.isPublished !== false)
}

// Curated high quality photos relevant to Ethiopian civic affairs, municipal services, public forums, and community development
export const MOCK_NEWS = [
  {
    id: 'news-1',
    type: 'news',
    title: 'City Launches Digital Tax Clearance System Across All 11 Sub-Cities',
    titleAm: 'የአዲስ አበባ ከተማ ዲጂታል የግብር ክሊራንስ አሰራር በሁሉም 11 ክፍለ ከተሞች በይፋ አስጀመረ',
    slug: 'digital-tax-clearance-launch',
    summary: 'Taxpayers can now obtain official tax clearance certificates online within 24 hours without queueing in revenue branches.',
    summaryAm: 'ግብር ከፋዮች ወደ ገቢዎች ቢሮ በአካል መሄድ ሳያስፈልጋቸው በ24 ሰዓት ውስጥ ይፋዊ የታክስ ክሊራንስ ሰርተፍኬት በኦንላይን ማግኘት ይችላሉ።',
    content: `The Addis Ababa Revenues Bureau in partnership with the Innovation and Technology Bureau has officially unveiled a nationwide digital tax clearance portal.

Starting this week, individual taxpayers and registered business enterprises across all 11 sub-cities (including Bole, Yeka, Kirkos, Arada, and Addis Ketema) can request, verify, and print stamped clearance documents digitally.

Key highlights of the new digital portal:
• Integrated with the National ID (Fayda) database for instant authentication
• Automatic verification against audited annual declarations and e-TIN accounts
• Average processing turnaround reduced from 7 working days to under 24 hours
• Real-time SMS and email tracking updates for submitted requests

Citizen service desks at all woredas will continue to assist citizens who require in-person digital support and guidance during the introductory phase.`,
    contentAm: `የአዲስ አበባ ገቢዎች ቢሮ ከኢኖቬሽንና ቴክኖሎጂ ቢሮ ጋር በመተባበር ሀገር አቀፍ የዲጂታል ታክስ ክሊራንስ መድረክን ይፋ አድርጓል።

ከዚህ ሳምንት ጀምሮ በሁሉም 11 ክፍለ ከተሞች (ቦሌ፣ የካ፣ ቂርቆስ፣ አራዳ እና አዲስ ከተማን ጨምሮ) የሚገኙ ግብር ከፋዮች እና ንግድ ድርጅቶች የታክስ ክሊራንስ ሰርተፍኬት በቀላሉ መጠየቅ፣ ማረጋገጥ እና ማተም ይችላሉ።

የአዲሱ ዲጂታል አሰራር ዋና ዋና ነጥቦች፡
• ፈጣን ማረጋገጫ ለመስጠት ከብሔራዊ መታወቂያ (ፋይዳ) ጋር የተሳሰረ ነው
• ከተመረመሩ የዓመት ሂሳቦችና ከኢ-ቲን መለያ ጋር በቀጥታ ይገናኛል
• የክሊራንስ አገልግሎት ማጠናቀቂያ ጊዜ ከ7 የሥራ ቀናት ወደ 24 ሰዓት ዝቅ ብሏል
• የአገልግሎት ሂደቱን በሞባይል አጭር መልእክትና በኢሜይል መከታተል ይቻላል

የዲጂታል አገልግሎቱን መጠቀም ለሚቸገሩ ዜጎች በሁሉም ወረዳዎች የሚገኙ የአገልግሎት መስጫ ጠረጴዛዎች ድጋፍ መስጠታቸውን ይቀጥላሉ።`,
    category: 'Digital Services',
    categoryAm: 'ዲጂታል አገልግሎት',
    subCity: 'All Addis Ababa',
    subCityAm: 'መላው አዲስ አበባ',
    bureau: 'Addis Ababa Revenues Bureau',
    bureauAm: 'የአዲስ አበባ ገቢዎች ቢሮ',
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Communications Directorate',
      nameAm: 'የኮሙኒኬሽን ዳይሬክቶሬት',
      role: 'Addis Ababa Revenues Bureau',
      roleAm: 'የአዲስ አበባ ገቢዎች ቢሮ',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
    publishedAt: '2026-10-18',
    readTimeMinutes: 4,
    views: 3420,
    tags: ['e-TIN', 'Tax Clearance', 'Fayda ID', 'Digital Bureau'],
    isFeatured: true,
  },
  {
    id: 'news-2',
    type: 'news',
    title: 'Vital Events Registration: Free Birth Certificates for Newborns in 90 Days',
    titleAm: 'የሲቪል ምዝገባ ኤጀንሲ፡ በ90 ቀናት ውስጥ ለተመዘገቡ ህፃናት የልደት ሰርተፍኬት በነጻ ይሰጣል',
    slug: 'vital-events-birth-certificate-drive',
    summary: 'Parents are reminded that birth registration within 90 days remains fee-free at all woreda civil registration desks.',
    summaryAm: 'ወላጆች ልጆቻቸው በተወለዱ በ90 ቀናት ውስጥ ሲያስመዘግቡ ያለምንም ክፍያ የልደት ሰርተፍኬት በሁሉም የወረዳ ሲቪል ምዝገባ ቢሮዎች ማግኘት እንደሚችሉ ተገለጸ።',
    content: `The Civil Registration and Residency Service Agency (CRRSA) has issued an official advisory encouraging all families to register newborn infants promptly.

Under Ethiopian proclamation regulations, births reported within 90 calendar days are issued official civil registration documents free of administrative fees. Registration desks across all sub-cities have also expanded operating hours on Saturdays from 8:30 AM to 12:30 PM.

What to prepare:
1. Hospital or health facility birth notification slip
2. Parents' valid Kebele or National Fayda ID card
3. Marriage certificate copy (if available)

For births that occurred outside medical facilities, two adult witnesses who witnessed the birth or community health extension workers can provide verification testimony.`,
    contentAm: `የሲቪል ምዝገባና የነዋሪነት አገልግሎት ኤጀንሲ (CRRSA) ወላጆች አዲስ የተወለዱ ልጆቻቸውን በወቅቱ እንዲያስመዘግቡ ጥሪ አቅርቧል።

በኢትዮጵያ ህግ መሰረት ልጅ በተወለደ በ90 ቀናት ውስጥ የሚደረግ የልደት ምዝገባ ያለምንም የአገልግሎት ክፍያ ይከናወናል። በተጨማሪም በሁሉም ክፍለ ከተሞች ያሉ የወረዳ ቢሮዎች በቅዳሜ ግማሽ ቀን (ከጠዋቱ 2:30 እስከ 6:30) አገልግሎት መስጠት ጀምረዋል።

የሚያስፈልጉ ሰነዶች፡
1. ከጤና ተቋም የተሰጠ የልደት ማሳወቂያ ወረቀት
2. የወላጆች የቀበሌ ወይም የፋይዳ መታወቂያ
3. የጋብቻ ሰርተፍኬት (ካለ)

ከጤና ተቋም ውጭ ለተወለዱ ህፃናት ልደቱን የሚያረጋግጡ ሁለት ምስክሮች ወይም የማህበረሰብ ጤና ኤክስቴንሽን ባለሙያዎች ማረጋገጫ መስጠት ይችላሉ።`,
    category: 'Civil Registry',
    categoryAm: 'የሲቪል ምዝገባ',
    subCity: 'All Addis Ababa',
    subCityAm: 'መላው አዲስ አበባ',
    bureau: 'Civil Registration & Residency Service Agency',
    bureauAm: 'የሲቪል ምዝገባና የነዋሪነት አገልግሎት ኤጀንሲ',
    coverImage: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'CRRSA Media Desk',
      nameAm: 'የሲቪል ምዝገባ ሚዲያ ክፍል',
      role: 'Civil Status Advisory',
      roleAm: 'የሲቪል ሁኔታ አማካሪ',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
    publishedAt: '2026-10-16',
    readTimeMinutes: 3,
    views: 2890,
    tags: ['CRRSA', 'Birth Certificate', 'Vital Records'],
    isFeatured: true,
  },
  {
    id: 'news-3',
    type: 'news',
    title: 'Addis Ababa Master Plan: Public Consultations Open for Transit Corridors',
    titleAm: 'የአዲስ አበባ መሪ ፕላን፡ ለትራንዚት ኮሪደሮች ልማት የህዝብ ውይይት ተጀመረ',
    slug: 'transit-corridor-public-consultations',
    summary: 'The Planning and Development Commission invites residents and local business owners to review neighborhood revitalization plans.',
    summaryAm: 'የዕቅድና ልማት ኮሚሽን ነዋሪዎችና የንግድ ማህበረሰቡ በአካባቢያቸው በሚካሄዱ የኮሪደር ልማትና ማሻሻያ እቅዶች ላይ አስተያየት እንዲሰጡ ጋበዘ።',
    content: `The Plan and Development Office has initiated comprehensive public consultation rounds regarding the next phase of sustainable pedestrian, transit, and green public space developments.

Residents across Bole, Kirkos, Lideta, and Arada sub-cities are encouraged to visit designated exhibition pavilions or participate digitally through the CivicLink platform to review architectural models and proposed zoning updates.

Key topics under consultation:
• Accessible pedestrian walkways, protected cycling lanes, and street lighting
• Pocket park developments and urban greening strategies
• Micro-retail kiosks and designated market spaces for neighborhood vendors
• Enhanced drainage networks and public sanitation facilities.`,
    contentAm: `የዕቅድና ልማት ቢሮ ቀጣዩን ዘላቂ የእግረኛ፣ የትራንስፖርት እና የህዝብ መናፈሻ ኮሪደሮች ልማት በተመለከተ ከህዝብ ጋር የምክክር መድረኮችን ጀምሯል።

በቦሌ፣ ቂርቆስ፣ ልደታ እና አራዳ ክፍለ ከተሞች የሚኖሩ ነዋሪዎች በተዘጋጁት የዕቅድ ማሳያ ማዕከላት ወይም በሲቪክሊንክ ድረ-ገጽ በኩል አስተያየታቸውን እንዲያጋሩ ተጋብዘዋል።

በውይይት ላይ ያሉ ዋና ዋና ነጥቦች፡
• የተመቻቹ የእግረኛ መንገዶች፣ የብስክሌት መስመሮችና የመንገድ መብራቶች
• የአካባቢ መናፈሻዎችና የከተማ አረንጓዴ ልማት
• ለአነስተኛ ነጋዴዎች የተዘጋጁ ዘመናዊ የመሸጫ ቦታዎች
• የተሻሻለ የፍሳሽ ማስወገጃ እና የህዝብ መጸዳጃ ተቋማት ግንባታ።`,
    category: 'Urban Planning',
    categoryAm: 'የከተማ ፕላን',
    subCity: 'Kirkos & Bole',
    subCityAm: 'ቂርቆስ እና ቦሌ',
    bureau: 'Plan & Development Office',
    bureauAm: 'የዕቅድና ልማት ቢሮ',
    coverImage: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Urban Planning Team',
      nameAm: 'የከተማ ፕላን ቡድን',
      role: 'Plan & Development Office',
      roleAm: 'የዕቅድና ልማት ቢሮ',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    },
    publishedAt: '2026-10-14',
    readTimeMinutes: 5,
    views: 4120,
    tags: ['Master Plan', 'Corridor Development', 'Public Hearing'],
    isFeatured: true,
  },
  {
    id: 'news-4',
    type: 'news',
    title: 'Trade Bureau Streamlines Commercial License Renewals via Single-Window Desks',
    titleAm: 'የንግድ ቢሮ የንግድ ፈቃድ እድሳትን በአንድ መስኮት አሰራር አቀላጠፈ',
    slug: 'trade-bureau-single-window-renewals',
    summary: 'Commercial license renewals now require only 15 minutes at unified single-window service counters in all sub-city branches.',
    summaryAm: 'በሁሉም ክፍለ ከተሞች በተዘረጉ የአንድ መስኮት አገልግሎት መስጫዎች የንግድ ፈቃድ እድሳት በ15 ደቂቃ ውስጥ ማጠናቀቅ እንደሚቻል ተገለጸ።',
    content: `The City Government Trade Bureau has completed rollout of its Unified Business Service counters across all sub-city offices.

Entrepreneurs and shop owners no longer need to move between disparate departments for annual competency verification, tax status receipts, and license stamps.

Requirements for fast-track renewal:
• Previous commercial registration certificate
• Current year tax clearance code or receipt
• Valid National ID / Fayda of manager or legal representative
• Commercial lease agreement or title ownership certificate`,
    contentAm: `የከተማው ንግድ ቢሮ በሁሉም ክፍለ ከተሞች የንግድ ፈቃድና ምዝገባ አገልግሎትን በአንድ መስኮት ማዕቀፍ ውስጥ አጠናክሯል።

ነጋዴዎች ለብቃት ማረጋገጫ፣ ለታክስ ደረሰኝና ለማህተም በተለያዩ ቢሮዎች መመላለስ ሳይጠበቅባቸው በአንድ ጠረጴዛ ላይ አገልግሎቱን ማጠናቀቅ ይችላሉ።

ለፈጣን እድሳት የሚያስፈልጉ ሰነዶች፡
• የቀደመው የንግድ ምዝገባ ሰርተፍኬት
• የዘመኑ የግብር ክሊራንስ ማረጋገጫ
• የባለቤቱ ወይም የህጋዊ ወኪሉ የታደሰ መታወቂያ
• የንግድ ቦታው የኪራይ ውል ወይም የይዞታ ማረጋገጫ ሰነድ`,
    category: 'Commerce & Trade',
    categoryAm: 'ንግድና ገበያ',
    subCity: 'Addis Ketema & Arada',
    subCityAm: 'አዲስ ከተማ እና አራዳ',
    bureau: 'City Government Trade Bureau',
    bureauAm: 'የከተማ ንግድ ቢሮ',
    coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Trade Desk Lead',
      nameAm: 'የንግድ አገልግሎት ኃላፊ',
      role: 'City Trade Bureau',
      roleAm: 'የከተማ ንግድ ቢሮ',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    },
    publishedAt: '2026-10-11',
    readTimeMinutes: 3,
    views: 1980,
    tags: ['Trade License', 'Business Support', 'Single Window'],
    isFeatured: false,
  },
  {
    id: 'news-5',
    type: 'news',
    title: 'Land Records Modernization: Digital Cadastre Verification Phase 3 Commences',
    titleAm: 'የመሬት ይዞታ መረጃዎች ዘመናዊነት፡ የዲጂታል ካዳስተር ማረጋገጫ 3ኛ ምዕራፍ ተጀመረ',
    slug: 'land-records-cadastre-phase-3',
    summary: 'Property owners in Yeka and Lemi Kura sub-cities can now review parcel boundaries online through the GIS portal.',
    summaryAm: 'በየካ እና በለሚ ኩራ ክፍለ ከተሞች የሚገኙ የመሬት ይዞታ ባለቤቶች የይዞታ ድንበራቸውን በጂ.አይ.ኤስ ፖርታል በኩል በኦንላይን ማየት ይችላሉ።',
    content: `The Land Development & Administration Bureau has officially kicked off the third phase of the digital cadastre modernization campaign.

This phase equips parcel owners with direct access to inspect their recorded geometric boundaries, verify registration numbers, and submit correction requests if discrepancies exist.

Field survey teams equipped with high-accuracy GNSS positioning tools will also be visiting neighborhood clusters to resolve historical overlapping boundary claims.`,
    contentAm: `የመሬት ልማትና አስተዳደር ቢሮ የዲጂታል ካዳስተር ምዝገባና ማረጋገጫ ሶስተኛ ምዕራፍ ስራውን በይፋ ጀምሯል።

በዚህ ምዕራፍ የይዞታ ባለቤቶች የተመዘገበውን የቦታ ስፋት፣ የድንበር መለኪያዎችንና የመዝገብ ቁጥራቸውን በኦንላይን መፈተሽና ያልተስተካከለ መረጃ ካለ ማመልከት ይችላሉ።

የካዳስተር ቅየሳ ባለሙያዎችም በሰፈሮች በመዘዋወር የድንበር ይገባኛል ጥያቄዎችን በዘመናዊ ጂ.ፒ.ኤስ መሳሪያዎች በመታገዝ ይፈታሉ።`,
    category: 'Land & Housing',
    categoryAm: 'መሬትና ይዞታ',
    subCity: 'Yeka & Lemi Kura',
    subCityAm: 'የካ እና ለሚ ኩራ',
    bureau: 'Land Development & Administration Bureau',
    bureauAm: 'የመሬት ልማትና አስተዳደር ቢሮ',
    coverImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Cadastre Taskforce',
      nameAm: 'የካዳስተር ግብረ ኃይል',
      role: 'Land Administration',
      roleAm: 'የመሬት አስተዳደር',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    },
    publishedAt: '2026-10-08',
    readTimeMinutes: 4,
    views: 2450,
    tags: ['Land Registry', 'Cadastre', 'GIS Mapping'],
    isFeatured: false,
  },
  {
    id: 'news-6',
    type: 'news',
    title: 'Customer Service Standard: 5 New Service Charters Enacted Across City Offices',
    titleAm: 'የአገልግሎት አሰጣጥ ደረጃ፡ 5 አዳዲስ የዜጎች ቻርተሮች በከተማው ቢሮዎች ስራ ላይ ዋሉ',
    slug: 'citizen-service-charter-enacted',
    summary: 'Maximum wait times and document requirements are now legally guaranteed under the 2026 Citizen Service Charter.',
    summaryAm: 'በ2026 የዜጎች አገልግሎት ቻርተር መሰረት ለእያንዳንዱ አገልግሎት የሚፈጀው ከፍተኛ ጊዜና መስፈርቶች በግልጽ እንዲታወቁ ተደረገ።',
    content: `To ensure transparency and eliminate bureaucratic delays, the City Administration has published updated Citizen Service Charters across all customer engagement bureaus.

Under the new directives, service counters must publicly display service steps, accountable desk officers, and maximum turnaround times. Citizens can also submit real-time QR ratings directly from waiting halls.`,
    contentAm: `አላስፈላጊ መጉላላትን ለማስቀረት እና ግልጽነትን ለማረጋገጥ የአስተዳደሩ አዳዲስ የአገልግሎት አሰጣጥ ቻርተሮች ተግባራዊ መሆን ጀምረዋል።

በአዲሱ መመሪያ መሰረት እያንዳንዱ አገልግሎት የሚፈጀው ጊዜና ኃላፊነት ያለባቸው ባለሙያዎች ስም በአዳራሾች ውስጥ በግልጽ ይሰቀላሉ፤ ዜጎችም በQR ኮድ ወዲያውኑ አስተያየት መስጠት ይችላሉ።`,
    category: 'Citizen Services',
    categoryAm: 'የዜጎች አገልግሎት',
    subCity: 'All Addis Ababa',
    subCityAm: 'መላው አዲስ አበባ',
    bureau: 'City Public Service & HR Bureau',
    bureauAm: 'የህዝብ አገልግሎትና የሰው ሀብት ቢሮ',
    coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Public Service Inspectorate',
      nameAm: 'የህዝብ አገልግሎት ኢንስፔክቶሬት',
      role: 'City Administration',
      roleAm: 'የከተማ አስተዳደር',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    },
    publishedAt: '2026-10-04',
    readTimeMinutes: 3,
    views: 1840,
    tags: ['Service Charter', 'Citizen Rights', 'Civic Standards'],
    isFeatured: false,
  },
  {
    id: 'news-7',
    type: 'news',
    title: 'Mobile Clinic Schedules Announced for Preventive Health Checks in Sub-Cities',
    titleAm: 'በክፍለ ከተሞች ለሚካሄደው የቅድመ-መከላከል የጤና ምርመራ የሞባይል ክሊኒክ መርሃ-ግብር ይፋ ሆነ',
    slug: 'mobile-clinic-health-checks',
    summary: 'Community mobile health teams will visit designated kebeles for free blood pressure, diabetes, and eye screenings.',
    summaryAm: 'የማህበረሰብ ጤና ቡድኖች በተመረጡ ቀበሌዎች በመዘዋወር የደም ግፊት፣ የስኳር እና የአይን ምርመራ በነጻ ይሰጣሉ።',
    content: `The Addis Ababa Health Bureau has launched its seasonal community wellness tour. Over the next six weeks, fully equipped medical vans will stop at community centers, offering free consultations, immunization boosters, and vital health screenings.`,
    contentAm: `የአዲስ አበባ ጤና ቢሮ የማህበረሰብ ጤና ጥበቃ ዘመቻ ጀምሯል። በቀጣዮቹ ስድስት ሳምንታት የህክምና አውቶቡሶች በየቀበሌው በመዘዋወር የነጻ ህክምና ምክርና ምርመራዎችን ያካሂዳሉ።`,
    category: 'Public Health',
    categoryAm: 'የህዝብ ጤና',
    subCity: 'Kolfe Keranio & Gulele',
    subCityAm: 'ቆልፌ ቀራኒዮ እና ጉለሌ',
    bureau: 'City Health Bureau',
    bureauAm: 'የከተማው ጤና ቢሮ',
    coverImage: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Public Health Bureau',
      nameAm: 'የህዝብ ጤና ቢሮ',
      role: 'Preventive Healthcare',
      roleAm: 'የመከላከያ ጤና',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80',
    },
    publishedAt: '2026-09-29',
    readTimeMinutes: 3,
    views: 1620,
    tags: ['Healthcare', 'Community Clinic', 'Wellness'],
    isFeatured: false,
  },
  {
    id: 'news-8',
    type: 'news',
    title: 'Youth Entrepreneurship Fund Opens Applications for Tech & Green Initiatives',
    titleAm: 'የወጣቶች የፈጠራ ስራ ፈንድ ለቴክኖሎጂና ለአረንጓዴ ስራዎች ማመልከቻ መቀበል ጀመረ',
    slug: 'youth-entrepreneurship-fund-2026',
    summary: 'Eligible young entrepreneurs can apply for seed grants and subsidized incubation space at city innovation hubs.',
    summaryAm: 'ብቁ የሆኑ ወጣት ስራ ፈጣሪዎች የመነሻ ካፒታል ድጋፍ እና በከተማው የፈጠራ ማዕከላት የመስሪያ ቦታ ማግኘት ይችላሉ።',
    content: `The Innovation & Technology Bureau together with youth enterprise agencies is accepting proposals from young founders working on urban agriculture, waste circularity, and digital public services. Grant funding of up to 500,000 ETB and 12-month mentorship are provided to selected cohorts.`,
    contentAm: `የኢኖቬሽንና ቴክኖሎጂ ቢሮ በከተማ ግብርና፣ በቆሻሻ መልሶ ጥቅም እና በዲጂታል አገልግሎቶች ላይ ለሚሰሩ ወጣቶች የገንዘብ ድጋፍና የማማከር እድል አዘጋጅቷል።`,
    category: 'Innovation & Youth',
    categoryAm: 'ፈጠራና ወጣቶች',
    subCity: 'All Addis Ababa',
    subCityAm: 'መላው አዲስ አበባ',
    bureau: 'Innovation & Technology Bureau',
    bureauAm: 'የኢኖቬሽንና ቴክኖሎጂ ቢሮ',
    coverImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Innovation Directorate',
      nameAm: 'የኢኖቬሽን ዳይሬክቶሬት',
      role: 'Startup Support Desk',
      roleAm: 'የስራ ፈጠራ ድጋፍ',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
    publishedAt: '2026-09-24',
    readTimeMinutes: 4,
    views: 3100,
    tags: ['Youth Fund', 'Startups', 'Technology Grants'],
    isFeatured: false,
  },
  {
    id: 'news-9',
    type: 'news',
    title: 'Addis Water & Sewerage Upgrades Pressure in Nifas Silk and Akaki Kality',
    titleAm: 'የአዲስ አበባ ውሃና ፍሳሽ ባለስልጣን በንፋስ ስልክና አቃቂ ቃሊቲ የውሃ ግፊትን አሻሻለ',
    slug: 'water-sewerage-pressure-upgrade',
    summary: 'New booster pumping stations have been commissioned, improving residential water continuity in southern woredas.',
    summaryAm: 'አዳዲስ የውሃ ማከፋፈያና ግፊት ማሳደጊያ ፓምፖች ስራ በመጀመራቸው በደቡባዊ ወረዳዎች የውሃ አቅርቦት መሻሻሉ ተገለጸ።',
    content: `The Addis Ababa Water and Sewerage Authority (AAWSA) announced the completion of the South Trunk pipeline extension, supplying over 45,000 additional households with reliable clean tap water. Maintenance schedules and hotline numbers have been updated.`,
    contentAm: `የአዲስ አበባ ውሃና ፍሳሽ ባለስልጣን የደቡብ አቅጣጫ ዋና የውሃ ቧንቧ መስመር ዝርጋታን በማጠናቀቅ ከ45,000 በላይ አባወራዎች ተጠቃሚ መሆናቸውን አስታወቀ።`,
    category: 'Utilities & Infrastructure',
    categoryAm: 'መሰረተ ልማት',
    subCity: 'Nifas Silk-Lafto & Akaki',
    subCityAm: 'ንፋስ ስልክ ላፍቶ እና አቃቂ',
    bureau: 'Water & Sewerage Authority',
    bureauAm: 'የውሃና ፍሳሽ ባለስልጣን',
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'AAWSA Press',
      nameAm: 'የውሃና ፍሳሽ ፕሬስ',
      role: 'Infrastructure Updates',
      roleAm: 'የመሰረተ ልማት ዝመና',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
    publishedAt: '2026-09-20',
    readTimeMinutes: 3,
    views: 1490,
    tags: ['Water', 'AAWSA', 'Infrastructure'],
    isFeatured: false,
  },
  {
    id: 'news-10',
    type: 'news',
    title: 'Kebele Administrative Offices Introduce Extended Evening Hours for Working Citizens',
    titleAm: 'የቀበሌ አስተዳደር ቢሮዎች ለሰራተኞች አመቺ የሆነ የተራዘመ የማታ አገልግሎት መስጠት ጀመሩ',
    slug: 'kebele-extended-evening-hours',
    summary: 'Selected woreda administrative halls will stay open until 7:30 PM on Tuesdays and Thursdays to handle ID and residency papers.',
    summaryAm: 'በቀን ስራ ለሚጠመዱ ዜጎች በማሰብ የተመረጡ የወረዳ ቢሮዎች በማክሰኞና ሀሙስ እስከ ምሽቱ 1:30 ድረስ አገልግሎት ይሰጣሉ።',
    content: `Following citizen feedback on CivicLink, pilot woreda centers in Bole and Kirkos sub-cities are testing evening hours. Working professionals and business owners can now certify residential status and renew identity papers after regular working hours.`,
    contentAm: `በሲቪክሊንክ በኩል ከቀረቡ የዜጎች አስተያየቶች በመነሳት በቦሌና ቂርቆስ ክፍለ ከተሞች ያሉ የሙከራ ወረዳዎች በምሽት ሰዓት አገልግሎት መስጠት ጀመሩ።`,
    category: 'Citizen Services',
    categoryAm: 'የዜጎች አገልግሎት',
    subCity: 'Bole & Kirkos',
    subCityAm: 'ቦሌ እና ቂርቆስ',
    bureau: 'Sub-city Administration',
    bureauAm: 'የክፍለ ከተማ አስተዳደር',
    coverImage: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Civic Outreach Team',
      nameAm: 'የህዝብ ግንኙነት ቡድን',
      role: 'Bole Sub-city Admin',
      roleAm: 'የቦሌ ክፍለ ከተማ',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    },
    publishedAt: '2026-09-15',
    readTimeMinutes: 3,
    views: 2210,
    tags: ['Kebele Services', 'Evening Hours', 'Residency ID'],
    isFeatured: false,
  },
  {
    id: 'news-11',
    type: 'news',
    title: 'Green Legacy 2026: Community Urban Nurseries Deliver 1.2M Seedlings',
    titleAm: 'የአረንጓዴ አሻራ 2026፡ የከተማ ችግኝ ጣቢያዎች 1.2 ሚሊዮን ችግኞችን አዘጋጁ',
    slug: 'green-legacy-urban-nurseries',
    summary: 'Free indigenous tree saplings and fruit-bearing trees are ready for distribution to school grounds and neighborhood associations.',
    summaryAm: 'ለትምህርት ቤቶችና ለነዋሪዎች ማህበራት የሚከፋፈሉ የሀገር በቀልና የፍራፍሬ ችግኞች በነጻ መዘጋጀታቸው ተገለጸ።',
    content: `The Environmental Protection Authority has distributed over 1.2 million saplings across all 11 sub-cities. Citizens and neighborhood block committees can collect seedlings directly from designated woreda nursery sites with registration.`,
    contentAm: `የአካባቢ ጥበቃ ባለስልጣን ከ1.2 ሚሊዮን በላይ ችግኞችን በሁሉም ክፍለ ከተሞች አዘጋጅቷል። ዜጎችና የሰፈር ኮሚቴዎች በወረዳቸው ካሉ ጣቢያዎች በነጻ መውሰድ ይችላሉ።`,
    category: 'Environment',
    categoryAm: 'አካባቢ ጥበቃ',
    subCity: 'All Addis Ababa',
    subCityAm: 'መላው አዲስ አበባ',
    bureau: 'Environmental Protection Authority',
    bureauAm: 'የአካባቢ ጥበቃ ባለስልጣን',
    coverImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Green City Project',
      nameAm: 'አረንጓዴ ከተማ ፕሮጀክት',
      role: 'Environment Desk',
      roleAm: 'የአካባቢ ጥበቃ ክፍል',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    },
    publishedAt: '2026-09-10',
    readTimeMinutes: 4,
    views: 1780,
    tags: ['Green Legacy', 'Seedlings', 'Urban Forestry'],
    isFeatured: false,
  },
  {
    id: 'news-12',
    type: 'news',
    title: 'Public Transit Card (Anbessa & Sheger) Automatic Top-up via Telebirr & CBE Birr',
    titleAm: 'የአንበሳና ሸገር አውቶቡስ ካርድ ክፍያ በቴሌብር እና በሲቢኢ ብር በኦንላይን መሙላት ተጀመረ',
    slug: 'transit-card-digital-topup',
    summary: 'Commuters can now instantly recharge their contactless bus cards using smartphone mobile money without waiting at ticket kiosks.',
    summaryAm: 'ተሳፋሪዎች የአውቶቡስ ካርዶቻቸውን በሞባይል ባንኪንግ አማካኝነት ከየትኛውም ቦታ ሆነው በቅጽበት መሙላት ይችላሉ።',
    content: `The Transport Bureau in coordination with Ethio Telecom and Commercial Bank of Ethiopia has introduced NFC digital recharge for contactless bus cards. Riders simply scan their card against their mobile phone or enter their 10-digit card serial number to add transit balance.`,
    contentAm: `የትራንስፖርት ቢሮ ከኢትዮ ቴሌኮም እና ከኢትዮጵያ ንግድ ባንክ ጋር በመተባበር የአውቶቡስ ካርዶችን በስልክ በቀጥታ መሙላት የሚያስችል አሰራር ይፋ አድርጓል።`,
    category: 'Transportation',
    categoryAm: 'ትራንስፖርት',
    subCity: 'All Addis Ababa',
    subCityAm: 'መላው አዲስ አበባ',
    bureau: 'City Transport Bureau',
    bureauAm: 'የትራንስፖርት ቢሮ',
    coverImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Smart Transit Initiative',
      nameAm: 'ዘመናዊ ትራንስፖርት ፕሮጀክት',
      role: 'City Transport Bureau',
      roleAm: 'የትራንስፖርት ቢሮ',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    },
    publishedAt: '2026-09-05',
    readTimeMinutes: 3,
    views: 2950,
    tags: ['Transit', 'Telebirr', 'Smart City', 'Bus Card'],
    isFeatured: false,
  },
];

export const MOCK_EVENTS = [
  {
    id: 'event-1',
    type: 'event',
    title: 'Public Town Hall: Bole & Kirkos Corridor Development Review',
    titleAm: 'የህዝብ መድረክ፡ የቦሌና ቂርቆስ ኮሪደር ልማት ግምገማና ውይይት',
    slug: 'town-hall-bole-kirkos-corridor',
    summary: 'Join city architects, sub-city administrators, and community representatives for an open Q&A on road safety, lighting, and business spaces.',
    summaryAm: 'ከከተማ ፕላነሮችና ከአስተዳዳሪዎች ጋር በመገናኘት ስለ መንገድ ደህንነት፣ መብራቶችና የንግድ ቦታዎች በቀጥታ ይወያዩ።',
    content: `The City Administration invites all residents, property owners, and business operators of Bole and Kirkos sub-cities to an open-floor town hall.

Agenda:
• 09:00 AM – Opening remarks by Sub-city Chief Administrator
• 09:30 AM – Presentation of pedestrian walkway enhancements and lighting plans
• 10:15 AM – Open floor question-and-answer session with citizen feedback
• 11:30 AM – Review of community safety committee recommendations
• 12:15 PM – Closing summary and next consultation dates

Refreshments will be served. Free translation into Sign Language and Amharic/Afan Oromo provided.`,
    contentAm: `የከተማው አስተዳደር በቦሌና ቂርቆስ ክፍለ ከተሞች የሚኖሩ ነዋሪዎችንና ነጋዴዎችን ለግልጽ የህዝብ መድረክ ጋብዟል።

የውይይቱ መርሃ-ግብር፡
• 3:00 – የክፍለ ከተማው ዋና አስተዳዳሪ የመክፈቻ ንግግር
• 3:30 – የእግረኛ መንገዶችና የመብራት ፕሮጀክት ማብራሪያ
• 4:15 – የህዝብ ጥያቄና መልስ እንዲሁም የአስተያየት መስጫ ሰዓት
• 5:30 – የማህበረሰብ ደህንነት ምክረ-ሀሳቦች ግምገማ
• 6:15 – የማጠቃለያ ውሳኔዎችና የቀጣይ ቀጠሮዎች

ቀለል ያለ መስተንግዶ የተዘጋጀ ሲሆን የምልክት ቋንቋ ተርጓሚዎችም ተመድበዋል።`,
    eventDate: '2026-10-26',
    endDate: '2026-10-26',
    time: '09:00 AM – 12:30 PM',
    timeAm: 'ከጠዋቱ 3:00 – 6:30',
    location: {
      venue: 'Bole Sub-city Youth & Cultural Center',
      venueAm: 'የቦሌ ክፍለ ከተማ ወጣቶችና ባህል ማዕከል',
      address: 'Near Edna Mall, Africa Avenue',
      addressAm: 'ኤድና ሞል አጠገብ፣ ቦሌ',
      subCity: 'Bole',
      subCityAm: 'ቦሌ',
      isVirtual: false,
    },
    category: 'Town Hall',
    categoryAm: 'የህዝብ መድረክ',
    bureau: 'Plan & Development Office',
    bureauAm: 'የዕቅድና ልማት ቢሮ',
    coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    capacity: 250,
    rsvpCount: 184,
    status: 'upcoming',
    registrationRequired: true,
    organizer: 'Bole Sub-City Administration',
    organizerAm: 'የቦሌ ክፍለ ከተማ አስተዳደር',
    isFeatured: true,
  },
  {
    id: 'event-2',
    type: 'event',
    title: 'Workshop: Free e-TIN Registration & Annual Tax Declaration Training',
    titleAm: 'የስልጠና አውደ-ጥናት፡ የነጻ ኢ-ቲን ምዝገባና የዓመት ግብር ማሳወቂያ ስልጠና',
    slug: 'workshop-etin-tax-training',
    summary: 'A hands-on practical clinic for micro, small, and medium business owners to master online tax filings and clearance applications.',
    summaryAm: 'ለአነስተኛና መካከለኛ ንግዶች ባለቤቶች የኦንላይን ግብር ማሳወቅና ክሊራንስ ማውጣት የሚያስችል ተግባራዊ ስልጠና።',
    content: `The Addis Ababa Revenues Bureau is hosting an interactive training workshop for small business entrepreneurs. Technical officers will guide attendees through hands-on exercises in the e-Tax simulator.

Please bring:
• Laptop or tablet (smartphones also supported)
• Business registration documents & e-TIN reference
• Bank book or statement for reconciliation practicals.`,
    contentAm: `የአዲስ አበባ ገቢዎች ቢሮ ለአነስተኛና መካከለኛ ነጋዴዎች ተግባራዊ የግብር ስልጠና አዘጋጅቷል። ባለሙያዎች በኮምፒውተር ታግዘው የግብር አሰራሩን ያሳያሉ።

ይዘው መምጣት ያለብዎት፡
• ላፕቶፕ ወይም ስማርት ስልክ
• የንግድ ምዝገባ ሰነድና የቲን ቁጥር
• የባንክ ደብተር ለመለማመጃ`,
    eventDate: '2026-10-31',
    endDate: '2026-10-31',
    time: '02:00 PM – 05:00 PM',
    timeAm: 'ከከሰዓት 8:00 – 11:00',
    location: {
      venue: 'Addis Ababa Exhibition Center, Hall 3',
      venueAm: 'አዲስ አበባ ኤግዚቢሽን ማዕከል፣ አዳራሽ 3',
      address: 'Meskel Square',
      addressAm: 'መስቀል አደባባይ',
      subCity: 'Kirkos',
      subCityAm: 'ቂርቆስ',
      isVirtual: false,
    },
    category: 'Workshop & Clinic',
    categoryAm: 'አውደ ጥናትና ስልጠና',
    bureau: 'Addis Ababa Revenues Bureau',
    bureauAm: 'የአዲስ አበባ ገቢዎች ቢሮ',
    coverImage: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
    capacity: 300,
    rsvpCount: 245,
    status: 'upcoming',
    registrationRequired: true,
    organizer: 'Revenues Bureau Taxpayer Education Directorate',
    organizerAm: 'የገቢዎች ቢሮ የግብር ከፋዮች ትምህርት ዳይሬክቶሬት',
    isFeatured: true,
  },
  {
    id: 'event-3',
    type: 'event',
    title: 'Community Clean-Up & Riverside Park Tree Planting Drive',
    titleAm: 'የህብረተሰብ የጽዳት ዘመቻና የወንዝ ዳርቻ የችግኝ ተከላ መርሃ-ግብር',
    slug: 'community-cleanup-riverside-planting',
    summary: 'Join fellow neighbors and youth volunteers in Yeka and Arada to plant indigenous trees and beautify neighborhood stream banks.',
    summaryAm: 'በየካ እና አራዳ ክፍለ ከተሞች ከወጣቶች ጋር በመሆን ወንዞችን በማጽዳትና ሀገር በቀል ችግኞችን በመትከል አካባቢዎን ያስውቡ።',
    content: `Help build a greener, more resilient Addis Ababa. Gloves, tree saplings, watering cans, and gardening equipment will be provided on site. Families, students, and community groups are all welcome!`,
    contentAm: `ለተሻለችና አረንጓዴ አዲስ አበባ የበኩልዎን ድርሻ ይወጡ። የጓንት፣ የችግኝና የመትከያ ቁሳቁሶች በቦታው ይቀርባሉ። ሁሉም የህብረተሰብ ክፍሎች ተጋብዘዋል።`,
    eventDate: '2026-11-07',
    endDate: '2026-11-07',
    time: '07:30 AM – 11:30 AM',
    timeAm: 'ከጠዋቱ 1:30 – 5:30',
    location: {
      venue: 'Kebena Riverside Promenade & Public Park',
      venueAm: 'የቀበና ወንዝ ዳርቻ መናፈሻ',
      address: 'Near British Embassy Gate, Yeka',
      addressAm: 'የካ፣ እንግሊዝ ኤምባሲ አካባቢ',
      subCity: 'Yeka & Arada',
      subCityAm: 'የካ እና አራዳ',
      isVirtual: false,
    },
    category: 'Community Service',
    categoryAm: 'የማህበረሰብ አገልግሎት',
    bureau: 'Environmental Protection Authority',
    bureauAm: 'የአካባቢ ጥበቃ ባለስልጣን',
    coverImage: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80',
    capacity: 500,
    rsvpCount: 398,
    status: 'upcoming',
    registrationRequired: false,
    organizer: 'Green Legacy Youth Volunteers',
    organizerAm: 'የአረንጓዴ አሻራ ወጣት በጎ ፈቃደኞች',
    isFeatured: true,
  },
  {
    id: 'event-4',
    type: 'event',
    title: 'Civic Tech & Open Data Forum: Enhancing Public Service Feedback',
    titleAm: 'የሲቪክ ቴክኖሎጂና ክፍት መረጃ ፎረም፡ የህዝብ አገልግሎት አስተያየቶችን ማሳደግ',
    slug: 'civic-tech-open-data-forum',
    summary: 'A hybrid webinar & live panel exploring citizen satisfaction analytics, QR-based bureau ratings, and transparent service metrics.',
    summaryAm: 'የዜጎች እርካታ ዳሰሳ፣ የቢሮዎች የQR ኮድ ደረጃ አሰጣጥና ግልጽ የአገልግሎት መረጃዎች የሚዳሰሱበት ውይይት።',
    content: `Local developers, civic leaders, university researchers, and government IT directors meet to discuss open APIs and civic link tools. Learn how citizen feedback is anonymized and routed directly to bureau managers to improve accountability.`,
    contentAm: `የቴክኖሎጂ ባለሙያዎች፣ የዩኒቨርሲቲ ተመራማሪዎችና የመንግስት ኃላፊዎች በጋራ በመገናኘት ክፍት የዳታ አሰራርና የዜጎች አስተያየት አሰባሰብ ላይ ይመክራሉ።`,
    eventDate: '2026-11-12',
    endDate: '2026-11-12',
    time: '03:00 PM – 06:00 PM',
    timeAm: 'ከከሰዓት 9:00 – 12:00',
    location: {
      venue: 'Science Museum Innovation Auditorium & Virtual Stream',
      venueAm: 'የሳይንስ ሙዚየም አዳራሽ እና በበይነ-መረብ',
      address: 'Churchill Avenue, Kirkos',
      addressAm: 'ቸርችል ጎዳና፣ ቂርቆስ',
      subCity: 'Kirkos',
      subCityAm: 'ቂርቆስ',
      isVirtual: true,
      virtualLink: 'https://meet.civiclink.et/civic-tech-2026',
    },
    category: 'Technology & Innovation',
    categoryAm: 'ቴክኖሎጂና ፈጠራ',
    bureau: 'Innovation & Technology Bureau',
    bureauAm: 'የኢኖቬሽንና ቴክኖሎጂ ቢሮ',
    coverImage: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80',
    capacity: 200,
    rsvpCount: 167,
    status: 'upcoming',
    registrationRequired: true,
    organizer: 'CivicLink Digital Team',
    organizerAm: 'የሲቪክሊንክ ዲጂታል ቡድን',
    isFeatured: false,
  },
  {
    id: 'event-5',
    type: 'event',
    title: 'Fayda National ID Registration Weekend Camp in Lemi Kura',
    titleAm: 'የፋይዳ ብሔራዊ መታወቂያ ምዝገባ የሳምንቱ መጨረሻ ልዩ ዘመቻ በለሚ ኩራ',
    slug: 'fayda-id-weekend-registration-camp',
    summary: 'Fast-track biometric enrollment for residents of Lemi Kura woredas 01 through 08 with extended stations.',
    summaryAm: 'በለሚ ኩራ ክፍለ ከተማ ከወረዳ 01 እስከ 08 ለሚኖሩ ነዋሪዎች የተዘጋጀ ፈጣን የፋይዳ ባዮሜትሪክ መታወቂያ ምዝገባ።',
    content: `The National ID Program (Fayda) in collaboration with the Lemi Kura Sub-city Administration is staging a multi-station enrollment weekend. Over 20 biometric capture desks will operate continuously. Bring your existing Kebele ID or passport.`,
    contentAm: `የብሔራዊ መታወቂያ ፕሮግራም ከለሚ ኩራ ክፍለ ከተማ ጋር በመተባበር ከ20 በላይ የመመዝገቢያ ጣቢያዎችን በማዘጋጀት ፈጣን አገልግሎት ይሰጣል።`,
    eventDate: '2026-11-14',
    endDate: '2026-11-15',
    time: '08:30 AM – 04:30 PM',
    timeAm: 'ከጠዋቱ 2:30 – 10:30',
    location: {
      venue: 'Lemi Kura Woreda 08 Administrative Complex',
      venueAm: 'የለሚ ኩራ ወረዳ 08 የአስተዳደር ህንፃ',
      address: 'Ayat Zone 2',
      addressAm: 'አያት ዞን 2',
      subCity: 'Lemi Kura',
      subCityAm: 'ለሚ ኩራ',
      isVirtual: false,
    },
    category: 'Citizen Registration',
    categoryAm: 'የዜጎች ምዝገባ',
    bureau: 'National ID Program & CRRSA',
    bureauAm: 'የብሔራዊ መታወቂያ ፕሮግራም',
    coverImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
    capacity: 1000,
    rsvpCount: 820,
    status: 'upcoming',
    registrationRequired: false,
    organizer: 'National ID Authority',
    organizerAm: 'የብሔራዊ መታወቂያ ባለስልጣን',
    isFeatured: false,
  },
  {
    id: 'event-6',
    type: 'event',
    title: 'Women in Business: Licensing & Access to Micro-Finance Fair',
    titleAm: 'ሴቶች በንግድ፡ የንግድ ፈቃድና የአነስተኛ ብድር አቅርቦት አውደ ርዕይ',
    slug: 'women-business-licensing-finance-fair',
    summary: 'Meet micro-finance institutions, receive on-the-spot trade registration guidance, and attend financial literacy seminars.',
    summaryAm: 'የብድር ተቋማትን በአንድ ቦታ የሚያገኙበት፣ የንግድ ፈቃድ የሚያወጡበትና የፋይናንስ እውቀት የሚቀስሙበት አውደ ርዕይ።',
    content: `Organized by the City Government Trade Bureau and the Women, Children & Social Affairs Bureau. Discover low-interest loans, collateral-free credit products, and free bookkeeping toolkits designed for women-led enterprises.`,
    contentAm: `በንግድ ቢሮ እና በሴቶችና ማህበራዊ ጉዳይ ቢሮ የተዘጋጀ አውደ ርዕይ ሲሆን ዝቅተኛ ወለድ ያላቸው ብድሮችና የንግድ ድጋፎች ይቀርባሉ።`,
    eventDate: '2026-11-20',
    endDate: '2026-11-21',
    time: '09:00 AM – 05:00 PM',
    timeAm: 'ከጠዋቱ 3:00 – 11:00',
    location: {
      venue: 'Addis Ketema Trade Hall & Bazaar Grounds',
      venueAm: 'የአዲስ ከተማ የንግድ አዳራሽና ባዛር ማዕከል',
      address: 'Autobus Tera, Addis Ketema',
      addressAm: 'አውቶቡስ ተራ፣ አዲስ ከተማ',
      subCity: 'Addis Ketema',
      subCityAm: 'አዲስ ከተማ',
      isVirtual: false,
    },
    category: 'Commerce & Enterprise',
    categoryAm: 'ንግድና ስራ ፈጠራ',
    bureau: 'City Government Trade Bureau',
    bureauAm: 'የከተማ ንግድ ቢሮ',
    coverImage: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80',
    capacity: 400,
    rsvpCount: 310,
    status: 'upcoming',
    registrationRequired: true,
    organizer: 'Trade Bureau & Women Enterprise Agency',
    organizerAm: 'የንግድ ቢሮ እና የሴቶች ስራ ፈጠራ ኤጀንሲ',
    isFeatured: false,
  },
  {
    id: 'event-7',
    type: 'event',
    title: 'Urban Agriculture & Household Gardening Expo 2026',
    titleAm: 'የከተማ ግብርና እና የጓሮ አትክልት ልማት ኤክስፖ 2026',
    slug: 'urban-agriculture-household-gardening-expo',
    summary: 'Learn vertical farming, hydroponics, rooftop vegetable growing, and urban poultry methods suitable for city homes.',
    summaryAm: 'በከተማ ውስጥ በጓሮ፣ በረንዳና ጣሪያ ላይ አትክልትና ፍራፍሬ እንዲሁም ዶሮ የማርባት ዘመናዊ ዘዴዎችን ይማሩ።',
    content: `Learn practical techniques to enhance household food security. Free seed packets, organic soil conditioning samples, and compact greenhouse blueprints will be distributed to attendees.`,
    contentAm: `የቤተሰብ የምግብ ዋስትናን ለማረጋገጥ የሚረዱ ዘመናዊ የከተማ ግብርና ዘዴዎችን ይማሩ። የነጻ የዘር ፓኬቶችም ይሰጣሉ።`,
    eventDate: '2026-11-28',
    endDate: '2026-11-29',
    time: '09:00 AM – 04:30 PM',
    timeAm: 'ከጠዋቱ 3:00 – 10:30',
    location: {
      venue: 'Gulele Botanical Garden & Research Center',
      venueAm: 'የጉለሌ እፅዋት ማዕከልና መናፈሻ',
      address: 'Entoto Foothills, Gulele',
      addressAm: 'እንጦጦ ግርጌ፣ ጉለሌ',
      subCity: 'Gulele',
      subCityAm: 'ጉለሌ',
      isVirtual: false,
    },
    category: 'Urban Agriculture',
    categoryAm: 'የከተማ ግብርና',
    bureau: 'Farmers & Urban Agriculture Commission',
    bureauAm: 'የከተማ ግብርና ልማት ኮሚሽን',
    coverImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80',
    capacity: 350,
    rsvpCount: 220,
    status: 'upcoming',
    registrationRequired: false,
    organizer: 'Urban Green Commission',
    organizerAm: 'የከተማ አረንጓዴ ልማት ኮሚሽን',
    isFeatured: false,
  },
  {
    id: 'event-8',
    type: 'event',
    title: 'Senior Citizens Public Service Assistance Day at Lideta Sub-City',
    titleAm: 'በልደታ ክፍለ ከተማ ለአረጋውያን የተዘጋጀ ልዩ የህዝብ አገልግሎት ቀን',
    slug: 'senior-citizens-service-day-lideta',
    summary: 'Dedicated priority counters for pension records, residence ID updates, and healthcare coverage for citizens aged 65 and above.',
    summaryAm: 'ዕድሜያቸው ከ65 ዓመት በላይ ለሆኑ አረጋውያን የጡረታ ሰነዶችንና የነዋሪነት መታወቂያዎችን ያለ ወረፋ የሚያድሱበት ልዩ ቀን።',
    content: `Lideta sub-city designates this special day with zero wait times, wheelchair assistance, free blood pressure checks, and warm tea service for respected senior citizens.`,
    contentAm: `በዚህ ልዩ ቀን ለአረጋውያን ፈጣን አገልግሎት፣ የዊልቸር ድጋፍ፣ ነጻ የጤና ምርመራ እና የሻይ መስተንግዶ ተዘጋጅቷል።`,
    eventDate: '2026-12-05',
    endDate: '2026-12-05',
    time: '09:00 AM – 01:00 PM',
    timeAm: 'ከጠዋቱ 3:00 – 7:00',
    location: {
      venue: 'Lideta Sub-City Main Service Hall',
      venueAm: 'የልደታ ክፍለ ከተማ ዋና አገልግሎት አዳራሽ',
      address: 'Balcha Hospital Road, Lideta',
      addressAm: 'ባልቻ ሆስፒታል መንገድ፣ ልደታ',
      subCity: 'Lideta',
      subCityAm: 'ልደታ',
      isVirtual: false,
    },
    category: 'Citizen Care',
    categoryAm: 'የዜጎች እንክብካቤ',
    bureau: 'Social Affairs Bureau & Sub-city',
    bureauAm: 'የማህበራዊ ጉዳይ ቢሮ',
    coverImage: 'https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&w=1200&q=80',
    capacity: 150,
    rsvpCount: 92,
    status: 'upcoming',
    registrationRequired: false,
    organizer: 'Lideta Social Welfare Team',
    organizerAm: 'የልደታ ማህበራዊ ደህንነት ቡድን',
    isFeatured: false,
  },
  {
    id: 'event-9',
    type: 'event',
    title: 'Digital Property Registration Q&A Session for Kolfe Keranio Landholders',
    titleAm: 'የዲጂታል ይዞታ ምዝገባ ጥያቄና መልስ ለቆልፌ ቀራኒዮ ነዋሪዎች',
    slug: 'kolfe-land-registration-qa',
    summary: 'Get answers regarding title deeds, property succession, building permit transfers, and land leasing updates.',
    summaryAm: 'ስለ ካርታ፣ ስለ ንብረት ውርስ፣ ስለ ግንባታ ፈቃድ ዝውውርና ስለ መሬት ሊዝ መረጃ የሚያገኙበት የጥያቄና መልስ መድረክ።',
    content: `Land administration specialists and legal advisors from the Land Development & Administration Bureau will review common title transfer bottlenecks and clarify required supporting documents.`,
    contentAm: `የመሬት ልማትና አስተዳደር ህግ ባለሙያዎች የካርታ ማስተላለፍ ሂደቶችን በማብራራት ለነዋሪዎች ጥያቄዎች መልስ ይሰጣሉ።`,
    eventDate: '2026-12-12',
    endDate: '2026-12-12',
    time: '10:00 AM – 01:00 PM',
    timeAm: 'ከጠዋቱ 4:00 – 7:00',
    location: {
      venue: 'Kolfe Keranio Woreda 03 Community Pavilion',
      venueAm: 'የቆልፌ ቀራኒዮ ወረዳ 03 የህብረተሰብ አዳራሽ',
      address: 'Near Zenebework Square',
      addressAm: 'ዘነበወርቅ አደባባይ አጠገብ',
      subCity: 'Kolfe Keranio',
      subCityAm: 'ቆልፌ ቀራኒዮ',
      isVirtual: false,
    },
    category: 'Land & Legal',
    categoryAm: 'መሬትና ህግ',
    bureau: 'Land Development & Administration Bureau',
    bureauAm: 'የመሬት ልማትና አስተዳደር ቢሮ',
    coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    capacity: 250,
    rsvpCount: 175,
    status: 'upcoming',
    registrationRequired: true,
    organizer: 'Land Bureau Legal Advisory',
    organizerAm: 'የመሬት ቢሮ ህግ አማካሪ ክፍል',
    isFeatured: false,
  },
  {
    id: 'event-10',
    type: 'event',
    title: 'CivicLink Annual Feedback Summit: Listening to 100,000 Citizen Voices',
    titleAm: 'የሲቪክሊንክ የዓመቱ የማጠቃለያ ጉባኤ፡ 100 ሺህ የዜጎች ድምፆች ግምገማ',
    slug: 'civiclink-annual-feedback-summit',
    summary: 'Presentation of the 2026 public service satisfaction report, best performing sub-city awards, and future civic roadmap.',
    summaryAm: 'የ2026 የህዝብ አገልግሎት እርካታ ሪፖርት፣ ከፍተኛ ውጤት ላስመዘገቡ ክፍለ ከተሞች የሚሰጥ እውቅና እና የቀጣይ እቅዶች ይፋ ይደረጋሉ።',
    content: `Celebrate progress in Ethiopian public service delivery. Highlights will include rankings of the fastest bureau response times, recognition of outstanding front-desk civil servants, and the launch of AI-assisted multilingual service navigation.`,
    contentAm: `በህዝብ አገልግሎት የተገኙ ስኬቶችን በመገምገም ፈጣን አገልግሎት ለሰጡ ቢሮዎች ሽልማት የሚሰጥበትና አዳዲስ ዲጂታል አሰራሮች የሚተዋወቁበት ትልቅ ጉባኤ ነው።`,
    eventDate: '2026-12-19',
    endDate: '2026-12-19',
    time: '09:00 AM – 02:00 PM',
    timeAm: 'ከጠዋቱ 3:00 – 8:00',
    location: {
      venue: 'African Union New Conference Complex, Plenary Hall',
      venueAm: 'የአፍሪካ ህብረት የስብሰባ ማዕከል',
      address: 'Roosevelt Street, Kirkos',
      addressAm: 'ሩዝቬልት ጎዳና፣ ቂርቆስ',
      subCity: 'Kirkos',
      subCityAm: 'ቂርቆስ',
      isVirtual: true,
      virtualLink: 'https://live.civiclink.et/summit-2026',
    },
    category: 'Annual Summit',
    categoryAm: 'ዓመታዊ ጉባኤ',
    bureau: 'Mayor’s Office & CivicLink Team',
    bureauAm: 'የከንቲባ ጽ/ቤትና የሲቪክሊንክ ቡድን',
    coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    capacity: 600,
    rsvpCount: 540,
    status: 'upcoming',
    registrationRequired: true,
    organizer: 'CivicLink Ethiopia & City Administration',
    organizerAm: 'ሲቪክሊንክ ኢትዮጵያና የከተማ አስተዳደሩ',
    isFeatured: true,
  },
];

/**
 * Filter helper for mock dataset
 */
function filterItems(items, { category = 'all', subCity = 'all', search = '' }) {
  let filtered = [...items];

  if (category && category !== 'all') {
    filtered = filtered.filter(
      (item) => (item.category || '').toLowerCase() === category.toLowerCase()
    );
  }

  if (subCity && subCity !== 'all') {
    filtered = filtered.filter(
      (item) => {
        const itemSubCity = item.subCity || item.location?.subCity || ''
        return itemSubCity.toLowerCase().includes(subCity.toLowerCase()) || itemSubCity.toLowerCase().includes('all')
      }
    );
  }

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(
      (item) =>
        (item.title || '').toLowerCase().includes(q) ||
        (item.titleAm && item.titleAm.includes(q)) ||
        (item.summary || '').toLowerCase().includes(q) ||
        (item.summaryAm && item.summaryAm.includes(q)) ||
        (item.bureau || '').toLowerCase().includes(q) ||
        (item.tags && item.tags.some((tag) => tag.toLowerCase().includes(q)))
    );
  }

  return filtered;
}

/**
 * Fetch top 3 highlights for the home page (Instant or fast response)
 */
export async function getHomeHighlights() {
  if (USE_REAL_BACKEND) {
    try {
      const res = await fetch(`${API_BASE_URL}/home-highlights`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Real backend fetch failed, using fallback mock highlights', err);
    }
  }

  // Simulated quick delay
  await new Promise((resolve) => setTimeout(resolve, 80));

  const items = getPublishedNewsEvents()
  const news = items.filter((item) => item.type === 'news')
  const events = items.filter((item) => item.type === 'event')
  return {
    news: news.slice(0, 3),
    events: events.slice(0, 3),
    totalNews: news.length,
    totalEvents: events.length,
  }
}

async function fetchBackendNews() {
  try {
    const res = await fetch('/api/v1/news');
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      return json.data.map((art) => ({
        id: String(art.id),
        type: 'news',
        title: art.news_title,
        titleAm: '',
        slug: `news-${art.id}`,
        summary: art.contents?.[0]?.content || 'Official Municipal Announcement',
        summaryAm: '',
        content: art.contents?.map((c) => c.content).join('\n\n') || '',
        contentAm: '',
        category: 'Public notice',
        categoryAm: 'ይፋዊ ማስታወቂያ',
        subCity: art.organization?.name || 'All Addis Ababa',
        subCityAm: 'መላው አዲስ አበባ',
        bureau: art.organization?.name || 'City Administration',
        bureauAm: 'የከተማ አስተዳደር',
        coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
        publishedAt: art.created_at ? art.created_at.split('T')[0] : '2026-10-26',
        readTimeMinutes: 3,
        isPublished: true,
      }));
    }
  } catch (err) {
    console.warn('Backend news query error, using local fallback:', err);
  }
  return null;
}

/**
 * Paginated API fetch for News items (YouTube-style continuous loading)
 */
export async function fetchNews({
  page = 1,
  limit = 6,
  category = 'all',
  subCity = 'all',
  search = '',
} = {}) {
  const liveNews = await fetchBackendNews();
  const newsSource = liveNews && liveNews.length > 0
    ? liveNews
    : getPublishedNewsEvents().filter((item) => item.type === 'news');

  const filtered = filterItems(newsSource, { category, subCity, search });
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const items = filtered.slice(startIndex, endIndex);
  const total = filtered.length;
  const hasMore = endIndex < total;

  return {
    items,
    page,
    limit,
    total,
    hasMore,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Paginated API fetch for Events items (YouTube-style continuous loading)
 */
export async function fetchEvents({
  page = 1,
  limit = 6,
  category = 'all',
  subCity = 'all',
  search = '',
} = {}) {
  if (USE_REAL_BACKEND) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      category,
      subCity,
      search,
    });
    const res = await fetch(`${API_BASE_URL}/events?${params}`);
    if (!res.ok) throw new Error(`Failed to fetch events: ${res.statusText}`);
    return await res.json();
  }

  // Simulated backend network delay
  await new Promise((resolve) => setTimeout(resolve, 150));

  const filtered = filterItems(getPublishedNewsEvents().filter((item) => item.type === 'event'), { category, subCity, search });
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const items = filtered.slice(startIndex, endIndex);
  const total = filtered.length;
  const hasMore = endIndex < total;

  return {
    items,
    page,
    limit,
    total,
    hasMore,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Combined Feed: News & Events together (sorted chronologically)
 */
export async function fetchCombinedFeed({
  page = 1,
  limit = 6,
  category = 'all',
  subCity = 'all',
  search = '',
} = {}) {
  let liveNews = [];
  try {
    liveNews = (await fetchBackendNews()) || [];
  } catch {
    liveNews = [];
  }

  const events = getPublishedNewsEvents().filter((item) => item.type === 'event');
  const fallbackNews = getPublishedNewsEvents().filter((item) => item.type === 'news');
  const newsSource = liveNews.length > 0 ? liveNews : fallbackNews;

  const allItems = [...newsSource, ...events].sort((a, b) => {
    const dateA = a.type === 'event' ? a.eventDate : a.publishedAt;
    const dateB = b.type === 'event' ? b.eventDate : b.publishedAt;
    return new Date(dateB) - new Date(dateA);
  });

  const filtered = filterItems(allItems, { category, subCity, search });
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const items = filtered.slice(startIndex, endIndex);
  const total = filtered.length;
  const hasMore = endIndex < total;

  return {
    items,
    page,
    limit,
    total,
    hasMore,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Lookup single item by ID
 */
export async function getItemById(id) {
  try {
    const res = await fetch(`/api/v1/news/${id}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const art = json.data;
        return {
          id: String(art.id),
          type: 'news',
          title: art.news_title,
          titleAm: '',
          slug: `news-${art.id}`,
          summary: art.contents?.[0]?.content || '',
          summaryAm: '',
          content: art.contents?.slice(1).map((c) => c.content).join('\n\n') || art.contents?.[0]?.content || '',
          contentAm: '',
          category: 'Public notice',
          categoryAm: 'ይፋዊ ማስታወቂያ',
          subCity: art.organization?.name || 'All Addis Ababa',
          subCityAm: 'መላው አዲስ አበባ',
          bureau: art.organization?.name || 'City Administration',
          bureauAm: 'የከተማ አስተዳደር',
          author: {
            name: art.organization?.name || 'Communications Directorate',
            nameAm: art.organization?.name || 'የኮሙኒኬሽን ዳይሬክቶሬት',
            role: 'Official Municipal Bureau',
            roleAm: 'ይፋዊ የማዘጋጃ ቤት ቢሮ',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          },
          coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
          publishedAt: art.created_at ? art.created_at.split('T')[0] : '2026-10-26',
          readTimeMinutes: Math.max(1, Math.ceil((art.contents?.reduce((acc, c) => acc + (c.content?.length || 0), 0) || 500) / 400)),
          isPublished: true,
          tags: [art.organization?.name || 'Addis Ababa', 'Public Notice', 'Citizen Services'],
        };
      }
    }
  } catch (err) {
    console.warn('Backend getItemById error:', err);
  }

  const item = getPublishedNewsEvents().find(
    (entry) => String(entry.id) === String(id) || String(entry.id) === `news-${id}` || String(entry.id) === `event-${id}`
  );
  return item || null;
}


/**
 * Get related items for recommendations on detail page
 */
export function getRelatedItems(currentItem, count = 3) {
  if (!currentItem) return [];
  const pool = getPublishedNewsEvents().filter((item) => item.type === currentItem.type)
  return pool.filter((item) => item.id !== currentItem.id).slice(0, count);
}

/**
 * Simulated RSVP submission for an event
 */
export async function submitEventRsvp(eventId, rsvpData) {
  if (USE_REAL_BACKEND) {
    const res = await fetch(`${API_BASE_URL}/events/${eventId}/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rsvpData),
    });
    if (!res.ok) throw new Error('RSVP submission failed');
    return await res.json();
  }

  await new Promise((resolve) => setTimeout(resolve, 600));

  const storedItems = readSharedNewsEvents([...MOCK_NEWS, ...MOCK_EVENTS])
  const event = storedItems.find((item) => item.id === eventId && item.type === 'event')
  if (event) {
    event.rsvpCount = (event.rsvpCount || 0) + 1;
    writeSharedNewsEvents(storedItems)
  }

  return {
    success: true,
    message: 'RSVP confirmed successfully! A reminder has been scheduled.',
    rsvpCount: event ? event.rsvpCount : 1,
  };
}
