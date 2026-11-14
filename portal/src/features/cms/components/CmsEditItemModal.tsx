import React from 'react';
import { createPortal } from 'react-dom';
import { Icon, getModalContainer } from '../../shared';

export interface CmsEditItemModalProps {
  modalItem: any;
  setModalItem: (item: any) => void;
  copyLang: 'en' | 'am';
  setCms: React.Dispatch<React.SetStateAction<any>>;
  updateJourneyStep: (index: number, key: string, value: any) => void;
  uploadImageTrigger: (data: FormData) => any;
}

export const CmsEditItemModal: React.FC<CmsEditItemModalProps> = ({
  modalItem,
  setModalItem,
  copyLang,
  setCms,
  updateJourneyStep,
  uploadImageTrigger,
}) => {
  if (!modalItem) return null;

  const getStr = (val: any) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object') return val.en || val.eng || val.am || val.amh || '';
    return String(val);
  };

  return createPortal(
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setModalItem(null);
      }}
    >
      <section className="modal-card modal-form" role="dialog" aria-modal="true" aria-label="CMS editor modal">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (modalItem.type === 'slide') {
              if (modalItem.index !== null) {
                setCms((prev: any) => {
                  const slides = [...(prev.hero?.slides || [])];
                  slides[modalItem.index] = {
                    ...(slides[modalItem.index] || {}),
                    title: modalItem.title || '',
                    bureau: modalItem.bureau || '',
                    category: modalItem.category || '',
                    image: modalItem.image || (slides[modalItem.index]?.image || ''),
                    alt: modalItem.alt || modalItem.title || '',
                    credit: modalItem.credit || '',
                    tint: modalItem.tint || '#164d58',
                  };
                  return { ...prev, hero: { ...prev.hero, slides } };
                });
              } else {
                setCms((prev: any) => ({
                  ...prev,
                  hero: {
                    ...prev.hero,
                    slides: [
                      ...(prev.hero?.slides || []),
                      {
                        id: Date.now(),
                        title: modalItem.title || 'Spotlight Service',
                        bureau: modalItem.bureau || 'MUNICIPAL SERVICES',
                        category: modalItem.category || '',
                        image: modalItem.image || '',
                        alt: modalItem.alt || modalItem.title || '',
                        credit: modalItem.credit || 'Civic Photo',
                        tint: modalItem.tint || '#164d58',
                      },
                    ],
                  },
                }));
              }
            } else if (modalItem.type === 'journey') {
              if (copyLang === 'am') {
                updateJourneyStep(modalItem.index, 'titleAm', modalItem.titleAm);
                updateJourneyStep(modalItem.index, 'detailAm', modalItem.detailAm);
              } else {
                updateJourneyStep(modalItem.index, 'title', modalItem.title);
                updateJourneyStep(modalItem.index, 'detail', modalItem.detail);
              }
            }
            setModalItem(null);
          }}
        >
          <div className="modal-header">
            <div>
              <span className="panel-eyebrow">LANDING PAGE CMS</span>
              <h2>
                {modalItem.type === 'slide'
                  ? modalItem.index !== null
                    ? 'Edit spotlight card'
                    : 'Add spotlight card'
                  : `Edit journey step 0${modalItem.index + 1}`}
              </h2>
              <p>Changes will update the citizen landing page live preview immediately.</p>
            </div>
            <button
              type="button"
              className="modal-close"
              onClick={() => setModalItem(null)}
              aria-label="Close dialog"
            >
              <Icon name="close" />
            </button>
          </div>

          <div className="modal-form-grid">
            {modalItem.type === 'slide' && (
              <>
                <label className="modal-field full">
                  <span>
                    Service name <i>*</i>
                  </span>
                  <input
                    required
                    value={getStr(modalItem.title)}
                    onChange={(e) => setModalItem((m: any) => ({ ...m, title: e.target.value }))}
                    placeholder="e.g. Business tax registration"
                  />
                </label>
                <label className="modal-field">
                  <span>
                    Bureau jurisdiction <i>*</i>
                  </span>
                  <input
                    required
                    value={getStr(modalItem.bureau)}
                    onChange={(e) => setModalItem((m: any) => ({ ...m, bureau: e.target.value }))}
                    placeholder="e.g. Revenues Bureau"
                  />
                </label>
                <label className="modal-field">
                  <span>
                    Slide description <i>*</i>
                  </span>
                  <input
                    required
                    value={getStr(modalItem.category)}
                    onChange={(e) => setModalItem((m: any) => ({ ...m, category: e.target.value }))}
                    placeholder="Describe the bureau spotlight"
                  />
                </label>
                <label className="modal-field full">
                  <span>Hero slide photo upload</span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <label
                      className="button secondary small-button"
                      style={{ cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}
                    >
                      <Icon name="upload" size={13} /> Upload photo
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) {
                              setModalItem((m: any) => ({
                                ...m,
                                image: ev.target!.result as string,
                                alt: m.alt || file.name.replace(/\.[^/.]+$/, ''),
                              }));
                            }
                          };
                          reader.readAsDataURL(file);

                          try {
                            const fd = new FormData();
                            fd.append('image', file);
                            const res = await uploadImageTrigger(fd).unwrap();
                            const serverUrl = res?.data?.url || (res as any)?.url;
                            if (serverUrl) {
                              setModalItem((m: any) => ({ ...m, image: serverUrl }));
                            }
                          } catch (err) {
                            console.warn('Modal image upload endpoint notice:', err);
                          }
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                  {modalItem.image && (
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={modalItem.image}
                        alt=""
                        style={{ width: '56px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                      />
                      <small style={{ color: '#64748b', fontSize: '11px' }}>Current slide photo preview</small>
                    </div>
                  )}
                </label>
              </>
            )}

            {modalItem.type === 'journey' && (
              <>
                <label className="modal-field full">
                  <span>
                    Step title {copyLang === 'am' ? '(አማርኛ)' : '(English)'} <i>*</i>
                  </span>
                  <input
                    required
                    value={getStr(copyLang === 'am' ? modalItem.titleAm : modalItem.title)}
                    onChange={(e) =>
                      setModalItem((m: any) => ({
                        ...m,
                        [copyLang === 'am' ? 'titleAm' : 'title']: e.target.value,
                      }))
                    }
                    placeholder={copyLang === 'am' ? 'ለምሳሌ፡ ሰነዶችን ማዘጋጀት' : 'e.g. Check requirements'}
                  />
                </label>
                <label className="modal-field full">
                  <span>
                    Step instructions {copyLang === 'am' ? '(አማርኛ)' : '(English)'} <i>*</i>
                  </span>
                  <textarea
                    required
                    rows={3}
                    value={getStr(copyLang === 'am' ? modalItem.detailAm : modalItem.detail)}
                    onChange={(e) =>
                      setModalItem((m: any) => ({
                        ...m,
                        [copyLang === 'am' ? 'detailAm' : 'detail']: e.target.value,
                      }))
                    }
                    placeholder={
                      copyLang === 'am' ? 'ዜጎች ምን ማድረግ እንዳለባቸው ያስረዱ...' : 'Explain what the citizen needs to do...'
                    }
                  />
                </label>
              </>
            )}
          </div>

          <div className="modal-footer">
            <span>
              <Icon name="globe" size={14} /> Changes update the citizen preview live.
            </span>
            <div>
              <button type="button" className="button secondary" onClick={() => setModalItem(null)}>
                Cancel
              </button>
              <button type="submit" className="button primary">
                Save changes <Icon name="arrow" size={15} />
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>,
    getModalContainer()
  );
};

export default CmsEditItemModal;

