package com.falcim.appinfo;

import com.falcim.appinfo.dto.AppConfigResponse;
import com.falcim.config.props.AppVersionProperties;
import com.falcim.config.props.AppVersionProperties.Platform;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * İstemci açılışta buraya sürümünü sorar; zorunlu/opsiyonel güncelleme kararı burada verilir.
 * Kimlik doğrulama gerektirmez (public).
 */
@RestController
@RequestMapping("/api/v1/app")
public class AppConfigController {

    private final AppVersionProperties props;

    public AppConfigController(AppVersionProperties props) {
        this.props = props;
    }

    @GetMapping("/config")
    public AppConfigResponse config(
            @RequestParam(defaultValue = "android") String platform,
            @RequestParam(defaultValue = "0.0.0") String version) {

        Platform cfg = props.forPlatform(platform);

        boolean updateRequired = SemanticVersion.compare(version, cfg.minSupportedVersion()) < 0;
        boolean updateAvailable = SemanticVersion.compare(version, cfg.latestVersion()) < 0;

        String message = updateRequired
                ? props.forceUpdateMessage()
                : (updateAvailable ? props.updateMessage() : null);

        return new AppConfigResponse(
                platform.toLowerCase(),
                version,
                cfg.latestVersion(),
                cfg.minSupportedVersion(),
                updateRequired,
                updateAvailable,
                cfg.storeUrl(),
                message
        );
    }
}
