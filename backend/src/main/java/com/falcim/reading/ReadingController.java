package com.falcim.reading;

import com.falcim.common.PageResponse;
import com.falcim.common.error.ApiException;
import com.falcim.config.props.RateLimitProperties;
import com.falcim.reading.dto.ReadingDto;
import com.falcim.reading.provider.ReadingInput;
import com.falcim.security.UserPrincipal;
import com.falcim.security.ratelimit.RateLimiterService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/readings")
public class ReadingController {

    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp");
    private static final int MAX_PAGE_SIZE = 50;

    private final ReadingService readingService;
    private final RateLimiterService rateLimiter;
    private final RateLimitProperties rateLimitProps;

    public ReadingController(ReadingService readingService,
                             RateLimiterService rateLimiter,
                             RateLimitProperties rateLimitProps) {
        this.readingService = readingService;
        this.rateLimiter = rateLimiter;
        this.rateLimitProps = rateLimitProps;
    }

    @PostMapping(value = "/coffee", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ReadingDto> coffee(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("image") MultipartFile image,
            @RequestParam(value = "intent", defaultValue = "general") String intent) {

        enforceAiRateLimit(principal.getId());
        validateImage(image);

        String mediaType = image.getContentType() == null ? "image/jpeg" : image.getContentType();
        byte[] bytes = readBytes(image);

        ReadingInput input = ReadingInput.ofImage(Intent.fromKey(intent), bytes, mediaType);
        Reading reading = readingService.create(principal.getId(), ReadingCategory.COFFEE, input);

        return ResponseEntity.status(HttpStatus.CREATED).body(ReadingDto.from(reading));
    }

    @GetMapping
    public PageResponse<ReadingDto> history(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        int safeSize = Math.min(Math.max(1, size), MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(Math.max(0, page), safeSize);
        return PageResponse.of(readingService.history(principal.getId(), pageable), ReadingDto::from);
    }

    @GetMapping("/{id}")
    public ReadingDto get(@AuthenticationPrincipal UserPrincipal principal,
                          @PathVariable UUID id) {
        return ReadingDto.from(readingService.get(principal.getId(), id));
    }

    private void enforceAiRateLimit(UUID userId) {
        if (!rateLimiter.tryConsume("ai:" + userId, rateLimitProps.aiPerMinute())) {
            throw ApiException.tooManyRequests("rate_limited",
                    "Çok hızlı istek gönderdiniz. Lütfen biraz bekleyin.");
        }
    }

    private void validateImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw ApiException.badRequest("image_required", "Lütfen bir fincan fotoğrafı yükleyin.");
        }
        String type = image.getContentType();
        if (type == null || !ALLOWED_TYPES.contains(type.toLowerCase())) {
            throw ApiException.badRequest("invalid_image_type",
                    "Yalnızca JPEG, PNG veya WEBP fotoğraf yükleyebilirsiniz.");
        }
    }

    private byte[] readBytes(MultipartFile image) {
        try {
            return image.getBytes();
        } catch (IOException e) {
            throw ApiException.badRequest("image_read_error", "Fotoğraf okunamadı. Lütfen tekrar deneyin.");
        }
    }
}
