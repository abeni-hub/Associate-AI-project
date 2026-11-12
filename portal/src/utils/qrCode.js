import QRCode from 'qrcode';

export function feedbackQrMatrix(text) {
  if (!text || typeof text !== 'string') return [];
  try {
    const qr = QRCode.create(text, { errorCorrectionLevel: 'M' });
    const size = qr.modules.size;
    const matrix = [];
    for (let y = 0; y < size; y += 1) {
      const row = [];
      for (let x = 0; x < size; x += 1) {
        row.push(Boolean(qr.modules.get(x, y)));
      }
      matrix.push(row);
    }
    return matrix;
  } catch (err) {
    console.error('Failed to generate QR code matrix:', err);
    return [];
  }
}
