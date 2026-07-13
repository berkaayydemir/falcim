import * as SecureStore from 'expo-secure-store';

/**
 * Access ve refresh token'ları cihazın güvenli anahtar deposunda (Keychain/Keystore) saklar.
 * AsyncStorage'dan farklı olarak burası şifrelenmiş ve uygulamaya özeldir.
 */
const ACCESS_KEY = 'falcim.accessToken';
const REFRESH_KEY = 'falcim.refreshToken';

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

export async function saveTokens(tokens: StoredTokens): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_KEY, tokens.accessToken);
  await SecureStore.setItemAsync(REFRESH_KEY, tokens.refreshToken);
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_KEY);
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
}
