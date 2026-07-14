import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AuthUser } from '../types';
import { setSessionExpiredListener } from '../services/apiClient';
import * as authService from '../services/authService';

type AuthStatus = 'loading' | 'authed' | 'guest';

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithGoogle: (idToken: string, displayName?: string) => Promise<void>;
  loginWithApple: (idToken: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);

  // Oturum açılışta güvenli depodaki token ile /users/me denenir.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const current = await authService.me();
        if (!cancelled) {
          setUser(current);
          setStatus('authed');
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setStatus('guest');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Refresh başarısız olursa (oturum düştü) otomatik guest'e düş.
  useEffect(() => {
    setSessionExpiredListener(() => {
      setUser(null);
      setStatus('guest');
    });
    return () => setSessionExpiredListener(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authService.login(email, password);
    setUser(res.user);
    setStatus('authed');
  }, []);

  const register = useCallback(
    async (email: string, password: string, displayName: string) => {
      const res = await authService.register(email, password, displayName);
      setUser(res.user);
      setStatus('authed');
    },
    []
  );

  const loginWithGoogle = useCallback(async (idToken: string, displayName?: string) => {
    const res = await authService.loginWithGoogle(idToken, displayName);
    setUser(res.user);
    setStatus('authed');
  }, []);

  const loginWithApple = useCallback(async (idToken: string, displayName?: string) => {
    const res = await authService.loginWithApple(idToken, displayName);
    setUser(res.user);
    setStatus('authed');
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setStatus('guest');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, login, register, loginWithGoogle, loginWithApple, logout }),
    [status, user, login, register, loginWithGoogle, loginWithApple, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth, AuthProvider içinde kullanılmalı.');
  }
  return ctx;
}
