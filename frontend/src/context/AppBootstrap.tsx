import React, { useEffect, useRef, useState } from 'react';
import { Alert, Linking } from 'react-native';
import { AppConfig } from '../types';
import { getAppConfig } from '../services/appConfigService';
import SplashView from '../screens/SplashView';
import UpdateRequiredScreen from '../screens/UpdateRequiredScreen';

type BootState = 'checking' | 'ready' | 'forceUpdate';

const MIN_SPLASH_MS = 900; // splash'in bir anda kaybolup titremesini önler

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Açılış akışını yönetir:
 *  1. Markalı splash gösterilir
 *  2. Backend'den sürüm/güncelleme durumu çekilir
 *  3. Zorunlu güncelleme varsa uygulama bloklanır; yoksa çocuklar render edilir
 * Backend'e ulaşılamazsa fail-open: uygulama açılmaya devam eder.
 */
export function AppBootstrap({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BootState>('checking');
  const [config, setConfig] = useState<AppConfig | null>(null);
  const softNoticeShown = useRef(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [result] = await Promise.all([
        getAppConfig().catch(() => null), // ağ hatası → fail-open
        delay(MIN_SPLASH_MS),
      ]);
      if (cancelled) return;

      if (result?.updateRequired) {
        setConfig(result);
        setState('forceUpdate');
        return;
      }

      // Opsiyonel (yumuşak) güncelleme: bir kez, bloklamayan bilgi
      if (result?.updateAvailable && !softNoticeShown.current) {
        softNoticeShown.current = true;
        Alert.alert(
          'Yeni Sürüm Var',
          result.message ?? 'Falcım’ın yeni bir sürümü mevcut.',
          [
            { text: 'Daha Sonra', style: 'cancel' },
            {
              text: 'Güncelle',
              onPress: () => {
                if (result.storeUrl) void Linking.openURL(result.storeUrl);
              },
            },
          ]
        );
      }

      setState('ready');
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (state === 'checking') {
    return <SplashView />;
  }
  if (state === 'forceUpdate' && config) {
    return <UpdateRequiredScreen config={config} />;
  }
  return <>{children}</>;
}
