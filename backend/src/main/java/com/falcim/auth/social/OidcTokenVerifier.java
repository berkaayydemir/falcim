package com.falcim.auth.social;

import com.falcim.common.error.ApiException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.jwk.source.JWKSourceBuilder;
import com.nimbusds.jose.proc.JWSKeySelector;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.ConfigurableJWTProcessor;
import com.nimbusds.jwt.proc.DefaultJWTClaimsVerifier;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.util.Set;

/**
 * Bir OIDC sağlayıcısının (Google/Apple) id_token'ını JWKS ile doğrular:
 * imza (RS256), 'aud' (kabul edilen client id'ler), 'iss' (beklenen issuer'lar) ve süre.
 * Anahtarlar sağlayıcının JWKS uç noktasından çekilir ve önbelleklenir.
 */
public class OidcTokenVerifier {

    private static final Logger log = LoggerFactory.getLogger(OidcTokenVerifier.class);

    private final ConfigurableJWTProcessor<SecurityContext> processor;
    private final Set<String> expectedIssuers;
    private final String providerName;

    public OidcTokenVerifier(String providerName, String jwksUrl,
                             Set<String> expectedIssuers, Set<String> acceptedAudiences) {
        this.providerName = providerName;
        this.expectedIssuers = expectedIssuers;
        try {
            JWKSource<SecurityContext> keySource = JWKSourceBuilder
                    .create(URI.create(jwksUrl).toURL())
                    .retrying(true)
                    .build();

            DefaultJWTProcessor<SecurityContext> p = new DefaultJWTProcessor<>();
            JWSKeySelector<SecurityContext> keySelector =
                    new JWSVerificationKeySelector<>(JWSAlgorithm.RS256, keySource);
            p.setJWSKeySelector(keySelector);
            p.setJWTClaimsSetVerifier(new DefaultJWTClaimsVerifier<>(
                    acceptedAudiences,        // 'aud' bu kümede olmalı
                    null,                     // exact-match claim yok
                    Set.of("sub"),            // 'sub' zorunlu ('exp' otomatik kontrol edilir)
                    null));
            this.processor = p;
        } catch (Exception e) {
            throw new IllegalStateException(providerName + " için token doğrulayıcı kurulamadı", e);
        }
    }

    public VerifiedIdentity verify(String idToken) {
        try {
            JWTClaimsSet claims = processor.process(idToken, null);

            String issuer = claims.getIssuer();
            if (issuer == null || !expectedIssuers.contains(issuer)) {
                throw ApiException.unauthorized("invalid_social_token",
                        "Kimlik doğrulanamadı. Lütfen tekrar deneyin.");
            }

            String subject = claims.getSubject();
            String email = claims.getStringClaim("email");
            boolean emailVerified = parseBoolean(claims.getClaim("email_verified"));
            String name = claims.getStringClaim("name");

            return new VerifiedIdentity(subject, email, emailVerified, name);
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            log.warn("{} id_token doğrulaması başarısız: {}", providerName, ex.getMessage());
            throw ApiException.unauthorized("invalid_social_token",
                    "Kimlik doğrulanamadı. Lütfen tekrar deneyin.");
        }
    }

    private static boolean parseBoolean(Object value) {
        if (value instanceof Boolean b) {
            return b;
        }
        return value != null && "true".equalsIgnoreCase(value.toString());
    }
}
