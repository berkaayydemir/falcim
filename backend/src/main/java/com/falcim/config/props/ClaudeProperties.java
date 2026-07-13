package com.falcim.config.props;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Claude / Anthropic API yapılandırması (falcim.claude.*).
 */
@ConfigurationProperties(prefix = "falcim.claude")
public record ClaudeProperties(
        String baseUrl,
        String apiKey,
        String model,
        String version,
        int maxTokens,
        int timeoutSeconds
) {
    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }
}
