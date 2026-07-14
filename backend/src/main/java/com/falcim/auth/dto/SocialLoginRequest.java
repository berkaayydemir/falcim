package com.falcim.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * İstemciden gelen sosyal giriş isteği.
 *
 * @param idToken     Google/Apple id_token (JWT)
 * @param displayName ad (Apple yalnızca ilk girişte ad verir; istemci iletebilir)
 */
public record SocialLoginRequest(
        @NotBlank(message = "idToken zorunludur")
        String idToken,

        @Size(max = 80)
        String displayName
) {
}
