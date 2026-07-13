package com.falcim.reading.provider;

import com.falcim.reading.ReadingCategory;

/**
 * Bir okuma kategorisinin AI mantığını kapsayan strateji arayüzü.
 * Her kategori (kahve, tarot, burç, natal) bir Spring bean'i olarak bu arayüzü uygular;
 * {@code ReadingService} bunları kategoriye göre otomatik yönlendirir.
 */
public interface ReadingProvider {

    ReadingCategory category();

    /**
     * Girdiyi AI ile işleyip okuma sonucunu döner.
     * Uygulamalar hata durumunda güvenli bir fallback sonuç dönmelidir (exception fırlatmak yerine).
     */
    ReadingOutput generate(ReadingInput input);
}
