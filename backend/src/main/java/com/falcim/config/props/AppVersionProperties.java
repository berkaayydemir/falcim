package com.falcim.config.props;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Uygulama sürüm/force-update yapılandırması (falcim.app.*).
 * Sürüm eşikleri buradan yönetilir; değiştirip backend'i yeniden başlatmak yeterlidir.
 */
@ConfigurationProperties(prefix = "falcim.app")
public record AppVersionProperties(
        Platform android,
        Platform ios,
        String updateMessage,
        String forceUpdateMessage
) {

    /**
     * @param latestVersion       en güncel yayınlanan sürüm (bunun altı → yumuşak güncelleme önerisi)
     * @param minSupportedVersion desteklenen en düşük sürüm (bunun altı → ZORUNLU güncelleme)
     * @param storeUrl            mağaza linki
     */
    public record Platform(
            String latestVersion,
            String minSupportedVersion,
            String storeUrl
    ) {
    }

    public Platform forPlatform(String platform) {
        if (platform != null && platform.trim().equalsIgnoreCase("ios")) {
            return ios;
        }
        return android; // varsayılan android
    }
}
