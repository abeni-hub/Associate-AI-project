import React, { useMemo } from 'react';
import { feedbackQrMatrix } from '../../utils/qrMath';

export interface QRPatternProps {
  data?: string;
  color?: string;
}

export const QRPattern: React.FC<QRPatternProps> = ({
  data = 'https://client.pharmasoft-et.com/#feedback',
  color = '#000000',
}) => {
  const matrix = useMemo(() => feedbackQrMatrix(data), [data]);
  const size = matrix.length;
  const quietZone = 4;

  if (size === 0) {
    return null;
  }

  return (
    <svg
      className="qr-pattern"
      viewBox={`0 0 ${size + quietZone * 2} ${size + quietZone * 2}`}
      role="img"
      aria-label="Scannable QR code for citizen feedback"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <rect width={size + quietZone * 2} height={size + quietZone * 2} fill="#ffffff" />
      {matrix.flatMap((row, y) =>
        row.map((filled, x) =>
          filled ? (
            <rect
              key={`${x}-${y}`}
              x={x + quietZone}
              y={y + quietZone}
              width="1"
              height="1"
              fill={color}
            />
          ) : null
        )
      )}
    </svg>
  );
};
