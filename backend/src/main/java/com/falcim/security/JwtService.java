package com.falcim.security;

import com.falcim.config.props.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

/**
 * Kısa ömürlü access token üretir ve doğrular. Refresh token'lar burada değil,
 * {@code auth} modülünde DB'de hash'li olarak yönetilir.
 */
@Service
public class JwtService {

    private final SecretKey key;
    private final String issuer;
    private final long accessTtlMinutes;

    public JwtService(JwtProperties props) {
        byte[] secretBytes = props.secret().getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < 32) {
            throw new IllegalStateException(
                    "falcim.jwt.secret en az 32 bayt (256-bit) olmalı. .env içindeki JWT_SECRET değerini güçlendirin.");
        }
        this.key = Keys.hmacShaKeyFor(secretBytes);
        this.issuer = props.issuer();
        this.accessTtlMinutes = props.accessTtlMinutes();
    }

    public String generateAccessToken(UUID userId, String email, String role) {
        Instant now = Instant.now();
        Instant exp = now.plus(accessTtlMinutes, ChronoUnit.MINUTES);
        return Jwts.builder()
                .issuer(issuer)
                .subject(userId.toString())
                .claim("email", email)
                .claim("role", role)
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .signWith(key)
                .compact();
    }

    /**
     * Token'ı doğrular ve subject (kullanıcı id) döner. Geçersizse boş.
     */
    public UUID parseUserId(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .requireIssuer(issuer)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return UUID.fromString(claims.getSubject());
        } catch (JwtException | IllegalArgumentException ex) {
            return null;
        }
    }
}
