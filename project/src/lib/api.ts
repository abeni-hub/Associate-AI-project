import { API_BASE_URL } from './constants';
import type {
  ApiResume,
  ApiJobDescription,
  ApiJobRequirement,
  ApiCandidateRankingResponse,
} from './types';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Format error details from FastAPI responses.
 */
function parseErrorDetail(status: number, text: string): string {
  if (!text) return `Request failed with status ${status}`;
  try {
    const json = JSON.parse(text);
    if (typeof json.detail === 'string') {
      return json.detail;
    }
    if (Array.isArray(json.detail)) {
      return json.detail
        .map((item: { loc?: unknown[]; msg?: string }) => {
          const field = Array.isArray(item.loc) ? item.loc.slice(-1)[0] : '';
          return field ? `${field}: ${item.msg}` : (item.msg || JSON.stringify(item));
        })
        .join('; ');
    }
    if (typeof json.message === 'string') {
      return json.message;
    }
    if (typeof json.error === 'string') {
      return json.error;
    }
  } catch {
    // Keep raw response text
  }
  return text.length > 200 ? text.slice(0, 200) + '...' : text;
}

/**
 * Check whether the FastAPI backend is running and reachable.
 */
export async function checkApiHealth(): Promise<{ ok: boolean; status?: string; message?: string }> {
  if (!API_BASE_URL) {
    return { ok: false, message: 'VITE_API_BASE_URL is not configured.' };
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) {
      return { ok: false, message: `API returned HTTP ${res.status}` };
    }
    const data = await res.json().catch(() => ({}));
    return { ok: true, status: data.status || 'ok' };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { ok: false, message: 'Backend health check timed out (4s).' };
    }
    return { ok: false, message: 'Cannot connect to backend server. Ensure FastAPI is running.' };
  }
}

/**
 * Analyze a single PDF resume using POST /api/v1/resumes/analyze.
 */
export async function analyzeResume(file: File): Promise<ApiResume> {
  if (!API_BASE_URL) {
    throw new ApiError(
      'Analysis service is not configured. Set VITE_API_BASE_URL in your environment.',
      0,
    );
  }

  const formData = new FormData();
  formData.append('file', file);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90000); // 90 seconds timeout for AI model

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/resumes/analyze`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new ApiError(parseErrorDetail(res.status, text), res.status);
    }

    const data: ApiResume = await res.json();
    return data;
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof ApiError) throw err;
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('Single resume extraction timed out. Please try again.', 408);
    }
    if (err instanceof TypeError) {
      throw new ApiError(
        'Could not reach the analysis service. Verify that the FastAPI backend is running and CORS allows this origin.',
        0,
      );
    }
    throw err;
  }
}

/**
 * Helper to construct a strictly valid JobDescription for POST /api/v1/resumes/rank.
 * Enforces requirement uniqueness, valid descriptions, and ensures weights sum to exactly 100.
 */
export function buildValidJobDescription(params: {
  title: string;
  description: string;
  required_skills?: string[];
  preferred_skills?: string[];
  minimum_score?: number;
}): ApiJobDescription {
  const requirements: ApiJobRequirement[] = [];
  const seenNames = new Set<string>();

  const addReq = (name: string, isRequired: boolean) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const key = trimmed.toLowerCase();
    if (seenNames.has(key)) return;
    seenNames.add(key);

    requirements.push({
      name: trimmed,
      description: `Demonstrated experience or proficiency in ${trimmed}.`,
      required: isRequired,
      weight: 1, // temporary, will normalize below
    });
  };

  (params.required_skills || []).forEach((s) => addReq(s, true));
  (params.preferred_skills || []).forEach((s) => addReq(s, false));

  // If no specific skills were supplied, create a core requirement based on title
  if (requirements.length === 0) {
    requirements.push({
      name: params.title.trim().slice(0, 100) || 'Core Competency',
      description: params.description.trim().slice(0, 500) || 'Relevant domain experience.',
      required: true,
      weight: 100,
    });
  } else {
    // Distribute weights so they sum to exactly 100.0
    // Required skills get 2x weight relative to preferred skills
    const rawWeights = requirements.map((r) => (r.required ? 2 : 1));
    const totalRaw = rawWeights.reduce((acc, val) => acc + val, 0);

    let distributedSum = 0;
    requirements.forEach((req, idx) => {
      if (idx === requirements.length - 1) {
        // Last item takes whatever remains to guarantee exact 100.0 sum
        req.weight = Math.round((100 - distributedSum) * 100) / 100;
      } else {
        const calculated = Math.round((rawWeights[idx] / totalRaw) * 100 * 100) / 100;
        req.weight = calculated;
        distributedSum += calculated;
      }
    });

    // Ensure no weight is 0 or negative
    if (requirements[requirements.length - 1].weight <= 0) {
      const equalWeight = Math.round((100 / requirements.length) * 100) / 100;
      let sum = 0;
      requirements.forEach((req, idx) => {
        if (idx === requirements.length - 1) {
          req.weight = Math.round((100 - sum) * 100) / 100;
        } else {
          req.weight = equalWeight;
          sum += equalWeight;
        }
      });
    }
  }

  return {
    title: params.title.trim().slice(0, 150),
    description: (params.description.trim() || 'Job criteria and requirements for candidate evaluation.').slice(0, 5000),
    requirements,
    minimum_score: params.minimum_score ?? 0,
  };
}

export interface RankParams {
  job: ApiJobDescription;
  files: File[];
}

/**
 * Score and rank multiple candidate resumes against a job description.
 * Calls POST /api/v1/resumes/rank with multipart form-data.
 */
export async function rankResumes({ job, files }: RankParams): Promise<ApiCandidateRankingResponse> {
  if (!API_BASE_URL) {
    throw new ApiError(
      'AI analysis service is not configured. Set VITE_API_BASE_URL to connect the analysis backend.',
      0,
    );
  }

  const formData = new FormData();
  formData.append('job', JSON.stringify(job));
  for (const file of files) {
    formData.append('files', file);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 180000); // 3 minutes timeout for multiple PDFs

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/resumes/rank`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new ApiError(parseErrorDetail(res.status, text), res.status);
    }

    const data: ApiCandidateRankingResponse = await res.json();

    if (!data.candidates || !Array.isArray(data.candidates)) {
      throw new ApiError('Received an unexpected response format from the analysis service.', res.status);
    }

    return data;
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof ApiError) throw err;
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('The ranking request timed out. The backend or AI provider may be busy — please try again.', 408);
    }
    if (err instanceof TypeError) {
      throw new ApiError('Could not reach the analysis service. Check that the backend is running and CORS is enabled.', 0);
    }
    throw err;
  }
}
