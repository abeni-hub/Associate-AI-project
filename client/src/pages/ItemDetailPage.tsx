import { useState, useEffect, useMemo, type ChangeEvent, type FormEvent } from 'react';
import { getItemById, submitEventRsvp, getRelatedItems } from '../services/newsEventsService';
import { useGetNewsByIdQuery } from '../services/newsApi.js';
import DetailArticleContent from '../components/item-detail/DetailArticleContent.jsx';
import DetailBreadcrumbs from '../components/item-detail/DetailBreadcrumbs.jsx';
import DetailHeader from '../components/item-detail/DetailHeader.jsx';
import DetailHeroMedia from '../components/item-detail/DetailHeroMedia.jsx';
import DetailLoading from '../components/item-detail/DetailLoading.jsx';
import DetailNotFound from '../components/item-detail/DetailNotFound.jsx';
import DetailPageFooter from '../components/item-detail/DetailPageFooter.jsx';
import DetailRelatedItems from '../components/item-detail/DetailRelatedItems.jsx';
import EventSpecsCard from '../components/item-detail/EventSpecsCard.jsx';
import type { Language, NewsEventItem } from '../types/newsEvents';

interface ItemDetailPageProps {
  itemId: string;
  language?: Language;
  onBackToHub?: () => void;
  onBackToHome?: () => void;
  onNavigateToDetail?: (item: NewsEventItem) => void;
}

export default function ItemDetailPage({
  itemId,
  language = 'en',
  onBackToHub,
  onBackToHome,
  onNavigateToDetail,
}: ItemDetailPageProps) {
  const isAm = language === 'am';

  // Check if itemId is numeric for backend RTK Query lookup
  const isNumericId = /^\d+$/.test(itemId);
  const { data: apiArticle, isLoading: apiLoading } = useGetNewsByIdQuery(itemId, {
    skip: !isNumericId,
  });

  const [localItem, setLocalItem] = useState<NewsEventItem | null>(null);
  const [localLoading, setLocalLoading] = useState(true);
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpPhone, setRsvpPhone] = useState('');
  const [rsvpStatus, setRsvpStatus] = useState<'submitting' | 'success' | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setLocalLoading(true);
    async function loadItem() {
      try {
        const found = await getItemById(itemId);
        if (mounted) {
          setLocalItem(found);
        }
      } catch (err) {
        console.error('Failed to load item:', err);
      } finally {
        if (mounted) setLocalLoading(false);
      }
    }
    loadItem();

    return () => {
      mounted = false;
    };
  }, [itemId]);

  const item: NewsEventItem | null = useMemo(() => {
    if (apiArticle?.data) {
      const art = apiArticle.data;
      const contentList = art.contents || [];
      const leadBlock = contentList[0]?.content || '';
      const bodyBlocks = contentList.length > 1
        ? contentList.slice(1).map((c: any) => c.content).join('\n\n')
        : leadBlock;

      return {
        id: String(art.id),
        type: 'news',
        title: art.news_title,
        titleAm: '',
        slug: `news-${art.id}`,
        summary: leadBlock,
        summaryAm: '',
        content: bodyBlocks,
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
        coverImage:
          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
        publishedAt: art.created_at ? art.created_at.split('T')[0] : '2026-10-26',
        readTimeMinutes: Math.max(1, Math.ceil((contentList.reduce((acc: number, c: any) => acc + (c.content?.length || 0), 0) || 500) / 400)),
        isPublished: true,
        tags: [art.organization?.name || 'Addis Ababa', 'Public Notice', 'Citizen Services'],
      };
    }
    return localItem;
  }, [apiArticle, localItem]);

  const loading = isNumericId ? (apiLoading && !localItem) : localLoading;

  async function handleRsvpSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!item || !rsvpName.trim()) return;
    setRsvpStatus('submitting');
    try {
      await submitEventRsvp(item.id, {
        name: rsvpName,
        phone: rsvpPhone,
      });
      setRsvpStatus('success');
    } catch (err) {
      console.error('RSVP failed:', err);
      setRsvpStatus(null);
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: item ? (isAm ? item.titleAm || item.title : item.title) : 'CivicLink Ethiopia',
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.warn('Share dismissed or clipboard blocked', err);
    }
  };

  const related = useMemo(() => (item ? getRelatedItems(item) : []), [item]);

  if (loading) {
    return <DetailLoading language={language} />;
  }

  if (!item) {
    return <DetailNotFound language={language} onBack={onBackToHub} />;
  }

  const title = isAm && item.titleAm ? item.titleAm : item.title;
  const summary = isAm && item.summaryAm ? item.summaryAm : item.summary;
  const content = isAm && item.contentAm ? item.contentAm : item.content;
  const category = isAm && item.categoryAm ? item.categoryAm : item.category;
  const bureau = isAm && item.bureauAm ? item.bureauAm : item.bureau;
  const subCity = isAm && item.subCityAm ? item.subCityAm : item.subCity;

  return (
    <article className="nep-detail-page item-detail-page">
      <DetailBreadcrumbs
        isAm={isAm}
        onBackToHub={onBackToHub}
        onBackToHome={onBackToHome}
        title={title}
      />

      <div className="nep-detail-container detail-page-main">
        <DetailHeroMedia item={item} title={title} language={language} />

        <DetailHeader
          isAm={isAm}
          item={item}
          title={title}
          summary={summary}
          category={category}
          bureau={bureau}
          subCity={subCity}
          language={language}
          copied={copied}
          onCopyLink={handleShare}
        />

        <div className="nep-detail-body-grid">
          <main className="nep-detail-main">
            <DetailArticleContent
              isAm={isAm}
              item={item}
              content={content}
              bureau={bureau}
            />
          </main>

          {item.type === 'event' && (
            <aside className="nep-detail-sidebar">
              <EventSpecsCard
                item={item}
                language={language}
                rsvpName={rsvpName}
                rsvpPhone={rsvpPhone}
                rsvpStatus={rsvpStatus}
                onRsvpNameChange={(e: ChangeEvent<HTMLInputElement>) => setRsvpName(e.target.value)}
                onRsvpPhoneChange={(e: ChangeEvent<HTMLInputElement>) => setRsvpPhone(e.target.value)}
                onSubmitRsvp={handleRsvpSubmit}
              />
            </aside>
          )}
        </div>

        {related.length > 0 && (
          <DetailRelatedItems
            isAm={isAm}
            item={item}
            related={related}
            onBackToHub={onBackToHub}
            onNavigateToDetail={onNavigateToDetail}
          />
        )}
      </div>
    </article>
  );
}
