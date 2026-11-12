import React from 'react';
import { Icon } from '../../shared';
import type { PostItem } from '../../../types/portal.types';

interface NewsDetailContentProps {
  item: PostItem;
  event: boolean;
  language: 'en' | 'am';
  onLanguageChange: (lang: 'en' | 'am') => void;
  body?: string;
}

export const NewsDetailContent: React.FC<NewsDetailContentProps> = ({
  item,
  event,
  language,
  onLanguageChange,
  body,
}) => {
  return (
    <section className="news-detail-content-area">
      <div className="news-detail-section-header">
        <div>
          <span className="panel-eyebrow">{event ? 'EVENT BRIEFING' : 'OFFICIAL STATEMENT'}</span>
          <h2>{language === 'am' ? 'ዝርዝር መግለጫ' : 'Full Briefing'}</h2>
        </div>
        <div className="news-language-switch" role="group" aria-label="Preview language">
          <button
            type="button"
            className={language === 'en' ? 'active' : ''}
            onClick={() => onLanguageChange('en')}
          >
            English
          </button>
          <button
            type="button"
            className={language === 'am' ? 'active' : ''}
            onClick={() => onLanguageChange('am')}
          >
            አማርኛ
          </button>
        </div>
      </div>

      <div className="news-detail-prose">
        {body || (language === 'am' ? 'ሙሉ መረጃ አልተጨመረም።' : 'Full content has not been added yet.')}
      </div>

      {/* Tags */}
      {item.tags?.length ? (
        <div className="news-detail-tags-row">
          <span>{language === 'am' ? 'ተዛማጅ ርዕሶች፦' : 'Related Topics:'}</span>
          {item.tags.map((tag) => <small key={tag}>#{tag}</small>)}
        </div>
      ) : null}

      {/* Verification Banner */}
      <div className="news-detail-verified-banner">
        <Icon name="checkCircle" size={20} />
        <div>
          <b>{language === 'am' ? 'የተረጋገጠ ይፋዊ መረጃ' : 'Verified Public Information'}</b>
          <p>
            {language === 'am'
              ? 'ይህ መረጃ በአዲስ አበባ ከተማ አስተዳደር ይፋዊ ስርዓት የተረጋገጠና ለዜጎች መተግበሪያ የተለቀቀ ነው።'
              : 'Published and verified through the Addis Ababa City Administration official civic communication portal.'}
          </p>
        </div>
      </div>
    </section>
  );
};

