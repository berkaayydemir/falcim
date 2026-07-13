export type Intent = 'general' | 'love' | 'career' | 'money' | 'health';

export interface FortuneSymbol {
  icon: string;
  name: string;
  meaning: string;
}

export interface FortuneReading {
  id: string;
  imageUri: string;
  intent: Intent;
  fortune: string;
  symbols: FortuneSymbol[];
  energyPct: number;
  createdAt: string; // ISO 8601
}

export interface IntentOption {
  key: Intent;
  icon: string;
  label: string;
}

export const INTENT_OPTIONS: IntentOption[] = [
  { key: 'general', icon: '💫', label: 'Genel' },
  { key: 'love', icon: '❤️', label: 'Aşk' },
  { key: 'career', icon: '💼', label: 'Kariyer' },
  { key: 'money', icon: '💰', label: 'Para' },
  { key: 'health', icon: '🌿', label: 'Sağlık' },
];

export const INTENT_LABEL: Record<Intent, string> = {
  general: 'Genel',
  love: 'Aşk',
  career: 'Kariyer',
  money: 'Para',
  health: 'Sağlık',
};

// Navigasyon parametreleri
export type RootStackParamList = {
  Tabs: undefined;
  Loading: { imageUri: string; intent: Intent };
  Result: { imageUri?: string; intent: Intent; fortune?: string };
};

export type TabParamList = {
  Home: undefined;
  History: undefined;
  Premium: undefined;
  Profile: undefined;
};

// Giriş yapılmamışken gösterilen auth akışı
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// ─── Backend DTO'ları ───

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: AuthUser;
}

export interface QuotaStatus {
  used: number;
  limit: number; // -1 = sınırsız (premium)
  remaining: number;
  premium: boolean;
}

// Backend /readings uçlarının döndürdüğü okuma kaydı
export interface ReadingDto {
  id: string;
  category: string;
  intent: string | null;
  fortune: string;
  symbols: FortuneSymbol[];
  energyPct: number;
  createdAt: string; // ISO 8601
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}
