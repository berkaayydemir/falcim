package com.falcim.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "E-posta zorunludur")
        @Email(message = "Geçerli bir e-posta girin")
        @Size(max = 320)
        String email,

        @NotBlank(message = "Şifre zorunludur")
        @Size(min = 8, max = 72, message = "Şifre en az 8 karakter olmalı")
        String password,

        @NotBlank(message = "İsim zorunludur")
        @Size(min = 2, max = 80)
        String displayName
) {
}
