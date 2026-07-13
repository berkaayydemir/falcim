import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Colors, FontFamily, Radius, Spacing, Ornament } from '../theme';

interface FortuneCardProps {
  text: string;
  loading: boolean;
}

export default function FortuneCard({ text, loading }: FortuneCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🔮</Text>
        <Text style={styles.headerTitle}>Falcım'ın Yorumu</Text>
        <View style={styles.tag}>
          <Text style={styles.tagText}>AI Yorumu</Text>
        </View>
      </View>

      <View style={styles.body}>
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={Colors.gold} />
            <Text style={styles.loadingText}>Fincanın okunuyor…</Text>
          </View>
        ) : (
          <Text style={styles.fortuneText}>
            {Ornament} {text}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  headerTitle: {
    flex: 1,
    color: Colors.cream,
    fontFamily: FontFamily.serif,
    fontSize: 18,
  },
  tag: {
    borderWidth: 1,
    borderColor: Colors.goldDim,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  tagText: {
    color: Colors.gold,
    fontFamily: FontFamily.sansMed,
    fontSize: 9,
    letterSpacing: 1,
  },
  body: {
    minHeight: 80,
    justifyContent: 'center',
  },
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  loadingText: {
    color: Colors.mist,
    fontFamily: FontFamily.sans,
    fontSize: 13,
    marginTop: Spacing.sm,
  },
  fortuneText: {
    color: Colors.cream,
    fontFamily: FontFamily.serifItalic,
    fontStyle: 'italic',
    fontSize: 17,
    lineHeight: 28,
  },
});
