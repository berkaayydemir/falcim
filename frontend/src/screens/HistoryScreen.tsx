import React, { useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  Pressable,
  ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Colors, FontFamily, Radius, Spacing, Ornament } from '../theme';
import { RootStackParamList, FortuneReading, INTENT_LABEL } from '../types';
import { useFortuneStore } from '../hooks/useFortuneStore';
import SectionLabel from '../components/SectionLabel';
import GoldButton from '../components/GoldButton';

type Nav = StackNavigationProp<RootStackParamList>;

export default function HistoryScreen() {
  const navigation = useNavigation<Nav>();
  const { readings, refresh } = useFortuneStore();

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  const openReading = useCallback(
    (r: FortuneReading) => {
      navigation.navigate('Result', {
        imageUri: r.imageUri,
        intent: r.intent,
        fortune: r.fortune,
      });
    },
    [navigation]
  );

  const renderItem = ({ item }: ListRenderItemInfo<FortuneReading>) => {
    const date = new Date(item.createdAt).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return (
      <Pressable style={styles.card} onPress={() => openReading(item)}>
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.thumbEmpty]}>
            <Text style={styles.thumbIcon}>☕</Text>
          </View>
        )}
        <View style={styles.body}>
          <View style={styles.cardHeader}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{INTENT_LABEL[item.intent]}</Text>
            </View>
            <Text style={styles.date}>{date}</Text>
          </View>
          <Text style={styles.preview} numberOfLines={2}>
            {item.fortune}
          </Text>
          <Text style={styles.mood}>
            {item.energyPct >= 60 ? '🌟 Olumlu' : '🌙 Sakin'} · %{item.energyPct}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <SectionLabel>Arşiv</SectionLabel>
        <Text style={styles.title}>Geçmiş Falların</Text>
      </View>

      {readings.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>☕</Text>
          <Text style={styles.emptyTitle}>Henüz fal baktırmadın</Text>
          <Text style={styles.emptyDesc}>
            İlk fincanını göster, Falcım senin için okusun.
          </Text>
          <GoldButton
            label={`${Ornament} Falıma Bak`}
            onPress={() => navigation.navigate('Tabs')}
            style={styles.emptyCta}
          />
        </View>
      ) : (
        <FlatList
          data={readings}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontFamily: FontFamily.serif,
    fontSize: 30,
    color: Colors.cream,
    marginTop: Spacing.xs,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: Radius.sm,
    marginRight: Spacing.md,
  },
  thumbEmpty: {
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbIcon: {
    fontSize: 26,
  },
  body: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  chip: {
    backgroundColor: Colors.goldGlow,
    borderColor: Colors.goldDim,
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
  },
  chipText: {
    fontFamily: FontFamily.sansMed,
    fontSize: 10,
    color: Colors.gold,
  },
  date: {
    fontFamily: FontFamily.sans,
    fontSize: 11,
    color: Colors.mist,
  },
  preview: {
    fontFamily: FontFamily.serifItalic,
    fontStyle: 'italic',
    fontSize: 13,
    color: Colors.cream,
    lineHeight: 19,
    marginBottom: Spacing.xs,
  },
  mood: {
    fontFamily: FontFamily.sansMed,
    fontSize: 11,
    color: Colors.mist,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontFamily: FontFamily.serif,
    fontSize: 22,
    color: Colors.cream,
    marginBottom: Spacing.sm,
  },
  emptyDesc: {
    fontFamily: FontFamily.sans,
    fontSize: 13,
    color: Colors.mist,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  emptyCta: {
    alignSelf: 'stretch',
  },
});
