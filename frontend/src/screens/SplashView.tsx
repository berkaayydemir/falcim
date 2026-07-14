import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import { Colors, FontFamily, Spacing, Ornament } from '../theme';
import { APP_VERSION } from '../config/appVersion';

/**
 * Açılışta gösterilen markalı splash. Sürüm kontrolü sürerken ekranda kalır.
 */
export default function SplashView() {
  const fade = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [fade, glow]);

  const ornamentOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 1],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.center, { opacity: fade }]}>
        <Animated.Text style={[styles.ornament, { opacity: ornamentOpacity }]}>
          {Ornament}
        </Animated.Text>
        <Text style={styles.title}>Falcım</Text>
        <Text style={styles.subtitle}>Fincanın sırlarını keşfet</Text>
      </Animated.View>

      <Text style={styles.version}>Sürüm {APP_VERSION}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
  },
  ornament: {
    fontSize: 34,
    color: Colors.gold,
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: FontFamily.serif,
    fontSize: 52,
    color: Colors.cream,
  },
  subtitle: {
    fontFamily: FontFamily.sansLight,
    fontSize: 14,
    color: Colors.mist,
    marginTop: Spacing.xs,
  },
  version: {
    position: 'absolute',
    bottom: Spacing.xxl,
    fontFamily: FontFamily.sansMed,
    fontSize: 12,
    color: Colors.goldDim,
    letterSpacing: 1,
  },
});
