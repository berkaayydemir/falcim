package com.falcim.user;

/**
 * Kullanıcının hesabını hangi yöntemle oluşturduğu / bağladığı.
 */
public enum AuthProvider {
    LOCAL,   // e-posta + şifre
    GOOGLE,
    APPLE
}
