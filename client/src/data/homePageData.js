export const subCityOptions = [
  'Addis Ketema',
  'Akaki Kality',
  'Arada',
  'Bole',
  'Gulele',
  'Kirkos',
  'Kolfe Keranio',
  'Lideta',
  'Lemi Kura',
  'Nifas Silk-Lafto',
  'Yeka',
]

export const bureauOptions = [
  { id: 'revenue', label: 'Addis Ababa Revenues Bureau', shortLabel: 'Revenues Bureau' },
  { id: 'civil', label: 'Civil Registration & Residency Service Agency', shortLabel: 'CRRSA district office' },
  { id: 'land', label: 'Land Development & Administration Bureau', shortLabel: 'Land Development & Administration' },
  { id: 'trade', label: 'City Government Trade Bureau', shortLabel: 'Trade Bureau' },
  { id: 'planning', label: 'Plan & Development Office', shortLabel: 'Plan & Development' },
]

const sampleService = (id, label, summary) => ({
  id,
  label,
  summary,
  documents: ['Valid kebele ID or Fayda ID, where applicable', 'Relevant account, record, or application reference'],
  steps: [
    { room: '01', title: 'Service desk', detail: 'Confirm the right service and current requirements.' },
    { room: '02', title: 'Request review', detail: 'An officer checks your request and supporting details.' },
    { room: '03', title: 'Next step', detail: 'Complete the service or collect its confirmation.' },
  ],
})

export const serviceCatalog = {
  revenue: [
    sampleService('tin-registration', 'e-TIN registration', 'Register for or update a taxpayer identification number.'),
    sampleService('tax-payment', 'Tax payment', 'Check tax payment options and obtain a payment confirmation.'),
    sampleService('tax-clearance', 'Digital tax clearance', 'Request a tax clearance certificate.'),
    sampleService('tax-simulator', 'Tax estimate (VAT, income, turnover)', 'Use the bureau’s tax simulator to estimate a tax amount.'),
  ],
  civil: [
    {
      ...sampleService('birth-copy', 'Birth registration & certificate', 'Register a child’s birth within 90 days and receive the official civil registration certificate.'),
      routeHeading: 'Registration steps',
      visitNote: 'Call CRRSA at 7533 to confirm the district office serving your address in Bole and its current desk location.',
      documents: [
        'Bring identification and evidence that you are the child’s parent, guardian, or custodian.',
        'For a birth at a health facility, bring the birth notification paper issued by the facility.',
        'Have the child’s full name, date and place of birth ready. For late registration, bring the reason and supporting evidence.',
      ],
      steps: [
        { room: '01', routeLabel: 'Local office', title: 'Choose the correct registration office', detail: 'Use the civil registration office serving a parent or guardian’s principal residence, or the office or health facility where the birth occurred.' },
        { room: '02', routeLabel: 'Declare', title: 'Make the birth declaration', detail: 'The parent or authorized guardian appears in person; the civil status officer records and checks the birth details.' },
        { room: '03', routeLabel: 'Certificate', title: 'Receive the birth certificate', detail: 'The civil status officer completes the registration and issues the official certificate.' },
      ],
    },
    sampleService('marriage-record', 'Marriage registration / certificate', 'Register a marriage or request a marriage certificate.'),
    sampleService('death-certificate', 'Death registration / certificate', 'Register a death or request a death certificate.'),
    sampleService('divorce-record', 'Divorce registration', 'Register a divorce or request a divorce record.'),
    sampleService('adoption-record', 'Adoption registration', 'Register an adoption or request its supporting record.'),
    sampleService('residence-id', 'Residence ID card', 'Apply for or update a resident identification card.'),
    sampleService('family-registration', 'Family registration', 'Register or update a family record.'),
    sampleService('residence-transfer', 'Residence transfer', 'Update a residence record after moving.'),
    sampleService('non-marital-certificate', 'Non-marital certificate', 'Request a certificate of non-marital status.'),
    sampleService('residency-verification', 'Residency verification', 'Request verification of a residence record.'),
  ],
  land: [
    sampleService('ownership-copy', 'Landholding record / correction', 'Request land record information or a record correction.'),
    sampleService('land-transfer', 'Land rights creation / transfer', 'Request a land-rights creation or transfer service.'),
    sampleService('land-lease', 'Land lease tender information', 'Find information about a city land lease tender.'),
    sampleService('land-information', 'Integrated land information', 'Request land information or records support.'),
    sampleService('land-preparation', 'Land preparation and transfer', 'Ask about land preparation and transfer services.'),
  ],
  trade: [
    sampleService('business-license', 'New business license', 'Apply for a new business license.'),
    sampleService('business-renewal', 'Business license renewal', 'Renew an existing business license.'),
    sampleService('business-amendment', 'Business license amendment', 'Update details on a business license.'),
    sampleService('business-replacement', 'Replace a lost or damaged license', 'Request a replacement business license.'),
    sampleService('business-cancellation', 'Business license cancellation', 'Request cancellation of a business license.'),
    sampleService('registration-amendment', 'Commercial registration amendment', 'Update commercial registration details.'),
    sampleService('registration-cancellation', 'Commercial registration cancellation', 'Request cancellation of commercial registration.'),
  ],
  planning: [
    sampleService('structural-plan', 'Structural plan preparation / amendment', 'Request preparation or amendment of a city structural plan.'),
    sampleService('infrastructure-review', 'Infrastructure design review', 'Request review of an infrastructure design.'),
    sampleService('spatial-plan-information', 'Spatial plan information', 'Request information or clarification about a spatial plan.'),
    sampleService('planning-statistics', 'City statistics and documentation', 'Request social and economic statistics or documentation.'),
    sampleService('planning-implementation', 'Plan implementation information', 'Ask about plan implementation and related city services.'),
  ],
}

export const serviceFor = (bureauId, serviceId) =>
  serviceCatalog[bureauId]?.find((service) => service.id === serviceId) ?? serviceCatalog[bureauId]?.[0]

export const heroSlides = [
  {
    bureau: 'REVENUE BUREAU',
    title: 'Revenue services, made clearer.',
    description: 'Know what to prepare before you visit your local revenue office.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Local_government_building%2C_Yeka_Subcity%2C_Addis_Ababa.jpg/1280px-Local_government_building%2C_Yeka_Subcity%2C_Addis_Ababa.jpg',
    alt: 'Local government office building in Yeka Subcity, Addis Ababa.',
    credit: 'Yeka Subcity Office · Mjr74 (CC BY 4.0)',
    source: 'https://commons.wikimedia.org/wiki/File:Local_government_building,_Yeka_Subcity,_Addis_Ababa.jpg',
    tint: '#164d58',
  },
  {
    bureau: 'PLANNING & DEVELOPMENT',
    title: 'A better view of what’s next.',
    description: 'Find planning and development information for your community.',
    image: 'https://mopd.gov.et/media/492570380_994507082831520_8549139107595449985_n.jpg',
    alt: 'Officials meet at Ethiopia’s Ministry of Planning and Development.',
    credit: 'Ministry of Planning & Development',
    source: 'https://mopd.gov.et/',
    tint: '#365b63',
  },
  {
    bureau: 'CIVIL REGISTRATION',
    title: 'The right documents. The right place.',
    description: 'Prepare for vital records and civil registration services.',
    image: 'https://aacrrsa.gov.et/uploads/Blog/662a29f023bf6.438697344_821273923352047_6926469178446352208_n.jpg',
    alt: 'The Addis Ababa Civil Registration and Residency Service Agency lobby.',
    credit: 'Civil Registration & Residency Service Agency',
    source: 'https://aacrrsa.gov.et/',
    tint: '#3b625e',
  },
  {
    bureau: 'LAND ADMINISTRATION',
    title: 'Find your way through land services.',
    description: 'See what to bring and where to go for property record services.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Lemikurasubcityworeda08.jpg',
    alt: 'Lemi Kura Woreda 08 local government office in Addis Ababa.',
    credit: 'Lemi Kura Woreda 08 · Khajitdadddy (CC BY-SA 4.0)',
    source: 'https://commons.wikimedia.org/wiki/File:Lemikurasubcityworeda08.jpg',
    tint: '#536458',
  },
]
