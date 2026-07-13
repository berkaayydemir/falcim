package com.falcim.reading;

/**
 * Okuma kategorileri. Süper-app genişleme noktası:
 * yeni bir kategori eklemek için buraya bir değer + yeni bir {@code ReadingProvider} bean'i eklenir.
 */
public enum ReadingCategory {
    COFFEE,        // Türk kahvesi falı (bu iterasyonda aktif)
    TAROT,         // Tarot (sonraki adım)
    HOROSCOPE,     // Burç yorumu (sonraki adım)
    NATAL_CHART    // Yıldız/natal harita (sonraki adım)
}
