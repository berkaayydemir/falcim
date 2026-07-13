package com.falcim.reading;

import java.util.Locale;

/**
 * Kullanıcının fal odağı. Frontend'deki anahtarlarla birebir eşleşir.
 */
public enum Intent {
    GENERAL("genel yaşam ve gelecek"),
    LOVE("aşk ve ilişkiler"),
    CAREER("kariyer ve iş hayatı"),
    MONEY("para ve maddi konular"),
    HEALTH("sağlık ve enerji");

    private final String label;

    Intent(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }

    /**
     * Frontend anahtarını (ör. "love") güvenle parse eder; bilinmeyen değerde GENERAL döner.
     */
    public static Intent fromKey(String key) {
        if (key == null || key.isBlank()) {
            return GENERAL;
        }
        try {
            return Intent.valueOf(key.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return GENERAL;
        }
    }
}
