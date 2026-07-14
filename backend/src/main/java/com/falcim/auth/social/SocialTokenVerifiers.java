package com.falcim.auth.social;

import com.falcim.common.error.ApiException;
import com.falcim.config.props.OAuthProperties;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

/**
 * Google ve Apple id_token doğrulayıcılarını yapılandırmadan üretir ve saklar.
 * İlgili sağlayıcı yapılandırılmamışsa anlamlı bir hata döner.
 */
@Component
public class SocialTokenVerifiers {

    private static final String GOOGLE_JWKS = "https://www.googleapis.com/oauth2/v3/certs";
    private static final Set<String> GOOGLE_ISSUERS =
            Set.of("https://accounts.google.com", "accounts.google.com");

    private static final String APPLE_JWKS = "https://appleid.apple.com/auth/keys";
    private static final Set<String> APPLE_ISSUERS = Set.of("https://appleid.apple.com");

    private final OidcTokenVerifier google;
    private final OidcTokenVerifier apple;

    public SocialTokenVerifiers(OAuthProperties props) {
        this.google = props.google().isConfigured()
                ? new OidcTokenVerifier("Google", GOOGLE_JWKS, GOOGLE_ISSUERS,
                        new HashSet<>(props.google().clientIds()))
                : null;
        this.apple = props.apple().isConfigured()
                ? new OidcTokenVerifier("Apple", APPLE_JWKS, APPLE_ISSUERS,
                        new HashSet<>(props.apple().clientIds()))
                : null;
    }

    public VerifiedIdentity verifyGoogle(String idToken) {
        if (google == null) {
            throw ApiException.badRequest("google_not_configured",
                    "Google ile giriş şu an kullanılamıyor.");
        }
        return google.verify(idToken);
    }

    public VerifiedIdentity verifyApple(String idToken) {
        if (apple == null) {
            throw ApiException.badRequest("apple_not_configured",
                    "Apple ile giriş şu an kullanılamıyor.");
        }
        return apple.verify(idToken);
    }
}
