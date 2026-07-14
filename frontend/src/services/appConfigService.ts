import { AppConfig } from '../types';
import { APP_PLATFORM, APP_VERSION } from '../config/appVersion';
import { apiJson } from './apiClient';

/**
 * Açılışta sürüm/güncelleme durumunu backend'den çeker. Kimlik doğrulama gerektirmez.
 */
export function getAppConfig(): Promise<AppConfig> {
  const query = `platform=${APP_PLATFORM}&version=${encodeURIComponent(APP_VERSION)}`;
  return apiJson<AppConfig>(`/app/config?${query}`, { auth: false });
}
