package com.falcim.auth.social;

/**
 * Google/Apple id_token doğrulandıktan sonra elde edilen kimlik.
 *
 * @param subject       sağlayıcıdaki benzersiz kullanıcı kimliği (JWT 'sub')
 * @param email         e-posta (Apple'da yalnızca ilk girişte gelebilir; null olabilir)
 * @param emailVerified e-posta doğrulanmış mı
 * @param name          ad (varsa)
 */
public record VerifiedIdentity(
        String subject,
        String email,
        boolean emailVerified,
        String name
) {
}
