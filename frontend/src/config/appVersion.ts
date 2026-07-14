import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Uygulama sürümü app.json'daki "version" alanından okunur (şu an 1.0.0).
 * Backend'e bu değer gönderilir; force-update kararı orada verilir.
 */
export const APP_VERSION: string = Constants.expoConfig?.version ?? '1.0.0';

export const APP_PLATFORM: 'ios' | 'android' =
  Platform.OS === 'ios' ? 'ios' : 'android';
