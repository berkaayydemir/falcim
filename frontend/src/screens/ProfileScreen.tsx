import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontFamily, Radius, Spacing, Ornament } from '../theme';
import SectionLabel from '../components/SectionLabel';
import { useAuth } from '../context/AuthContext';
import { APP_VERSION } from '../config/appVersion';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const onLogout = useCallback(() => {
    Alert.alert('Çıkış yap', 'Hesabından çıkmak istediğine emin misin?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Çıkış yap',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try {
            await logout();
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  }, [logout]);

  const initial = user?.displayName?.trim()?.charAt(0)?.toUpperCase() ?? '✦';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <SectionLabel>Hesap</SectionLabel>
        <Text style={styles.title}>Profil</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.name}>{user?.displayName ?? 'Falcım Kullanıcısı'}</Text>
        <Text style={styles.email}>{user?.email ?? ''}</Text>

        <View style={styles.card}>
          <Text style={styles.cardIcon}>{Ornament}</Text>
          <Text style={styles.cardText}>
            Bildirimler ve hesap tercihleri yakında burada olacak.
          </Text>
        </View>

        <Pressable
          style={styles.logoutBtn}
          onPress={onLogout}
          disabled={loggingOut}
        >
          <Text style={styles.logoutText}>
            {loggingOut ? 'Çıkış yapılıyor…' : 'Çıkış Yap'}
          </Text>
        </Pressable>

        <Text style={styles.version}>
          {Ornament} Falcım · Sürüm {APP_VERSION}
        </Text>
      </View>
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
  },
  title: {
    fontFamily: FontFamily.serif,
    fontSize: 30,
    color: Colors.cream,
    marginTop: Spacing.xs,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.card,
    borderColor: Colors.gold,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  avatarText: {
    fontFamily: FontFamily.serif,
    fontSize: 36,
    color: Colors.gold,
  },
  name: {
    fontFamily: FontFamily.serif,
    fontSize: 24,
    color: Colors.cream,
  },
  email: {
    fontFamily: FontFamily.sans,
    fontSize: 13,
    color: Colors.mist,
    marginTop: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.card,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.xxl,
    width: '100%',
  },
  cardIcon: {
    fontSize: 22,
    color: Colors.gold,
    marginBottom: Spacing.sm,
  },
  cardText: {
    fontFamily: FontFamily.sans,
    fontSize: 13,
    color: Colors.mist,
    textAlign: 'center',
    lineHeight: 20,
  },
  logoutBtn: {
    marginTop: 'auto',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    width: '100%',
    alignItems: 'center',
  },
  logoutText: {
    fontFamily: FontFamily.sansSemi,
    fontSize: 15,
    color: '#E5867A',
  },
  version: {
    fontFamily: FontFamily.sansMed,
    fontSize: 12,
    color: Colors.goldDim,
    letterSpacing: 0.5,
    marginBottom: Spacing.xl,
  },
});
