import { useMemo } from 'react'
import { feedbackQrMatrix } from '../../utils/qrCode.js'

function QRPattern({ data = 'https://civiclink.gov.et/feedback/rev-001' }) {
  const matrix = useMemo(() => feedbackQrMatrix(data), [data])
  const size = matrix.length
  const quietZone = 4
  return <svg className="qr-pattern" viewBox={`0 0 ${size + quietZone * 2} ${size + quietZone * 2}`} role="img" aria-label="Scannable QR code for the bureau feedback form"><rect width={size + quietZone * 2} height={size + quietZone * 2} fill="#fff" />{matrix.flatMap((row, y) => row.map((filled, x) => filled ? <rect key={`${x}-${y}`} x={x + quietZone} y={y + quietZone} width="1" height="1" fill="#06495a" /> : null))}</svg>
}

export default QRPattern
