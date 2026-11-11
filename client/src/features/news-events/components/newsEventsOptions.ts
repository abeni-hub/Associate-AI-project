export interface CategoryOption {
  id: string
  label: string
  labelAm: string
}

export const categories: CategoryOption[] = [
  { id: 'all', label: 'All Categories', labelAm: 'ሁሉም ዘርፎች' },
  { id: 'Public notice', label: 'Public Notices', labelAm: 'ይፋዊ ማስታወቂያ' },
  { id: 'Digital Services', label: 'Digital Services', labelAm: 'ዲጂታል አገልግሎት' },
  { id: 'Civil Registry', label: 'Civil Registry', labelAm: 'የሲቪል ምዝገባ' },
  { id: 'Urban Planning', label: 'Urban Planning', labelAm: 'የከተማ ፕላን' },
  { id: 'Commerce & Trade', label: 'Commerce & Trade', labelAm: 'ንግድና ገበያ' },
  { id: 'Town Hall', label: 'Town Hall & Forums', labelAm: 'የህዝብ መድረክ' },
  { id: 'Community Service', label: 'Community Service', labelAm: 'የማህበረሰብ አገልግሎት' },
  { id: 'Citizen Services', label: 'Citizen Care & Standards', labelAm: 'የዜጎች አገልግሎት' },
]

export const subCities: string[] = [
  'All Addis Ababa',
]

