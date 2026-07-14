# Sosyal Giriş Kurulumu (Google & Apple)

Kod tarafı hazır. Butonların **çalışması** için aşağıdaki credential'ları oluşturup
`.env` / `application-local.yml` içine koyman gerekiyor. Credential yokken:
- **Google butonu gizli** kalır (client id boşsa görünmez),
- **Apple butonu** yalnızca iOS + dev build'de görünür,
- **e-posta/şifre** girişi her durumda çalışır.

> ⚠️ Backend'i **yeniden başlat** — yeni uçlar (`/auth/google`, `/auth/apple`) ve
> `V2` şema göçü (Flyway otomatik) ancak restart'ta yüklenir.

---

## 1) Google ile Giriş

### a) Google Cloud Console
1. <https://console.cloud.google.com> → yeni proje (ör. "Falcim").
2. **APIs & Services → OAuth consent screen** → External → uygulama adı, destek e-postası,
   `email` + `profile` scope'ları → kaydet.
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID** ile **3 ayrı** client oluştur:
   - **Web application** → *Web client ID* (Expo Go ve id_token audience için)
   - **Android** → paket adı `com.falcim.app` + **SHA-1** parmak izi
     (dev için debug keystore SHA-1; prod için EAS/imzalama SHA-1)
   - **iOS** → bundle id `com.falcim.app`

### b) Frontend `.env`
```
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=xxxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=xxxx.apps.googleusercontent.com
```

### c) Backend `application-local.yml`
Backend, istemcinin sunabileceği **tüm** client id'leri `aud` olarak kabul etmeli:
```yaml
falcim:
  oauth:
    google:
      client-ids:
        - xxxx-web.apps.googleusercontent.com
        - xxxx-ios.apps.googleusercontent.com
        - xxxx-android.apps.googleusercontent.com
```
(Env ile: `GOOGLE_CLIENT_IDS=web,ios,android`)

> Expo Go'da Google, **Web client id** + Expo proxy redirect ile çalışır (test edilebilir).
> Standalone/dev build'de iOS/Android client id'leri kullanılır.

---

## 2) Apple ile Giriş (yalnızca iOS)

**Ön koşullar:** ücretli **Apple Developer** hesabı + **dev build** (Expo Go'da çalışmaz).

1. Apple Developer → **Certificates, IDs & Profiles → Identifiers** → App ID `com.falcim.app`
   → **Sign In with Apple** özelliğini etkinleştir.
2. Uygulamada zaten hazır: `app.json` → `ios.usesAppleSignIn: true` + `expo-apple-authentication` plugin.
3. Backend `application-local.yml` → audience = bundle id (varsayılan hazır):
   ```yaml
   falcim:
     oauth:
       apple:
         client-ids:
           - com.falcim.app
   ```
4. **Dev build ile test et:**
   ```
   npx expo run:ios        # yerel Xcode build
   # veya EAS: eas build --profile development --platform ios
   ```
   Gerçek iOS cihaz veya simülatörde Apple butonu görünür.

> Apple e-postayı **yalnızca ilk girişte** verir; backend bunu hesaba kaydeder,
> sonraki girişlerde `sub` ile eşleştirir.

---

## 3) Nasıl Çalışıyor (özet)

```
Mobil (Google/Apple SDK) ──id_token──▶ Backend /auth/google|apple
                                         │ JWKS ile imza + aud + iss + exp doğrula
                                         │ hesabı bul (sub) / e-posta ile bağla / oluştur
                                         ▼
                                   Falcım JWT (access + refresh) ──▶ Mobil
```

- Token doğrulama: `backend/.../auth/social/OidcTokenVerifier.java` (Nimbus JWKS)
- Uçlar: `POST /api/v1/auth/google`, `POST /api/v1/auth/apple` (public)
- Hesap bağlama: aynı e-posta varsa mevcut hesaba bağlanır; yoksa yeni sosyal hesap açılır.
