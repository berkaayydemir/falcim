import { API_BASE } from '../config/env';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from './tokenStorage';

/**
 * Backend'den dönen standart hata gövdesi.
 */
export interface ApiErrorBody {
  code?: string;
  message?: string;
  status?: number;
  fieldErrors?: Array<{ field: string; message: string }>;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// Oturum düştüğünde (refresh başarısız) AuthContext'in haberdar olması için basit dinleyici.
let sessionExpiredListener: (() => void) | null = null;

export function setSessionExpiredListener(listener: (() => void) | null): void {
  sessionExpiredListener = listener;
}

// Eşzamanlı 401'lerde tek bir refresh isteği yapılmasını sağlar.
let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }
  refreshPromise = (async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) return false;

      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) {
        await clearTokens();
        return false;
      }
      const data = (await res.json()) as { accessToken: string; refreshToken: string };
      await saveTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

interface RequestOptions {
  method?: string;
  body?: BodyInit | null;
  headers?: Record<string, string>;
  auth?: boolean; // varsayılan true; auth uçları için false
}

async function rawRequest(path: string, options: RequestOptions): Promise<Response> {
  const headers: Record<string, string> = { ...(options.headers ?? {}) };

  if (options.auth !== false) {
    const token = await getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return fetch(`${API_BASE}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ?? null,
  });
}

/**
 * Kimlik doğrulamalı istek gönderir; 401 alınırsa bir kez token yeniler ve tekrar dener.
 */
export async function apiRequest(path: string, options: RequestOptions = {}): Promise<Response> {
  let response = await rawRequest(path, options);

  if (response.status === 401 && options.auth !== false) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      response = await rawRequest(path, options);
    } else {
      sessionExpiredListener?.();
    }
  }

  return response;
}

async function parseError(response: Response): Promise<ApiError> {
  let body: ApiErrorBody = {};
  try {
    body = (await response.json()) as ApiErrorBody;
  } catch {
    // gövde yoksa varsayılan mesaj
  }
  return new ApiError(
    response.status,
    body.code ?? 'error',
    body.message ?? 'Bir hata oluştu. Lütfen tekrar deneyin.'
  );
}

/**
 * JSON gövdeli istek gönderir ve tipli sonucu döner. Hatada ApiError fırlatır.
 */
export async function apiJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = { 'content-type': 'application/json', ...(options.headers ?? {}) };
  const response = await apiRequest(path, { ...options, headers });
  if (!response.ok) {
    throw await parseError(response);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export async function apiJsonOrThrow<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw await parseError(response);
  }
  return (await response.json()) as T;
}
