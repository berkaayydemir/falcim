import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  Pressable,
  Share,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';
import { Colors, FontFamily, Radius, Spacing, Ornament } from '../theme';
import { RootStackParamList, INTENT_LABEL, FortuneSymbol, FortuneReading } from '../types';
import FortuneCard from '../components/FortuneCard';
import GoldButton from '../components/GoldButton';
import SectionLabel from '../components/SectionLabel';
import {
  getCoffeeReading,
  FALLBACK_FORTUNE,
  FortuneResult,
} from '../services/readingService';
import { useFortuneStore } from '../hooks/useFortuneStore';

type Nav = StackNavigationProp<RootStackParamList, 'Result'>;
type Route = RouteProp<RootStackParamList, 'Result'>;

const APP_LINK = 'https://falcim.app';

export default function ResultScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { imageUri, intent, fortune: presetFortune } = route.params;
  const { addReading } = useFortuneStore();

  const [loading, setLoading] = useState<boolean>(!presetFortune);
  const [result, setResult] = useState<FortuneResult>(
    presetFortune
      ? {
          fortune: presetFortune,
          symbols: FALLBACK_FORTUNE.symbols,
          energyPct: FALLBACK_FORTUNE.energyPct,
        }
      : FALLBACK_FORTUNE
  );
  const [saved, setSaved] = useState<boolean>(false);
  const savedOnce = useRef<boolean>(false);

  const persist = useCallback(
    async (data: FortuneResult) => {
      if (savedOnce.current || !imageUri) return;
      savedOnce.current = true;
      const reading: FortuneReading = {
        id: `${Date.now()}`,
        imageUri,
        intent,
        fortune: data.fortune,
        symbols: data.symbols,
        energyPct: data.energyPct,
        createdAt: new Date().toISOString(),
      };
      await addReading(reading);
    },
    [imageUri, intent, addReading]
  );

  useEffect(() => {
    // Geçmişten açıldıysa yeniden API çağırma
    if (presetFortune || !imageUri) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const dto = await getCoffeeReading(imageUri, intent);
        if (cancelled) return;
        const data: FortuneResult = {
          fortune: dto.fortune,
          symbols: dto.symbols,
          energyPct: dto.energyPct,
        };
        setResult(data);
        await persist(data);
      } catch {
        if (cancelled) return;
        setResult(FALLBACK_FORTUNE);
        await persist(FALLBACK_FORTUNE);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [imageUri, intent, presetFortune, persist]);

  const onShare = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Share.share({
      message: `${Ornament} Falcım'dan bugünkü falım:\n\n"${result.fortune}"\n\nSen de fincanına baktır → ${APP_LINK}`,
    });
  }, [result.fortune]);

  const onSave = useCallback(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaved(true);
  }, []);

  const date = new Date().toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top nav */}
      <View style={styles.topNav}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={styles.navIcon}>‹</Text>
        </Pressable>
        <Text style={styles.navTitle}>Fal Sonucun</Text>
        <Pressable onPress={onShare} hitSlop={8}>
          <Text style={styles.navIcon}>↑</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Fincan fotoğrafı */}
        <View style={styles.photoCard}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.photo} />
          ) : (
            <View style={[styles.photo, styles.photoEmpty]}>
              <Text style={styles.photoEmptyIcon}>☕</Text>
            </View>
          )}
          <View style={styles.badgeTop}>
            <PulseDot />
            <Text style={styles.badgeTopText}>Falcım AI · Analiz Edildi</Text>
          </View>
          <View style={styles.badgeBottom}>
            <Text style={styles.badgeBottomText}>☕ Kahve Falı</Text>
          </View>
        </View>

        {/* Intent + tarih */}
        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Text style={styles.metaChipText}>{INTENT_LABEL[intent]}</Text>
          </View>
          <Text style={styles.metaDate}>{date}</Text>
        </View>

        {/* Fal yorumu */}
        <FortuneCard text={result.fortune} loading={loading} />

        {/* Semboller */}
        <SectionLabel style={styles.blockLabel}>
          Fincandaki Semboller
        </SectionLabel>
        <View style={styles.symbolRow}>
          {result.symbols.map((s) => (
            <SymbolCard key={s.name} symbol={s} />
          ))}
        </View>

        {/* Genel enerji */}
        <SectionLabel style={styles.blockLabel}>Genel Enerji</SectionLabel>
        <View style={styles.energyBlock}>
          <View style={styles.energyTrack}>
            <View style={[styles.energyFill, { width: `${result.energyPct}%` }]} />
          </View>
          <Text style={styles.energyValue}>
            Olumlu · %{result.energyPct}
          </Text>
        </View>

        {/* Aksiyonlar */}
        <View style={styles.actionRow}>
          <GoldButton
            label={`${Ornament} Falını Paylaş`}
            onPress={onShare}
            style={styles.shareBtn}
          />
          <Pressable
            style={[styles.saveBtn, saved && styles.saveBtnActive]}
            onPress={onSave}
          >
            <Text style={styles.saveIcon}>{saved ? '🔖' : '🔖'}</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.ghostBtn}
          onPress={() => navigation.navigate('Tabs')}
        >
          <Text style={styles.ghostText}>☕ Yeni Fal Bak</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function SymbolCard({ symbol }: { symbol: FortuneSymbol }) {
  return (
    <View style={styles.symbolCard}>
      <Text style={styles.symbolIcon}>{symbol.icon}</Text>
      <Text style={styles.symbolName}>{symbol.name}</Text>
      <Text style={styles.symbolMeaning}>{symbol.meaning}</Text>
    </View>
  );
}

function PulseDot() {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] });
  return <Animated.View style={[styles.pulseDot, { opacity }]} />;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  navIcon: {
    fontSize: 26,
    color: Colors.gold,
    width: 32,
    textAlign: 'center',
  },
  navTitle: {
    fontFamily: FontFamily.serif,
    fontSize: 18,
    color: Colors.cream,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  photoCard: {
    height: 200,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    backgroundColor: Colors.card,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEmptyIcon: {
    fontSize: 48,
  },
  badgeTop: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13,10,8,0.72)',
    borderRadius: Radius.full,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
  },
  badgeTopText: {
    fontFamily: FontFamily.sansMed,
    fontSize: 10,
    color: Colors.cream,
    marginLeft: Spacing.xs,
  },
  badgeBottom: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(13,10,8,0.72)',
    borderRadius: Radius.full,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
  },
  badgeBottomText: {
    fontFamily: FontFamily.sansMed,
    fontSize: 10,
    color: Colors.gold,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.gold,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  metaChip: {
    backgroundColor: Colors.goldGlow,
    borderColor: Colors.gold,
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingVertical: 4,
    paddingHorizontal: Spacing.md,
  },
  metaChipText: {
    fontFamily: FontFamily.sansMed,
    fontSize: 12,
    color: Colors.cream,
  },
  metaDate: {
    fontFamily: FontFamily.sans,
    fontSize: 12,
    color: Colors.mist,
  },
  blockLabel: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  symbolRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  symbolCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginHorizontal: Spacing.xs,
  },
  symbolIcon: {
    fontSize: 26,
    marginBottom: Spacing.xs,
  },
  symbolName: {
    fontFamily: FontFamily.sansSemi,
    fontSize: 13,
    color: Colors.cream,
    marginBottom: 2,
  },
  symbolMeaning: {
    fontFamily: FontFamily.sans,
    fontSize: 11,
    color: Colors.mist,
    textAlign: 'center',
  },
  energyBlock: {
    marginBottom: Spacing.xl,
  },
  energyTrack: {
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.card,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  energyFill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Colors.gold,
  },
  energyValue: {
    fontFamily: FontFamily.sansSemi,
    fontSize: 13,
    color: Colors.gold,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  shareBtn: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  saveBtn: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.goldDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnActive: {
    backgroundColor: Colors.goldGlow,
    borderColor: Colors.gold,
  },
  saveIcon: {
    fontSize: 20,
  },
  ghostBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  ghostText: {
    fontFamily: FontFamily.sansSemi,
    fontSize: 15,
    color: Colors.cream,
  },
});
