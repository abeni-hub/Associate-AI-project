const field = (name, label, options = {}) => ({ name, label, ...options })
const forType = (type) => (values) => values.type === type

export const NEWS_EVENT_FORM_FIELDS = [
  field('type', 'Content type', {
    type: 'select', required: true, value: 'news',
    options: [{ value: 'news', label: 'News article' }, { value: 'event', label: 'Public event' }],
  }),
  field('publicationStatus', 'Publication', {
    type: 'select', required: true, value: 'draft',
    options: [{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }],
  }),
  field('title', 'Title (English)', { required: true }),
  field('titleAm', 'Title (Amharic)', { required: true }),
  field('slug', 'Page slug', { placeholder: 'Generated from the English title when blank' }),
  field('category', 'Category', { required: true, placeholder: 'e.g. Civil Registry' }),
  field('categoryAm', 'Category (Amharic)', { required: true }),
  field('bureau', 'Publishing bureau', { required: true }),
  field('bureauAm', 'Publishing bureau (Amharic)', { required: true }),
  field('subCity', 'Sub-city', { required: true, placeholder: 'e.g. All Addis Ababa', visibleWhen: forType('news') }),
  field('subCityAm', 'Sub-city (Amharic)', { required: true, visibleWhen: forType('news') }),
  field('summary', 'Summary (English)', { type: 'textarea', rows: 3, full: true, required: true }),
  field('summaryAm', 'Summary (Amharic)', { type: 'textarea', rows: 3, full: true, required: true }),
  field('content', 'Full content (English)', { type: 'textarea', rows: 6, full: true, required: true }),
  field('contentAm', 'Full content (Amharic)', { type: 'textarea', rows: 6, full: true, required: true }),
  field('coverImage', 'Cover image URL', { type: 'url', full: true, placeholder: 'https://…' }),
  field('isFeatured', 'Feature on the landing page', {
    type: 'select', value: 'No', options: [{ value: 'Yes', label: 'Featured' }, { value: 'No', label: 'Standard' }],
  }),
  field('publishedAt', 'Publication date', { type: 'date', required: true, visibleWhen: forType('news') }),
  field('readTimeMinutes', 'Reading time (minutes)', { type: 'number', value: 3, visibleWhen: forType('news') }),
  field('authorName', 'Author name', { visibleWhen: forType('news') }),
  field('authorNameAm', 'Author name (Amharic)', { visibleWhen: forType('news') }),
  field('authorRole', 'Author role', { visibleWhen: forType('news') }),
  field('authorRoleAm', 'Author role (Amharic)', { visibleWhen: forType('news') }),
  field('authorAvatar', 'Author image URL', { type: 'url', full: true, placeholder: 'https://…', visibleWhen: forType('news') }),
  field('tags', 'Search tags', { full: true, placeholder: 'Separate tags with commas', visibleWhen: forType('news') }),
  field('eventDate', 'Event date', { type: 'date', required: true, visibleWhen: forType('event') }),
  field('endDate', 'Event end date', { type: 'date', visibleWhen: forType('event') }),
  field('time', 'Time (English)', { required: true, visibleWhen: forType('event') }),
  field('timeAm', 'Time (Amharic)', { required: true, visibleWhen: forType('event') }),
  field('venue', 'Venue', { required: true, visibleWhen: forType('event') }),
  field('venueAm', 'Venue (Amharic)', { required: true, visibleWhen: forType('event') }),
  field('address', 'Address', { visibleWhen: forType('event') }),
  field('addressAm', 'Address (Amharic)', { visibleWhen: forType('event') }),
  field('locationSubCity', 'Event sub-city', { required: true, placeholder: 'e.g. Bole', visibleWhen: forType('event') }),
  field('locationSubCityAm', 'Event sub-city (Amharic)', { required: true, visibleWhen: forType('event') }),
  field('isVirtual', 'Event format', {
    type: 'select', value: 'false', options: [{ value: 'false', label: 'In person' }, { value: 'true', label: 'Virtual' }], visibleWhen: forType('event'),
  }),
  field('virtualLink', 'Virtual event link', { type: 'url', required: true, full: true, placeholder: 'https://…', visibleWhen: (values) => values.type === 'event' && values.isVirtual === 'true' }),
  field('capacity', 'Attendance capacity', { type: 'number', visibleWhen: forType('event') }),
  field('eventStatus', 'Event status', {
    type: 'select', value: 'upcoming', options: ['upcoming', 'live', 'completed', 'cancelled'], visibleWhen: forType('event'),
  }),
  field('registrationRequired', 'Registration', {
    type: 'select', value: 'true', options: [{ value: 'true', label: 'Required' }, { value: 'false', label: 'Not required' }], visibleWhen: forType('event'),
  }),
  field('organizer', 'Organizer', { visibleWhen: forType('event') }),
  field('organizerAm', 'Organizer (Amharic)', { visibleWhen: forType('event') }),
]

export function newsEventFormValues(item) {
  const isEvent = item?.type === 'event'
  return {
    type: isEvent ? 'event' : 'news',
    publicationStatus: item ? (item.isPublished === false ? 'draft' : 'published') : 'draft',
    title: item?.title ?? '',
    titleAm: item?.titleAm ?? '',
    slug: item?.slug ?? '',
    category: item?.category ?? '',
    categoryAm: item?.categoryAm ?? '',
    bureau: item?.bureau ?? '',
    bureauAm: item?.bureauAm ?? '',
    subCity: item?.subCity ?? 'All Addis Ababa',
    subCityAm: item?.subCityAm ?? '',
    summary: item?.summary ?? '',
    summaryAm: item?.summaryAm ?? '',
    content: item?.content ?? '',
    contentAm: item?.contentAm ?? '',
    coverImage: item?.coverImage ?? '',
    isFeatured: item?.isFeatured ? 'Yes' : 'No',
    publishedAt: item?.publishedAt ?? '',
    readTimeMinutes: item?.readTimeMinutes ?? 3,
    authorName: item?.author?.name ?? '',
    authorNameAm: item?.author?.nameAm ?? '',
    authorRole: item?.author?.role ?? '',
    authorRoleAm: item?.author?.roleAm ?? '',
    authorAvatar: item?.author?.avatar ?? '',
    tags: item?.tags?.join(', ') ?? '',
    eventDate: item?.eventDate ?? '',
    endDate: item?.endDate ?? '',
    time: item?.time ?? '',
    timeAm: item?.timeAm ?? '',
    venue: item?.location?.venue ?? '',
    venueAm: item?.location?.venueAm ?? '',
    address: item?.location?.address ?? '',
    addressAm: item?.location?.addressAm ?? '',
    locationSubCity: item?.location?.subCity ?? '',
    locationSubCityAm: item?.location?.subCityAm ?? '',
    isVirtual: item?.location?.isVirtual ? 'true' : 'false',
    virtualLink: item?.location?.virtualLink ?? '',
    capacity: item?.capacity ?? '',
    eventStatus: item?.status ?? 'upcoming',
    registrationRequired: item?.registrationRequired === false ? 'false' : 'true',
    organizer: item?.organizer ?? '',
    organizerAm: item?.organizerAm ?? '',
  }
}

function slugify(value) {
  return value.trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function toNewsEventRecord(values, existingItem) {
  const isEvent = values.type === 'event'
  const title = values.title.trim()
  const record = {
    id: existingItem?.id ?? `${values.type}-${Date.now()}`,
    type: values.type,
    title,
    titleAm: values.titleAm.trim(),
    slug: values.slug.trim() || slugify(title),
    summary: values.summary.trim(),
    summaryAm: values.summaryAm.trim(),
    content: values.content.trim(),
    contentAm: values.contentAm.trim(),
    category: values.category,
    categoryAm: values.categoryAm.trim(),
    bureau: values.bureau.trim(),
    bureauAm: values.bureauAm.trim(),
    coverImage: values.coverImage.trim(),
    isFeatured: values.isFeatured === 'Yes',
    isPublished: values.publicationStatus === 'published',
  }

  if (isEvent) {
    return {
      ...record,
      eventDate: values.eventDate,
      endDate: values.endDate || values.eventDate,
      time: values.time.trim(),
      timeAm: values.timeAm.trim(),
      location: {
        venue: values.venue.trim(),
        venueAm: values.venueAm.trim(),
        address: values.address.trim(),
        addressAm: values.addressAm.trim(),
        subCity: values.locationSubCity,
        subCityAm: values.locationSubCityAm.trim(),
        isVirtual: values.isVirtual === 'true',
        ...(values.isVirtual === 'true' && values.virtualLink.trim()
          ? { virtualLink: values.virtualLink.trim() }
          : {}),
      },
      capacity: Number(values.capacity) || 0,
      rsvpCount: existingItem?.rsvpCount ?? 0,
      status: values.eventStatus,
      registrationRequired: values.registrationRequired === 'true',
      organizer: values.organizer.trim(),
      organizerAm: values.organizerAm.trim(),
    }
  }

  return {
    ...record,
    subCity: values.subCity,
    subCityAm: values.subCityAm.trim(),
    publishedAt: values.publishedAt,
    readTimeMinutes: Math.max(1, Number(values.readTimeMinutes) || 1),
    views: existingItem?.views ?? 0,
    tags: values.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    author: {
      name: values.authorName.trim(),
      nameAm: values.authorNameAm.trim(),
      role: values.authorRole.trim(),
      roleAm: values.authorRoleAm.trim(),
      avatar: values.authorAvatar.trim(),
    },
  }
}

export function createNewsEventModal(item, onSave) {
  const initialValues = newsEventFormValues(item)
  return {
    kind: 'form',
    size: 'wide',
    eyebrow: 'PUBLIC INFORMATION',
    title: item ? 'Edit news or event' : 'Create news or event',
    description: 'Manage the bilingual content shown in the public client app.',
    submit: item ? 'Save changes' : 'Save update',
    footerNote: 'Published updates appear in the public client feed.',
    fields: NEWS_EVENT_FORM_FIELDS.map((field) => ({ ...field, value: initialValues[field.name] ?? field.value ?? '' })),
    onSubmit: (values) => onSave(toNewsEventRecord(values, item)),
  }
}
