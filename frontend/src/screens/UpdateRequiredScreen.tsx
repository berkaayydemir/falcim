import React, { useCallback } from 'react';
import { StyleSheet, Text, View, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontFamily, Spacing, Ornament } from '../theme';
import GoldButton from '../components/GoldButton';
import { AppConfig } from '../types';

/**
 * Zorunlu güncelleme ekranı. Her şeyi bloklar; kullanıcı mağazaya yönlendirilir.
 */
export default function UpdateRequiredScreen({ config }: { config: AppConfig }) {
  const onUpdate = useCallback(() => {
    if (config.storeUrl) {
      void Linking.openURL(config.storeUrl);
    }
  }, [config.storeUrl]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.icon}>{Ornament}</Text>
        <Text style={styles.title}>Güncelleme Gerekli</Text>
        <Text style={styles.message}>
          {config.message ??
            'Bu sürüm artık desteklenmiyor. Devam etmek için lütfen Falcım’ı güncelle.'}
        </Text>

        <GoldButton
          label={`${Ornament} Şimdi Güncelle`}
          onPress={onUpdate}
          style={styles.cta}
        />

        <Text style={styles.version}>Yüklü sürüm: {config.currentVersion}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  icon: {
    fontSize: 44,
    color: Colors.gold,
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: FontFamily.serif,
    fontSize: 30,
    color: Colors.cream,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  message: {
    fontFamily: FontFamily.sans,
    fontSize: 15,
    color: Colors.mist,
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: Spacing.xxl,
  },
  cta: {
    alignSelf: 'stretch',
  },
  version: {
    fontFamily: FontFamily.sansMed,
    fontSize: 12,
    color: Colors.goldDim,
    marginTop: Spacing.xl,
  },
});
