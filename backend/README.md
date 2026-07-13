# Falcım Backend

Spring Boot 3.3 · Java 21 · PostgreSQL · JWT auth · Claude (sunucu tarafı) entegrasyonu.

Frontend'in çağırdığı API'yi barındırır. **Claude API anahtarı yalnızca burada** (sunucuda)
tutulur; istemciye asla gömülmez.

---

## Gereksinimler

| Araç | Sürüm | Not |
|------|-------|-----|
| JDK | **21** | IntelliJ içinden indirilebilir (aşağıda) |
| PostgreSQL | **16** | Docker Desktop **veya** yerel kurulum |
| IntelliJ IDEA | 2023.2+ | Community veya Ultimate |

> Bu makinede şu an JDK, Docker ve Postgres kurulu **değil**. Aşağıdaki adımlar bunları da kapsar.

---

## IntelliJ ile Kurulum (adım adım)

### 1) Projeyi aç
`File → Open` → `falcim/backend/pom.xml` seç → **Open as Project**.
IntelliJ Maven'i içe aktarır ve bağımlılıkları indirir (ilk seferde birkaç dakika).

### 2) JDK 21 ayarla
`File → Project Structure → Project`:
- **SDK** boşsa → `Add SDK → Download JDK…` → sürüm **21** (ör. Eclipse Temurin 21) → indir.
- **Language level**: `21`.

### 3) PostgreSQL'i başlat
İki seçenekten biri:

**A. Docker Desktop (önerilir — compose hazır):**
1. Docker Desktop kur ve çalıştır.
2. Terminalde `backend/` içinde:
   ```bash
   docker compose up -d
   ```
   (Ya da IntelliJ Ultimate'te `Settings → Build → Docker` altında bir Docker bağlantısı
   tanımladıktan sonra **"Postgres (docker-compose)"** run config'ini çalıştır.)

**B. Yerel PostgreSQL kurulumu:**
PostgreSQL 16'yı kur, sonra veritabanı ve kullanıcıyı oluştur:
```sql
CREATE DATABASE falcim;
CREATE USER falcim WITH PASSWORD 'falcim_local_dev';
GRANT ALL PRIVILEGES ON DATABASE falcim TO falcim;
```

### 4) Yerel gizli değerleri gir
`src/main/resources/application-local.yml.example` dosyasını aynı klasöre
**`application-local.yml`** olarak kopyala ve doldur:
- `falcim.claude.api-key` → gerçek Anthropic anahtarın
- `falcim.jwt.secret` → en az 32 karakter güçlü bir gizli anahtar

> Bu dosya `.gitignore`'dadır; anahtarların repoya girmez.

### 5) Çalıştır
Sağ üstteki run config listesinde hazır gelen **"Falcim Backend (dev)"** seç → ▶ Run.
- Bu config `dev,local` profillerini aktive eder (Swagger açık + local gizli değerler yüklenir).
- Alternatif: **"Falcim Backend (maven)"** (Maven `spring-boot:run`).

Flyway ilk açılışta şemayı otomatik oluşturur.

### 6) Doğrula
- Sağlık: <http://localhost:8080/actuator/health> → `{"status":"UP"}`
- Swagger UI: <http://localhost:8080/swagger-ui.html>

---

## Hızlı API denemesi (curl)

```bash
# Kayıt
curl -s -X POST http://localhost:8080/api/v1/auth/register \
  -H "content-type: application/json" \
  -d '{"email":"test@falcim.app","password":"sifre1234","displayName":"Berkay"}'

# Dönen accessToken ile kahve falı (örnek görselle)
curl -s -X POST http://localhost:8080/api/v1/readings/coffee \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -F "image=@/path/to/fincan.jpg" \
  -F "intent=love"
```

---

## Profiller

| Profil | Ne yapar |
|--------|----------|
| `dev` | Swagger UI açık, geliştirme ayarları |
| `local` | `application-local.yml`'deki gizli değerleri yükler (git'e girmez) |
| `prod` | Swagger kapalı, ters proxy başlıklarına güvenir |

Ortam değişkenleriyle (CI/CD, prod) çalıştırmak için `.env.example`'daki anahtarları
sistem ortam değişkeni olarak verin; `application-local.yml` gerekmez.

---

## Mimari (özet)

- `auth`, `user` — JWT (access + rotating refresh), BCrypt, `/users/me`
- `reading` — çok kategorili okuma domaini; `ReadingProvider` **strateji deseni**
  (süper-app: kahve → tarot/burç/natal aynı yapıya eklenir). Şu an aktif: `CoffeeReadingProvider`.
- `ai` — `ClaudeClient` (WebClient), anahtar sunucuda
- `quota` — ücretsiz kullanıcıya günlük 3 fal (sunucuda zorlanır)
- `subscription` — premium iskeleti (ödeme sonraki adım)
