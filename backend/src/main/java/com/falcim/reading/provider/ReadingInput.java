package com.falcim.reading.provider;

import com.falcim.reading.Intent;

/**
 * Bir sağlayıcıya verilen girdi. Kategoriye göre görsel VE/VEYA metin kullanılabilir:
 * kahve falı görsel kullanır; tarot/burç ileride metin (doğum tarihi, seçilen kartlar) kullanabilir.
 *
 * @param intent    kullanıcının fal odağı
 * @param imageBytes görsel (kahve için zorunlu, diğerleri için null olabilir)
 * @param mediaType görsel MIME tipi (ör. image/jpeg)
 * @param textInput serbest metin girdisi (tarot/burç için; kahvede null)
 */
public record ReadingInput(
        Intent intent,
        byte[] imageBytes,
        String mediaType,
        String textInput
) {
    public static ReadingInput ofImage(Intent intent, byte[] imageBytes, String mediaType) {
        return new ReadingInput(intent, imageBytes, mediaType, null);
    }
}
