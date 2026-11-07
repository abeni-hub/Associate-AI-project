
export const ROLE = {
  super: { label: 'Super admin', title: 'Platform administration', organization: 'CivicLink Ethiopia', name: 'Mekdes Tadesse', initials: 'MT' },
  subcity: { label: 'Sub-city admin', title: 'Sub-city administration', organization: 'Lemi Kura Sub-city', name: 'Aster Bekele', initials: 'AB' },
  bureau: { label: 'Bureau admin', title: 'Bureau operations', organization: 'Revenues Bureau · Lemi Kura', name: 'Dawit Alemu', initials: 'DA' },
}

export const NAV = {
  super: [
    { label: '', items: [{ id: 'overview', text: 'Overview', icon: 'overview' }, { id: 'offices', text: 'Offices & directory', icon: 'sitemap' }, { id: 'levels', text: 'Organization levels', icon: 'layers' }, { id: 'accounts', text: 'Accounts', icon: 'users' }, { id: 'roles', text: 'Roles & permissions', icon: 'key' }] },
    { label: 'Public experience', items: [{ id: 'cms', text: 'Landing page CMS', icon: 'palette' }, { id: 'news', text: 'News & events', icon: 'news' }] },
    { label: 'Citizen voice', items: [{ id: 'feedback', text: 'Citizen feedback', icon: 'message', badge: '23' }, { id: 'activity', text: 'Activity log', icon: 'activity' }] },
  ],
  subcity: [
    { label: 'Workspace', items: [{ id: 'overview', text: 'Overview', icon: 'overview' }, { id: 'offices', text: 'Bureaus & offices', icon: 'sitemap' }, { id: 'services', text: 'Service standards', icon: 'layers' }] },
    { label: 'Community', items: [{ id: 'feedback', text: 'Citizen feedback', icon: 'message', badge: '8' }, { id: 'news', text: 'News & events', icon: 'news' }] },
  ],
  bureau: [
    { label: 'Workspace', items: [{ id: 'overview', text: 'Overview', icon: 'overview' }, { id: 'routes', text: 'Room routes', icon: 'route' }, { id: 'feedback', text: 'Citizen feedback', icon: 'message', badge: '5' }] },
    { label: 'Office tools', items: [{ id: 'qr', text: 'Feedback QR codes', icon: 'qr' }, { id: 'office', text: 'Office profile', icon: 'building' }] },
  ],
}

export const INITIAL_OFFICE_TYPES = [
  { id: 1, name: 'Sub-City', description: 'Municipal sub-city administrative center', level: 1 },
  { id: 2, name: 'Woreda', description: 'Local community administrative branch', level: 2 },
  { id: 3, name: 'Bureau', description: 'Specialized public service bureau or sector office', level: 3 },
  { id: 4, name: 'Service Center', description: 'Walk-in civic service desk or satellite branch', level: 4 },
]

export const INITIAL_OFFICES = []

export const INITIAL_ROLES = [
  {
    id: '1',
    name: 'Super Admin',
    slug: 'super_admin',
    scope: 'Platform',
    scope_level: 'global',
    description: 'Platform-wide administrator with full authority across all modules.',
    isSystem: true,
    permissionsCount: 38,
    permissionIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38],
    userCount: 2,
  },
  {
    id: '2',
    name: 'Sub-City Admin',
    slug: 'sub_city_admin',
    scope: 'Sub-city',
    scope_level: 'sub_city',
    description: 'Sub-City level administrator managing own organization and descendant Woredas/Bureaus.',
    isSystem: true,
    permissionsCount: 28,
    permissionIds: [1, 2, 3, 5, 6, 7, 8, 9, 12, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37],
    userCount: 11,
  },
  {
    id: '3',
    name: 'Woreda Admin',
    slug: 'woreda_admin',
    scope: 'Woreda',
    scope_level: 'woreda',
    description: 'Woreda level administrator managing Woreda operations and descendant Bureaus.',
    isSystem: true,
    permissionsCount: 20,
    permissionIds: [1, 5, 6, 7, 9, 12, 17, 19, 20, 21, 22, 23, 24, 26, 27, 28, 29, 31, 32, 33, 34, 35, 36],
    userCount: 45,
  },
  {
    id: '4',
    name: 'Bureau Admin',
    slug: 'bureau_admin',
    scope: 'Bureau',
    scope_level: 'bureau',
    description: 'Bureau level administrator managing Bureau staff, service steps, and own feedback.',
    isSystem: true,
    permissionsCount: 16,
    permissionIds: [1, 5, 12, 17, 19, 20, 21, 22, 23, 24, 26, 27, 28, 29, 31, 33, 34, 36],
    userCount: 30,
  },
  {
    id: '5',
    name: 'Operational Staff',
    slug: 'staff',
    scope: 'Staff',
    scope_level: 'staff',
    description: 'Operational government staff member with service navigation and feedback viewing rights.',
    isSystem: true,
    permissionsCount: 5,
    permissionIds: [12, 17, 19, 31, 36],
    userCount: 120,
  },
]

export const INITIAL_CMS_CONFIG = {
  announcement: {
    enabled: true,
    tag: '',
    message: 'One clear place to plan your next public service visit',
    linkText: 'Explore the guide',
    linkUrl: '#find-service',
  },
  hero: {
    badge: 'OFFICIAL CITIZEN PORTAL',
    titleEn: 'Know where to go. Arrive ready.',
    titleAm: 'አገልግሎት የት እንደሚሰጥ ይወቁ። ተዘጋጅተው ይድረሱ።',
    subtitleEn: 'The right information makes every visit easier. Find your service, prepare your documents, and know exactly where to go before you leave home.',
    subtitleAm: 'ትክክለኛው መረጃ እያንዳንዱን ጉብኝት ቀላል ያደርገዋል። ከአገርዎ ሳይወጡ አገልግሎትዎን ያግኙ፣ ሰነዶችዎን ያዘጋጁ እና የት መሄድ እንዳለቦት በትክክል ይወቁ።',
    primaryCtaText: 'Find a service',
    primaryCtaUrl: '#find-service',
    secondaryCtaText: 'I’ve already visited',
    secondaryCtaUrl: '#feedback',
    slides: [
      {
        id: 1,
        title: 'Revenue services, made clearer.',
        bureau: 'REVENUE BUREAU',
        category: 'Know what to prepare before you visit your local revenue office.',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Local_government_building%2C_Yeka_Subcity%2C_Addis_Ababa.jpg/1280px-Local_government_building%2C_Yeka_Subcity%2C_Addis_Ababa.jpg',
        alt: 'Local government office building in Yeka Subcity, Addis Ababa.',
        credit: 'Yeka Subcity Office · Mjr74 (CC BY 4.0)',
        source: 'https://commons.wikimedia.org/wiki/File:Local_government_building,_Yeka_Subcity,_Addis_Ababa.jpg',
        tint: '#164d58',
      },
      {
        id: 2,
        title: 'A better view of what’s next.',
        bureau: 'PLANNING & DEVELOPMENT',
        category: 'Find planning and development information for your community.',
        image: 'https://mopd.gov.et/media/492570380_994507082831520_8549139107595449985_n.jpg',
        alt: 'Officials meet at Ethiopia’s Ministry of Planning and Development.',
        credit: 'Ministry of Planning & Development',
        source: 'https://mopd.gov.et/',
        tint: '#365b63',
      },
      {
        id: 3,
        title: 'The right documents. The right place.',
        bureau: 'CIVIL REGISTRATION',
        category: 'Prepare for vital records and civil registration services.',
        image: 'https://aacrrsa.gov.et/uploads/Blog/662a29f023bf6.438697344_821273923352047_6926469178446352208_n.jpg',
        alt: 'The Addis Ababa Civil Registration and Residency Service Agency lobby.',
        credit: 'Civil Registration & Residency Service Agency',
        source: 'https://aacrrsa.gov.et/',
        tint: '#3b625e',
      },
      {
        id: 4,
        title: 'Find your way through land services.',
        bureau: 'LAND ADMINISTRATION',
        category: 'See what to bring and where to go for property record services.',
        image: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Lemikurasubcityworeda08.jpg',
        alt: 'Lemi Kura Woreda 08 local government office in Addis Ababa.',
        credit: 'Lemi Kura Woreda 08 · Khajitdadddy (CC BY-SA 4.0)',
        source: 'https://commons.wikimedia.org/wiki/File:Lemikurasubcityworeda08.jpg',
        tint: '#536458',
      },
    ],
  },
  quickSearch: {
    enabled: true,
    kicker: 'START HERE',
    kickerNum: '01',
    title: 'What do you need help with?',
    subtitle: 'Choose a location and service to see your visit guide.',
    buttonText: 'Show my guide',
    footnoteText: 'Takes less than a minute · No account needed',
  },
  serviceGuide: {
    enabled: true,
    kicker: 'YOUR VISIT GUIDE',
    kickerNum: '02',
    titleLead: 'A clearer path,',
    titleEmphasis: 'step by step.',
    description: 'Know what to bring and which room to visit, before you set off. The sample guide below shows how service details will appear.',
    sampleBadgeText: 'SAMPLE GUIDE',
    whatToBringTitle: 'What to bring',
    expectationsNote: 'Bring original documents where available. Ask the bureau if requirements have changed.',
    routeHeading: 'Your room-by-room route',
    disclaimerText: 'Illustrative example only. Bureaus will publish and maintain official requirements and room numbers in the live system.',
  },
  journey: {
    enabled: true,
    kicker: 'HOW IT WORKS',
    kickerNum: '03',
    title: 'From the moment you start planning to the moment you share your experience, everything you need is easy to find.',
    steps: [
      { step: '01', title: 'Prepare with confidence.', detail: 'Choose your service and see the requirements, expectations, and room numbers before you leave home.' },
      { step: '02', title: 'Go straight to the right room.', detail: 'Follow your step-by-step guide inside the bureau. Spend less time finding your way around.' },
      { step: '03', title: 'Share what you experienced.', detail: 'Leave a complaint, suggestion, or satisfaction rating on the page or with an office QR code.' },
    ],
  },
  newsEvents: {
    enabled: true,
    kicker: 'FROM YOUR COMMUNITY',
    kickerNum: '04',
    title: 'What’s happening near you.',
    sourceLabel: 'Published by sub-city admins',
    showEvents: true,
    showNews: true,
    viewAllText: 'Explore news & events hub',
    emptyMessage: 'No community updates published yet for this sub-city.',
  },
  feedback: {
    enabled: true,
    kicker: 'YOUR VOICE HELPS',
    kickerNum: '05',
    title: 'Every experience can make things better.',
    description: 'Tell us how your visit went. Your feedback reaches the right bureau and helps improve services for everyone.',
    pointOne: 'No account needed',
    pointTwo: 'Scan a bureau QR code',
    quote: 'Clear guidance before your visit. A simple way to be heard afterward.',
  },
  footer: {
    enabled: true,
    brandTagline: 'ETHIOPIA · CITIZEN SERVICES',
    description: 'Clearer information for every visit. A more responsive public service.',
    adminStripKicker: 'FOR PUBLIC SERVICE TEAMS',
    adminStripTitle: 'Manage information where it belongs.',
    adminStripDescription: 'Sub-city and bureau admins keep service guides, room routes, news, and feedback up to date.',
    copyright: '© 2026 CivicLink Ethiopia · Public service information platform',
    bottomNote: 'Built for citizens, maintained by bureaus.',
    helplinePhone: '7533',
  },
  stats: [
    { label: 'Sub-cities connected', value: '11' },
    { label: 'Bureaus registered', value: '86' },
    { label: 'Published services', value: '248' },
    { label: 'Citizen satisfaction', value: '94%' },
  ],
}

export const INITIAL_SUBCITIES = []
export const INITIAL_BUREAUS = []
export const INITIAL_ACCOUNTS = []
export const INITIAL_SERVICES = []
export const INITIAL_ROUTES = []
export const INITIAL_FEEDBACK = []
export const INITIAL_POSTS = []
export const INITIAL_ACTIVITIES = []
