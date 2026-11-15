export interface DetailLoadingProps {
  language?: string
}

export default function DetailLoading({ language }: DetailLoadingProps) {
  return (
    <div className="item-detail-page" lang={language}>
      <div className="detail-loading-skeleton section-wrap" style={{ marginTop: '32px' }}>
        <div className="detail-skeleton-hero ne-shimmer" />
        <div className="detail-skeleton-title ne-shimmer" />
        <div className="detail-skeleton-line ne-shimmer" />
        <div className="detail-skeleton-line ne-shimmer" />
      </div>
    </div>
  )
}

