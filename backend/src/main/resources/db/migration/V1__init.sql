-- Falcım — başlangıç şeması

CREATE TABLE users (
    id            UUID        PRIMARY KEY,
    email         VARCHAR(320) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    display_name  VARCHAR(80)  NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'USER',
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL,
    updated_at    TIMESTAMPTZ  NOT NULL
);

CREATE INDEX idx_users_email ON users (email);

-- Rotasyonlu refresh token'lar; ham token değil, hash'i saklanır
CREATE TABLE refresh_tokens (
    id          UUID        PRIMARY KEY,
    user_id     UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token_hash  VARCHAR(100) NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens (user_id);

-- Okumalar (kahve falı + gelecekte tarot/burç/natal) — çok kategorili
CREATE TABLE readings (
    id           UUID        PRIMARY KEY,
    user_id      UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    category     VARCHAR(30) NOT NULL,
    intent       VARCHAR(30),
    result_text  TEXT        NOT NULL,
    symbols      JSONB       NOT NULL DEFAULT '[]'::jsonb,
    energy_pct   INTEGER     NOT NULL DEFAULT 0,
    image_ref    VARCHAR(255),
    created_at   TIMESTAMPTZ NOT NULL,
    updated_at   TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_readings_user_created ON readings (user_id, created_at DESC);

-- Abonelik iskeleti (ödeme entegrasyonu sonraki adım)
CREATE TABLE subscriptions (
    id                   UUID        PRIMARY KEY,
    user_id              UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    plan                 VARCHAR(20) NOT NULL DEFAULT 'FREE',
    status               VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    current_period_end   TIMESTAMPTZ,
    created_at           TIMESTAMPTZ NOT NULL,
    updated_at           TIMESTAMPTZ NOT NULL
);

CREATE UNIQUE INDEX idx_subscriptions_user ON subscriptions (user_id);
