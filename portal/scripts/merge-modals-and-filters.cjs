const fs = require('fs');
const path = require('path');

const enPath = path.resolve(__dirname, '../src/i18n/translations/en.json');
const amPath = path.resolve(__dirname, '../src/i18n/translations/am.json');
const omPath = path.resolve(__dirname, '../src/i18n/translations/om.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const am = JSON.parse(fs.readFileSync(amPath, 'utf8'));
const om = JSON.parse(fs.readFileSync(omPath, 'utf8'));

const additions = {
  common: {
    actions: { en: 'ACTIONS', am: 'እርምጃዎች', om: 'GOCHAWWAN' },
    status: { en: 'Status', am: 'ሁኔታ', om: 'Haala' },
    active: { en: 'Active', am: 'ንቁ', om: 'Hojirra kan jiru' },
    inactive: { en: 'Inactive', am: 'ቦዝኗል', om: 'Hojirra kan hin jirre' },
    edit: { en: 'Edit', am: 'አርትዕ', om: 'Gulaali' },
    delete: { en: 'Delete', am: 'ሰርዝ', om: 'Haqi' },
    total: { en: 'total', am: 'ጠቅላላ', om: 'ida\'ama' },
    synchronized: { en: 'Synchronized', am: 'የተመሳሰለ', om: 'Walsimateera' },
    saving: { en: 'Saving...', am: 'በማስቀመጥ ላይ...', om: 'Olkaawaa jira...' },
    copied: { en: 'Copied!', am: 'ተቀድቷል!', om: 'Garagalmfameera!' },
    copy: { en: 'Copy', am: 'ቅዳ', om: 'Garagalchi' },
    notAssigned: { en: 'Not assigned', am: 'አልተመደበም', om: 'Hin ramadamne' },
    notProvided: { en: 'Not provided', am: 'አልተገለጸም', om: 'Hin kennamne' },
  },
  qr: {
    defaultOrg: { en: 'Default Administrative Office', am: 'መደበኛ አስተዳደራዊ መሥሪያ ቤት', om: 'Waajjira Bulchiinsaa Idilee' },
    citizenScanHint: { en: 'Citizens can scan to submit feedback without login.', am: 'ዜጎች መግባት ሳያስፈልጋቸው አስተያየት ለመስጠት መቃኘት ይችላሉ።', om: 'Lammiileen osoo hin seenin yaada kennuuf iskaan gochuu danda\'u.' },
    urlRequired: { en: 'Please enter a valid HTTP/HTTPS destination URL.', am: 'እባክዎ ትክክለኛ HTTP/HTTPS መድረሻ ዩአርኤል ያስገቡ።', om: 'Moo deestineeshiinii HTTP/HTTPS sirrii ta\'e galchaa.' },
    createFailed: { en: 'Failed to generate QR poster. Ensure the code is unique.', am: 'የQR ፖስተር ማመንጨት አልተሳካም። ኮዱ ልዩ መሆኑን ያረጋግጡ።', om: 'Poostara QR oomishuun hin danda\'amne. Koodiin kan addaa ta\'uu mirkaneessaa.' },
  },
  accounts: {
    adminAccounts: { en: 'Administrator accounts', am: 'የአስተዳዳሪ መለያዎች', om: 'Herreggoota Bulchitootaa' },
    adminAccountsDesc: { en: 'Role and organization determine what each admin can see and manage.', am: 'ሚና እና መሥሪያ ቤት እያንዳንዱ አስተዳዳሪ ምን ማየት እና ማስተዳደር እንደሚችል ይወስናሉ።', om: 'Gaheen fi dhaabbati bulchaan tokko maal akka argu fi bulchu murteessu.' },
    searchAccounts: { en: 'Search accounts', am: 'መለያዎችን ይፈልጉ', om: 'Herreggoota barbaadi' },
    exportList: { en: 'Export list', am: 'ዝርዝር ላክ', om: 'Tarree ergi' },
    totalAccountsDesc: { en: 'Across administrative hierarchy', am: 'በአስተዳደራዊ መዋቅሩ ውስጥ', om: 'Caasaa bulchiinsaa keessatti' },
    accessConfirmed: { en: 'Access confirmed', am: 'ፈቃድ ተረጋግጧል', om: 'Hayyamni mirkanaa\'eera' },
    inactiveAccounts: { en: 'Inactive accounts', am: 'ቦዝነዋል መለያዎች', om: 'Herreggoota hojiirra hin jirre' },
    accessSuspended: { en: 'Access suspended', am: 'መዳረሻ ታግዷል', om: 'Hayyamni daangeffameera' },
    securityAudits: { en: 'Security audits', am: 'የደህንነት ቁጥጥር', om: 'Oodiitii Nageenyaa' },
    connectedSanctum: { en: 'Connected to Laravel Sanctum', am: 'ከLaravel Sanctum ጋር ተገናኝቷል', om: 'Laravel Sanctum wajjin walqabateera' },
    accessGovernance: { en: 'ACCESS & AUTHORIZATION GOVERNANCE', am: 'የመዳረሻ እና ፈቃድ አስተዳደር', om: 'BULCHIINSA HAYYAMA FI SEENSAA' },
    editUserRoleModalTitle: { en: 'Edit Administrator Role & Permissions', am: 'የአስተዳዳሪ ሚና እና ፈቃዶችን አርትዕ', om: 'Gahee fi Hayyama Bulchaa Gulaali' },
    editUserRoleModalDesc: { en: 'Configure role tier, jurisdictional scope, and granular permissions for this child user account.', am: 'ለዚህ የተጠቃሚ መለያ የሚና ደረጃ፣ የስልጣን ወሰን እና ዝርዝር ፈቃዶችን ያዋቅሩ።', om: 'Herrega fayyadamaa kanaaf sadarkaa gahee, daangaa aangoo fi hayyamoota qindeessi.' },
    childAccountBadge: { en: 'Child User Account', am: 'የተጠቃሚ መለያ', om: 'Herrega Fayyadamaa' },
    effectivePermissions: { en: 'Effective Permissions', am: 'ተፈፃሚ ፈቃዶች', om: 'Hayyamoota Hojiirra Jiran' },
    activePerms: { en: 'Active', am: 'ንቁ', om: 'Hojiirra kan jiru' },
    selectRoleStep: { en: '1. Select Role Assignment', am: '1. የሚና ምደባ ይምረጡ', om: '1. Ramaddii Gahee Filadhu' },
    rolePresetDesc: { en: 'Role presets baseline permissions', am: 'ሚና መሠረታዊ ፈቃዶችን አስቀድሞ ይወስናል', om: 'Gaheen hayyamoota bu\'uuraa dursanii murteessa' },
    currentBadge: { en: 'Current', am: 'ወቅታዊ', om: 'Ammaa' },
    updatePermsStep: { en: '2. Update Child User Permissions', am: '2. የተጠቃሚ ፈቃዶችን ያዘምኑ', om: '2. Hayyama Fayyadamaa Haaromsi' },
    permsActive: { en: 'permissions active', am: 'ፈቃዶች ንቁ ናቸው', om: 'hayyamoonni hojiirra jiru' },
    syncingRoleDefaults: { en: 'Syncing role defaults...', am: 'የሚና ነባሪዎችን በማመሳሰል ላይ...', om: 'Dursaalee gahee walsimsiisaa jira...' },
    clickCheckboxHint: { en: 'Click any checkbox to grant or revoke specific permissions for this account.', am: 'ለዚህ መለያ የተወሰኑ ፈቃዶችን ለመስጠት ወይም ለመሰረዝ ማንኛውንም ሳጥን ይጫኑ።', om: 'Herrega kanaaf hayyama murtaa\'e kennuuf yookiin haqachuuf saanduqa filadhu.' },
    grantAll: { en: 'Grant All', am: 'ሁሉንም ፍቀድ', om: 'Hunda Hayyami' },
    clearAll: { en: 'Clear All', am: 'ሁሉንም አፅዳ', om: 'Hunda Haqi' },
    resetToDefaults: { en: 'Reset to Defaults', am: 'ወደ ነባሪ መልስ', om: 'Gara Durseetti Deebisi' },
    searchPermsPlaceholder: { en: 'Search permissions by name, key, domain...', am: 'ፈቃዶችን በስም፣ ቁልፍ፣ ዘርፍ ይፈልጉ...', om: 'Hayyamoota maqaa, furtuu, dameedhaan barbaadi...' },
    grantedBadge: { en: '✓ GRANTED', am: '✓ ተፈቅዷል', om: '✓ HAYYAMAMEERA' },
    revokedBadge: { en: 'REVOKED', am: 'ተሰርዟል', om: 'HAQAMEERA' },
    noPermsMatch: { en: 'No permissions match', am: 'ተዛማጅ ፈቃድ አልተገኘም', om: 'Hayyamni walsimu hin argamne' },
    clearSearchFilter: { en: 'Clear search filter', am: 'የፍለጋ ማጣሪያውን አፅዳ', om: 'Calaltuu barbaacha qulqulleessi' },
    auditLogNote: { en: 'Child user permission changes trigger security audit logs.', am: 'የተጠቃሚ ፈቃድ ለውጦች የደህንነት ኦዲት ምዝገባን ያስነሳሉ።', om: 'Jijjiiramni hayyamaa galmee oodiitii nageenyaa kakaasa.' },
    saveUserPerms: { en: 'Save user permissions', am: 'የተጠቃሚ ፈቃዶችን አስቀምጥ', om: 'Hayyama fayyadamaa olkaawi' },
  },
  documents: {
    cataloguedDocs: { en: 'Catalogued documents', am: 'የተመዘገቡ ሰነዶች', om: 'Sanadoota galmaa\'an' },
    standardCitizenReqs: { en: 'Standard citizen requirements', am: 'መደበኛ የዜጎች መስፈርቶች', om: 'Ulaagaalee lammiilee idilee' },
    activeReqs: { en: 'Active requirements', am: 'ንቁ መስፈርቶች', om: 'Ulaagaalee hojiirra jiran' },
    readyForChecklists: { en: 'Ready for service checklists', am: 'ለአገልግሎት ዝርዝር ዝግጁ', om: 'Tarree tajaajilaaf qophii' },
    attachedToServices: { en: 'Attached to services', am: 'ከአገልግሎቶች ጋር የተያያዙ', om: 'Tajaajiloota wajjin walqabatan' },
    totalAssociations: { en: 'total service associations', am: 'አጠቃላይ የአገልግሎት ትስስሮች', om: 'walitti dhufeenya tajaajilaa waliigalaa' },
    standardCompliance: { en: 'Standard compliance', am: 'የመስፈርት ተገዢነት', om: 'Walsimannaa ulaagaa' },
    cityWideStandard: { en: 'City-wide verification standard', am: 'ከተማ አቀፍ የማረጋገጫ መስፈርት', om: 'Ulaagaa mirkaneessaa magaalaa guutuu' },
    docSpecs: { en: 'Document specifications', am: 'የሰነድ ዝርዝር መግለጫዎች', om: 'Ibsa sanadootaa' },
    showingDocs: { en: 'Showing document standards defined for public service delivery.', am: 'ለሕዝብ አገልግሎት አሰጣጥ የተገለጹ የሰነድ መስፈርቶች ይታያሉ።', om: 'Ulaagaalee sanadaa tajaajila ummataaf qophaa\'an mul\'isa.' },
    tableDocStandard: { en: 'DOCUMENT STANDARD & CODE', am: 'የሰነድ መመዘኛ እና ኮድ', om: 'ULAAGAA SANADAA FI KOODII' },
    tableDesc: { en: 'DESCRIPTION & ACCEPTABLE CRITERIA', am: 'መግለጫ እና ተቀባይነት ያላቸው መስፈርቶች', om: 'IBSI FI ULAAGAALEE FUDHATAMA QABAN' },
    tableTemplate: { en: 'SAMPLE TEMPLATE', am: 'የናሙና ቅጽ', om: 'FAKKEENYA FOORMII' },
    tableLinkedServices: { en: 'LINKED SERVICES', am: 'የተገናኙ አገልግሎቶች', om: 'TAJAAJILOOTA WALQABATAN' },
    tableStatus: { en: 'STATUS', am: 'ሁኔታ', om: 'HAALA' },
    noDocsFound: { en: 'No documents found', am: 'ምንም ሰነዶች አልተገኙም', om: 'Sanadni tokkollee hin argamne' },
    noDocsDesc: { en: 'Try adjusting your search query or reset your filters.', am: 'የፍለጋ ቃልዎን ያስተካክሉ ወይም ማጣሪያዎችን ዳግም ያስጀምሩ።', om: 'Barbaacha keessan sirreessaa yookiin calaltuu deebisaa.' },
  },
  levels: {
    statutoryRanks: { en: 'Statutory hierarchy ranks', am: 'ህጋዊ የተዋረድ ደረጃዎች', om: 'Sadarkaalee caasaa seera qabeessaa' },
    independentAuth: { en: 'Independent regional authorities', am: 'ገለልተኛ የከተማ ተቋማት', om: 'Aangoo naannoo of danda\'an' },
    availableInForms: { en: 'Available in office forms', am: 'በመሥሪያ ቤት ቅጾች ውስጥ ይገኛል', om: 'Foormii waajjiraa keessatti kan argamu' },
    tierLevels: { en: 'Hierarchy tier levels', am: 'የተዋረድ ደረጃ እርከኖች', om: 'Sadarkaalee caasaa bulchiinsaa' },
    tierLevelsDesc: { en: 'Offices choose from these tiers during registration to establish parent/child relationships.', am: 'መሥሪያ ቤቶች የበላይ/የበታች ግንኙነቶችን ለመመስረት በምዝገባ ወቅት ከእነዚህ እርከኖች ይመርጣሉ።', om: 'Waajjirleen yeroo galmee walitti dhufeenya caasaa uumuuf sadarkaalee kana keessaa filatu.' },
    tableRankLevel: { en: 'Rank Level', am: 'የእርከን ደረጃ', om: 'Sadarkaa' },
    tableTierName: { en: 'Tier Name & Code', am: 'የእርከን ስም እና ኮድ', om: 'Maqaa Sadarkaa fi Koodii' },
    tableStructure: { en: 'Hierarchy Structure', am: 'የተዋረድ መዋቅር', om: 'Caasaa Sadarkaa' },
    tableMandate: { en: 'Mandate Description', am: 'የስልጣን ወሰን መግለጫ', om: 'Ibsa Aangoo' },
    noLevelsFound: { en: 'No hierarchy levels found', am: 'ምንም የተዋረድ እርከኖች አልተገኙም', om: 'Sadarkaan caasaa hin argamne' },
    noLevelsDesc: { en: 'Try clearing your search query or reset your filters.', am: 'የፍለጋ ቃልዎን ያፅዱ ወይም ማጣሪያዎችን ዳግም ያስጀምሩ።', om: 'Barbaacha keessan qulqulleessaa yookiin calaltuu deebisaa.' },
  },
  news: {
    createUpdate: { en: 'Create an update', am: 'አዲስ መረጃ ፍጠር', om: 'Odeeffannoo haaraa uumi' },
    publicFeed: { en: 'Public client feed', am: 'ይፋዊ የዜጎች ምግብ', om: 'Facaatii ummataa' },
    updatesTitle: { en: 'Updates residents can use', am: 'ነዋሪዎች የሚጠቀሙባቸው መረጃዎች', om: 'Odeeffannoo jiraattonni itti fayyadaman' },
    feedDesc: { en: 'Published notices appear in the client app. Preview each update in English and Amharic before it goes live.', am: 'የታተሙ ማስታወቂያዎች በዜጎች መተግበሪያ ላይ ይታያሉ። ከመታተማቸው በፊት በእንግሊዝኛ እና በአማርኛ አስቀድመው ይመልከቱ።', om: 'Beeksisni maxxanfame mobaayila irratti mul\'ata. Osoo hin gadhiisifamin dura Ingiliffaa fi Afaan Oromootti dursitanii ilaalaa.' },
    totalUpdates: { en: 'Total updates', am: 'አጠቃላይ መረጃዎች', om: 'Odeeffannoo waliigalaa' },
    publishedEvents: { en: 'Published events', am: 'የታተሙ ዝግጅቶች', om: 'Sagantaalee maxxanfaman' },
    feedContent: { en: 'Client feed content', am: 'የይዘት ዝርዝር', om: 'Qabiyyee facaatii' },
    feedContentDesc: { en: 'Browse public cards, open the full detail, and manage publication.', am: 'ይፋዊ ካርዶችን ያስሱ፣ ሙሉ ዝርዝሩን ይክፈቱ እና ህትመትን ያስተዳድሩ።', om: 'Kaardiiwwan daawwadhaa, ibsa guutuu banaa, maxxansa bulchaa.' },
  },
  feedback: {
    exportFeedback: { en: 'Export feedback', am: 'አስተያየቶችን ላክ', om: 'Yaada ergi' },
    allResponses: { en: 'All responses', am: 'ሁሉም ምላሾች', om: 'Deebiiwwan hunda' },
    activeFeedbackQueue: { en: 'Active feedback queue', am: 'ንቁ የአስተያየት ቅደም ተከተል', om: 'Tarree yaadaa hojiirra jiru' },
    openItems: { en: 'Open items', am: 'ክፍት ጉዳዮች', om: 'Dhimmoota banamoo' },
    awaitingFirstReview: { en: 'Awaiting first review', am: 'የመጀመሪያ ምርመራ በመጠባበቅ ላይ', om: 'Gulaallii jalqabaa eegaa jira' },
    activelyBeingResolved: { en: 'Actively being resolved', am: 'በመፍትሔ ሂደት ላይ', om: 'Furmaata argachaa jira' },
    resolutionRate: { en: 'Resolution rate', am: 'የመፍትሔ ምጣኔ', om: 'Reeshioo furmaataa' },
    resolvedResponses: { en: 'Resolved responses', am: 'የተፈቱ ጉዳዮች', om: 'Dhimmoota furmaata argatan' },
    allCitizenResponses: { en: 'All citizen responses', am: 'ሁሉም የዜጎች አስተያየቶች', om: 'Yaada lammiilee hunda' },
    feedbackRoutedDesc: { en: 'Feedback is routed to the relevant bureau and sub-city teams.', am: 'አስተያየቶች ወደሚመለከተው ቢሮ እና ክፍለ ከተማ ቡድኖች ይተላለፋሉ።', om: 'Yaadni gara biiroo fi garee kutaa magaalaa dhimmi ilaallatuutti ergama.' },
    tableCitizenMsg: { en: 'CITIZEN MESSAGE', am: 'የዜጋው መልዕክት', om: 'ERGA LAMIITII' },
    tableServiceBureau: { en: 'SERVICE & BUREAU', am: 'አገልግሎት እና ቢሮ', om: 'TAJAAJILA FI BIIROO' },
    tableSubmitted: { en: 'SUBMITTED', am: 'የቀረበበት ቀን', om: 'KAN DHIHAATE' },
    tableStatus: { en: 'STATUS', am: 'ሁኔታ', om: 'HAALA' },
    tableRating: { en: 'RATING', am: 'ደረጃ', om: 'SADARKAA' },
    serviceLabel: { en: 'SERVICE', am: 'አገልግሎት', om: 'TAJAAJILA' },
    bureauLabel: { en: 'BUREAU', am: 'ቢሮ', om: 'BIIROO' },
    subcityLabel: { en: 'SUB-CITY', am: 'ክፍለ ከተማ', om: 'KUTAA MAGAALAA' },
    ratingLabel: { en: 'CITIZEN RATING', am: 'የዜጎች ምዘና', om: 'SADARKAA LAMMII' },
    citizenNameLabel: { en: 'CITIZEN NAME', am: 'የዜጋው ስም', om: 'MAQAA LAMIITII' },
    phoneNumberLabel: { en: 'PHONE NUMBER', am: 'ስልክ ቁጥር', om: 'LAKKOOFSA BILBILAA' },
    emailLabel: { en: 'EMAIL', am: 'ኢሜይል', om: 'IMEELII' },
    responseReadOnly: { en: 'Read-only: permission required to update feedback status', am: 'ተነባቢ ብቻ፡ የአስተያየት ሁኔታን ለማዘመን ፈቃድ ያስፈልጋል', om: 'Dubbisa qofa: haala yaadaa haaromsuuf hayyama barbaada' },
    routedTitle: { en: 'Routed to authorized teams', am: 'ለተፈቀደላቸው ቡድኖች ተላልፏል', om: 'Garee hayyamameef qoodameera' },
    routedDesc: { en: 'Visible to Sub-city Admin and Bureau Admin', am: 'ለክፍለ ከተማ አስተዳዳሪ እና ለቢሮ አስተዳዳሪ ይታያል', om: 'Bulchaa Kutaa Magaalaa fi Bulchaa Biirootiif ni mul\'ata' },
  },
  services: {
    masterCategories: { en: 'Master Categories', am: 'ዋና ዋና ዘርፎች', om: 'Dhangiiwwan Ijoo' },
    citizenServices: { en: 'Citizen Services', am: 'የዜጎች አገልግሎቶች', om: 'Tajaajiloota Lammiilee' },
    deliveryOffices: { en: 'Delivery Offices', am: 'አገልግሎት ሰጪ መሥሪያ ቤቶች', om: 'Waajjiraalee Tajaajila Kennan' },
    publishedActive: { en: 'Published & Active', am: 'የታተሙ እና ንቁ', om: 'Maxxanfaman fi Hojiirra Jiran' },
    catalogDirectory: { en: 'Service Catalog Directory', am: 'የአገልግሎቶች ማውጫ', om: 'Galmee Tajaajilaa' },
    branchScope: { en: 'Branch scope:', am: 'የቅርንጫፍ ወሰን፡', om: 'Daangaa damee:' },
    allBranches: { en: 'All administrative branches', am: 'ሁሉም አስተዳደራዊ ቅርንጫፎች', om: 'Dameewwan bulchiinsaa hunda' },
    subcitiesGroup: { en: 'Sub-cities', am: 'ክፍለ ከተሞች', om: 'Kutaa Magaalaalee' },
    centralBureausGroup: { en: 'Central Bureaus', am: 'ማዕከላዊ ቢሮዎች', om: 'Biiroolee Giddugaleessaa' },
    filterAll: { en: 'All services', am: 'ሁሉም አገልግሎቶች', om: 'Tajaajiloota hunda' },
  },
  activity: {
    exportCsv: { en: 'Export CSV audit', am: 'የኦዲት CSV ላክ', om: 'CSV Oodiitii Ergi' },
    loggedActions: { en: 'Logged system actions', am: 'የተመዘገቡ የስርዓት እርምጃዎች', om: 'Gochawwan sirnaa galmaa\'an' },
    acrossHierarchy: { en: 'Across administrative hierarchy', am: 'በአስተዳደራዊ መዋቅሩ ውስጥ', om: 'Caasaa bulchiinsaa keessatti' },
    stateChangesDiffs: { en: 'State changes & diffs', am: 'የሁኔታ ለውጦች እና ልዩነቶች', om: 'Jijjiirama haalaa fi adda baasuu' },
    fieldTransitions: { en: 'Field-level state transitions', am: 'የመስክ ደረጃ የሁኔታ ሽግግሮች', om: 'Jijjiirama sadarkaa dirree' },
    wireTelemetry: { en: 'Wire telemetry captured', am: 'የተመዘገቡ የቴሌሜትሪ መረጃዎች', om: 'Teelemeetirii sararaa qabame' },
    httpReqRes: { en: 'HTTP requests & responses', am: 'የHTTP ጥያቄዎች እና ምላሾች', om: 'Gaaffii fi deebii HTTP' },
    integrityRate: { en: 'Audit integrity rate', am: 'የኦዲት ትክክለኛነት ምጣኔ', om: 'Reeshioo qulqullina oodiitii' },
    tamperSha: { en: 'Tamper-evident SHA-256', am: 'ደህንነቱ የተጠበቀ SHA-256', om: 'Eegumsa SHA-256' },
    recordedEntries: { en: 'Recorded audit entries', am: 'የተመዘገቡ የኦዲት መረጃዎች', om: 'Galmeewwan oodiitii qabaman' },
    showingEvents: { en: 'Showing events with full user action, state change diffs, and network metadata.', am: 'የተጠቃሚ እርምጃዎችን፣ የሁኔታ ለውጦችን እና የአውታረ መረብ መረጃዎችን ሙሉ በሙሉ ያሳያል።', om: 'Gochawwan fayyadamaa, jijjiirama haalaa fi odeeffannoo netwoorkii guutuutti mul\'isa.' },
    catAll: { en: 'All activity', am: 'ሁሉም እንቅስቃሴዎች', om: 'Sochii hunda' },
    catServices: { en: 'Service standards', am: 'የአገልግሎት ደረጃዎች', om: 'Ulaagaalee tajaajilaa' },
    catCitizenVoice: { en: 'Citizen voice', am: 'የዜጎች ድምጽ', om: 'Sagalee lammiilee' },
    catSecurity: { en: 'Security & access', am: 'ደህንነት እና መዳረሻ', om: 'Nageenya fi seensa' },
    catCms: { en: 'CMS & landing', am: 'ይዘት እና መነሻ ገጽ', om: 'Qabiyyee fi fuula jalqabaa' },
    catOffices: { en: 'Offices & bureaus', am: 'መሥሪያ ቤቶች እና ቢሮዎች', om: 'Waajjiraalee fi biiroolee' },
    catRoles: { en: 'Roles & permissions', am: 'ሚናዎች እና ፈቃዶች', om: 'Gahee fi hayyamoota' },
    tableTimeId: { en: 'TIME & EVENT ID', am: 'ሰዓት እና የመታወቂያ ቁጥር', om: 'YEROO FI ID SAGANTAA' },
    tableActor: { en: 'USER (ACTOR)', am: 'ተጠቃሚ (ፈጻሚ)', om: 'FAYYADAMAA (RAAWWATAA)' },
    tableActionStatus: { en: 'ACTION & HTTP STATUS', am: 'እርምጃ እና የHTTP ሁኔታ', om: 'GOCHA FI HAALA HTTP' },
    tableResourceTarget: { en: 'RESOURCE / TARGET', am: 'ተቋም / ዒላማ', om: 'QABEENYA / XIYYEEFFANNOO' },
    tableWhatChanged: { en: 'WHAT CHANGED (FROM ➔ TO)', am: 'የተለወጠው ነገር (ከ ➔ ወደ)', om: 'MAALTU JIJJIIRAME (IRRAA ➔ GARA)' },
    tableOriginIp: { en: 'ORIGIN & IP', am: 'መነሻ እና አይፒ', om: 'MADDA FI IP' },
    tableDetails: { en: 'DETAILS', am: 'ዝርዝሮች', om: 'BAL\'INA' },
  }
};

for (const section of Object.keys(additions)) {
  if (!en[section]) en[section] = {};
  if (!am[section]) am[section] = {};
  if (!om[section]) om[section] = {};

  for (const [key, trans] of Object.entries(additions[section])) {
    en[section][key] = trans.en;
    am[section][key] = trans.am;
    om[section][key] = trans.om;
  }
}

function countKeys(obj) {
  let count = 0;
  for (const k in obj) {
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      count += countKeys(obj[k]);
    } else {
      count++;
    }
  }
  return count;
}

function diffKeys(a, b, prefix = '') {
  let diffs = [];
  for (const k of Object.keys(a)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (!(k in b)) {
      diffs.push(`Missing in other: ${full}`);
    } else if (typeof a[k] === 'object' && a[k] !== null && typeof b[k] === 'object' && b[k] !== null) {
      diffs = diffs.concat(diffKeys(a[k], b[k], full));
    }
  }
  return diffs;
}

const diffEnAm = diffKeys(en, am);
const diffAmEn = diffKeys(am, en);
const diffEnOm = diffKeys(en, om);
const diffOmEn = diffKeys(om, en);

if (diffEnAm.length || diffAmEn.length || diffEnOm.length || diffOmEn.length) {
  console.error('Parity check failed!', { diffEnAm, diffAmEn, diffEnOm, diffOmEn });
  process.exit(1);
}

fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n', 'utf8');
fs.writeFileSync(amPath, JSON.stringify(am, null, 2) + '\n', 'utf8');
fs.writeFileSync(omPath, JSON.stringify(om, null, 2) + '\n', 'utf8');

console.log('SUCCESS! All keys merged in 100% parity.');
console.log('Key count:', {
  en: countKeys(en),
  am: countKeys(am),
  om: countKeys(om),
});

