# Falcım ✦

Türk kahvesi fincanının fotoğrafını çek, Claude Vision destekli yapay zeka falcısı **Falcım** senin için okusun.

React Native + Expo (SDK 51) · TypeScript (strict) · React Navigation

## Özellikler

- 📷 Kamera veya galeriden fincan fotoğrafı
- 🔮 Claude Vision ile kişiselleştirilmiş, mistik Türkçe fal yorumu
- 💫 Konu seçimi: Genel · Aşk · Kariyer · Para · Sağlık
- ✨ Orbital animasyonlu yükleme ekranı (Animated API, `useNativeDriver`)
- 📜 AsyncStorage ile fal geçmişi
- ✦ Premium ekranı (plan seçimi)

## Kurulum

```bash
cd falcim
npm install
cp .env.example .env   # ardından API anahtarını gir
npm start
```

`.env` içine Claude API anahtarını ekle:

```
EXPO_PUBLIC_CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
```

> Not: `EXPO_PUBLIC_` önekli değişkenler istemci paketine gömülür. Anahtar
> cihazda görünür olur; prodüksiyonda çağrıyı bir backend/proxy üzerinden
> yapman önerilir.

## Model

`src/services/claudeService.ts` içindeki `CLAUDE_MODEL` sabiti spec'te
belirtilen `claude-sonnet-4-6` değerini kullanır. Geçerli güncel bir model id
ile (ör. `claude-sonnet-5`) değiştirebilirsin.

## Klasör Yapısı

```
falcim/
├── App.tsx                      # Font yükleme + navigator
├── src/
│   ├── theme/index.ts           # Renk, font, spacing token'ları
│   ├── navigation/AppNavigator  # Stack + Bottom Tabs
│   ├── screens/                 # Home, Loading, Result, History, Premium, Profile
│   ├── components/              # GoldButton, SectionLabel, OrbitalLoader, FortuneCard
│   ├── services/claudeService   # Claude Vision API çağrısı
│   ├── hooks/useFortuneStore    # AsyncStorage fal geçmişi
│   └── types/index.ts           # Ortak tipler
```

## Komutlar

- `npm start` — Expo geliştirme sunucusu
- `npm run android` / `npm run ios` — platform hedefli başlatma
- `npm run typecheck` — TypeScript denetimi (`tsc --noEmit`)
