package com.falcim.reading;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class IntentTest {

    @Test
    void parsesKnownKeysCaseInsensitively() {
        assertThat(Intent.fromKey("love")).isEqualTo(Intent.LOVE);
        assertThat(Intent.fromKey("CAREER")).isEqualTo(Intent.CAREER);
    }

    @Test
    void fallsBackToGeneralForUnknownOrNull() {
        assertThat(Intent.fromKey("unknown")).isEqualTo(Intent.GENERAL);
        assertThat(Intent.fromKey(null)).isEqualTo(Intent.GENERAL);
        assertThat(Intent.fromKey("")).isEqualTo(Intent.GENERAL);
    }
}
