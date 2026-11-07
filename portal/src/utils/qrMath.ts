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

export function feedbackQrMatrix(text: string): boolean[][] {
  const size = 29;
  const dataCapacity = 55;
  const bits: number[] = [];
  const appendBits = (value: number, count: number) => {
    for (let bit = count - 1; bit >= 0; bit -= 1) {
      bits.push((value >>> bit) & 1);
    }
  };
  const bytes = Array.from(new TextEncoder().encode(text));
  appendBits(0b0100, 4);
  appendBits(bytes.length, 8);
  bytes.forEach((byte) => appendBits(byte, 8));
  for (let i = 0; i < Math.min(4, dataCapacity * 8 - bits.length); i += 1) {
    bits.push(0);
  }
  while (bits.length % 8 !== 0) {
    bits.push(0);
  }
  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    data.push(bits.slice(i, i + 8).reduce((value, bit) => (value << 1) | bit, 0));
  }
  for (let pad = 0; data.length < dataCapacity; pad += 1) {
    data.push(pad % 2 === 0 ? 0xec : 0x11);
  }
  const codewords = [...data, ...qrErrorCorrection(data, 15)];
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const reserved: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const setFunction = (x: number, y: number, dark: boolean) => {
    if (x >= 0 && y >= 0 && x < size && y < size) {
      matrix[y][x] = dark;
      reserved[y][x] = true;
    }
  };
  const finder = (ox: number, oy: number) => {
    for (let dy = -1; dy <= 7; dy += 1) {
      for (let dx = -1; dx <= 7; dx += 1) {
        const distance = Math.max(Math.abs(dx - 3), Math.abs(dy - 3));
        setFunction(ox + dx, oy + dy, distance === 3 || distance <= 1);
      }
    }
  };
  finder(0, 0);
  finder(size - 7, 0);
  finder(0, size - 7);
  for (let dy = -2; dy <= 2; dy += 1) {
    for (let dx = -2; dx <= 2; dx += 1) {
      setFunction(22 + dx, 22 + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
  }
  for (let i = 8; i < size - 8; i += 1) {
    setFunction(i, 6, i % 2 === 0);
    setFunction(6, i, i % 2 === 0);
  }
  const mask = (x: number, y: number) => (x + y) % 2 === 0;
  const formatBits = ((1 << 3) | 0) << 10;
  let remainder = formatBits;
  for (let i = 14; i >= 10; i -= 1) {
    if ((remainder >>> i) & 1) remainder ^= 0x537 << (i - 10);
  }
  const format = (((1 << 3) | 0) << 10 | remainder) ^ 0x5412;
  for (let i = 0; i <= 5; i += 1) setFunction(8, i, ((format >>> i) & 1) !== 0);
  setFunction(8, 7, ((format >>> 6) & 1) !== 0);
  setFunction(8, 8, ((format >>> 7) & 1) !== 0);
  setFunction(7, 8, ((format >>> 8) & 1) !== 0);
  for (let i = 9; i < 15; i += 1) setFunction(14 - i, 8, ((format >>> i) & 1) !== 0);
  for (let i = 0; i < 8; i += 1) setFunction(size - 1 - i, 8, ((format >>> i) & 1) !== 0);
  for (let i = 8; i < 15; i += 1) setFunction(8, size - 15 + i, ((format >>> i) & 1) !== 0);
  setFunction(8, size - 8, true);

  let bitIndex = 0;
  let upward = true;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right -= 1;
    for (let vert = 0; vert < size; vert += 1) {
      const y = upward ? size - 1 - vert : vert;
      for (let offset = 0; offset < 2; offset += 1) {
        const x = right - offset;
        if (!reserved[y][x]) {
          const bit = bitIndex < codewords.length * 8 ? (codewords[bitIndex >>> 3] >>> (7 - (bitIndex & 7))) & 1 : 0;
          matrix[y][x] = Boolean(bit ^ Number(mask(x, y)));
          bitIndex += 1;
        }
      }
    }
    upward = !upward;
  }
  return matrix;
}
