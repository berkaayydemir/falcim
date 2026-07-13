package com.falcim.reading.dto;

import com.falcim.reading.Reading;
import com.falcim.reading.ReadingSymbol;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * İstemciye dönen okuma sonucu.
 */
public record ReadingDto(
        UUID id,
        String category,
        String intent,
        String fortune,
        List<ReadingSymbol> symbols,
        int energyPct,
        Instant createdAt
) {
    public static ReadingDto from(Reading reading) {
        return new ReadingDto(
                reading.getId(),
                reading.getCategory().name(),
                reading.getIntent() == null ? null : reading.getIntent().name().toLowerCase(),
                reading.getResultText(),
                reading.getSymbols(),
                reading.getEnergyPct(),
                reading.getCreatedAt()
        );
    }
}
