import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Colors, FontFamily, Radius, Spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/apiClient';
import {
  GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_ENABLED,
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID,
} from '../config/socialAuth';

// Auth oturumu tamamlandığında tarayıcıyı kapatır (expo-auth-session gerekliliği)
WebBrowser.maybeCompleteAuthSession();

function extractMessage(e: unknown, fallback: string): string {
  return e instanceof ApiError ? e.message : fallback;
}

interface ChildProps {
  busy: boolean;
  setBusy: (b: boolean) => void;
}

/**
 * Google butonu — Google auth hook'u burada. Bu bileşen SADECE
 * GOOGLE_ENABLED true iken render edilir; böylece client id yokken
 * hook hiç çağrılmaz (native'de aksi halde hata fırlatır).
 */
function GoogleAuthButton({ busy, setBusy }: ChildProps) {
  const { loginWithGoogle } = useAuth();

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (!response) return;
    if (response.type === 'success') {
      const idToken =
        response.params?.id_token ?? response.authentication?.idToken ?? null;
      if (!idToken) {
        setBusy(false);
        Alert.alert('Giriş başarısız', 'Google kimliği alınamadı. Tekrar deneyin.');
        return;
      }
      loginWithGoogle(idToken)
        .catch((e) =>
          Alert.alert('Giriş başarısız', extractMessage(e, 'Google ile giriş yapılamadı.'))
        )
        .finally(() => setBusy(false));
    } else if (response.type === 'error') {
      setBusy(false);
      Alert.alert('Giriş başarısız', 'Google ile giriş sırasında bir hata oluştu.');
    } else {
      setBusy(false);
    }
  }, [response, loginWithGoogle, setBusy]);

  const onGoogle = useCallback(() => {
    if (busy || !request) return;
    setBusy(true);
    void promptAsync();
  }, [busy, request, promptAsync, setBusy]);

  return (
    <Pressable
      style={[styles.googleBtn, busy && styles.disabled]}
      onPress={onGoogle}
      disabled={busy || !request}
    >
      <Text style={styles.googleG}>G</Text>
      <Text style={styles.googleText}>Google ile devam et</Text>
    </Pressable>
  );
}

export default function SocialAuthButtons() {
  const { loginWithApple } = useAuth();
  const [busy, setBusy] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);

  // Apple Sign-In yalnızca iOS'ta ve destekleniyorsa
  useEffect(() => {
    let active = true;
    if (Platform.OS === 'ios') {
      AppleAuthentication.isAvailableAsync()
        .then((ok) => {
          if (active) setAppleAvailable(ok);
        })
        .catch(() => {
          /* yoksay */
        });
    }
    return () => {
      active = false;
    };
  }, []);

  const onApple = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) {
        Alert.alert('Giriş başarısız', 'Apple kimliği alınamadı. Tekrar deneyin.');
        return;
      }
      const name = credential.fullName
        ? [credential.fullName.givenName, credential.fullName.familyName]
            .filter(Boolean)
            .join(' ')
            .trim() || undefined
        : undefined;
      await loginWithApple(credential.identityToken, name);
    } catch (e) {
      const err = e as { code?: string };
      if (err.code === 'ERR_REQUEST_CANCELED') return; // kullanıcı vazgeçti
      Alert.alert('Giriş başarısız', extractMessage(e, 'Apple ile giriş yapılamadı.'));
    } finally {
      setBusy(false);
    }
  }, [busy, loginWithApple]);

  if (!GOOGLE_ENABLED && !appleAvailable) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>veya</Text>
        <View style={styles.line} />
      </View>

      {busy && (
        <View style={styles.busy}>
          <ActivityIndicator color={Colors.gold} />
        </View>
      )}

      {GOOGLE_ENABLED && <GoogleAuthButton busy={busy} setBusy={setBusy} />}

      {appleAvailable && (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
          cornerRadius={Radius.md}
          style={styles.appleBtn}
          onPress={onApple}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    marginTop: Spacing.xl,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontFamily: FontFamily.sansMed,
    fontSize: 12,
    color: Colors.mist,
    marginHorizontal: Spacing.md,
  },
  busy: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cream,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  disabled: {
    opacity: 0.6,
  },
  googleG: {
    fontFamily: FontFamily.serif,
    fontSize: 18,
    color: '#4285F4',
    marginRight: Spacing.sm,
  },
  googleText: {
    fontFamily: FontFamily.sansSemi,
    fontSize: 15,
    color: '#1E1814',
  },
  appleBtn: {
    width: '100%',
    height: 50,
  },
});
