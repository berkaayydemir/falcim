package com.falcim.reading;

import com.falcim.common.error.ApiException;
import com.falcim.quota.DailyQuotaService;
import com.falcim.reading.provider.ReadingInput;
import com.falcim.reading.provider.ReadingOutput;
import com.falcim.reading.provider.ReadingProvider;
import com.falcim.user.User;
import com.falcim.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Okuma akışını yönetir: kota kontrolü → kategoriye göre sağlayıcı seçimi (strateji) →
 * AI üretimi → kalıcılaştırma. Yeni kategori eklemek yalnızca yeni bir
 * {@link ReadingProvider} bean'i gerektirir; bu sınıf değişmez.
 */
@Service
public class ReadingService {

    private final Map<ReadingCategory, ReadingProvider> providers = new EnumMap<>(ReadingCategory.class);
    private final ReadingRepository readingRepository;
    private final UserRepository userRepository;
    private final DailyQuotaService quotaService;

    public ReadingService(List<ReadingProvider> providerBeans,
                          ReadingRepository readingRepository,
                          UserRepository userRepository,
                          DailyQuotaService quotaService) {
        for (ReadingProvider provider : providerBeans) {
            providers.put(provider.category(), provider);
        }
        this.readingRepository = readingRepository;
        this.userRepository = userRepository;
        this.quotaService = quotaService;
    }

    @Transactional
    public Reading create(UUID userId, ReadingCategory category, ReadingInput input) {
        ReadingProvider provider = providers.get(category);
        if (provider == null) {
            throw ApiException.badRequest("category_unavailable",
                    "Bu kategori henüz aktif değil.");
        }

        if (!quotaService.canConsume(userId)) {
            throw ApiException.tooManyRequests("quota_exceeded",
                    "Bugünkü fal hakkın doldu. Sınırsız fal için Premium'a geçebilirsin.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("user_not_found", "Kullanıcı bulunamadı."));

        ReadingOutput output = provider.generate(input);

        Reading reading = new Reading(
                user, category, input.intent(),
                output.fortune(), output.symbols(), output.energyPct());
        return readingRepository.save(reading);
    }

    @Transactional(readOnly = true)
    public Page<Reading> history(UUID userId, Pageable pageable) {
        return readingRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    @Transactional(readOnly = true)
    public Reading get(UUID userId, UUID readingId) {
        return readingRepository.findByIdAndUserId(readingId, userId)
                .orElseThrow(() -> ApiException.notFound("reading_not_found", "Fal bulunamadı."));
    }
}
