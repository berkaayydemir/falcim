package com.falcim.appinfo;

/**
 * "major.minor.patch" biçimindeki sürümleri karşılaştırmak için küçük yardımcı.
 * Bozuk/eksik girdilerde güvenli davranır (0 kabul eder).
 */
public final class SemanticVersion {

    private SemanticVersion() {
    }

    /**
     * @return a < b ise negatif, a == b ise 0, a > b ise pozitif
     */
    public static int compare(String a, String b) {
        int[] va = parse(a);
        int[] vb = parse(b);
        for (int i = 0; i < 3; i++) {
            if (va[i] != vb[i]) {
                return Integer.compare(va[i], vb[i]);
            }
        }
        return 0;
    }

    private static int[] parse(String version) {
        int[] parts = {0, 0, 0};
        if (version == null || version.isBlank()) {
            return parts;
        }
        // "1.2.3-beta" gibi ekleri at
        String core = version.trim().split("[-+]", 2)[0];
        String[] tokens = core.split("\\.");
        for (int i = 0; i < 3 && i < tokens.length; i++) {
            parts[i] = safeInt(tokens[i]);
        }
        return parts;
    }

    private static int safeInt(String token) {
        try {
            return Integer.parseInt(token.trim());
        } catch (NumberFormatException ex) {
            return 0;
        }
    }
}
