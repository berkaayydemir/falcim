package com.falcim.config.props;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Kota yapılandırması (falcim.quota.*).
 */
@ConfigurationProperties(prefix = "falcim.quota")
public record QuotaProperties(
        int freeDailyLimit
) {
}
