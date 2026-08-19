import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi, type AuthUser } from './api';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  isManager: boolean;
  canManage: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, firstName: string, lastName: string, phone: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const syncProfile = async () => {
    if (!authApi.getToken()) return;
    const res = await authApi.me();
    if (res.success && res.data) {
      const next = res.data as AuthUser;
      setUser(next);
      const refresh = localStorage.getItem('bakest_auth_refresh');
      if (refresh) authApi.setAuth(authApi.getToken()!, refresh, next);
    } else if (res.message && /authentication|expired|invalid/i.test(res.message)) {
      authApi.clearAuth();
      setUser(null);
    }
  };

  useEffect(() => {
    (async () => {
      const stored = authApi.getStoredUser();
      if (stored && authApi.getToken()) await syncProfile();
      else setUser(null);
      setLoading(false);
    })();
  }, []);

  // Keep role/permissions in sync across devices/tabs. This means a customer
  // promoted to Manager receives Manager access without needing to refresh.
  useEffect(() => {
    if (!user || !authApi.getToken()) return;
    const timer = window.setInterval(syncProfile, 5000);
    return () => window.clearInterval(timer);
  }, [user?.id, user?.role]);

  const signIn = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    if (res.success && res.data) {
      const d = res.data as { access_token: string; refresh_token: string; user: AuthUser };
      authApi.setAuth(d.access_token, d.refresh_token, d.user); setUser(d.user);
      return { error: null };
    }
    return { error: res.message };
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string, phone: string) => {
    const res = await authApi.register(email, password, firstName, lastName, phone);
    if (res.success && res.data) {
      const d = res.data as { access_token: string; refresh_token: string; user: AuthUser };
      authApi.setAuth(d.access_token, d.refresh_token, d.user); setUser(d.user);
      return { error: null };
    }
    return { error: res.message };
  };

  const signOut = async () => { await authApi.logout(); setUser(null); };

  const refreshProfile = async () => { await syncProfile(); };

  const isAdmin = user?.role === 'admin' || user?.role === 'manager';
  const isManager = user?.role === 'manager';
  const canManage = user?.role === 'admin';

  return <AuthContext.Provider value={{ user, loading, isAdmin, isManager, canManage, signIn, signUp, signOut, refreshProfile }}>{children}</AuthContext.Provider>;
}

export function useAuth() { const ctx = useContext(AuthContext); if (!ctx) throw new Error('useAuth must be used within AuthProvider'); return ctx; }
