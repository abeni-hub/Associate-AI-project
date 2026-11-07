import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../shared/Icon';
import { SearchSelect, type SearchSelectOption } from '../shared/SearchSelect';
import { useGetOrganizationsQuery } from '../../services/organizationsApi';
import { useUploadCmsImageMutation } from '../../services/cmsApi';
import { usePortal } from '../../context';
import { useGetMeQuery } from '../../services/authApi';

export interface ImageItem {
  id: string;
  url: string;
  caption?: string;
  isUploading?: boolean;
}

export interface NewsModalProps {
  item?: any;
  organizations?: any[];
  isOpen: boolean;
  onClose: () => void;
  onSave?: (saved: any) => void;
  isLoading?: boolean;
}

export const NewsModal: React.FC<NewsModalProps> = ({
  item,
  organizations: propOrganizations,
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}) => {
  const portal = usePortal();
  const { data: meResponse } = useGetMeQuery(undefined, { skip: !isOpen });
  const currentUser = meResponse?.data || portal.authUser || portal.session?.user;
  const userOrg = currentUser?.organization;
  const isSuperAdmin =
    currentUser?.role?.slug === 'super_admin' ||
    portal.role === 'super' ||
    currentUser?.role?.scope_level === 'global';

  const { data: apiOrgs } = useGetOrganizationsQuery(undefined, { skip: !isOpen });
  const [uploadCmsImage] = useUploadCmsImageMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Content type toggle: 'news' | 'event'
  const [contentType, setContentType] = useState<'news' | 'event'>('news');

  // Common Form states
  const [title, setTitle] = useState('');
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Event-specific Form states
  const [locationName, setLocationName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [audience, setAudience] = useState('');

  // UI state for image manager
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');

  // Sync form states when opening or switching item
  useEffect(() => {
    if (isOpen) {
      const isEvt =
        item?.type === 'event' ||
        !!item?.location_name ||
        !!item?.event_date ||
        !!item?.eventDate;
      setContentType(isEvt ? 'event' : 'news');

      setTitle(item?.title || item?.news_title || '');

      // Autofetch organization: existing item org > logged-in user org > first platform org
      const autoOrgId =
        item?.organization_id ||
        item?.organization?.id ||
        (userOrg?.id ? Number(userOrg.id) : null) ||
        (apiOrgs?.data?.[0]?.id ? Number(apiOrgs.data[0].id) : null);

      setOrganizationId(autoOrgId);

      // Extract images from multiple formats
      const initialImages: ImageItem[] = [];

      // 1. From news contents (image_url or image blocks)
      const imageBlocks =
        item?.contents?.filter(
          (c: any) => c.content_type === 'image_url' || c.content_type === 'image'
        ) || [];

      if (imageBlocks.length > 0) {
        imageBlocks.forEach((b: any, idx: number) => {
          if (b.content) {
            initialImages.push({
              id: `block-${idx}-${Date.now()}`,
              url: b.content,
            });
          }
        });
      } else if (item?.images && Array.isArray(item.images)) {
        // 2. From event images or raw images array
        item.images.forEach((img: any, idx: number) => {
          const url = typeof img === 'string' ? img : img.image_url;
          const caption = typeof img === 'object' ? img.caption : undefined;
          if (url) {
            initialImages.push({
              id: `img-${idx}-${Date.now()}`,
              url,
              caption: caption || undefined,
            });
          }
        });
      } else if (item?.coverImage) {
        // 3. Fallback to cover image
        initialImages.push({
          id: `cover-${Date.now()}`,
          url: item.coverImage,
        });
      }

      setImages(initialImages);

      // Extract text content blocks for news
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
        setContent(item?.content || item?.description || '');
      }

      // Event-specific fields
      setLocationName(item?.location_name || item?.location?.venue || '');
      setEventDate(
        item?.event_date
          ? item.event_date.split('T')[0]
          : item?.eventDate
          ? item.eventDate.split('T')[0]
          : ''
      );
      setEndDate(
        item?.end_date
          ? item.end_date.split('T')[0]
          : item?.endDate
          ? item.endDate.split('T')[0]
          : ''
      );
      setAudience(item?.audience || '');

      setErrorMsg(null);
      setShowUrlInput(false);
      setUrlInputValue('');
    }
  }, [isOpen, item, userOrg, apiOrgs]);

  // Autofetch user organization when creating new item if not yet populated
  useEffect(() => {
    if (isOpen && !item && !organizationId) {
      if (userOrg?.id) {
        setOrganizationId(Number(userOrg.id));
      } else if (apiOrgs?.data && apiOrgs.data.length > 0) {
        setOrganizationId(Number(apiOrgs.data[0].id));
      }
    }
  }, [isOpen, item, organizationId, userOrg, apiOrgs]);

  // Organization options for publisher link
  const organizationOptions: SearchSelectOption[] = useMemo(() => {
    const list: any[] = propOrganizations?.length ? propOrganizations : apiOrgs?.data || [];
    return list.map((org: any) => ({
      value: org.id,
      label: org.name,
      code: org.code,
      badge:
        org.organization_type_id === 1
          ? 'Sub-City'
          : org.organization_type_id === 2
          ? 'Woreda'
          : 'Bureau',
      badgeTone:
        org.organization_type_id === 1 ? 'sage' : org.organization_type_id === 2 ? 'blue' : 'gold',
    }));
  }, [propOrganizations, apiOrgs]);

  // Handle multiple file upload
  const handleProcessFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    fileArray.forEach((file) => {
      const tempId = `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const reader = new FileReader();

      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        if (!dataUrl) return;

        // Immediate visual preview
        setImages((prev) => [
          ...prev,
          { id: tempId, url: dataUrl, caption: file.name, isUploading: true },
        ]);

        // Attempt upload to backend CMS image endpoint
        try {
          const formData = new FormData();
          formData.append('image', file);
          const res = await uploadCmsImage(formData).unwrap();
          if (res?.data?.url) {
            setImages((prev) =>
              prev.map((img) =>
                img.id === tempId ? { ...img, url: res.data.url, isUploading: false } : img
              )
            );
          } else {
            setImages((prev) =>
              prev.map((img) => (img.id === tempId ? { ...img, isUploading: false } : img))
            );
          }
        } catch {
          // If upload endpoint is offline or restricted, retain dataUrl preview
          setImages((prev) =>
            prev.map((img) => (img.id === tempId ? { ...img, isUploading: false } : img))
          );
        }
      };

      reader.readAsDataURL(file);
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFiles(e.target.files);
      // Reset input value so same files can be re-selected if needed
      e.target.value = '';
    }
  };

  const handleDropFiles = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      handleProcessFiles(e.dataTransfer.files);
    }
  };

  // Add image URL manually
  const handleAddFromUrl = () => {
    const trimmed = urlInputValue.trim();
    if (!trimmed) return;
    setImages((prev) => [
      ...prev,
      {
        id: `url-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        url: trimmed,
      },
    ]);
    setUrlInputValue('');
  };

  // Remove single image
  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  // Promote image to cover (index 0)
  const handleSetAsCover = (index: number) => {
    setImages((prev) => {
      if (index <= 0 || index >= prev.length) return prev;
      const target = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [target, ...rest];
    });
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      return setErrorMsg(
        contentType === 'event' ? 'Event title is required.' : 'Article headline is required.'
      );
    }
    if (!organizationId) {
      return setErrorMsg('Publishing organization is required.');
    }

    if (contentType === 'event') {
      if (!locationName.trim()) {
        return setErrorMsg('Venue / location name is required for events.');
      }
      if (!eventDate) {
        return setErrorMsg('Event date is required.');
      }
      if (!content.trim() && !summary.trim()) {
        return setErrorMsg('Event description or agenda is required.');
      }

      const validImages = images
        .filter((img) => img.url && img.url.trim().length > 0)
        .map((img, idx) => ({
          image_url: img.url.trim(),
          caption: img.caption || null,
          order_column: idx + 1,
        }));

      const payload = {
        type: 'event',
        ...(item?.id ? { id: item.id } : {}),
        organization_id: Number(organizationId),
        title: title.trim(),
        description: content.trim() || summary.trim(),
        location_name: locationName.trim(),
        event_date: eventDate,
        end_date: endDate || null,
        audience: audience.trim() || null,
        status: 'published',
        images: validImages,
      };

      onSave?.(payload);
      onClose();
    } else {
      // News Article
      if (!content.trim() && !summary.trim()) {
        return setErrorMsg('Article content is required.');
      }

      // Build ordered blocks for news_content table
      const contents: Array<{ content: string; content_type: string; order: number }> = [];
      let order = 1;

      // Add image blocks
      images.forEach((img) => {
        if (img.url && img.url.trim().length > 0) {
          contents.push({
            content: img.url.trim(),
            content_type: 'image_url',
            order: order++,
          });
        }
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
        type: 'news',
        ...(item?.id ? { id: item.id } : {}),
        news_title: title.trim(),
        organization_id: Number(organizationId),
        contents,
      };

      onSave?.(payload);
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay">
      <section
        className="modal-card modal-form"
        role="dialog"
        aria-modal="true"
        aria-label={
          item
            ? `Edit ${contentType === 'event' ? 'event' : 'news article'}`
            : `Create ${contentType === 'event' ? 'event' : 'news article'}`
        }
        style={{ maxWidth: '680px', width: '92%', maxHeight: '92vh', overflowY: 'auto' }}
      >
        <form onSubmit={handleSubmit}>
          {/* Modal Header */}
          <div className="modal-header">
            <div>
              <span className="panel-eyebrow">PUBLIC INFORMATION</span>
              <h2>
                {item
                  ? `Edit ${contentType === 'event' ? 'public event' : 'news article'}`
                  : `Create ${contentType === 'event' ? 'public event' : 'news article'}`}
              </h2>
              <p>
                {contentType === 'event'
                  ? 'Coordinate a municipal public gathering, town hall, or civic event.'
                  : 'Publish an official municipal notice or civic announcement.'}
              </p>
            </div>
            <button
              type="button"
              className="modal-close"
              onClick={onClose}
              aria-label="Close dialog"
            >
              <Icon name="close" />
            </button>
          </div>

          {/* Type Selector (News vs Event) */}
          <div
            style={{
              display: 'flex',
              padding: '12px 24px 0',
              gap: '10px',
              borderBottom: '1px solid #edf1ed',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setContentType('news');
                setErrorMsg(null);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                border: 'none',
                background: 'none',
                borderBottom: contentType === 'news' ? '2.5px solid #00485a' : '2.5px solid transparent',
                color: contentType === 'news' ? '#00485a' : '#64748b',
                fontWeight: contentType === 'news' ? 700 : 500,
                fontSize: '13.5px',
                cursor: 'pointer',
                marginBottom: '-1px',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon name="news" size={15} /> News Announcement
            </button>
            <button
              type="button"
              onClick={() => {
                setContentType('event');
                setErrorMsg(null);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                border: 'none',
                background: 'none',
                borderBottom: contentType === 'event' ? '2.5px solid #00485a' : '2.5px solid transparent',
                color: contentType === 'event' ? '#00485a' : '#64748b',
                fontWeight: contentType === 'event' ? 700 : 500,
                fontSize: '13.5px',
                cursor: 'pointer',
                marginBottom: '-1px',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon name="calendar" size={15} /> Public Event
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
            {/* Title / Headline */}
            <label className="modal-field full">
              <span>
                {contentType === 'event' ? 'Event title ' : 'Headline title '}
                <i>*</i>
              </span>
              <input
                required
                placeholder={
                  contentType === 'event'
                    ? 'e.g. Annual Addis Ababa Youth Innovation & Civic Town Hall'
                    : 'e.g. New Business License Registration Windows Opened'
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>

            {/* Publishing Organization */}
            <div className="modal-field full">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                {contentType === 'event' ? 'Host Organization' : 'Publishing Organization'} <i style={{ color: '#dc2626' }}>*</i>
              </label>

              {!isSuperAdmin && userOrg ? (
                /* Autofetched Organization Card for Scoped Users */
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    background: '#f8fafc',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '8px',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: '#e8f2ed',
                        color: '#00485a',
                        flexShrink: 0,
                      }}
                    >
                      <Icon name="building" size={17} />
                    </span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <b style={{ fontSize: '13.5px', color: '#0f172a' }}>
                          {userOrg.name}
                        </b>
                        {userOrg.code && (
                          <code
                            style={{
                              fontSize: '11px',
                              background: '#e2e8f0',
                              color: '#334155',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              fontWeight: 600,
                            }}
                          >
                            {userOrg.code}
                          </code>
                        )}
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            background: '#dcfce7',
                            color: '#15803d',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Icon name="check" size={11} /> Autofetched
                        </span>
                      </div>
                      <small style={{ color: '#64748b', fontSize: '11.5px', marginTop: '2px', display: 'block' }}>
                        {contentType === 'event' ? 'Public event' : 'Official notice'} will be published under your assigned municipal organization.
                      </small>
                    </div>
                  </div>
                  <input type="hidden" name="organization_id" value={organizationId || userOrg.id} />
                </div>
              ) : (
                /* Super Admin or fallback: SearchSelect prefilled with autofetched organization */
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11.5px', color: '#047857', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Icon name="check" size={12} /> Autofetched default organization
                    </span>
                    {userOrg && organizationId !== userOrg.id && (
                      <button
                        type="button"
                        onClick={() => setOrganizationId(Number(userOrg.id))}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: '#00485a',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: 0,
                          textDecoration: 'underline',
                        }}
                      >
                        Reset to my organization ({userOrg.name})
                      </button>
                    )}
                  </div>
                  <SearchSelect
                    value={organizationId}
                    onChange={(val) => {
                      setOrganizationId(val ? Number(val) : null);
                      setErrorMsg(null);
                    }}
                    options={organizationOptions}
                    placeholder="Select publishing bureau or sub-city..."
                  />
                </div>
              )}
            </div>

            {/* Event Specific: Location and Dates */}
            {contentType === 'event' && (
              <>
                <label className="modal-field full">
                  <span>
                    Venue / Location name <i>*</i>
                  </span>
                  <input
                    required
                    placeholder="e.g. Addis Ababa Exhibition Center, Hall 2 / Meskel Square"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                  />
                </label>

                <label className="modal-field">
                  <span>
                    Event date <i>*</i>
                  </span>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </label>

                <label className="modal-field">
                  <span>End date (optional)</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </label>

                <label className="modal-field full">
                  <span>Target Audience</span>
                  <input
                    placeholder="e.g. All Addis Ababa Residents, Registered Merchants, Youth"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                  />
                </label>
              </>
            )}

            {/* Multiple Image Input Section (Replacing single URL input) */}
            <div className="modal-field full" style={{ marginTop: '2px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#5d746a',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Icon name="image" size={16} />
                    {contentType === 'event' ? 'Event Images' : 'Article Images'}
                  </span>
                  {images.length > 0 && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        background: '#e8f2ed',
                        color: '#00485a',
                        padding: '2px 8px',
                        borderRadius: '12px',
                      }}
                    >
                      {images.length} {images.length === 1 ? 'image' : 'images'}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  className="button secondary small-button"
                  style={{
                    padding: '3px 8px',
                    fontSize: '12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  onClick={() => setShowUrlInput(!showUrlInput)}
                >
                  <Icon name={showUrlInput ? 'close' : 'plus'} size={12} />
                  {showUrlInput ? 'Hide URL input' : 'Add via URL'}
                </button>
              </div>

              {/* Multiple Image File Upload Dropzone */}
              <div
                className="cms-upload-dropzone"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDropFiles}
                style={{
                  border: isDragging ? '2px dashed #00485a' : '2px dashed #b7cdc2',
                  background: isDragging ? '#e8f2ed' : '#f8faf9',
                  padding: '20px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  marginBottom: images.length > 0 || showUrlInput ? '12px' : '4px',
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileInputChange}
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      padding: '8px',
                      borderRadius: '50%',
                      background: '#e2ece7',
                      color: '#00485a',
                    }}
                  >
                    <Icon name="upload" size={20} />
                  </span>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                    Click or drag multiple image files to upload
                  </p>
                  <small style={{ fontSize: '11px', color: '#64748b' }}>
                    Supports PNG, JPG, WebP. <b>Select multiple images at once.</b> First image will be the public cover.
                  </small>
                </div>
              </div>

              {/* Manual URL Input Toggle */}
              {showUrlInput && (
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '12px',
                    padding: '8px 12px',
                    background: '#f1f5f9',
                    borderRadius: '6px',
                    alignItems: 'center',
                  }}
                >
                  <input
                    type="url"
                    placeholder="https://... image web URL"
                    value={urlInputValue}
                    onChange={(e) => setUrlInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFromUrl();
                      }
                    }}
                    style={{ flex: 1, minHeight: '32px', fontSize: '13px' }}
                  />
                  <button
                    type="button"
                    className="button primary small-button"
                    style={{ padding: '6px 12px', fontSize: '12px', whiteSpace: 'nowrap' }}
                    onClick={handleAddFromUrl}
                  >
                    <Icon name="plus" size={13} /> Add URL
                  </button>
                </div>
              )}

              {/* Visual Thumbnail Gallery Preview */}
              {images.length > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                    gap: '10px',
                    marginTop: '6px',
                  }}
                >
                  {images.map((img, index) => (
                    <div
                      key={img.id}
                      style={{
                        position: 'relative',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: index === 0 ? '2px solid #00485a' : '1px solid #cbd5e1',
                        background: '#fff',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      {/* Cover / Order Badge */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '6px',
                          left: '6px',
                          zIndex: 2,
                          background: index === 0 ? '#00485a' : 'rgba(15, 23, 42, 0.75)',
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          letterSpacing: '0.3px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {index === 0 ? '★ Cover' : `#${index + 1}`}
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(img.id);
                        }}
                        style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          zIndex: 2,
                          background: 'rgba(239, 68, 68, 0.9)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '22px',
                          height: '22px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                        }}
                        title="Remove image"
                        aria-label={`Remove image ${index + 1}`}
                      >
                        <Icon name="close" size={13} />
                      </button>

                      {/* Image Thumbnail */}
                      <div
                        style={{
                          width: '100%',
                          height: '92px',
                          background: '#e2e8f0',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img
                          src={img.url}
                          alt={`Preview ${index + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>

                      {/* Footer Actions */}
                      <div
                        style={{
                          padding: '4px 6px',
                          background: '#f8fafc',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderTop: '1px solid #f1f5f9',
                        }}
                      >
                        {index !== 0 ? (
                          <button
                            type="button"
                            onClick={() => handleSetAsCover(index)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#00485a',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              padding: '2px 4px',
                            }}
                          >
                            Set as cover
                          </button>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                            Main cover
                          </span>
                        )}
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                          {index + 1}/{images.length}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <span
                style={{
                  fontSize: '11px',
                  color: '#64748b',
                  marginTop: '6px',
                  display: 'block',
                }}
              >
                The first image is used as the public feed cover. Subsequent images are displayed in the full article/event gallery.
              </span>
            </div>

            {/* Summary / Lead notice */}
            <label className="modal-field full">
              <span>
                {contentType === 'event' ? 'Short brief / summary' : 'Summary / lead notice'}
              </span>
              <textarea
                rows={2}
                placeholder={
                  contentType === 'event'
                    ? 'Brief one-line teaser for public event previews...'
                    : 'Brief summary or key takeaway for public previews...'
                }
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </label>

            {/* Content Details */}
            <label className="modal-field full">
              <span>
                {contentType === 'event'
                  ? 'Event description & agenda '
                  : 'Article content / details '}
                <i>*</i>
              </span>
              <textarea
                required
                rows={5}
                placeholder={
                  contentType === 'event'
                    ? 'Full schedule, speakers, participation instructions, registration details...'
                    : 'Detailed instructions, requirements, office hours, and contact details...'
                }
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </label>
          </div>

          <div className="modal-footer">
            <span />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="button secondary" onClick={onClose} disabled={isLoading}>
                Cancel
              </button>
              <button type="submit" className="button primary" disabled={isLoading}>
                {isLoading ? 'Saving...' : (item ? 'Save changes' : 'Publish update')} <Icon name="arrow" size={15} />
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
