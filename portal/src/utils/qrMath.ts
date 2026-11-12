import QRCode from 'qrcode';

export function qrGfMultiply(a: number, b: number): number {
  let result = 0;
  for (let i = 7; i >= 0; i -= 1) {
    result = (result << 1) ^ ((result >>> 7) * 0x11d);
    result ^= ((b >>> i) & 1) * a;
  }
  return result;
}

export function qrErrorCorrection(data: number[], degree: number): number[] {
  let generator = [1];
  let root = 1;
  for (let i = 0; i < degree; i += 1) {
    const next = Array(generator.length + 1).fill(0);
    generator.forEach((coefficient, index) => {
      next[index] ^= coefficient;
      next[index + 1] ^= qrGfMultiply(coefficient, root);
    });
    generator = next;
    root = qrGfMultiply(root, 2);
  }
  const work = [...data, ...Array(degree).fill(0)];
  for (let i = 0; i < data.length; i += 1) {
    const factor = work[i];
    if (factor !== 0) {
      generator.forEach((coefficient, offset) => {
        work[i + offset] ^= qrGfMultiply(coefficient, factor);
      });
    }
  }
  return work.slice(data.length);
}

/**
 * Generates a standard-compliant scannable QR code matrix of any length.
 */
export function feedbackQrMatrix(text: string): boolean[][] {
  if (!text || typeof text !== 'string') return [];
  try {
    const qr = QRCode.create(text, { errorCorrectionLevel: 'M' });
    const size = qr.modules.size;
    const matrix: boolean[][] = [];
    for (let y = 0; y < size; y += 1) {
      const row: boolean[] = [];
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
