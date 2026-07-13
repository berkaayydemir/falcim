import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Colors, FontFamily, Radius, Spacing, Ornament } from '../theme';
import SectionLabel from '../components/SectionLabel';
import GoldButton from '../components/GoldButton';

type Plan = 'monthly' | 'yearly';

interface PlanInfo {
  key: Plan;
  title: string;
  price: string;
  note?: string;
  popular?: boolean;
}

const PLANS: PlanInfo[] = [
  { key: 'monthly', title: 'Aylık', price: '99₺ / ay' },
  {
    key: 'yearly',
    title: 'Yıllık',
    price: '69₺ / ay',
    note: '%30 tasarruf',
    popular: true,
  },
];

const FEATURES: string[] = [
  'Sınırsız fal baktırma hakkı',
  'Daha derin ve detaylı yorumlar',
  'Fal geçmişine sınırsız erişim',
  'Reklamsız, öncelikli okuma',
];

export default function PremiumScreen() {
  const navigation = useNavigation();
  const [plan, setPlan] = useState<Plan>('yearly');

  const selectPlan = (key: Plan) => {
    void Haptics.selectionAsync();
    setPlan(key);
  };

  const startPlan = () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top nav */}
      <View style={styles.topNav}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={styles.navIcon}>‹</Text>
        </Pressable>
        <Text style={styles.navTitle}>Premium</Text>
        <View style={styles.navSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroIcon}>{Ornament}</Text>
          <SectionLabel style={styles.center}>Sınırsız Keşif</SectionLabel>
          <Text style={styles.heroTitle}>Falcım Premium</Text>
          <Text style={styles.heroDesc}>
            Fincanının tüm sırlarını sınırsız keşfet. Daha derin yorumlar,
            reklamsız deneyim.
          </Text>
        </View>

        {/* Planlar */}
        {PLANS.map((p) => {
          const active = p.key === plan;
          return (
            <Pressable
              key={p.key}
              onPress={() => selectPlan(p.key)}
              style={[styles.planCard, active && styles.planCardActive]}
            >
              {p.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>En Popüler</Text>
                </View>
              )}
              <View style={styles.planLeft}>
                <View style={[styles.radio, active && styles.radioActive]}>
                  {active && <View style={styles.radioDot} />}
                </View>
                <View>
                  <Text style={styles.planTitle}>{p.title}</Text>
                  {p.note && <Text style={styles.planNote}>{p.note}</Text>}
                </View>
              </View>
              <Text style={styles.planPrice}>{p.price}</Text>
            </Pressable>
          );
        })}

        {/* Özellikler */}
        <SectionLabel style={styles.blockLabel}>Premium'a Özel</SectionLabel>
        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f} style={styles.featureRow}>
              <Text style={styles.featureCheck}>{Ornament}</Text>
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <GoldButton
          label={`${Ornament} ${plan === 'yearly' ? 'Yıllık' : 'Aylık'} Planı Başlat`}
          onPress={startPlan}
          style={styles.cta}
        />
        <Text style={styles.disclaimer}>
          İstediğin zaman iptal edebilirsin · Otomatik yenileme
        </Text>

        {/* Testimonial */}
        <View style={styles.testimonial}>
          <Text style={styles.stars}>★★★★★</Text>
          <Text style={styles.testimonialText}>
            "Falcım'ın yorumları o kadar isabetli ki, her sabah kahvemden sonra
            ilk işim fincanıma baktırmak oldu."
          </Text>
          <Text style={styles.testimonialName}>— Elif K.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
  navSpacer: {
    width: 32,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  center: {
    textAlign: 'center',
  },
  hero: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  heroIcon: {
    fontSize: 44,
    color: Colors.gold,
    marginBottom: Spacing.sm,
  },
  heroTitle: {
    fontFamily: FontFamily.serif,
    fontSize: 34,
    color: Colors.cream,
    marginTop: Spacing.sm,
  },
  heroDesc: {
    fontFamily: FontFamily.sans,
    fontSize: 14,
    color: Colors.mist,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderColor: Colors.border,
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  planCardActive: {
    borderColor: Colors.gold,
    backgroundColor: Colors.goldGlow,
  },
  popularBadge: {
    position: 'absolute',
    top: -11,
    left: '50%',
    marginLeft: -48,
    width: 96,
    backgroundColor: Colors.gold,
    borderRadius: Radius.full,
    paddingVertical: 3,
    paddingHorizontal: Spacing.md,
  },
  popularText: {
    fontFamily: FontFamily.sansSemi,
    fontSize: 10,
    color: Colors.black,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  planLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.goldDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  radioActive: {
    borderColor: Colors.gold,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.gold,
  },
  planTitle: {
    fontFamily: FontFamily.sansSemi,
    fontSize: 16,
    color: Colors.cream,
  },
  planNote: {
    fontFamily: FontFamily.sansMed,
    fontSize: 11,
    color: Colors.gold,
    marginTop: 2,
  },
  planPrice: {
    fontFamily: FontFamily.serif,
    fontSize: 20,
    color: Colors.cream,
  },
  blockLabel: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  features: {
    marginBottom: Spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  featureCheck: {
    color: Colors.gold,
    fontSize: 14,
    marginRight: Spacing.md,
    width: 18,
    textAlign: 'center',
  },
  featureText: {
    flex: 1,
    fontFamily: FontFamily.sans,
    fontSize: 14,
    color: Colors.cream,
  },
  cta: {
    marginBottom: Spacing.sm,
  },
  disclaimer: {
    fontFamily: FontFamily.sans,
    fontSize: 11,
    color: Colors.mist,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  testimonial: {
    backgroundColor: Colors.card,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  stars: {
    color: Colors.gold,
    fontSize: 16,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  testimonialText: {
    fontFamily: FontFamily.serifItalic,
    fontStyle: 'italic',
    fontSize: 14,
    color: Colors.cream,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  testimonialName: {
    fontFamily: FontFamily.sansMed,
    fontSize: 12,
    color: Colors.mist,
  },
});
