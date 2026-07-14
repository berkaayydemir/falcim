package com.falcim.auth;

import com.falcim.auth.dto.AuthResponse;
import com.falcim.auth.dto.LoginRequest;
import com.falcim.auth.dto.RegisterRequest;
import com.falcim.auth.dto.UserDto;
import com.falcim.auth.social.SocialTokenVerifiers;
import com.falcim.auth.social.VerifiedIdentity;
import com.falcim.common.error.ApiException;
import com.falcim.config.props.JwtProperties;
import com.falcim.user.AuthProvider;
import com.falcim.user.User;
import com.falcim.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * Kimlik doğrulama iş mantığı: kayıt, giriş, refresh rotasyonu, çıkış.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.falcim.security.JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final SocialTokenVerifiers socialVerifiers;

    public AuthService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       PasswordEncoder passwordEncoder,
                       com.falcim.security.JwtService jwtService,
                       JwtProperties jwtProperties,
                       SocialTokenVerifiers socialVerifiers) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.jwtProperties = jwtProperties;
        this.socialVerifiers = socialVerifiers;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = normalizeEmail(req.email());
        if (userRepository.existsByEmail(email)) {
            throw ApiException.conflict("email_taken", "Bu e-posta ile zaten bir hesap var.");
        }
        User user = new User(email, passwordEncoder.encode(req.password()), req.displayName().trim());
        userRepository.save(user);
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest req) {
        String email = normalizeEmail(req.email());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.unauthorized("invalid_credentials", "E-posta veya şifre hatalı."));

        if (!user.isActive() || !passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw ApiException.unauthorized("invalid_credentials", "E-posta veya şifre hatalı.");
        }
        return issueTokens(user);
    }

    /**
     * Refresh token rotasyonu: sunulan token doğrulanır, iptal edilir ve yeni bir çift üretilir.
     * Yeniden kullanılmış (iptal edilmiş) token gelirse güvenlik için kullanıcının tüm token'ları iptal edilir.
     */
    @Transactional
    public AuthResponse refresh(String rawRefreshToken) {
        String hash = TokenHasher.sha256(rawRefreshToken);
        RefreshToken stored = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> ApiException.unauthorized("invalid_refresh", "Oturum geçersiz. Tekrar giriş yapın."));

        if (!stored.isActive()) {
            // Olası token çalınması: bu kullanıcının tüm aktif token'larını iptal et.
            refreshTokenRepository.revokeAllForUser(stored.getUser().getId(), Instant.now());
            throw ApiException.unauthorized("invalid_refresh", "Oturum geçersiz. Tekrar giriş yapın.");
        }

        stored.revoke();
        return issueTokens(stored.getUser());
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        String hash = TokenHasher.sha256(rawRefreshToken);
        refreshTokenRepository.findByTokenHash(hash).ifPresent(RefreshToken::revoke);
    }

    @Transactional
    public AuthResponse loginWithGoogle(String idToken, String displayNameFallback) {
        VerifiedIdentity identity = socialVerifiers.verifyGoogle(idToken);
        return resolveSocialUser(AuthProvider.GOOGLE, identity, displayNameFallback);
    }

    @Transactional
    public AuthResponse loginWithApple(String idToken, String displayNameFallback) {
        VerifiedIdentity identity = socialVerifiers.verifyApple(idToken);
        return resolveSocialUser(AuthProvider.APPLE, identity, displayNameFallback);
    }

    /**
     * Doğrulanmış sosyal kimliği hesaba çözer:
     * 1) sağlayıcı+id ile eşleşen hesap, 2) aynı e-postalı hesaba bağlama, 3) yeni hesap.
     */
    private AuthResponse resolveSocialUser(AuthProvider provider, VerifiedIdentity identity,
                                           String displayNameFallback) {
        // 1) Daha önce bu sağlayıcıyla giriş yapmış mı?
        User user = userRepository
                .findByProviderAndProviderId(provider, identity.subject())
                .orElse(null);

        String email = identity.email() == null ? null : normalizeEmail(identity.email());

        // 2) E-posta eşleşen mevcut hesaba bağla
        if (user == null && email != null) {
            user = userRepository.findByEmail(email).orElse(null);
            if (user != null && user.getProviderId() == null) {
                user.setProvider(provider);
                user.setProviderId(identity.subject());
            }
        }

        // 3) Yeni sosyal hesap oluştur
        if (user == null) {
            String finalEmail = email != null
                    ? email
                    : provider.name().toLowerCase() + "_" + identity.subject() + "@users.falcim.app";
            String name = resolveDisplayName(identity.name(), displayNameFallback, finalEmail);
            user = User.social(finalEmail, name, provider, identity.subject());
            userRepository.save(user);
        }

        if (!user.isActive()) {
            throw ApiException.forbidden("account_disabled", "Hesabınız devre dışı.");
        }
        return issueTokens(user);
    }

    private String resolveDisplayName(String fromToken, String fromClient, String email) {
        if (fromToken != null && !fromToken.isBlank()) {
            return fromToken.trim();
        }
        if (fromClient != null && !fromClient.isBlank()) {
            return fromClient.trim();
        }
        int at = email.indexOf('@');
        String local = at > 0 ? email.substring(0, at) : email;
        return local.isBlank() ? "Falcım Kullanıcısı" : local;
    }

    private AuthResponse issueTokens(User user) {
        String accessToken = jwtService.generateAccessToken(
                user.getId(), user.getEmail(), user.getRole().name());

        String rawRefresh = TokenHasher.generateRawToken();
        Instant expiresAt = Instant.now().plus(jwtProperties.refreshTtlDays(), ChronoUnit.DAYS);
        refreshTokenRepository.save(new RefreshToken(user, TokenHasher.sha256(rawRefresh), expiresAt));

        long accessTtlSeconds = jwtProperties.accessTtlMinutes() * 60;
        return AuthResponse.of(accessToken, rawRefresh, accessTtlSeconds, UserDto.from(user));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}
