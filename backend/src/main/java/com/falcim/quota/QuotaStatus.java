package com.falcim.quota;

/**
 * Günlük kota durumu. limit = -1 ise sınırsız (premium).
 */
public record QuotaStatus(
        int used,
        int limit,
        int remaining,
        boolean premium
) {
    public boolean isExceeded() {
        return !premium && used >= limit;
    }
}
