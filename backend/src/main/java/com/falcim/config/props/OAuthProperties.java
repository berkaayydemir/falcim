package com.falcim.config.props;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/**
 * Sosyal giriş sağlayıcı yapılandırması (falcim.oauth.*).
 * clientIds: kabul edilecek id_token 'aud' değerleri (platform başına farklı olabilir).
 */
@ConfigurationProperties(prefix = "falcim.oauth")
public record OAuthProperties(
        Provider google,
        Provider apple
) {

    public record Provider(List<String> clientIds) {
        public Provider {
            clientIds = clientIds == null
                    ? List.of()
                    : clientIds.stream()
                            .filter(s -> s != null && !s.isBlank())
                            .map(String::trim)
                            .toList();
        }

        public boolean isConfigured() {
            return !clientIds.isEmpty();
        }
    }

    public OAuthProperties {
        google = google == null ? new Provider(List.of()) : google;
        apple = apple == null ? new Provider(List.of()) : apple;
    }
}
