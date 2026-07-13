import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Colors, FontFamily, Radius, Spacing, Ornament } from '../theme';
import {
  Intent,
  INTENT_OPTIONS,
  RootStackParamList,
  FortuneReading,
  QuotaStatus,
} from '../types';
import SectionLabel from '../components/SectionLabel';
import GoldButton from '../components/GoldButton';
import { useFortuneStore } from '../hooks/useFortuneStore';
import { getQuota } from '../services/readingService';

const { width } = Dimensions.get('window');

type Nav = StackNavigationProp<RootStackParamList>;

const DAILY_LIMIT = 3;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { readings } = useFortuneStore();
  const [intent, setIntent] = useState<Intent>('general');
  const [pickedUri, setPickedUri] = useState<string | null>(null);
  const [quota, setQuota] = useState<QuotaStatus | null>(null);

  // Ekran her odaklandığında güncel kotayı backend'den çek
  useFocusEffect(
    useCallback(() => {
      let active = true;
      getQuota()
        .then((q) => {
          if (active) setQuota(q);
        })
        .catch(() => {
          /* kota alınamazsa sessizce geç */
        });
      return () => {
        active = false;
      };
    }, [])
  );

  const premium = quota?.premium ?? false;
  const used = quota?.used ?? 0;
  const limit = quota && quota.limit >= 0 ? quota.limit : DAILY_LIMIT;

  const goLoading = useCallback(
    (imageUri: string) => {
      navigation.navigate('Loading', { imageUri, intent });
    },
    [navigation, intent]
  );

  const takePhoto = useCallback(async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('İzin gerekli', 'Fotoğraf çekmek için kamera izni vermelisin.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });
    const asset = result.canceled ? undefined : result.assets[0];
    if (asset) {
      setPickedUri(asset.uri);
      goLoading(asset.uri);
    }
  }, [goLoading]);

  const pickFromGallery = useCallback(async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('İzin gerekli', 'Galeriye erişim izni vermelisin.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });
    const asset = result.canceled ? undefined : result.assets[0];
    if (asset) {
      setPickedUri(asset.uri);
      goLoading(asset.uri);
    }
  }, [goLoading]);

  const onSeeFortune = useCallback(() => {
    if (pickedUri) {
      goLoading(pickedUri);
    } else {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Fincan gerekli', 'Önce bir fincan fotoğrafı çek veya seç.');
    }
  }, [pickedUri, goLoading]);

  const selectIntent = (key: Intent) => {
    void Haptics.selectionAsync();
    setIntent(key);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <SectionLabel style={styles.center}>Yapay Zeka Falı</SectionLabel>
          <Text style={styles.title}>Falcım</Text>
          <Text style={styles.subtitle}>Fincanın sırlarını keşfet</Text>
        </View>

        {/* Günlük kota */}
        <View style={styles.quotaCard}>
          <View style={styles.quotaLeft}>
            <Text style={styles.quotaText}>
              {premium
                ? 'Premium · Sınırsız fal'
                : `Bugünkü hakkın: ${used} / ${limit} kullanıldı`}
            </Text>
            {!premium && (
              <View style={styles.dots}>
                {Array.from({ length: limit }).map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, i < used && styles.dotFilled]}
                  />
                ))}
              </View>
            )}
          </View>
          {!premium && (
            <Pressable onPress={() => navigation.navigate('Tabs')} hitSlop={8}>
              <Text style={styles.unlimited}>{Ornament} Sınırsız Al</Text>
            </Pressable>
          )}
        </View>

        {/* Fincan yükleme zone */}
        <View style={styles.uploadZone}>
          {pickedUri ? (
            <Image source={{ uri: pickedUri }} style={styles.preview} />
          ) : (
            <>
              <Text style={styles.cupIcon}>☕</Text>
              <Text style={styles.uploadTitle}>Fincanını Göster</Text>
              <Text style={styles.uploadDesc}>
                Fincanını ters çevirip fotoğrafını çek, gerisini Falcım'a bırak.
              </Text>
            </>
          )}
          <Pressable style={styles.pill} onPress={takePhoto}>
            <Text style={styles.pillText}>📷 Fotoğraf Çek</Text>
          </Pressable>
          <Pressable onPress={pickFromGallery} hitSlop={8}>
            <Text style={styles.galleryLink}>Galeriden Yükle</Text>
          </Pressable>
        </View>

        {/* Intent seçimi */}
        <SectionLabel style={styles.blockLabel}>
          Ne hakkında merak ediyorsun?
        </SectionLabel>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {INTENT_OPTIONS.map((opt) => {
            const active = opt.key === intent;
            return (
              <Pressable
                key={opt.key}
                onPress={() => selectIntent(opt.key)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={styles.chipIcon}>{opt.icon}</Text>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* CTA */}
        <GoldButton
          label={`${Ornament} Falıma Bak`}
          onPress={onSeeFortune}
          style={styles.cta}
        />

        {/* Ornament divider */}
        <Text style={styles.divider}>· · {Ornament} · ·</Text>

        {/* Geçmiş */}
        <SectionLabel style={styles.blockLabel}>Geçmiş Falların</SectionLabel>
        {readings.length === 0 ? (
          <Text style={styles.emptyHistory}>
            Henüz fal baktırmadın. İlk fincanını göster {Ornament}
          </Text>
        ) : (
          readings.slice(0, 2).map((r) => (
            <HistoryPreview
              key={r.id}
              reading={r}
              onPress={() =>
                navigation.navigate('Result', {
                  imageUri: r.imageUri,
                  intent: r.intent,
                  fortune: r.fortune,
                })
              }
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function HistoryPreview({
  reading,
  onPress,
}: {
  reading: FortuneReading;
  onPress: () => void;
}) {
  const date = new Date(reading.createdAt).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
  });
  return (
    <Pressable style={styles.historyCard} onPress={onPress}>
      {reading.imageUri ? (
        <Image source={{ uri: reading.imageUri }} style={styles.historyThumb} />
      ) : (
        <View style={[styles.historyThumb, styles.historyThumbEmpty]}>
          <Text style={styles.cupIconSmall}>☕</Text>
        </View>
      )}
      <View style={styles.historyBody}>
        <Text style={styles.historyDate}>{date}</Text>
        <Text style={styles.historyPreview} numberOfLines={2}>
          {reading.fortune}
        </Text>
      </View>
      <Text style={styles.historyMood}>{reading.energyPct >= 60 ? '🌟' : '🌙'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  center: {
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  title: {
    fontFamily: FontFamily.serif,
    fontSize: 42,
    color: Colors.cream,
    marginTop: Spacing.sm,
  },
  subtitle: {
    fontFamily: FontFamily.sansLight,
    fontSize: 14,
    color: Colors.mist,
    marginTop: Spacing.xs,
  },
  quotaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  quotaLeft: {
    flex: 1,
  },
  quotaText: {
    fontFamily: FontFamily.sansMed,
    fontSize: 13,
    color: Colors.cream,
  },
  dots: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    marginRight: Spacing.xs,
  },
  dotFilled: {
    backgroundColor: Colors.gold,
  },
  unlimited: {
    fontFamily: FontFamily.sansSemi,
    fontSize: 12,
    color: Colors.gold,
    marginLeft: Spacing.sm,
  },
  uploadZone: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  cupIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  cupIconSmall: {
    fontSize: 22,
  },
  uploadTitle: {
    fontFamily: FontFamily.serif,
    fontSize: 22,
    color: Colors.cream,
    marginBottom: Spacing.xs,
  },
  uploadDesc: {
    fontFamily: FontFamily.sans,
    fontSize: 13,
    color: Colors.mist,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  preview: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: Radius.md,
    marginBottom: Spacing.lg,
  },
  pill: {
    backgroundColor: Colors.surface,
    borderColor: Colors.goldDim,
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  pillText: {
    fontFamily: FontFamily.sansSemi,
    fontSize: 14,
    color: Colors.gold,
  },
  galleryLink: {
    fontFamily: FontFamily.sansMed,
    fontSize: 13,
    color: Colors.mist,
    textDecorationLine: 'underline',
  },
  blockLabel: {
    marginBottom: Spacing.md,
  },
  chipRow: {
    paddingRight: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginRight: Spacing.sm,
  },
  chipActive: {
    borderColor: Colors.gold,
    backgroundColor: Colors.goldGlow,
  },
  chipIcon: {
    fontSize: 14,
    marginRight: Spacing.xs,
  },
  chipText: {
    fontFamily: FontFamily.sansMed,
    fontSize: 13,
    color: Colors.mist,
  },
  chipTextActive: {
    color: Colors.cream,
  },
  cta: {
    marginBottom: Spacing.xl,
  },
  divider: {
    textAlign: 'center',
    color: Colors.goldDim,
    fontSize: 16,
    letterSpacing: 4,
    marginBottom: Spacing.xl,
  },
  emptyHistory: {
    fontFamily: FontFamily.sans,
    fontSize: 13,
    color: Colors.mist,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  historyThumb: {
    width: 52,
    height: 52,
    borderRadius: Radius.sm,
    marginRight: Spacing.md,
  },
  historyThumbEmpty: {
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyBody: {
    flex: 1,
  },
  historyDate: {
    fontFamily: FontFamily.sansSemi,
    fontSize: 11,
    color: Colors.gold,
    marginBottom: 2,
  },
  historyPreview: {
    fontFamily: FontFamily.sans,
    fontSize: 12,
    color: Colors.mist,
    lineHeight: 17,
  },
  historyMood: {
    fontSize: 20,
    marginLeft: Spacing.sm,
  },
});
