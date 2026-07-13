package com.falcim.quota;

import com.falcim.security.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/quota")
public class QuotaController {

    private final DailyQuotaService quotaService;

    public QuotaController(DailyQuotaService quotaService) {
        this.quotaService = quotaService;
    }

    @GetMapping("/today")
    public QuotaStatus today(@AuthenticationPrincipal UserPrincipal principal) {
        return quotaService.statusFor(principal.getId());
    }
}
