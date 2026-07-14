import { API_BASE } from '../config/env';
import { AuthResponse, AuthUser } from '../types';
import { ApiError, apiJson, apiJsonOrThrow } from './apiClient';
import { clearTokens, getRefreshToken, saveTokens } from './tokenStorage';

/**
 * Kimlik doğrulama servis çağrıları. Register/login token'ları güvenli depoya yazar.
 */

async function postAuth(path: string, payload: unknown): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await apiJsonOrThrow<AuthResponse>(res);
  await saveTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data;
}

export function register(
  email: string,
  password: string,
  displayName: string
): Promise<AuthResponse> {
  return postAuth('/auth/register', { email, password, displayName });
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return postAuth('/auth/login', { email, password });
}

/** Google id_token'ı backend'e gönderir; hesabı bulur/oluşturur ve token'ları saklar. */
export function loginWithGoogle(idToken: string, displayName?: string): Promise<AuthResponse> {
  return postAuth('/auth/google', { idToken, displayName });
}

/** Apple identityToken'ı backend'e gönderir; hesabı bulur/oluşturur ve token'ları saklar. */
export function loginWithApple(idToken: string, displayName?: string): Promise<AuthResponse> {
  return postAuth('/auth/apple', { idToken, displayName });
}

/**
 * Sunucudaki refresh token'ı iptal eder ve yerel token'ları temizler.
 */
export async function logout(): Promise<void> {
  try {
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    }
  } catch {
    // çıkışta ağ hatası olsa bile yerel token'ları temizlemeye devam et
  } finally {
    await clearTokens();
  }
}

/**
 * Geçerli oturumun kullanıcısını döner; token yoksa/expired ise ApiError fırlatır.
 */
export function me(): Promise<AuthUser> {
  return apiJson<AuthUser>('/users/me');
}

export { ApiError };
