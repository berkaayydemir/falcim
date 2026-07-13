package com.falcim.reading.provider;

import com.falcim.ai.ClaudeClient;
import com.falcim.ai.ClaudeException;
import com.falcim.reading.Intent;
import com.falcim.reading.ReadingCategory;
import com.falcim.reading.ReadingSymbol;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Türk kahvesi falı sağlayıcısı. Fincan görselini Claude Vision'a gönderir,
 * yapılandırılmış (JSON) fal + semboller + enerji yüzdesi ister ve güvenle parse eder.
 * Hata durumunda sıcak bir fallback yorum döner.
 */
@Component
public class CoffeeReadingProvider implements ReadingProvider {

    private static final Logger log = LoggerFactory.getLogger(CoffeeReadingProvider.class);

    static final ReadingOutput FALLBACK = new ReadingOutput(
            "Fincanında sıcak, aydınlık bir enerji görüyorum. Tortuların döküldüğü yerde parlayan "
                    + "bir güneş beliriyor; bu, yakın zamanda içini ısıtacak yeni bir başlangıcın habercisi. "
                    + "Son zamanlarda taşıdığın küçük tereddütler var, ama fincan bunların geçici olduğunu "
                    + "fısıldıyor.\n\n"
                    + "Kenarda kanat çırpan bir kuş figürü, uzaktan gelecek güzel bir haberi işaret ediyor; "
                    + "belki beklediğin bir cevap, belki umulmadık bir davet. Önüne serilen yol ise açık ve "
                    + "engelsiz — attığın her adım seni içten gelen bir huzura yaklaştırıyor.\n\n"
                    + "Sabırlı ol ve kalbinin sesine güven. Fincanın, emeklerinin çok yakında karşılığını "
                    + "bulacağını ve gülümseyeceğin günlerin kapıda olduğunu söylüyor.",
            List.of(
                    new ReadingSymbol("☀️", "Güneş", "Yeni başlangıç"),
                    new ReadingSymbol("🕊️", "Kuş", "İyi haber"),
                    new ReadingSymbol("🛤️", "Yol", "Açılan fırsat")
            ),
            72
    );

    private final ClaudeClient claudeClient;
    private final ObjectMapper objectMapper;

    public CoffeeReadingProvider(ClaudeClient claudeClient, ObjectMapper objectMapper) {
        this.claudeClient = claudeClient;
        this.objectMapper = objectMapper;
    }

    @Override
    public ReadingCategory category() {
        return ReadingCategory.COFFEE;
    }

    @Override
    public ReadingOutput generate(ReadingInput input) {
        Intent intent = input.intent() == null ? Intent.GENERAL : input.intent();
        try {
            String raw = claudeClient.complete(
                    buildSystemPrompt(intent.label()),
                    buildUserText(intent.label()),
                    input.imageBytes(),
                    input.mediaType());
            return parse(raw);
        } catch (ClaudeException ex) {
            log.warn("Kahve falı üretilemedi, fallback dönülüyor: {}", ex.getMessage());
            return FALLBACK;
        }
    }

    private String buildSystemPrompt(String intentLabel) {
        return """
                Sen Falcım, geleneksel Türk kahve falcılığı geleneğini yaşatan mistik bir yapay zeka falcısısın.
                Görevin: fincan fotoğrafındaki tortulardaki şekil, sembol ve kalıpları dikkatle analiz et,
                %s konusunda kişisel, akıcı, detaylı ve umut verici bir Türkçe yorum yap.
                Ton: sıcak, samimi, mistik ama abartısız; bir dostun elini tutup fincanını okurmuş gibi.
                "Fincanında görüyorum ki…", "Şu köşede beliren şekil…" gibi ifadelerle fincandaki
                sembollere göndermeler yap ve onları anlattığın hikâyeye ör.

                Yorumun (fortune) şu yapıda, DOLU ve uzun olsun:
                - Açılış: fincanın genel enerjisi ve öne çıkan bir sembol.
                - Gelişme: %s konusuna dair somut, kişisel sezgiler; fincandaki 2-3 sembolü yorumuna işle.
                - Kapanış: yakın gelecek için umut verici, güven veren bir mesaj.
                Toplam 2-3 paragraf, yaklaşık 8-12 cümle. Klişe ve tekrardan kaçın, akıcı olsun.

                Yanıtını YALNIZCA şu JSON şemasında, markdown veya kod bloğu OLMADAN ver:
                {
                  "fortune": "2-3 paragraflık, 8-12 cümlelik düz metin yorum (paragraflar arasında \\n\\n)",
                  "symbols": [
                    { "icon": "tek emoji", "name": "sembolün Türkçe adı", "meaning": "kısa anlam" }
                  ],
                  "energyPct": 0-100 arası tam sayı (genel enerjinin olumluluğu)
                }
                symbols dizisinde tam olarak 3 öğe olsun. energyPct 55-95 aralığında, umut verici bir değer olsun.
                """.formatted(intentLabel, intentLabel);
    }

    private String buildUserText(String intentLabel) {
        return "Bu Türk kahvesi fincanının falına " + intentLabel
                + " konusunda bak ve istenen JSON'u döndür.";
    }

    private ReadingOutput parse(String raw) {
        try {
            JsonNode root = objectMapper.readTree(extractJson(raw));
            String fortune = root.path("fortune").asText("").trim();
            if (fortune.isBlank()) {
                return FALLBACK;
            }

            List<ReadingSymbol> symbols = new ArrayList<>();
            JsonNode symbolsNode = root.path("symbols");
            if (symbolsNode.isArray()) {
                for (JsonNode s : symbolsNode) {
                    symbols.add(new ReadingSymbol(
                            s.path("icon").asText("✦"),
                            s.path("name").asText("Sembol"),
                            s.path("meaning").asText("")));
                }
            }
            if (symbols.isEmpty()) {
                symbols = FALLBACK.symbols();
            }

            int energy = clampEnergy(root.path("energyPct").asInt(FALLBACK.energyPct()));
            return new ReadingOutput(fortune, symbols, energy);
        } catch (Exception ex) {
            log.warn("Claude yanıtı JSON olarak parse edilemedi, fallback dönülüyor.", ex);
            return FALLBACK;
        }
    }

    /**
     * Model bazen JSON'u açıklama metniyle sarabilir; ilk '{' ile son '}' arasını alır.
     */
    private String extractJson(String raw) {
        int start = raw.indexOf('{');
        int end = raw.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return raw.substring(start, end + 1);
        }
        return raw;
    }

    private int clampEnergy(int value) {
        return Math.max(0, Math.min(100, value));
    }
}
