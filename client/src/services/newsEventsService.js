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
  return readSharedNewsEvents([]).filter((item) => item.isPublished !== false);
}

export const MOCK_NEWS = [];
export const MOCK_EVENTS = [];

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
export function parseNewsItem(art) {
  const contents = art.contents || [];
  const imageBlocks = contents.filter(
    (c) => c.content_type === 'image_url' || c.content_type === 'image'
  );
  const textBlocks = contents.filter(
    (c) => c.content_type !== 'image_url' && c.content_type !== 'image'
  );

  const images = imageBlocks.map((b) => b.content).filter(Boolean);
  const coverImage =
    images[0] ||
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80';

  const summary =
    textBlocks.length > 1
      ? textBlocks[0].content
      : textBlocks[0]?.content
      ? textBlocks[0].content.length > 160
        ? textBlocks[0].content.slice(0, 160) + '...'
        : textBlocks[0].content
      : 'Official Municipal Announcement';

  const content =
    textBlocks.length > 1
      ? textBlocks.slice(1).map((c) => c.content).join('\n\n')
      : textBlocks[0]?.content || '';

  const totalLength = textBlocks.reduce((acc, c) => acc + (c.content?.length || 0), 0);
  const readTimeMinutes = Math.max(1, Math.ceil((totalLength || 400) / 400));

  return {
    id: String(art.id),
    type: 'news',
    title: art.news_title,
    titleAm: '',
    slug: `news-${art.id}`,
    summary,
    summaryAm: '',
    content,
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
    coverImage,
    images,
    publishedAt: art.created_at ? art.created_at.split('T')[0] : '2026-10-26',
    readTimeMinutes,
    isPublished: true,
    tags: [art.organization?.name || 'Addis Ababa', 'Public Notice', 'Citizen Services'],
  };
}

export function parseEventItem(ev) {
  const rawImages = ev.images || [];
  const images = rawImages
    .map((img) => (typeof img === 'string' ? img : img.image_url))
    .filter(Boolean);

  const coverImage =
    images[0] ||
    'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80';

  return {
    id: String(ev.id),
    type: 'event',
    title: ev.title,
    titleAm: '',
    slug: `event-${ev.id}`,
    summary:
      ev.description && ev.description.length > 160
        ? ev.description.slice(0, 160) + '...'
        : ev.description || 'Public Municipal Event',
    summaryAm: '',
    content: ev.description || '',
    contentAm: '',
    category: 'Public consultation',
    categoryAm: 'የህዝብ ውይይት',
    subCity: ev.organization?.name || 'All Addis Ababa',
    subCityAm: 'ሁሉም አዲስ አበባ',
    bureau: ev.organization?.name || 'City Administration',
    bureauAm: 'የከተማ አስተዳደር',
    coverImage,
    images,
    eventDate: ev.event_date ? ev.event_date.split('T')[0] : '2026-11-15',
    endDate: ev.end_date ? ev.end_date.split('T')[0] : null,
    audience: ev.audience || 'All Citizens',
    startTime: '09:00',
    endTime: '13:00',
    location: {
      venue: ev.location_name || 'City Administration Hall',
      subCity: ev.organization?.name || 'Bole',
      woreda: '01',
      mapUrl: 'https://maps.google.com',
    },
    rsvp: { total: 45, max: 200, isRegistered: false },
    isPublished: ev.status === 'published',
    tags: [ev.organization?.name || 'Addis Ababa', 'Public Event', 'Civic Forum'],
  };
}

export async function getHomeHighlights() {
  let liveNews = [];
  try {
    liveNews = (await fetchBackendNews()) || [];
  } catch {
    liveNews = [];
  }

  let liveEvents = [];
  try {
    liveEvents = (await fetchBackendEvents()) || [];
  } catch {
    liveEvents = [];
  }

  const fallbackItems = getPublishedNewsEvents();
  const fallbackNews = fallbackItems.filter((item) => item.type === 'news');
  const fallbackEvents = fallbackItems.filter((item) => item.type === 'event');

  const finalNews = liveNews.length > 0 ? liveNews : fallbackNews;
  const finalEvents = liveEvents.length > 0 ? liveEvents : fallbackEvents;

  return {
    news: finalNews.slice(0, 3),
    events: finalEvents.slice(0, 3),
    totalNews: finalNews.length,
    totalEvents: finalEvents.length,
  };
}

function getApiBaseUrl() {
  const envUrl = import.meta.env?.VITE_API_BASE_URL || import.meta.env?.VITE_API_URL;
  if (typeof envUrl === 'string' && envUrl.trim().length > 0) {
    let url = envUrl.trim().replace(/\/+$/, '');
    if (url.endsWith('/api')) {
      url = `${url}/v1`;
    } else if (!url.endsWith('/api/v1')) {
      url = `${url}/api/v1`;
    }
    return url;
  }
  return '/api/v1';
}

async function fetchBackendNews() {
  try {
    const base = getApiBaseUrl();
    const res = await fetch(`${base}/news`);
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data.map(parseNewsItem);
    }
  } catch (err) {
    console.warn('Backend news query error, using local fallback:', err);
  }
  return null;
}

async function fetchBackendEvents() {
  try {
    const base = getApiBaseUrl();
    const res = await fetch(`${base}/events`);
    if (!res.ok) return null;
    const json = await res.json();
    const eventData = json.data?.data || json.data;
    if (Array.isArray(eventData)) {
      return eventData.map(parseEventItem);
    }
  } catch (err) {
    console.warn('Backend events query error, using local fallback:', err);
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
  const newsSource = liveNews !== null
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
  const liveEvents = await fetchBackendEvents();
  const eventSource = liveEvents !== null
    ? liveEvents
    : getPublishedNewsEvents().filter((item) => item.type === 'event');

  const filtered = filterItems(eventSource, { category, subCity, search });
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

  let liveEvents = [];
  try {
    liveEvents = (await fetchBackendEvents()) || [];
  } catch {
    liveEvents = [];
  }

  const fallbackEvents = getPublishedNewsEvents().filter((item) => item.type === 'event');
  const events = liveEvents.length > 0 ? liveEvents : fallbackEvents;
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
  const cleanId = String(id).replace(/^(news-|event-)/, '');
  const base = getApiBaseUrl();

  // 1. If ID explicitly indicates event or starts with event-
  if (String(id).startsWith('event-')) {
    try {
      const res = await fetch(`${base}/events/${cleanId}`);
      if (res.ok) {
        const json = await res.json();
        const ev = json.data;
        if (ev) return parseEventItem(ev);
      }
    } catch (err) {
      console.warn('Backend event lookup error:', err);
    }
  }

  // 2. Try news endpoint
  try {
    const res = await fetch(`${base}/news/${cleanId}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return parseNewsItem(json.data);
      }
    }
  } catch (err) {
    console.warn('Backend news lookup error:', err);
  }

  // 3. Fallback: try event endpoint if not previously checked
  if (!String(id).startsWith('event-')) {
    try {
      const res = await fetch(`${base}/events/${cleanId}`);
      if (res.ok) {
        const json = await res.json();
        const ev = json.data;
        if (ev) return parseEventItem(ev);
      }
    } catch (err) {
      console.warn('Backend event fallback lookup error:', err);
    }
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
