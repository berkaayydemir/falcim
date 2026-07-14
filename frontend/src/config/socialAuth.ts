import { Platform } from 'react-native';

/**
 * Google OAuth client id'leri (.env üzerinden).
 * Bu değerler Google Cloud Console'dan alınır ve backend'in kabul ettiği
 * client-ids listesiyle eşleşmelidir.
 *
 *   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
 *   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
 *   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID
 *
 * Boş bırakılırsa Google butonu gizlenir.
 */
export const GOOGLE_WEB_CLIENT_ID: string | undefined =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || undefined;

export const GOOGLE_IOS_CLIENT_ID: string | undefined =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || undefined;

export const GOOGLE_ANDROID_CLIENT_ID: string | undefined =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || undefined;

// Native build'de Google auth, platforma özel client id ZORUNLU ister.
// Butonu ancak o platformun client id'si tanımlıysa göster (yoksa hook hata verir).
export const GOOGLE_ENABLED: boolean =
  Platform.select({
    android: Boolean(GOOGLE_ANDROID_CLIENT_ID),
    ios: Boolean(GOOGLE_IOS_CLIENT_ID),
    default: Boolean(GOOGLE_WEB_CLIENT_ID),
  }) ?? false;
