import React from 'react';
import { SearchBox } from '../../shared';

interface NewsToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  typeFilter: string;
  onTypeFilterChange: (val: string) => void;
  publicationFilter: string;
  onPublicationFilterChange: (val: string) => void;
}

export const NewsToolbar: React.FC<NewsToolbarProps> = ({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  publicationFilter,
  onPublicationFilterChange,
}) => {
  return (
    <div className="table-toolbar">
      <div>
        <h2>Client feed content</h2>
        <p>Browse public cards, open the full detail, and manage publication.</p>
      </div>
      <div className="toolbar-tools">
        <SearchBox value={search} onChange={onSearchChange} placeholder="Search updates, bureau, location" />
        <select
          className="filter-select"
          value={typeFilter}
          onChange={(event) => onTypeFilterChange(event.target.value)}
          aria-label="Filter by content type"
        >
          <option value="all">All types</option>
          <option value="news">News</option>
          <option value="event">Events</option>
        </select>
        <select
          className="filter-select"
          value={publicationFilter}
          onChange={(event) => onPublicationFilterChange(event.target.value)}
          aria-label="Filter by publication status"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>
      </div>
    </div>
  );
};

