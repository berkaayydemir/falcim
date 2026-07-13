package com.falcim.reading.provider;

import com.falcim.ai.ClaudeClient;
import com.falcim.ai.ClaudeException;
import com.falcim.reading.Intent;
import com.falcim.reading.ReadingCategory;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CoffeeReadingProviderTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void parsesValidJsonResponse() {
        ClaudeClient client = mock(ClaudeClient.class);
        when(client.complete(anyString(), anyString(), any(), anyString())).thenReturn("""
                {
                  "fortune": "Fincanında güzel bir yolculuk görüyorum.",
                  "symbols": [
                    { "icon": "🌙", "name": "Ay", "meaning": "Sezgi" },
                    { "icon": "⭐", "name": "Yıldız", "meaning": "Umut" },
                    { "icon": "🕊️", "name": "Kuş", "meaning": "Haber" }
                  ],
                  "energyPct": 80
                }
                """);

        CoffeeReadingProvider provider = new CoffeeReadingProvider(client, objectMapper);
        ReadingOutput out = provider.generate(
                ReadingInput.ofImage(Intent.LOVE, new byte[]{1, 2, 3}, "image/jpeg"));

        assertThat(provider.category()).isEqualTo(ReadingCategory.COFFEE);
        assertThat(out.fortune()).contains("yolculuk");
        assertThat(out.symbols()).hasSize(3);
        assertThat(out.energyPct()).isEqualTo(80);
    }

    @Test
    void fallsBackWhenClaudeFails() {
        ClaudeClient client = mock(ClaudeClient.class);
        when(client.complete(anyString(), anyString(), any(), anyString()))
                .thenThrow(new ClaudeException("boom"));

        CoffeeReadingProvider provider = new CoffeeReadingProvider(client, objectMapper);
        ReadingOutput out = provider.generate(
                ReadingInput.ofImage(Intent.GENERAL, new byte[]{1}, "image/jpeg"));

        assertThat(out).isEqualTo(CoffeeReadingProvider.FALLBACK);
        assertThat(out.symbols()).hasSize(3);
    }

    @Test
    void fallsBackWhenJsonIsMalformed() {
        ClaudeClient client = mock(ClaudeClient.class);
        when(client.complete(anyString(), anyString(), any(), anyString()))
                .thenReturn("bu bir json değil");

        CoffeeReadingProvider provider = new CoffeeReadingProvider(client, objectMapper);
        ReadingOutput out = provider.generate(
                ReadingInput.ofImage(Intent.GENERAL, new byte[]{1}, "image/jpeg"));

        assertThat(out.fortune()).isEqualTo(CoffeeReadingProvider.FALLBACK.fortune());
    }
}
