package com.falcim.appinfo.dto;

/**
 * İstemcinin açılışta aldığı sürüm/güncelleme durumu.
 *
 * @param platform            değerlendirilen platform (android/ios)
 * @param currentVersion      istemcinin gönderdiği sürüm
 * @param latestVersion       en güncel sürüm
 * @param minSupportedVersion desteklenen en düşük sürüm
 * @param updateRequired      true → ZORUNLU güncelleme (uygulama bloklanmalı)
 * @param updateAvailable     true → yeni sürüm var ama zorunlu değil
 * @param storeUrl            mağaza linki
 * @param message             kullanıcıya gösterilecek mesaj (duruma göre)
 */
public record AppConfigResponse(
        String platform,
        String currentVersion,
        String latestVersion,
        String minSupportedVersion,
        boolean updateRequired,
        boolean updateAvailable,
        String storeUrl,
        String message
) {
}
