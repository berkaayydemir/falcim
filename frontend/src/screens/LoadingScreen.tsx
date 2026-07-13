import React, { useEffect, useRef, useState, useCallback } from 'react';
import { StyleSheet, Text, View, Pressable, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Colors, FontFamily, Radius, Spacing } from '../theme';
import { RootStackParamList } from '../types';
import OrbitalLoader from '../components/OrbitalLoader';

type Nav = StackNavigationProp<RootStackParamList, 'Loading'>;
type Route = RouteProp<RootStackParamList, 'Loading'>;

type StepState = 'done' | 'active' | 'waiting';

interface Step {
  icon: string;
  label: string;
}

const STEPS: Step[] = [
  { icon: '🖼️', label: 'Görüntü Yüklendi' },
  { icon: '🔍', label: 'Şekiller Tespit Ediliyor' },
  { icon: '🔮', label: 'Yorum Hazırlanıyor' },
];

// [zaman(ms), ilerleme(%)]
const PROGRESS_KEYS: Array<[number, number]> = [
  [0, 10],
  [1200, 35],
  [2800, 62],
  [4500, 85],
  [6000, 100],
];

const NAV_DELAY = 6800;

export default function LoadingScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { imageUri, intent } = route.params;

  const [activeStep, setActiveStep] = useState<number>(0);
  const [pct, setPct] = useState<number>(10);
  const progress = useRef(new Animated.Value(10)).current;

  const animateTo = useCallback(
    (value: number) => {
      setPct(value);
      Animated.timing(progress, {
        toValue: value,
        duration: 400,
        useNativeDriver: false,
      }).start();
    },
    [progress]
  );

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Adım geçişleri
    timers.push(setTimeout(() => setActiveStep(1), 1200));
    timers.push(setTimeout(() => setActiveStep(2), 4500));

    // Progress anahtarları
    PROGRESS_KEYS.forEach(([time, value]) => {
      timers.push(setTimeout(() => animateTo(value), time));
    });

    // Otomatik geçiş — geri dönülemez
    timers.push(
      setTimeout(() => {
        navigation.replace('Result', { imageUri, intent });
      }, NAV_DELAY)
    );

    return () => timers.forEach(clearTimeout);
  }, [navigation, animateTo, imageUri, intent]);

  const stepState = (index: number): StepState => {
    if (index < activeStep) return 'done';
    if (index === activeStep) return 'active';
    return 'waiting';
  };

  const barWidth = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.loaderWrap}>
          <OrbitalLoader size={220} />
        </View>

        <Text style={styles.heading}>Fincanın okunuyor…</Text>

        {/* Adımlar */}
        <View style={styles.steps}>
          {STEPS.map((step, i) => (
            <StepRow key={step.label} step={step} state={stepState(i)} />
          ))}
        </View>

        {/* Progress */}
        <View style={styles.progressBlock}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Analiz sürüyor</Text>
            <Text style={styles.progressPct}>%{pct}</Text>
          </View>
          <View style={styles.track}>
            <Animated.View style={[styles.fill, { width: barWidth }]} />
          </View>
        </View>

        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={styles.cancel}>İptal et</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function StepRow({ step, state }: { step: Step; state: StepState }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (state !== 'active') return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [state, pulse]);

  const dotScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] });
  const dotOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.4] });

  return (
    <View
      style={[
        styles.stepRow,
        state === 'active' && styles.stepActive,
        state === 'waiting' && styles.stepWaiting,
      ]}
    >
      <Text style={styles.stepIcon}>{step.icon}</Text>
      <Text
        style={[styles.stepLabel, state === 'done' && styles.stepLabelDone]}
      >
        {step.label}
      </Text>
      {state === 'done' && <Text style={styles.check}>✓</Text>}
      {state === 'active' && (
        <View style={styles.activeRight}>
          <Animated.View
            style={[
              styles.pulseDot,
              { transform: [{ scale: dotScale }], opacity: dotOpacity },
            ]}
          />
          <Text style={styles.working}>Çalışıyor</Text>
        </View>
      )}
    </View>
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
  loaderWrap: {
    marginBottom: Spacing.xl,
  },
  heading: {
    fontFamily: FontFamily.serifItalic,
    fontStyle: 'italic',
    fontSize: 20,
    color: Colors.cream,
    marginBottom: Spacing.xl,
  },
  steps: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  stepActive: {
    borderColor: Colors.gold,
  },
  stepWaiting: {
    opacity: 0.35,
  },
  stepIcon: {
    fontSize: 16,
    marginRight: Spacing.md,
  },
  stepLabel: {
    flex: 1,
    fontFamily: FontFamily.sansMed,
    fontSize: 14,
    color: Colors.cream,
  },
  stepLabelDone: {
    color: Colors.mist,
  },
  check: {
    color: Colors.gold,
    fontSize: 16,
    fontFamily: FontFamily.sansSemi,
  },
  activeRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gold,
    marginRight: Spacing.sm,
  },
  working: {
    fontFamily: FontFamily.sansMed,
    fontSize: 11,
    color: Colors.gold,
  },
  progressBlock: {
    width: '100%',
    marginBottom: Spacing.xxl,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  progressLabel: {
    fontFamily: FontFamily.sans,
    fontSize: 12,
    color: Colors.mist,
  },
  progressPct: {
    fontFamily: FontFamily.sansSemi,
    fontSize: 12,
    color: Colors.gold,
  },
  track: {
    height: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.card,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Colors.gold,
  },
  cancel: {
    fontFamily: FontFamily.sansMed,
    fontSize: 13,
    color: Colors.mist,
    textDecorationLine: 'underline',
  },
});
