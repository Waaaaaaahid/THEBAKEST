export type AdminRole = 'admin' | 'manager';

export function isAdminRole(role?: string | null) {
  return role === 'admin' || role === 'manager';
}

export function isManager(role?: string | null) {
  return role === 'manager';
}

export function canManage(role?: string | null) {
  return role === 'admin';
}
