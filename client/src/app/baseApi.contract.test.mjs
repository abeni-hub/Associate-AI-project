import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const file = fileURLToPath(new URL('./baseApi.ts', import.meta.url));
const source = readFileSync(file, 'utf8');

const hasDefaultTarget = source.includes("https://civillink.jobaleengineering.com") && source.includes("/api/v1");
const hasNoEnvOverride = !source.includes('VITE_BACKEND_URL') && !source.includes('VITE_API_BASE_URL') && !source.includes('process.env') && !source.includes('readEnv');

if (!hasDefaultTarget) {
  throw new Error('baseApi.ts must define the production backend as the default target.');
}

if (!hasNoEnvOverride) {
  throw new Error('baseApi.ts must not allow env override options.');
}

console.log('baseApi contract OK');
