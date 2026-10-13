import { API_BASE_URL } from './constants';
import type { ApiRankResponse, ApiRankCandidate } from './types';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function checkApiHealth(): Promise<boolean> {
  if (!API_BASE_URL) return false;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

export interface RankParams {
  job: Record<string, unknown>;
  files: File[];
}

export async function rankResumes({ job, files }: RankParams): Promise<ApiRankCandidate[]> {
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
  const timeout = setTimeout(() => controller.abort(), 120000);

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/resumes/rank`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      let detail = text;
      try {
        const json = JSON.parse(text);
        detail = json.detail || json.message || text;
      } catch {
        // keep raw text
      }
      throw new ApiError(
        detail || `Analysis request failed (${res.status})`,
        res.status,
      );
    }

    const data: ApiRankResponse = await res.json();

    if (data.error) {
      throw new ApiError(data.error, res.status);
    }

    const candidates = data.results || data.candidates || data.ranked_candidates;
    if (!candidates || !Array.isArray(candidates)) {
      throw new ApiError('Received an unexpected response format from the analysis service.', res.status);
    }

    return candidates;
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof ApiError) throw err;
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('The analysis request timed out. The service may be busy — please try again.', 408);
    }
    if (err instanceof TypeError) {
      throw new ApiError('Could not reach the analysis service. Check your network connection and that the backend is running.', 0);
    }
    throw err;
  }
}
