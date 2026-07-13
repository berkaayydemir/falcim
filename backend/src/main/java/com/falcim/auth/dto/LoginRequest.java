package com.falcim.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "E-posta zorunludur")
        @Email(message = "Geçerli bir e-posta girin")
        String email,

        @NotBlank(message = "Şifre zorunludur")
        String password
) {
}
