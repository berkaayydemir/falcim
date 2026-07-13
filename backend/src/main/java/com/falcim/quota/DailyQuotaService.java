package com.falcim.quota;

import com.falcim.config.props.QuotaProperties;
import com.falcim.reading.ReadingRepository;
import com.falcim.subscription.SubscriptionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.UUID;

/**
 * Ücretsiz kullanıcılar için günlük okuma kotasını sunucu tarafında zorlar.
 * Gün sınırı Türkiye saatine (Europe/Istanbul) göre hesaplanır.
 */
@Service
public class DailyQuotaService {

    private static final ZoneId ZONE = ZoneId.of("Europe/Istanbul");

    private final ReadingRepository readingRepository;
    private final SubscriptionService subscriptionService;
    private final QuotaProperties quotaProps;

    public DailyQuotaService(ReadingRepository readingRepository,
                             SubscriptionService subscriptionService,
                             QuotaProperties quotaProps) {
        this.readingRepository = readingRepository;
        this.subscriptionService = subscriptionService;
        this.quotaProps = quotaProps;
    }

    @Transactional(readOnly = true)
    public QuotaStatus statusFor(UUID userId) {
        if (subscriptionService.isPremium(userId)) {
            return new QuotaStatus(0, -1, -1, true);
        }
        int limit = quotaProps.freeDailyLimit();
        int used = (int) usedToday(userId);
        int remaining = Math.max(0, limit - used);
        return new QuotaStatus(used, limit, remaining, false);
    }

    /**
     * Yeni bir okuma başlatmadan önce çağrılır; kota aşıldıysa false döner.
     */
    @Transactional(readOnly = true)
    public boolean canConsume(UUID userId) {
        return !statusFor(userId).isExceeded();
    }

    private long usedToday(UUID userId) {
        LocalDate today = LocalDate.now(ZONE);
        Instant start = today.atStartOfDay(ZONE).toInstant();
        Instant end = today.plusDays(1).atStartOfDay(ZONE).toInstant();
        return readingRepository.countByUserIdAndCreatedAtBetween(userId, start, end);
    }
}
