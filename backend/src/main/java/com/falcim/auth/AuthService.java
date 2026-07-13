package com.falcim.auth;

import com.falcim.auth.dto.AuthResponse;
import com.falcim.auth.dto.LoginRequest;
import com.falcim.auth.dto.RegisterRequest;
import com.falcim.auth.dto.UserDto;
import com.falcim.common.error.ApiException;
import com.falcim.config.props.JwtProperties;
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

    public AuthService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       PasswordEncoder passwordEncoder,
                       com.falcim.security.JwtService jwtService,
                       JwtProperties jwtProperties) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.jwtProperties = jwtProperties;
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
