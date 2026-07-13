package com.falcim.security.ratelimit;

import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;

/**
 * Basit, bağımlılıksız, bellek-içi token-bucket rate limiter.
 * Anahtar başına dakikada N istek. Tek örnek (single-instance) dağıtım için yeterlidir;
 * yatay ölçeklemede Redis tabanlı bir limiter'a taşınmalıdır.
 */
@Service
public class RateLimiterService {

    private static final long WINDOW_NANOS = 60_000_000_000L; // 1 dakika

    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    /**
     * @return izin verildiyse true, kota aşıldıysa false
     */
    public boolean tryConsume(String key, int permitsPerMinute) {
        Bucket bucket = buckets.computeIfAbsent(key, k -> new Bucket(permitsPerMinute));
        return bucket.tryConsume(permitsPerMinute);
    }

    private static final class Bucket {
        private double tokens;
        private long lastRefillNanos;

        private Bucket(int capacity) {
            this.tokens = capacity;
            this.lastRefillNanos = System.nanoTime();
        }

        synchronized boolean tryConsume(int capacity) {
            refill(capacity);
            if (tokens >= 1.0) {
                tokens -= 1.0;
                return true;
            }
            return false;
        }

        private void refill(int capacity) {
            long now = System.nanoTime();
            long elapsed = now - lastRefillNanos;
            if (elapsed <= 0) {
                return;
            }
            double refilled = (double) capacity * elapsed / WINDOW_NANOS;
            tokens = Math.min(capacity, tokens + refilled);
            lastRefillNanos = now;
        }
    }
}
