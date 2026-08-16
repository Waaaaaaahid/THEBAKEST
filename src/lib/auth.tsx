import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi, type AuthUser } from './api';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, firstName: string, lastName: string, phone: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = authApi.getStoredUser();
      if (stored && authApi.getToken()) {
        // verify token is still valid
        const res = await authApi.me();
        if (res.success && res.data) {
          setUser(res.data as AuthUser);
        } else {
          authApi.clearAuth();
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    })();
  }, []);

  const signIn = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    if (res.success && res.data) {
      const d = res.data as { access_token: string; refresh_token: string; user: AuthUser };
      authApi.setAuth(d.access_token, d.refresh_token, d.user);
      setUser(d.user);
      return { error: null };
    }
    return { error: res.message };
  };

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string
  ) => {
    const res = await authApi.register(email, password, firstName, lastName, phone);
    if (res.success && res.data) {
      const d = res.data as { access_token: string; refresh_token: string; user: AuthUser };
      authApi.setAuth(d.access_token, d.refresh_token, d.user);
      setUser(d.user);
      return { error: null };
    }
    return { error: res.message };
  };

  const signOut = async () => {
    await authApi.logout();
    setUser(null);
  };

  const refreshProfile = async () => {
    const res = await authApi.me();
    if (res.success && res.data) {
      setUser(res.data as AuthUser);
      const current = authApi.getStoredUser();
      if (current) {
        authApi.setAuth(authApi.getToken()!, localStorage.getItem('bakest_auth_refresh')!, res.data as AuthUser);
      }
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
