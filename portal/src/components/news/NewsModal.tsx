import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../shared/Icon';
import { SearchSelect, type SearchSelectOption } from '../shared/SearchSelect';
import { useGetOrganizationsQuery } from '../../services/organizationsApi';

export interface NewsModalProps {
  item?: any;
  organizations?: any[];
  isOpen: boolean;
  onClose: () => void;
  onSave?: (saved: any) => void;
}

export const NewsModal: React.FC<NewsModalProps> = ({
  item,
  organizations: propOrganizations,
  isOpen,
  onClose,
  onSave,
}) => {
  const { data: apiOrgs } = useGetOrganizationsQuery(undefined, { skip: !isOpen });

  // Form states strictly matching news and news_content schema
  const [title, setTitle] = useState('');
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync form states when opening or switching item
  useEffect(() => {
    if (isOpen) {
      setTitle(item?.title || item?.news_title || '');
      setOrganizationId(item?.organization_id || item?.organization?.id || null);

      // Extract multiple image blocks if available
      const imageBlocks = item?.contents?.filter(
        (c: any) => c.content_type === 'image_url' || c.content_type === 'image'
      ) || [];

      if (imageBlocks.length > 0) {
        setImageUrls(imageBlocks.map((b: any) => b.content));
      } else if (item?.images?.length) {
        setImageUrls(item.images);
      } else if (item?.coverImage) {
        setImageUrls([item.coverImage]);
      } else {
        setImageUrls(['']);
      }

      // Extract text content blocks
      const textBlocks =
        item?.contents?.filter(
          (c: any) => c.content_type !== 'image_url' && c.content_type !== 'image'
        ) || [];

      if (textBlocks.length > 1) {
        setSummary(textBlocks[0].content);
        setContent(textBlocks.slice(1).map((b: any) => b.content).join('\n\n'));
      } else if (textBlocks.length === 1) {
        setSummary(item?.summary && item?.summary !== textBlocks[0].content ? item.summary : '');
        setContent(textBlocks[0].content);
      } else {
        setSummary(item?.summary || '');
        setContent(item?.content || '');
      }

      setErrorMsg(null);
    }
  }, [isOpen, item]);

  // Organization options for publisher link
  const organizationOptions: SearchSelectOption[] = useMemo(() => {
    const list: any[] = propOrganizations?.length ? propOrganizations : apiOrgs?.data || [];
    return list.map((org: any) => ({
      value: org.id,
      label: org.name,
      code: org.code,
      badge: org.organization_type_id === 1 ? 'Sub-City' : org.organization_type_id === 2 ? 'Woreda' : 'Bureau',
      badgeTone: org.organization_type_id === 1 ? 'sage' : org.organization_type_id === 2 ? 'blue' : 'gold',
    }));
  }, [propOrganizations, apiOrgs]);

  const handleImageUrlChange = (index: number, val: string) => {
    setImageUrls((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleAddImageUrl = () => {
    setImageUrls((prev) => [...prev, '']);
  };

  const handleRemoveImageUrl = (index: number) => {
    setImageUrls((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : [''];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setErrorMsg('Article headline is required.');
    if (!organizationId) return setErrorMsg('Publishing organization is required.');
    if (!content.trim() && !summary.trim()) return setErrorMsg('Article content is required.');

    // Build ordered blocks for news_content table
    const contents: Array<{ content: string; content_type: string; order: number }> = [];
    let order = 1;

    // Filter non-empty image URLs
    const validImages = imageUrls.map((u) => u.trim()).filter(Boolean);
    validImages.forEach((url) => {
      contents.push({
        content: url,
        content_type: 'image_url',
        order: order++,
      });
    });

    if (summary.trim()) {
      contents.push({
        content: summary.trim(),
        content_type: 'text',
        order: order++,
      });
    }

    if (content.trim()) {
      contents.push({
        content: content.trim(),
        content_type: 'text',
        order: order++,
      });
    }

    const payload = {
      ...(item?.id ? { id: item.id } : {}),
      news_title: title.trim(),
      organization_id: Number(organizationId),
      contents,
    };

    onSave?.(payload);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay">
      <section
        className="modal-card modal-form"
        role="dialog"
        aria-modal="true"
        aria-label={item ? 'Edit news article' : 'Create news article'}
        style={{ maxWidth: '640px', width: '92%' }}
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <div>
              <span className="panel-eyebrow">PUBLIC INFORMATION</span>
              <h2>{item ? 'Edit news article' : 'Create news article'}</h2>
              <p>Publish an official municipal notice or civic announcement.</p>
            </div>
            <button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog">
              <Icon name="close" />
            </button>
          </div>

          {errorMsg && (
            <div
              style={{
                margin: '1rem 1.5rem 0',
                padding: '10px 14px',
                borderRadius: '6px',
                background: '#fef2f2',
                border: '1px solid #ef4444',
                color: '#991b1b',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              <Icon name="close" size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="modal-form-grid" style={{ padding: '1.25rem 1.5rem' }}>
            {/* Title */}
            <label className="modal-field full">
              <span>Headline title <i>*</i></span>
              <input
                required
                placeholder="e.g. New Business License Registration Windows Opened"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>

            {/* Publishing Organization */}
            <div className="modal-field full">
              <SearchSelect
                label="Publishing Organization"
                required
                value={organizationId}
                onChange={(val) => {
                  setOrganizationId(val ? Number(val) : null);
                  setErrorMsg(null);
                }}
                options={organizationOptions}
                placeholder="Select publishing bureau or sub-city..."
              />
            </div>

            {/* Multiple Featured & Gallery Images */}
            <div className="modal-field full">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main, #1e293b)' }}>
                  Article Images (URLs)
                </span>
                <button
                  type="button"
                  className="button secondary small-button"
                  style={{ padding: '2px 8px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  onClick={handleAddImageUrl}
                >
                  <Icon name="plus" size={13} /> Add another image
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {imageUrls.map((url, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="url"
                      placeholder={idx === 0 ? 'Primary cover image URL (e.g. https://...)' : `Image ${idx + 1} URL (e.g. https://...)`}
                      value={url}
                      onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                      style={{ flex: 1 }}
                    />
                    {imageUrls.length > 1 && (
                      <button
                        type="button"
                        className="button secondary small-button"
                        onClick={() => handleRemoveImageUrl(idx)}
                        aria-label={`Remove image ${idx + 1}`}
                        style={{ padding: '8px', color: '#dc2626' }}
                        title="Remove image URL"
                      >
                        <Icon name="close" size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                First image is used as the public feed cover. Additional images are stored as article illustration blocks.
              </span>
            </div>

            {/* Summary */}
            <label className="modal-field full">
              <span>Summary / lead notice</span>
              <textarea
                rows={2}
                placeholder="Brief summary or key takeaway for public previews..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </label>

            {/* Content Details */}
            <label className="modal-field full">
              <span>Article content / details <i>*</i></span>
              <textarea
                required
                rows={5}
                placeholder="Detailed instructions, requirements, office hours, and contact details..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </label>
          </div>

          <div className="modal-footer">
            <span />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="button secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="button primary">
                {item ? 'Save changes' : 'Publish update'} <Icon name="arrow" size={15} />
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>,
    document.body
  );
};

export default NewsModal;
