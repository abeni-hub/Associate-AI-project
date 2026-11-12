import React from 'react';
import { PageHeading } from '../shared';
import { NewsModal } from './components/NewsModal';
import { useNewsList, type UseNewsListOptions } from './hooks/useNewsList';
import { NewsOverviewMetrics } from './components/NewsOverviewMetrics';
import { NewsToolbar } from './components/NewsToolbar';
import { NewsCardGrid } from './components/NewsCardGrid';
import type { PostItem } from '../../types/portal.types';

export interface NewsPageProps {
  items?: PostItem[];
  onAdd?: () => void;
  onEdit?: (item: PostItem) => void;
  search?: string;
  setSearch?: (s: string) => void;
  onTogglePublish?: (id: number | string) => void;
}

export const NewsPage: React.FC<NewsPageProps> = (props) => {
  const {
    items,
    filtered,
    publishedCount,
    eventCount,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    publicationFilter,
    setPublicationFilter,
    isLoading,
    isSavingPost,
    isNewsModalOpen,
    setIsNewsModalOpen,
    selectedNewsForEdit,
    setSelectedNewsForEdit,
    canCreate,
    canUpdate,
    canPublish,
    canDelete,
    handleOpenAdd,
    handleOpenEdit,
    handleSaveNews,
    handleDelete,
    onTogglePublish,
  } = useNewsList({
    propItems: props.items,
    propOnAdd: props.onAdd,
    propOnEdit: props.onEdit,
    propSearch: props.search,
    propSetSearch: props.setSearch,
    propOnTogglePublish: props.onTogglePublish,
  });

  return (
    <>
      <PageHeading
        eyebrow="PUBLIC INFORMATION"
        title="News & events"
        subtitle="Manage the bilingual updates and public events shown to residents in the client app."
        action={canCreate ? 'Create an update' : undefined}
        onAction={canCreate ? handleOpenAdd : undefined}
      />

      <NewsOverviewMetrics
        totalCount={items.length}
        publishedCount={publishedCount}
        eventCount={eventCount}
      />

      <section className="panel table-panel news-list-panel">
        <NewsToolbar
          search={search}
          onSearchChange={setSearch}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          publicationFilter={publicationFilter}
          onPublicationFilterChange={setPublicationFilter}
        />

        <NewsCardGrid
          items={items}
          filtered={filtered}
          isLoading={isLoading}
          canCreate={canCreate}
          canUpdate={canUpdate}
          canPublish={canPublish}
          canDelete={canDelete}
          onOpenAdd={handleOpenAdd}
          onOpenEdit={handleOpenEdit}
          onTogglePublish={onTogglePublish}
          onDelete={handleDelete}
          onResetFilters={() => {
            setSearch('');
            setTypeFilter('all');
            setPublicationFilter('all');
          }}
        />
      </section>

      <NewsModal
        isOpen={isNewsModalOpen}
        item={selectedNewsForEdit}
        onClose={() => {
          setIsNewsModalOpen(false);
          setSelectedNewsForEdit(null);
        }}
        onSave={handleSaveNews}
        isLoading={isSavingPost}
      />
    </>
  );
};

export default NewsPage;
