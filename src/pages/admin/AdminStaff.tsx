import { useEffect, useState } from 'react';
import { Briefcase, Crown, Loader2, UserRound, UserRoundMinus } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { staffApi, type StaffUser } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';

export default function AdminStaff() {
  const { canManage } = useAuth();
  const { notify } = useToast();
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await staffApi.list();
    if (res.success && res.data) setStaff(res.data);
    else notify(res.message || 'Could not load staff.', 'error');
    setLoading(false);
  };

  useEffect(() => { if (canManage) load(); }, [canManage]);

  const removeManager = async (u: StaffUser) => {
    if (u.role !== 'manager') return;
    setUpdating(u.id);
    const res = await staffApi.setRole(u.id, 'customer');
    if (res.success) {
      setStaff((prev) => prev.filter((x) => x.id !== u.id));
      notify('Manager access removed. The account is now a customer.', 'success');
    } else notify(res.message || 'Could not remove Manager access.', 'error');
    setUpdating(null);
  };

  if (!canManage) return <Navigate to="/admin" replace />;
  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-bakery-primary" /></div>;

  return <div>
    <div className="mb-6"><h1 className="font-display text-2xl font-bold text-bakery-ink">Staff</h1><p className="mt-1 text-sm text-bakery-ink/50">Manage the Admin and Manager accounts for your store.</p></div>
    <div className="space-y-4">{staff.map((u) => <div key={u.id} className="card p-5"><div className="flex flex-wrap items-center justify-between gap-4"><div className="flex min-w-0 items-center gap-3"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-bakery-primary text-white"><UserRound className="h-5 w-5" /></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="font-display font-semibold text-bakery-ink">{u.firstName} {u.lastName}</h2><span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${u.role === 'admin' ? 'bg-error/10 text-error' : 'bg-bakery-primary/10 text-bakery-primary'}`}>{u.role === 'admin' ? <Crown className="h-3 w-3" /> : <Briefcase className="h-3 w-3" />}{u.role.toUpperCase()}</span></div><p className="truncate text-sm text-bakery-ink/55">{u.email}</p><p className="text-xs text-bakery-ink/40">Joined {formatDate(u.created_at)}</p></div></div>{u.role === 'admin' ? <span className="rounded-xl border border-error/10 bg-error/5 px-3 py-2 text-xs font-bold text-error">Primary Admin · Protected</span> : <button type="button" onClick={() => removeManager(u)} disabled={updating === u.id} className="inline-flex items-center gap-2 rounded-xl border border-error/15 px-3 py-2.5 text-xs font-bold text-error hover:bg-error/5 disabled:opacity-50">{updating === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserRoundMinus className="h-4 w-4" />}Remove Manager</button>}</div></div>)}{staff.length === 0 && <div className="card p-12 text-center text-sm text-bakery-ink/50">No staff accounts found.</div>}</div>
  </div>;
}
