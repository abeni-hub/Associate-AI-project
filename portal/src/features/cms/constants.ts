export const CMS_SECTIONS = [
  { id: 'announcement', num: '01', label: 'Announcement', icon: 'bell', desc: 'Top alert banner' },
  { id: 'hero', num: '02', label: 'Hero & Spotlight', icon: 'desktop', desc: 'Headlines, CTA buttons & photo slides' },
  { id: 'quickSearch', num: '03', label: 'Quick Search', icon: 'search', desc: 'Find service widget' },
  { id: 'serviceGuide', num: '04', label: 'Service Guide', icon: 'layers', desc: 'Step-by-step visitor checklist' },
  { id: 'journey', num: '05', label: 'Citizen Journey', icon: 'route', desc: '3-stage experience walkthrough' },
  { id: 'newsEvents', num: '06', label: 'News & Events', icon: 'news', desc: 'Community updates feed' },
  { id: 'feedback', num: '07', label: 'Feedback CTA', icon: 'message', desc: 'Citizen voice prompt' },
  { id: 'footer', num: '08', label: 'Footer & Teams', icon: 'building', desc: 'Admin strip & bottom note' },
] as const;

export const EMPTY_CMS_CONFIG: any = {
  announcement: { enabled: true, tag: '', message: '', linkText: '', linkUrl: '' },
  hero: { badge: '', titleEn: '', titleAm: '', subtitleEn: '', subtitleAm: '', primaryCtaText: '', primaryCtaUrl: '', secondaryCtaText: '', secondaryCtaUrl: '', slides: [] },
  quickSearch: { enabled: true, kicker: '', kickerNum: '01', title: '', subtitle: '', buttonText: '', footnoteText: '' },
  serviceGuide: { enabled: true, kicker: '', kickerNum: '02', titleLead: '', titleEmphasis: '', description: '', sampleBadgeText: '', whatToBringTitle: '', expectationsNote: '', routeHeading: '', disclaimerText: '' },
  journey: { enabled: true, kicker: '', kickerNum: '03', title: '', steps: [] },
  newsEvents: { enabled: true, kicker: '', kickerNum: '04', title: '', sourceLabel: '', showEvents: true, showNews: true, viewAllText: '', emptyMessage: '' },
  feedback: { enabled: true, kicker: '', kickerNum: '05', title: '', description: '', pointOne: '', pointTwo: '', quote: '' },
  footer: { enabled: true, brandTagline: '', description: '', adminStripKicker: '', adminStripTitle: '', adminStripDescription: '', copyright: '', bottomNote: '', helplinePhone: '' },
};

