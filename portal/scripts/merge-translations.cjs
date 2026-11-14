const fs = require('fs');
const path = require('path');

const enPath = path.resolve(__dirname, '../src/i18n/translations/en.json');
const amPath = path.resolve(__dirname, '../src/i18n/translations/am.json');
const omPath = path.resolve(__dirname, '../src/i18n/translations/om.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const am = JSON.parse(fs.readFileSync(amPath, 'utf8'));
const om = JSON.parse(fs.readFileSync(omPath, 'utf8'));

const additions = {
  offices: {
    modalEyebrow: {
      en: 'ORGANIZATION DIRECTORY',
      am: 'የመሥሪያ ቤቶች ማውጫ',
      om: 'DAAYIREEKTORII WAAJJIRAA',
    },
    editOffice: {
      en: 'Edit administrative office',
      am: 'አስተዳደራዊ መሥሪያ ቤትን አርትዕ',
      om: 'Waajjira bulchiinsaa gulaali',
    },
    createOffice: {
      en: 'Create new administrative office',
      am: 'አዲስ አስተዳደራዊ መሥሪያ ቤት ፍጠር',
      om: 'Waajjira bulchiinsaa haaraa uumi',
    },
    modalSubtitle: {
      en: 'Configure office details, hierarchy tier, and contact information.',
      am: 'የመሥሪያ ቤቱን ዝርዝር መረጃ፣ የአስተዳደር ደረጃ እና የእውቂያ አድራሻ ያዋቅሩ።',
      om: 'Odeeffannoo waajjiraa, sadarkaa fi qunnamtii qindeessi.',
    },
    officeName: {
      en: 'Office name',
      am: 'የመሥሪያ ቤቱ ስም',
      om: 'Maqaa waajjiraa',
    },
    officeNamePlaceholder: {
      en: 'e.g. Bole Sub-City Administration or Revenues Bureau',
      am: 'ምሳሌ፡ የቦሌ ክፍለ ከተማ አስተዳደር ወይም የገቢዎች ቢሮ',
      om: 'Fkf: Bulchiinsa Kutaa Magaalaa Boolee yookiin Biiroo Galiiwwanii',
    },
    officeLogo: {
      en: 'Office logo',
      am: 'የመሥሪያ ቤቱ አርማ',
      om: 'Mallattoo (Asxaa) waajjiraa',
    },
    classificationTier: {
      en: 'Classification Tier',
      am: 'የአስተዳደር ደረጃ ምድብ',
      om: 'Sadarkaa Ramaddii',
    },
    selectTierPlaceholder: {
      en: 'Select tier...',
      am: 'ደረጃ ይምረጡ...',
      om: 'Sadarkaa filadhu...',
    },
    governingParent: {
      en: 'Governing Parent',
      am: 'ተቆጣጣሪ የበላይ ተቋም',
      om: 'Dhaabbata Olaanaa To\'atu',
    },
    notRequiredRoot: {
      en: '(Not required - Root Level)',
      am: '(አያስፈልግም - ዋና ደረጃ)',
      om: '(Hin barbaachisu - Sadarkaa Ol-aanaa)',
    },
    organization: {
      en: 'Organization',
      am: 'መሥሪያ ቤት',
      om: 'Dhaabbata',
    },
    noneRoot: {
      en: 'None (Root Organization)',
      am: 'ምንም የለም (ዋና መሥሪያ ቤት)',
      om: 'Homaa (Dhaabbata Hundee)',
    },
    rootNoParentDesc: {
      en: 'Root organizations have no parent organization.',
      am: 'ዋና መሥሪያ ቤቶች የበላይ ተቆጣጣሪ ተቋም የላቸውም።',
      om: 'Dhaabbileen hundee dhaabbata olaanaa hin qaban.',
    },
    physicalAddress: {
      en: 'Physical address / location',
      am: 'አድራሻ / የሚገኝበት ቦታ',
      om: 'Teessoo / Bakka argamaa',
    },
    addressPlaceholder: {
      en: 'e.g. Bole Road, Building B, Floor 2',
      am: 'ምሳሌ፡ ቦሌ መንገድ፣ ህንፃ ለ፣ ፎቅ 2',
      om: 'Fkf: Daandii Boolee, Gamoo B, Abbaa Foqii 2',
    },
    phone: {
      en: 'Official phone number',
      am: 'ይፋዊ ስልክ ቁጥር',
      om: 'Lakkoofsa bilbilaa seera qabeessa',
    },
    email: {
      en: 'Official contact email',
      am: 'ይፋዊ የኢሜይል አድራሻ',
      om: 'Imeelii qunnamtii seera qabeessa',
    },
    descriptionLabel: {
      en: 'Description / office mandate',
      am: 'መግለጫ / የመሥሪያ ቤቱ ተግባርና ኃላፊነት',
      om: 'Ibsa / Itti gaafatamummaa waajjiraa',
    },
    descriptionPlaceholder: {
      en: 'Brief summary of office mission and public services...',
      am: 'የመሥሪያ ቤቱ ተልዕኮ እና የህዝብ አገልግሎቶች አጭር ማጠቃለያ...',
      om: 'Ergama waajjiraa fi tajaajila hawaasaa gabaabinaan...',
    },
    nameRequired: {
      en: 'Office name is required.',
      am: 'የመሥሪያ ቤቱ ስም ያስፈልጋል።',
      om: 'Maqaan waajjiraa barbaachisaadha.',
    },
    logoRequired: {
      en: 'Office logo image is required.',
      am: 'የመሥሪያ ቤቱ አርማ ምስል ያስፈልጋል።',
      om: 'Suuraan asxaa waajjiraa barbaachisaadha.',
    },
    codeRequired: {
      en: 'Office code identifier is required.',
      am: 'የመሥሪያ ቤቱ መለያ ኮድ ያስፈልጋል።',
      om: 'Koodiin addaa waajjiraa barbaachisaadha.',
    },
    parentRequired: {
      en: 'A child office must have a parent organization selected.',
      am: 'የበታች መሥሪያ ቤት የበላይ ተቆጣጣሪ ተቋም ሊመረጥለት ይገባል።',
      om: 'Waajjirri gadi aanaan dhaabbata olaanaa filatame qabaachuu qaba.',
    },
    emailInvalid: {
      en: 'Please enter a valid email address (e.g., info@office.gov.et).',
      am: 'እባክዎ ትክክለኛ የኢሜይል አድራሻ ያስገቡ (ምሳሌ፡ info@office.gov.et)።',
      om: 'Maaloo teessoo imeelii sirrii galchaa (fkf: info@office.gov.et).',
    },
    saveSuccess: {
      en: 'Office saved successfully.',
      am: 'መሥሪያ ቤቱ በተሳካ ሁኔታ ተቀምጧል።',
      om: 'Waajjirri milkaa\'inaan olkaa\'ameera.',
    }
  },
  accounts: {
    modalEyebrow: {
      en: 'ACCESS & PERMISSIONS',
      am: 'የተጠቃሚ ፈቃድና ተደራሽነት',
      om: 'HEYYAMA FI MIRGA SEENSA',
    },
    editAccount: {
      en: 'Edit account',
      am: 'መለያውን አርትዕ',
      om: 'Herrega gulaali',
    },
    createAccount: {
      en: 'Create account',
      am: 'አዲስ መለያ ፍጠር',
      om: 'Herrega uumi',
    },
    modalSubtitle: {
      en: 'Assign administrative authority and link workspace organization.',
      am: 'የአስተዳደር ኃላፊነት ይመድቡ እና ከመሥሪያ ቤት ጋር ያገናኙ።',
      om: 'Aangoo bulchiinsaa kenni fi dhaabbata hojii waliin walqabsiisi.',
    },
    assignedOrg: {
      en: 'Assigned Organization',
      am: 'የተመደበበት መሥሪያ ቤት',
      om: 'Dhaabbata Ramadame',
    },
    globalAdminOption: {
      en: 'None (Global Platform Administrator)',
      am: 'ምንም (አጠቃላይ የፕላትፎርም አስተዳዳሪ)',
      om: 'Homaa (Bulchaa Waltajjii Waliigalaa)',
    },
    globalAdminDesc: {
      en: 'Platform-wide authority without organizational boundary (Super Admin).',
      am: 'ያለ ድንበር በመላው ስርዓቱ ላይ ሙሉ አስተዳደራዊ ስልጣን ያለው (ሱፐር አድሚን)።',
      om: 'Aangoo guutuu waltajjicha maraa daangaa dhaabbataa malee (Super Admin).',
    },
    selectOrgPlaceholder: {
      en: 'Search & select organization or Global Platform...',
      am: 'መሥሪያ ቤት ወይም አጠቃላይ ፕላትፎርም ይፈልጉና ይምረጡ...',
      om: 'Dhaabbata yookiin Waltajjii Waliigalaa barbaadiitii filadhu...',
    },
    adminRole: {
      en: 'Administrative Role',
      am: 'የአስተዳደር ሚና',
      om: 'Gahee Bulchiinsaa',
    },
    selectOrgFirst: {
      en: 'Select an organization first...',
      am: 'መጀመሪያ መሥሪያ ቤት ይምረጡ...',
      om: 'Duraan dursii dhaabbata filadhu...',
    },
    selectRolePlaceholder: {
      en: 'Select role for this organization...',
      am: 'ለዚህ መሥሪያ ቤት ሚና ይምረጡ...',
      om: 'Dhaabbata kanaaf gahee filadhu...',
    },
    fullName: {
      en: 'Full name',
      am: 'ሙሉ ስም',
      om: 'Maqaa Guutuu',
    },
    fullNamePlaceholder: {
      en: 'e.g. Sofia Lemma',
      am: 'ምሳሌ፡ ሶፊያ ለማ',
      om: 'Fkf: Soofiyaa Lammaa',
    },
    username: {
      en: 'Username',
      am: 'የተጠቃሚ ስም',
      om: 'Maqaa Fayyadamaa',
    },
    usernamePlaceholder: {
      en: 'e.g. sofia.lemma',
      am: 'ምሳሌ፡ sofia.lemma',
      om: 'Fkf: sofiyaa.lammaa',
    },
    workEmail: {
      en: 'Work email',
      am: 'የሥራ ኢሜይል',
      om: 'Imeelii Hojii',
    },
    workEmailPlaceholder: {
      en: 'sofia@admin.gov.et',
      am: 'sofia@admin.gov.et',
      om: 'sofia@admin.gov.et',
    },
    phone: {
      en: 'Phone number',
      am: 'ስልክ ቁጥር',
      om: 'Lakkoofsa Bilbilaa',
    },
    newPassword: {
      en: 'New password (optional)',
      am: 'አዲስ የይለፍ ቃል (አስገዳጅ ያልሆነ)',
      om: 'Jecha icciitii haaraa (dirqama miti)',
    },
    initialPassword: {
      en: 'Initial password',
      am: 'የመጀመሪያ የይለፍ ቃል',
      om: 'Jecha icciitii jalqabaa',
    },
    passwordPlaceholder: {
      en: 'Min 8 characters',
      am: 'ቢያንስ 8 ፊደላት',
      om: 'Yoo xiqqaate asxaa 8',
    },
    passwordCurrentPlaceholder: {
      en: 'Leave blank to keep current',
      am: 'ያለውን ለማስቀጠል ባዶ ይተዉት',
      om: 'Isa ammaa tursiisuuf duwwaa dhiisi',
    },
    accountStatus: {
      en: 'Account status',
      am: 'የመለያ ሁኔታ',
      om: 'Haala herregaa',
    },
    tableAccount: {
      en: 'ACCOUNT',
      am: 'መለያ',
      om: 'HERREGA',
    },
    tableRole: {
      en: 'ROLE',
      am: 'ሚና',
      om: 'GAHEE',
    },
    tableOrg: {
      en: 'ORGANIZATION',
      am: 'መሥሪያ ቤት',
      om: 'DHAABBATA',
    },
    tableStatus: {
      en: 'STATUS',
      am: 'ሁኔታ',
      om: 'HAALA',
    },
    tableLastActive: {
      en: 'LAST ACTIVE',
      am: 'የመጨረሻ እንቅስቃሴ',
      om: 'YEROO DHIHOO HOJJETE',
    },
    noAccountsFound: {
      en: 'No accounts found',
      am: 'ምንም መለያዎች አልተገኙም',
      om: 'Herregni tokkollee hin argamne',
    },
    noAccountsDesc: {
      en: 'Try adjusting your search filters or create an account.',
      am: 'የፍለጋ ማጣሪያዎችዎን ያስተካክሉ ወይም አዲስ መለያ ይፍጠሩ።',
      om: 'Gingilchaa barbaadichaa sirreessaa yookiin herrega haaraa uumaa.',
    },
    nameRequired: {
      en: 'Full name is required.',
      am: 'ሙሉ ስም ማስገባት ግዴታ ነው።',
      om: 'Maqaa guutuu galchuun dirqama.',
    },
    usernameRequired: {
      en: 'Username is required.',
      am: 'የተጠቃሚ ስም ማስገባት ግዴታ ነው።',
      om: 'Maqaa fayyadamaa galchuun dirqama.',
    },
    emailRequired: {
      en: 'Work email is required.',
      am: 'የሥራ ኢሜይል ማስገባት ግዴታ ነው።',
      om: 'Imeelii hojii galchuun dirqama.',
    },
    passwordRequired: {
      en: 'Initial password is required for new accounts (minimum 8 characters).',
      am: 'ለአዲስ መለያዎች የመጀመሪያ የይለፍ ቃል ያስፈልጋል (ቢያንስ 8 ፊደላት)።',
      om: 'Herrega haaraaf jechi icciitii jalqabaa ni barbaachisa (yoo xiqqaate asxaa 8).',
    },
    passwordLength: {
      en: 'Password must be at least 8 characters long.',
      am: 'የይለፍ ቃል ርዝመት ቢያንስ 8 ፊደላት መሆን አለበት።',
      om: 'Jechi icciitii yoo xiqqaate asxaa 8 ta\'uu qaba.',
    },
    orgRequired: {
      en: 'Please select an organization (or Global Platform) first.',
      am: 'እባክዎ መጀመሪያ መሥሪያ ቤት (ወይም አጠቃላይ ፕላትፎርም) ይምረጡ።',
      om: 'Maaloo duraan dursitanii dhaabbata (yookiin Waltajjii Waliigalaa) filadhaa.',
    },
    roleRequired: {
      en: 'Please select an administrative role.',
      am: 'እባክዎ የአስተዳደር ሚና ይምረጡ።',
      om: 'Maaloo gahee bulchiinsaa filadhaa.',
    },
    allRoles: {
      en: 'All roles',
      am: 'ሁሉም ሚናዎች',
      om: 'Gaheewwan hunda',
    }
  },
  levels: {
    modalEyebrow: {
      en: 'ORGANIZATION HIERARCHY',
      am: 'የአስተዳደር ተዋረድ',
      om: 'CAASAA DHAABBATA',
    },
    editLevel: {
      en: 'Edit organization level',
      am: 'የተቋም እርከንን አርትዕ',
      om: 'Sadarkaa dhaabbataa gulaali',
    },
    addLevelTitle: {
      en: 'Add organization level',
      am: 'አዲስ የተቋም እርከን አክል',
      om: 'Sadarkaa dhaabbataa haaraa dabali',
    },
    modalSubtitle: {
      en: 'Configure statutory rank and classification rules.',
      am: 'ህጋዊ ደረጃን እና የምደባ ደንቦችን ያዋቅሩ።',
      om: 'Sadarkaa seeraa fi qajeelfamoota ramaddii qindeessi.',
    },
    levelName: {
      en: 'Level / Tier name',
      am: 'የእርከን / ደረጃ ስም',
      om: 'Maqaa Sadarkaa',
    },
    levelNamePlaceholder: {
      en: 'e.g. Sub-City, Woreda, Bureau, Zone, or Kebele',
      am: 'ምሳሌ፡ ክፍለ ከተማ፣ ወረዳ፣ ቢሮ፣ ዞን ወይም ቀበሌ',
      om: 'Fkf: Kutaa Magaalaa, Aanaa, Biiroo, Zoonii yookiin Ganda',
    },
    hierarchyRank: {
      en: 'Hierarchy rank depth',
      am: 'የተዋረድ ደረጃ ቁጥር',
      om: 'Sadarkaa Cuunfaa Caasaa',
    },
    rankHelp: {
      en: 'Lower number = higher authority (1 is Root).',
      am: 'ዝቅተኛ ቁጥር = ከፍተኛ ስልጣን (1 ዋና ደረጃ ነው)።',
      om: 'Lakkoofsa xiqqaa = Aangoo olaanaa (1 Hundeedha).',
    },
    statusActiveOpt: {
      en: 'Active (available in office creation)',
      am: 'ንቁ (ለመሥሪያ ቤት ምስረታ ዝግጁ)',
      om: 'Hojjata (Waajjira uumuuf kan qophaa\'e)',
    },
    statusInactiveOpt: {
      en: 'Inactive (hidden from office creation)',
      am: 'ቦዘኔ (ከመሥሪያ ቤት ምስረታ የተደበቀ)',
      om: 'Dhaabbata (Waajjira uumuu irraa kan dhokate)',
    },
    mandateDesc: {
      en: 'Mandate description',
      am: 'የተግባርና ኃላፊነት መግለጫ',
      om: 'Ibsa Ergamaa fi Aangoo',
    },
    mandateDescPlaceholder: {
      en: 'Purpose of this tier in the city administration hierarchy...',
      am: 'ይህ እርከን በከተማ አስተዳደሩ መዋቅር ውስጥ ያለው ዓላማ...',
      om: 'Kaayyoo sadarkaan kun caasaa bulchiinsa magaalaa keessatti qabu...',
    },
    nameRequired: {
      en: 'Level name is required.',
      am: 'የእርከኑ ስም ያስፈልጋል።',
      om: 'Maqaan sadarkaa barbaachisaadha.',
    },
    codeRequired: {
      en: 'Code identifier slug is required.',
      am: 'የመለያ ኮድ ስሉግ ያስፈልጋል።',
      om: 'Koodiin addaa barbaachisaadha.',
    },
    rankInvalid: {
      en: 'Hierarchy rank level must be at least 1.',
      am: 'የተዋረድ ደረጃ ቁጥር ቢያንስ 1 መሆን አለበት።',
      om: 'Sadarkaan caasaa yoo xiqqaate 1 ta\'uu qaba.',
    },
    allStructures: {
      en: 'All structures',
      am: 'ሁሉም መዋቅሮች',
      om: 'Caasaalee hunda',
    },
    rootEligible: {
      en: 'Root tier eligible',
      am: 'የዋና ደረጃ ብቁ',
      om: 'Hundee ta\'uu kan danda\'u',
    },
    requiresParent: {
      en: 'Requires parent',
      am: 'የበላይ መሥሪያ ቤት የሚጠይቅ',
      om: 'Dhaabbata olaanaa kan barbaadu',
    }
  },
  documents: {
    modalEyebrow: {
      en: 'DOCUMENT CATALOG STANDARD',
      am: 'የሰነዶች መደበኛ ማውጫ',
      om: 'ULAAGAA SANADOOTAA',
    },
    editDoc: {
      en: 'Edit required document',
      am: 'አስፈላጊ ሰነድን አርትዕ',
      om: 'Sanada barbaachisaa gulaali',
    },
    createDoc: {
      en: 'Create required document',
      am: 'አስፈላጊ ሰነድ ፍጠር',
      om: 'Sanada barbaachisaa uumi',
    },
    modalSubtitle: {
      en: 'Define a canonical document criteria that services can require from citizens.',
      am: 'አገልግሎቶች ከዜጎች ሊጠይቋቸው የሚችሉ መደበኛ የሰነድ መስፈርቶችን ይግለጹ።',
      om: 'Ulaagaalee sanadaa kan tajaajiloonni lammiilee irraa barbaadan qindeessi.',
    },
    nameEn: {
      en: 'Document name (English)',
      am: 'የሰነዱ ስም (በእንግሊዝኛ)',
      om: 'Maqaa sanadaa (Afaan Ingiliziitiin)',
    },
    nameEnPlaceholder: {
      en: 'e.g. Kebele Resident ID, Renewed Trade License, Birth Certificate',
      am: 'ምሳሌ፡ የቀበሌ ነዋሪነት መታወቂያ፣ የታደሰ የንግድ ፈቃድ፣ የልደት ምስክር ወረቀት',
      om: 'Fkf: Waraqaa Eenyummaa Gandaa, Hayyama Daldalaa Haarome, Ragaa Dhalootaa',
    },
    nameAm: {
      en: 'Document name (Amharic - አማርኛ)',
      am: 'የሰነዱ ስም (በአማርኛ)',
      om: 'Maqaa sanadaa (Afaan Amaaraatiin)',
    },
    nameAmPlaceholder: {
      en: 'ለምሳሌ፡ የቀበሌ ነዋሪነት መታወቂያ',
      am: 'ለምሳሌ፡ የቀበሌ ነዋሪነት መታወቂያ',
      om: 'Fkn: Waraqaa eenyummaa jiraattummaa gandaa',
    },
    nameOm: {
      en: 'Document name (Afaan Oromoo)',
      am: 'የሰነዱ ስም (በአፋን ኦሮሞ)',
      om: 'Maqaa sanadaa (Afaan Oromoottiin)',
    },
    nameOmPlaceholder: {
      en: 'Fkf: Waraqaa Eenyummaa Jiraattummaa Gandaa',
      am: 'ምሳሌ፡ የነዋሪነት መታወቂያ ወረቀት',
      om: 'Fkf: Waraqaa Eenyummaa Jiraattummaa Gandaa',
    },
    descEn: {
      en: 'Description & Issuing Criteria (English)',
      am: 'መግለጫና የመስጫ መስፈርቶች (በእንግሊዝኛ)',
      om: 'Ibsa fi Ulaagaa Kenniinsaa (Afaan Ingiliziitiin)',
    },
    descEnPlaceholder: {
      en: 'Explain what this document is, issuing authority requirements, acceptable format...',
      am: 'ሰነዱ ምን እንደሆነ፣ ሰጪው አካል የሚያስፈልጉት መስፈርቶችና ተቀባይነት ያለው ቅርጽ...',
      om: 'Sanadichi maal akka ta\'e, ulaagaalee qaama kennuu fi bifa fudhatama qabu ibsaa...',
    },
    descAm: {
      en: 'Description (Amharic - አማርኛ)',
      am: 'መግለጫ (በአማርኛ)',
      om: 'Ibsa (Afaan Amaaraatiin)',
    },
    descAmPlaceholder: {
      en: 'የሰነዱን መግለጫ እና የማስረጃ መስፈርቶችን በአማርኛ ያስገቡ...',
      am: 'የሰነዱን መግለጫ እና የማስረጃ መስፈርቶችን በአማርኛ ያስገቡ...',
      om: 'Ibsa sanadichaa fi ulaagaalee Afaan Amaaraatiin galchaa...',
    },
    descOm: {
      en: 'Description (Afaan Oromoo)',
      am: 'መግለጫ (በአፋን ኦሮሞ)',
      om: 'Ibsa (Afaan Oromoottiin)',
    },
    descOmPlaceholder: {
      en: 'Ibsa sanadaa fi ulaagaalee dhiyeessaa Afaan Oromootiin galchaa...',
      am: 'የሰነዱን መግለጫ እና የማስረጃ መስፈርቶችን በአፋን ኦሮሞ ያስገቡ...',
      om: 'Ibsa sanadaa fi ulaagaalee dhiyeessaa Afaan Oromootiin galchaa...',
    },
    sampleUrl: {
      en: 'Sample file or template download URL',
      am: 'የናሙና ፋይል ወይም ቅጽ ማውረጃ አድራሻ (URL)',
      om: 'Fakkeenya faayilaa yookiin unkaa buufachuuf teessoo (URL)',
    },
    activeStandard: {
      en: 'Active document standard',
      am: 'ንቁ የሰነድ መስፈርት',
      om: 'Ulaagaa sanadaa hojjetu',
    },
    activeStandardDesc: {
      en: 'When active, services across all sub-cities and bureaus can select and attach this document.',
      am: 'ንቁ ሲሆን በመላው ክፍለ ከተሞችና ቢሮዎች ያሉ አገልግሎቶች ይህንን ሰነድ መርጠው ማያያዝ ይችላሉ።',
      om: 'Yeroo hojjatu, tajaajiloonni kutaalee magaalaa fi biiroolee hunda keessatti sanada kana qabsiisuu danda\'u.',
    },
    allStatuses: {
      en: 'All statuses',
      am: 'ሁሉም ሁኔታዎች',
      om: 'Haalawwan hunda',
    },
    activeOnly: {
      en: 'Active only',
      am: 'ንቁ ብቻ',
      om: 'Hojjataa qofa',
    },
    inactiveOnly: {
      en: 'Inactive only',
      am: 'ቦዘኔ ብቻ',
      om: 'Dhaabbataa qofa',
    },
    allLinkage: {
      en: 'All linkage states',
      am: 'ሁሉም የትስስር ሁኔታዎች',
      om: 'Haala walitti hidhamiinsaa hunda',
    },
    usedInServices: {
      en: 'Used in services',
      am: 'በአገልግሎቶች ውስጥ የተካተቱ',
      om: 'Tajaajila keessatti kan itti fayyadaman',
    },
    unusedDraft: {
      en: 'Unused / Catalog draft',
      am: 'ጥቅም ላይ ያልዋሉ / ረቂቅ',
      om: 'Itti hin fayyadamne / Waraqaa qorannoo',
    },
    nameRequired: {
      en: 'Document name is required.',
      am: 'የሰነዱ ስም ያስፈልጋል።',
      om: 'Maqaan sanadaa barbaachisaadha.',
    },
    codeRequired: {
      en: 'Document code slug is required.',
      am: 'የሰነዱ መለያ ኮድ ያስፈልጋል።',
      om: 'Koodiin sanadaa barbaachisaadha.',
    },
    urlInvalid: {
      en: 'Sample file URL must be a valid web address starting with http:// or https://',
      am: 'የናሙና ፋይል አድራሻ በ http:// ወይም https:// የሚጀምር ትክክለኛ የድረ-ገጽ አድራሻ መሆን አለበት።',
      om: 'Teessoon faayila fakkeenyaa http:// yookiin https:// kan eegalu ta\'uu qaba.',
    }
  },
  news: {
    modalEyebrow: {
      en: 'PUBLIC INFORMATION',
      am: 'የህዝብ መረጃ',
      om: 'ODEEFFANNOO HAWAASAA',
    },
    editNews: {
      en: 'Edit news article',
      am: 'የዜና ጽሑፍን አርትዕ',
      om: 'Barruu oduu gulaali',
    },
    createNews: {
      en: 'Create news article',
      am: 'የዜና ጽሑፍ ፍጠር',
      om: 'Barruu oduu haaraa uumi',
    },
    editEvent: {
      en: 'Edit public event',
      am: 'የህዝብ ዝግጅትን አርትዕ',
      om: 'Sagantaa hawaasaa gulaali',
    },
    createEvent: {
      en: 'Create public event',
      am: 'የህዝብ ዝግጅት ፍጠር',
      om: 'Sagantaa hawaasaa haaraa uumi',
    },
    newsDesc: {
      en: 'Publish an official municipal notice or civic announcement.',
      am: 'ይፋዊ የማዘጋጃ ቤት ማስታወቂያ ወይም የህዝብ መግለጫ ያትሙ።',
      om: 'Beeksisa bulchiinsa magaalaa yookiin labsa hawaasaa ifa godhi.',
    },
    eventDesc: {
      en: 'Coordinate a municipal public gathering, town hall, or civic event.',
      am: 'የማዘጋጃ ቤት የህዝብ ውይይት፣ ጉባኤ ወይም ዝግጅት ያስተባብሩ።',
      om: 'Walgahii hawaasaa, marii uummataa yookiin sagantaa magaalaa qindeessi.',
    },
    tabNews: {
      en: 'News Announcement',
      am: 'የዜና ማስታወቂያ',
      om: 'Beeksisa Oduu',
    },
    tabEvent: {
      en: 'Public Event',
      am: 'የህዝብ ዝግጅት',
      om: 'Sagantaa Hawaasaa',
    },
    headlineTitle: {
      en: 'Headline title',
      am: 'የዜናው ርዕስ',
      om: 'Mata duree ijoo',
    },
    eventTitle: {
      en: 'Event title',
      am: 'የዝግጅቱ ርዕስ',
      om: 'Mata duree sagantaa',
    },
    headlinePlaceholder: {
      en: 'e.g. New Business License Registration Windows Opened',
      am: 'ምሳሌ፡ አዳዲስ የንግድ ፈቃድ ምዝገባ መስኮቶች ተከፈቱ',
      om: 'Fkf: Foddaaleen galmee hayyama daldalaa haaraa banaman',
    },
    eventTitlePlaceholder: {
      en: 'e.g. Annual Addis Ababa Youth Innovation & Civic Town Hall',
      am: 'ምሳሌ፡ የዓመቱ የአዲስ አበባ ወጣቶች የፈጠራና የህዝብ መድረክ',
      om: 'Fkf: Marii Uummataa fi Kalaqa Dargaggoota Finfinnee Waggaa',
    },
    publishingOrg: {
      en: 'Publishing Organization',
      am: 'አሳታሚው መሥሪያ ቤት',
      om: 'Dhaabbata Maxxansu',
    },
    hostOrg: {
      en: 'Host Organization',
      am: 'አዘጋጁ መሥሪያ ቤት',
      om: 'Dhaabbata Qopheessu',
    },
    venueName: {
      en: 'Venue / Location name',
      am: 'የዝግጅቱ ቦታ / አዳራሽ',
      om: 'Bakka / Iddoo sagantaa',
    },
    venuePlaceholder: {
      en: 'e.g. Addis Ababa Exhibition Center, Hall 2 / Meskel Square',
      am: 'ምሳሌ፡ የአዲስ አበባ ኤግዚቢሽን ማዕከል፣ አዳራሽ 2 / መስቀል አደባባይ',
      om: 'Fkf: Giddugala Agarsiisa Finfinnee, Hoolii 2 / Addababayii Masqalaa',
    },
    eventDate: {
      en: 'Event date',
      am: 'የዝግጅቱ ቀን',
      om: 'Guyyaa sagantaa',
    },
    endDate: {
      en: 'End date (optional)',
      am: 'የማብቂያ ቀን (አስገዳጅ ያልሆነ)',
      om: 'Guyyaa xumuraa (dirqama miti)',
    },
    targetAudience: {
      en: 'Target Audience',
      am: 'ተሳታፊዎች / ባለድርሻ አካላት',
      om: 'Hawaasa Xiyyeeffatame',
    },
    audiencePlaceholder: {
      en: 'e.g. All Addis Ababa Residents, Registered Merchants, Youth',
      am: 'ምሳሌ፡ ሁሉም የአዲስ አበባ ነዋሪዎች፣ የተመዘገቡ ነጋዴዎች፣ ወጣቶች',
      om: 'Fkf: Jiraattota Finfinnee Hunda, Daldaltoota Galmaa\'an, Dargaggoota',
    },
    articleImages: {
      en: 'Article Images',
      am: 'የዜናው ምስሎች',
      om: 'Suuraalee Barruu',
    },
    eventImages: {
      en: 'Event Images',
      am: 'የዝግጅቱ ምስሎች',
      om: 'Suuraalee Sagantaa',
    },
    summaryBrief: {
      en: 'Summary / lead notice',
      am: 'ማጠቃለያ / አጭር መግለጫ',
      om: 'Cuunfaa / Beeksisa gabaabaa',
    },
    eventBrief: {
      en: 'Short brief / summary',
      am: 'አጭር ማጠቃለያ',
      om: 'Cuunfaa gabaabaa',
    },
    summaryPlaceholder: {
      en: 'Brief summary or key takeaway for public previews...',
      am: 'ለህዝብ እይታ የሚሆን አጭር ማጠቃለያ ወይም ዋና ነጥብ...',
      om: 'Cuunfaa gabaabaa yookiin qabxiilee ijoo agarsiisa uummataaf...',
    },
    contentDetails: {
      en: 'Article content / details',
      am: 'የዜናው ዝርዝር ይዘት',
      om: 'Qabiyyee / Bal\'ina barruu',
    },
    eventAgenda: {
      en: 'Event description & agenda',
      am: 'የዝግጅቱ ማብራሪያና አጀንዳ',
      om: 'Ibsa fi Sagantaa guyyaa',
    },
    contentPlaceholder: {
      en: 'Detailed instructions, requirements, office hours, and contact details...',
      am: 'ዝርዝር መመሪያዎች፣ መስፈርቶች፣ የሥራ ሰዓት እና የእውቂያ መረጃዎች...',
      om: 'Qajeelfamoota bal\'aa, ulaagaalee, sa\'aatii hojii fi odeeffannoo qunnamtii...',
    },
    imageHelp: {
      en: 'The first image is used as the public feed cover. Subsequent images are displayed in the full gallery.',
      am: 'የመጀመሪያው ምስል ለህዝብ ማሳያ ሽፋንነት ያገለግላል። ተከታዮቹ ምስሎች በሙሉ ማሳያው ውስጥ ይካተታሉ።',
      om: 'Suuraan jalqabaa qola maxxansaaf tajaajila. Suuraaleen hafan galmee suuraa guutuu keessatti mul\'atu.',
    },
    allTypes: {
      en: 'All types',
      am: 'ሁሉም አይነቶች',
      om: 'Gosa hunda',
    },
    newsType: {
      en: 'News',
      am: 'ዜና',
      om: 'Oduu',
    },
    eventType: {
      en: 'Events',
      am: 'ዝግጅቶች',
      om: 'Sagantaalee',
    },
    publishedStatus: {
      en: 'Published',
      am: 'የታተሙ',
      om: 'Maxxanfame',
    },
    draftStatus: {
      en: 'Drafts',
      am: 'ረቂቆች',
      om: 'Waraqaa qorannoo',
    }
  },
  feedback: {
    ticketResponse: {
      en: 'CITIZEN RESPONSE',
      am: 'የዜጎች ምላሽ',
      om: 'DEEBII LAMMII',
    },
    ticketReceived: {
      en: 'received',
      am: 'ደርሷል',
      om: 'dhaqqabeera',
    },
    trackingNumber: {
      en: 'TRACKING NUMBER',
      am: 'የክትትል ቁጥር',
      om: 'LAKKOOFSA HORDOFFII',
    },
    serviceContext: {
      en: 'SERVICE',
      am: 'አገልግሎት',
      om: 'TAJAAJILA',
    },
    bureauContext: {
      en: 'BUREAU',
      am: 'ቢሮ',
      om: 'BIIROO',
    },
    subcityContext: {
      en: 'SUB-CITY',
      am: 'ክፍለ ከተማ',
      om: 'KUTAA MAGAALAA',
    },
    ratingContext: {
      en: 'CITIZEN RATING',
      am: 'የዜጎች እርካታ ምዘና',
      om: 'SADARKAA ITTI QUUFINSA LAMMII',
    },
    nameContext: {
      en: 'CITIZEN NAME',
      am: 'የዜጋው ስም',
      om: 'MAQAA LAMMII',
    },
    phoneContext: {
      en: 'PHONE NUMBER',
      am: 'ስልክ ቁጥር',
      om: 'LAKKOOFSA BILBILAA',
    },
    emailContext: {
      en: 'EMAIL',
      am: 'ኢሜይል',
      om: 'IMEELII',
    },
    followupStatus: {
      en: 'Follow-up Resolution Status',
      am: 'የክትትልና መፍትሔ ሁኔታ',
      om: 'Haala Hordoffii fi Furmaataa',
    },
    statusOpen: {
      en: 'Open',
      am: 'ክፍት',
      om: 'Banaa',
    },
    statusOpenDesc: {
      en: 'Awaiting first review',
      am: 'የመጀመሪያ ግምገማ በመጠባበቅ ላይ',
      om: 'Qorannoo jalqabaa eegaa jira',
    },
    statusReview: {
      en: 'In review',
      am: 'በግምገማ ላይ',
      om: 'Qorannoo irra',
    },
    statusReviewDesc: {
      en: 'Under investigation',
      am: 'ማጣራት እየተካሄደበት ያለ',
      om: 'Qulqullaa\'aa jira',
    },
    statusResolved: {
      en: 'Resolved',
      am: 'ተፈትቷል',
      om: 'Furmaata argate',
    },
    statusResolvedDesc: {
      en: 'Addressed & completed',
      am: 'ምላሽ አግኝቶ የተጠናቀቀ',
      om: 'Deebiin kennamee xumurame',
    },
    statusClosed: {
      en: 'Closed',
      am: 'ተዘግቷል',
      om: 'Cufame',
    },
    statusClosedDesc: {
      en: 'Archived / Dismissed',
      am: 'በማህደር የተቀመጠ / ውድቅ የተደረገ',
      om: 'Kuufame / Haqame',
    },
    officialResponseLabel: {
      en: 'Official Response to Citizen (Optional)',
      am: 'ለዜጋው የሚሰጥ ይፋዊ ምላሽ (አስገዳጅ ያልሆነ)',
      om: 'Deebii Seera Qabeessa Lammiidhaaf Kennamu (Dirqama miti)',
    },
    responseInputPlaceholder: {
      en: 'Write official resolution notes or citizen response...',
      am: 'ይፋዊ የመፍትሔ ማስታወሻዎችን ወይም ለዜጋው ምላሽ ይጻፉ...',
      om: 'Yaada furmaataa yookiin deebii lammiidhaaf barreessaa...',
    },
    routedNote: {
      en: 'Routed to authorized teams',
      am: 'ስልጣን ላላቸው የስራ ክፍሎች ተመርቷል',
      om: 'Garee aangoo qabutti qajeelfameera',
    },
    privateNote: {
      en: 'Citizen details are kept private.',
      am: 'የዜጎች የግል መረጃዎች በሚስጥር ይጠበቃሉ።',
      om: 'Odeeffannoon lammiilee icciitiin eegama.',
    }
  },
  qr: {
    modalEyebrow: {
      en: 'CITIZEN ACCESS & POSTERS',
      am: 'የዜጎች ተደራሽነትና ፖስተሮች',
      om: 'QEENNAA FI BOORDII LAMMII',
    },
    modalTitle: {
      en: 'Generate feedback QR poster',
      am: 'የአስተያየት መስጫ QR ፖስተር አዘጋጅ',
      om: 'Boordii koodii QR yaadaa qopheessi',
    },
    modalSubtitle: {
      en: 'Create a physical access token linking citizens directly to your service feedback portal.',
      am: 'ዜጎችን በቀጥታ ወደ አገልግሎት ግምገማ ፖርታል የሚያገናኝ አካላዊ የQR መዳረሻ ይፍጠሩ።',
      om: 'Koodii QR lammiilee kallattiin gara portaalii yaadaatti geessu uumi.',
    },
    assignedOrg: {
      en: 'Assigned Organization / Bureau',
      am: 'የተመደበለት መሥሪያ ቤት / ቢሮ',
      om: 'Dhaabbata / Biiroo Ramadame',
    },
    deskLabel: {
      en: 'Poster Location / Desk Label',
      am: 'የፖስተሩ ቦታ / የመስኮቱ መለያ',
      om: 'Bakka Boordichaa / Minjaala Tajaajilaa',
    },
    deskPlaceholder: {
      en: 'e.g. Reception Desk 1, Vital Records Window, Main Lobby',
      am: 'ምሳሌ፡ የመስተንግዶ መስኮት 1፣ የወሳኝ ኩነቶች መስኮት፣ ዋና መግቢያ',
      om: 'Fkf: Minjaala Keessummeessaa 1, Foddaa Ragaalee Murteessoo',
    },
    qrCodeId: {
      en: 'Unique QR identifier',
      am: 'ልዩ የQR ኮድ መለያ',
      om: 'Koodii QR addaa',
    },
    targetUrl: {
      en: 'Direct Citizen Portal URL',
      am: 'የዜጎች ፖርታል ቀጥታ አድራሻ (URL)',
      om: 'Teessoo Kallattii Portaalii Lammii (URL)',
    },
    posterStatus: {
      en: 'Poster status',
      am: 'የፖስተሩ ሁኔታ',
      om: 'Haala boordichaa',
    },
    generatePoster: {
      en: 'Generate QR Poster',
      am: 'የQR ፖስተር አፍልቅ',
      om: 'Boordii QR Uumi',
    },
    orgRequired: {
      en: 'Please select an organization for this QR poster.',
      am: 'እባክዎ ለዚህ የQR ፖስተር መሥሪያ ቤት ይምረጡ።',
      om: 'Maaloo boordii QR kanaaf dhaabbata filadhaa.',
    },
    labelRequired: {
      en: 'Please enter a descriptive label for the QR poster.',
      am: 'እባክዎ ለQR ፖስተሩ ገላጭ መለያ ያስገቡ።',
      om: 'Maaloo boordii QR kanaaf ibsa maqaa galchaa.',
    },
    codeRequired: {
      en: 'Please enter a unique alphanumeric QR code identifier.',
      am: 'እባክዎ ልዩ የፊደልና ቁጥር የQR ኮድ መለያ ያስገቡ።',
      om: 'Maaloo koodii addaa QR galchaa.',
    }
  },
  activity: {
    allActionTypes: {
      en: 'All action types',
      am: 'ሁሉም የተግባር አይነቶች',
      om: 'Gosa gochaa hunda',
    },
    typeUpdate: {
      en: 'Updates & diffs (UPDATE)',
      am: 'ማሻሻያዎችና ለውጦች (UPDATE)',
      om: 'Fooyya\'iinsa fi jijjiirama (UPDATE)',
    },
    typeCreate: {
      en: 'New additions (CREATE)',
      am: 'አዲስ የተጨመሩ (CREATE)',
      om: 'Haaraa kan dabalame (CREATE)',
    },
    typePublish: {
      en: 'Publications (PUBLISH)',
      am: 'የታተሙ / ይፋ የሆኑ (PUBLISH)',
      om: 'Maxxansoota (PUBLISH)',
    },
    typeSecurity: {
      en: 'Security & access (SECURITY)',
      am: 'ደህንነትና ተደራሽነት (SECURITY)',
      om: 'Nageenya fi heyyama (SECURITY)',
    },
    typeStatus: {
      en: 'Status transitions (STATUS)',
      am: 'የሁኔታ ለውጦች (STATUS)',
      om: 'Jijjiirama haalaa (STATUS)',
    },
    typeDelete: {
      en: 'Record removals (DELETE)',
      am: 'የተሰረዙ መዛግብት (DELETE)',
      om: 'Galmee haqame (DELETE)',
    },
    typeErrors: {
      en: 'Errors & failed requests (HTTP 4xx/5xx)',
      am: 'ስህተቶችና ያልተሳኩ ጥያቄዎች (HTTP 4xx/5xx)',
      om: 'Dogoggora fi gaaffii hin milkoofne (HTTP 4xx/5xx)',
    }
  },
  services: {
    allBranches: {
      en: 'All administrative branches',
      am: 'ሁሉም አስተዳደራዊ ቅርንጫፎች',
      om: 'Dameelee bulchiinsaa hunda',
    },
    subcitiesGroup: {
      en: 'Sub-cities',
      am: 'ክፍለ ከተሞች',
      om: 'Kutaalee Magaalaa',
    },
    centralBureausGroup: {
      en: 'Central Bureaus',
      am: 'ማዕከላዊ ቢሮዎች',
      om: 'Biiroolee Giddugaleessaa',
    },
    searchServicesPlaceholder: {
      en: 'Search services, codes, descriptions...',
      am: 'አገልግሎቶችን፣ ኮዶችን፣ መግለጫዎችን ይፈልጉ...',
      om: 'Tajaajiloota, koodii, ibsa barbaadi...',
    }
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

// Function to recursively count keys
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

// Function to check key parity
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

