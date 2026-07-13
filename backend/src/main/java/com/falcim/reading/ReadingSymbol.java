package com.falcim.reading;

/**
 * Fincandaki bir sembol (JSONB olarak saklanır ve frontend'e döner).
 */
public record ReadingSymbol(
        String icon,
        String name,
        String meaning
) {
}
