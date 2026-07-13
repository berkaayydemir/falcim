package com.falcim.config.props;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/**
 * CORS izinli origin listesi (falcim.cors.*).
 */
@ConfigurationProperties(prefix = "falcim.cors")
public record CorsProperties(
        List<String> allowedOrigins
) {
    public CorsProperties {
        allowedOrigins = allowedOrigins == null ? List.of() : allowedOrigins;
    }
}
