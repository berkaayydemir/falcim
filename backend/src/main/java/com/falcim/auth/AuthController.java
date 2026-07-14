package com.falcim.auth;

import com.falcim.auth.dto.AuthResponse;
import com.falcim.auth.dto.LoginRequest;
import com.falcim.auth.dto.RefreshRequest;
import com.falcim.auth.dto.RegisterRequest;
import com.falcim.auth.dto.SocialLoginRequest;
import com.falcim.common.error.ApiException;
import com.falcim.config.props.RateLimitProperties;
import com.falcim.security.ratelimit.RateLimiterService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final RateLimiterService rateLimiter;
    private final RateLimitProperties rateLimitProps;

    public AuthController(AuthService authService,
                          RateLimiterService rateLimiter,
                          RateLimitProperties rateLimitProps) {
        this.authService = authService;
        this.rateLimiter = rateLimiter;
        this.rateLimitProps = rateLimitProps;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req,
                                                 HttpServletRequest http) {
        enforceRateLimit(http);
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req,
                                              HttpServletRequest http) {
        enforceRateLimit(http);
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> google(@Valid @RequestBody SocialLoginRequest req,
                                               HttpServletRequest http) {
        enforceRateLimit(http);
        return ResponseEntity.ok(authService.loginWithGoogle(req.idToken(), req.displayName()));
    }

    @PostMapping("/apple")
    public ResponseEntity<AuthResponse> apple(@Valid @RequestBody SocialLoginRequest req,
                                              HttpServletRequest http) {
        enforceRateLimit(http);
        return ResponseEntity.ok(authService.loginWithApple(req.idToken(), req.displayName()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshRequest req) {
        return ResponseEntity.ok(authService.refresh(req.refreshToken()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody RefreshRequest req) {
        authService.logout(req.refreshToken());
        return ResponseEntity.noContent().build();
    }

    private void enforceRateLimit(HttpServletRequest http) {
        String key = "auth:" + clientIp(http);
        if (!rateLimiter.tryConsume(key, rateLimitProps.authPerMinute())) {
            throw ApiException.tooManyRequests("rate_limited",
                    "Çok fazla deneme yaptınız. Lütfen biraz sonra tekrar deneyin.");
        }
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
