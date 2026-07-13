package com.falcim.reading.provider;

import com.falcim.reading.ReadingSymbol;

import java.util.List;

/**
 * Bir sağlayıcının ürettiği okuma sonucu.
 */
public record ReadingOutput(
        String fortune,
        List<ReadingSymbol> symbols,
        int energyPct
) {
}
