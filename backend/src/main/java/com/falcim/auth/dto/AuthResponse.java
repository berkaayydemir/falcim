package com.falcim.auth.dto;

/**
 * Kayıt/giriş/yenileme sonrası dönen token çifti ve kullanıcı bilgisi.
 */
public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresInSeconds,
        UserDto user
) {
    public static AuthResponse of(String accessToken, String refreshToken, long expiresInSeconds, UserDto user) {
        return new AuthResponse(accessToken, refreshToken, "Bearer", expiresInSeconds, user);
    }
}
