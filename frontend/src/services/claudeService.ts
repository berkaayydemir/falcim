/**
 * @deprecated Bu dosya artık kullanılmıyor. Claude API anahtarı istemciden kaldırıldı;
 * tüm AI çağrıları backend üzerinden `readingService` ile yapılır.
 * Geriye dönük uyumluluk için yeniden dışa aktarım bırakıldı.
 */
export {
  getCoffeeReading,
  getCoffeeReading as getFortuneReading,
  FALLBACK_FORTUNE,
} from './readingService';
export type { FortuneResult } from './readingService';
