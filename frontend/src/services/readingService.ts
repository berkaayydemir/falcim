import { Intent, PageResponse, QuotaStatus, ReadingDto } from '../types';
import { apiJson, apiRequest, ApiError } from './apiClient';

/**
 * Okuma (fal) servis çağrıları. Görsel backend'e yüklenir; Claude API anahtarı
 * artık istemcide DEĞİL, yalnızca sunucuda tutulur.
 */

// ResultScreen'in beklediği sonuç şekli (claudeService ile geriye dönük uyumlu).
export interface FortuneResult {
  fortune: string;
  symbols: ReadingDto['symbols'];
  energyPct: number;
}

// Ağ/oturum hatalarında gösterilecek sıcak yedek yorum.
export const FALLBACK_FORTUNE: FortuneResult = {
  fortune:
    'Fincanında sıcak bir enerji görüyorum. Yollarını aydınlatan bir ışık var; ' +
    'attığın her adım seni içten gelen bir huzura yaklaştırıyor. Sabırlı ol, ' +
    'güzel bir haber kapını çalmak üzere.',
  symbols: [
    { icon: '☀️', name: 'Güneş', meaning: 'Yeni başlangıç' },
    { icon: '🕊️', name: 'Kuş', meaning: 'İyi haber' },
    { icon: '🛤️', name: 'Yol', meaning: 'Açılan fırsat' },
  ],
  energyPct: 72,
};

// React Native FormData dosya nesnesi (TS strict için tiplenmiş cast).
interface RNFile {
  uri: string;
  name: string;
  type: string;
}

function guessMime(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

/**
 * Fincan görselini backend'e yükler ve kahve falı sonucunu döner.
 * Backend AI hatalarında kendi fallback'ini döndürür; ağ hatasında burada fırlatılır.
 */
export async function getCoffeeReading(
  imageUri: string,
  intent: Intent
): Promise<ReadingDto> {
  const file: RNFile = {
    uri: imageUri,
    name: 'cup.jpg',
    type: guessMime(imageUri),
  };

  const form = new FormData();
  // RN'de FormData dosyayı bu obje şekliyle bekler; Blob olarak cast ediyoruz.
  form.append('image', file as unknown as Blob);
  form.append('intent', intent);

  const res = await apiRequest('/readings/coffee', {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    let message = 'Fal alınamadı. Lütfen tekrar deneyin.';
    let code = 'error';
    try {
      const body = (await res.json()) as { message?: string; code?: string };
      message = body.message ?? message;
      code = body.code ?? code;
    } catch {
      // yoksa varsayılan
    }
    throw new ApiError(res.status, code, message);
  }

  return (await res.json()) as ReadingDto;
}

export function getQuota(): Promise<QuotaStatus> {
  return apiJson<QuotaStatus>('/quota/today');
}

export function getHistory(page = 0, size = 20): Promise<PageResponse<ReadingDto>> {
  return apiJson<PageResponse<ReadingDto>>(`/readings?page=${page}&size=${size}`);
}

export function getReading(id: string): Promise<ReadingDto> {
  return apiJson<ReadingDto>(`/readings/${id}`);
}
