-- Sosyal giriş (Google/Apple) desteği

-- Sosyal kullanıcıların şifresi yoktur → password_hash artık nullable
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Sağlayıcı ve sağlayıcıdaki benzersiz kullanıcı kimliği (JWT 'sub')
ALTER TABLE users ADD COLUMN provider     VARCHAR(20)  NOT NULL DEFAULT 'LOCAL';
ALTER TABLE users ADD COLUMN provider_id  VARCHAR(255);

-- Aynı sağlayıcıda aynı kullanıcının tekrar oluşmasını engelle
CREATE UNIQUE INDEX idx_users_provider ON users (provider, provider_id)
    WHERE provider_id IS NOT NULL;
