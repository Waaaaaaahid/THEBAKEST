import { supabase } from './supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const API_BASE = `${SUPABASE_URL}/functions/v1/bakest-api`;

const TOKEN_KEY = 'bakest_auth_token';
const REFRESH_KEY = 'bakest_auth_refresh';
const USER_KEY = 'bakest_auth_user';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'customer' | 'admin';
  created_at?: string;
}

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setAuth(access: string, refresh: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

async function apiCall<T = unknown>(path: string, options: RequestInit = {}): Promise<{ success: boolean; message: string; data?: T }> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    return { success: false, message: 'Network error — please check your connection' };
  }

  if (res.status === 401) {
    // try refresh
    const refresh = localStorage.getItem(REFRESH_KEY);
    if (refresh) {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refresh,
      });
      if (!error && data.session) {
        localStorage.setItem(TOKEN_KEY, data.session.access_token);
        localStorage.setItem(REFRESH_KEY, data.session.refresh_token);
        headers['Authorization'] = `Bearer ${data.session.access_token}`;
        try {
          const retry = await fetch(`${API_BASE}${path}`, { ...options, headers });
          return retry.json();
        } catch {
          return { success: false, message: 'Network error — please check your connection' };
        }
      }
    }
    clearAuth();
  }

  try {
    return await res.json();
  } catch {
    return { success: false, message: 'Unexpected response from server' };
  }
}

// ─── Auth API ───
export const authApi = {
  register: (email: string, password: string, firstName: string, lastName: string, phone: string) =>
    apiCall<{ access_token: string; refresh_token: string; user: AuthUser }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify({ email, password, firstName, lastName, phone }) }
    ),

  login: (email: string, password: string) =>
    apiCall<{ access_token: string; refresh_token: string; user: AuthUser }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    ),

  me: () => apiCall<AuthUser>('/auth/me', { method: 'GET' }),

  updateProfile: (firstName: string, lastName: string, phone: string) =>
    apiCall('/auth/update-profile', { method: 'PUT', body: JSON.stringify({ firstName, lastName, phone }) }),

  logout: () => {
    clearAuth();
    return Promise.resolve({ success: true, message: 'Logged out' });
  },

  getStoredUser,
  setAuth,
  clearAuth,
  getToken,
};

// ─── Categories API ───
export const categoriesApi = {
  list: () => apiCall<unknown[]>('/categories', { method: 'GET' }),
  create: (data: { name: string; slug?: string; sortOrder?: number }) =>
    apiCall('/categories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { name?: string; slug?: string; sortOrder?: number }) =>
    apiCall(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiCall(`/categories/${id}`, { method: 'DELETE' }),
};

// ─── Menu API ───
export const menuApi = {
  list: () => apiCall<unknown[]>('/menu', { method: 'GET' }),
  byCategory: (categoryId: string) => apiCall<unknown[]>(`/menu/category/${categoryId}`, { method: 'GET' }),
  create: (data: Record<string, unknown>) =>
    apiCall('/menu', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    apiCall(`/menu/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiCall(`/menu/${id}`, { method: 'DELETE' }),
};

// ─── Orders API ───
export const ordersApi = {
  list: () => apiCall<unknown[]>('/orders', { method: 'GET' }),
  get: (id: string) => apiCall<unknown>(`/orders/${id}`, { method: 'GET' }),
  create: (data: Record<string, unknown>) =>
    apiCall<unknown>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string) =>
    apiCall(`/orders/status/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

// ─── Reviews API ───
export const reviewsApi = {
  approved: () => apiCall<unknown[]>('/reviews/approved', { method: 'GET' }),
  all: () => apiCall<unknown[]>('/reviews/all', { method: 'GET' }),
  byOrder: (orderId: string) => apiCall<unknown | null>(`/reviews/order/${orderId}`, { method: 'GET' }),
  create: (orderId: string, rating: number, comment: string) =>
    apiCall('/reviews', { method: 'POST', body: JSON.stringify({ orderId, rating, comment }) }),
  moderate: (id: string, action: 'approve' | 'reject' | 'delete') =>
    apiCall(`/reviews/${id}`, { method: 'PUT', body: JSON.stringify({ action }) }),
};

// ─── Admin API ───
export const adminApi = {
  stats: () => apiCall<Record<string, unknown>>('/admin/stats', { method: 'GET' }),
  customers: () => apiCall<unknown[]>('/admin/customers', { method: 'GET' }),
};
