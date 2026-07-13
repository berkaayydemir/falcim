package com.falcim.config.props;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * JWT yapılandırması (falcim.jwt.*).
 */
@ConfigurationProperties(prefix = "falcim.jwt")
public record JwtProperties(
        String secret,
        long accessTtlMinutes,
        long refreshTtlDays,
        String issuer
) {
}
