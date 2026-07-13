package com.falcim.config.props;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Rate limit yapılandırması (falcim.ratelimit.*).
 */
@ConfigurationProperties(prefix = "falcim.ratelimit")
public record RateLimitProperties(
        int authPerMinute,
        int aiPerMinute
) {
}
