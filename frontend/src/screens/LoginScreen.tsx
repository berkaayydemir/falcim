import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Colors, FontFamily, Radius, Spacing, Ornament } from '../theme';
import { AuthStackParamList } from '../types';
import GoldButton from '../components/GoldButton';
import SectionLabel from '../components/SectionLabel';
import SocialAuthButtons from '../components/SocialAuthButtons';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/apiClient';

type Nav = StackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = useCallback(async () => {
    if (loading) return;
    setError(null);
    if (!email.trim() || !password) {
      setError('E-posta ve şifre gerekli.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : 'Giriş yapılamadı. Bağlantını kontrol et.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [email, password, login, loading]);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <SectionLabel style={styles.center}>Yapay Zeka Falı</SectionLabel>
            <Text style={styles.title}>Falcım</Text>
            <Text style={styles.subtitle}>Fincanın sırlarına tekrar hoş geldin</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>E-posta</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="ornek@falcim.app"
              placeholderTextColor={Colors.mist}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
            />

            <Text style={styles.label}>Şifre</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={Colors.mist}
              secureTextEntry
              textContentType="password"
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <GoldButton
              label={loading ? 'Giriş yapılıyor…' : `${Ornament} Giriş Yap`}
              onPress={onSubmit}
              disabled={loading}
              style={styles.cta}
            />

            <SocialAuthButtons />

            <Pressable onPress={() => navigation.navigate('Register')} hitSlop={8}>
              <Text style={styles.switchText}>
                Hesabın yok mu? <Text style={styles.switchLink}>Kayıt ol</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
  },
  center: {
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  title: {
    fontFamily: FontFamily.serif,
    fontSize: 46,
    color: Colors.cream,
    marginTop: Spacing.sm,
  },
  subtitle: {
    fontFamily: FontFamily.sansLight,
    fontSize: 14,
    color: Colors.mist,
    marginTop: Spacing.xs,
  },
  form: {
    width: '100%',
  },
  label: {
    fontFamily: FontFamily.sansMed,
    fontSize: 12,
    color: Colors.mist,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  input: {
    backgroundColor: Colors.card,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    fontFamily: FontFamily.sans,
    fontSize: 15,
    color: Colors.cream,
  },
  error: {
    fontFamily: FontFamily.sansMed,
    fontSize: 13,
    color: '#E5867A',
    marginTop: Spacing.md,
  },
  cta: {
    marginTop: Spacing.xl,
  },
  switchText: {
    fontFamily: FontFamily.sans,
    fontSize: 13,
    color: Colors.mist,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  switchLink: {
    fontFamily: FontFamily.sansSemi,
    color: Colors.gold,
  },
});
