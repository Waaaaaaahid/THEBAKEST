import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Cookie, Star, Users, LogOut, ArrowLeft, BellRing, Settings, Briefcase } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Logo } from '@/components/ui';
import { useToast } from '@/components/Toast';
import { ordersApi } from '@/lib/api';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: Package },
  { to: '/admin/menu', label: 'Menu', icon: Cookie },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/staff', label: 'Staff', icon: Briefcase, adminOnly: true },
  { to: '/admin/settings', label: 'Cafe Settings', icon: Settings },
];

export default function AdminLayout() {
  const { user, isAdmin, canManage, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { notify } = useToast();
  const seen = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user || !isAdmin) return;
    let active = true;
    const poll = async () => {
      const res = await ordersApi.list();
      if (!active || !res.success) return;
      const list = (res.data as Array<{ id: string; order_number: string; total: number }>) ?? [];
      const fresh = list.filter((o) => !seen.current.has(o.id));
      if (seen.current.size > 0) {
        fresh.slice(0, 3).forEach((o) => notify(`New order ${o.order_number} received · ₹${Number(o.total || 0).toLocaleString('en-IN')}`, 'success'));
      }
      list.forEach((o) => seen.current.add(o.id));
    };
    poll();
    const timer = window.setInterval(poll, 4000);
    return () => { active = false; window.clearInterval(timer); };
  }, [user, isAdmin, notify]);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-bakery-primary/20 border-t-bakery-primary" /></div>;
  if (!user || !isAdmin) return <Navigate to="/login" replace state={{ from: '/admin' }} />;

  const visibleNav = adminNav.filter((item) => !item.adminOnly || canManage);
  const handleSignOut = async () => { await signOut(); navigate('/'); };

  return <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-bakery-cream">
    <div className="container-bk py-4 sm:py-6">
      <div className="grid min-w-0 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden min-w-0 lg:sticky lg:top-24 lg:block lg:self-start">
          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between"><Logo className="!text-base" /><span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-[10px] font-semibold text-success"><BellRing className="h-3 w-3" />LIVE</span></div>
            <div className="mb-4 rounded-xl bg-bakery-sky/60 px-3 py-2"><p className="text-xs font-semibold text-bakery-primary">Admin Panel</p><p className="truncate text-xs text-bakery-ink/50">{user.firstName} {user.lastName}</p></div>
            <nav className="space-y-1">{visibleNav.map((item) => <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-bakery-primary text-white shadow-soft' : 'text-bakery-ink/70 hover:bg-bakery-sky'}`}><item.icon className="h-4 w-4" />{item.label}</NavLink>)}</nav>
            <div className="mt-4 space-y-1 border-t border-bakery-primary/10 pt-4"><button onClick={() => navigate('/')} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-bakery-ink/60 hover:bg-bakery-sky"><ArrowLeft className="h-4 w-4" />Back to Store</button><button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-error hover:bg-error/5"><LogOut className="h-4 w-4" />Sign Out</button></div>
          </div>
        </aside>
        <main className="min-w-0 w-full">
          <div className="mb-4 flex w-full min-w-0 flex-col gap-3 lg:hidden"><div className="card w-full p-3"><div className="mb-2 flex min-w-0 items-center justify-between gap-2"><div className="min-w-0"><p className="text-xs font-semibold text-bakery-primary">Admin Panel</p><p className="truncate text-xs text-bakery-ink/50">{user.firstName} {user.lastName}</p></div><span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-[10px] font-semibold text-success"><BellRing className="h-3 w-3" />LIVE</span></div><nav className="flex w-full flex-wrap justify-center gap-1.5">{visibleNav.map((item) => <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `inline-flex min-w-[92px] items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-colors ${isActive ? 'bg-bakery-primary text-white shadow-soft' : 'bg-bakery-sky/60 text-bakery-ink/70'}`}><item.icon className="h-3.5 w-3.5" />{item.label}</NavLink>)}</nav><div className="mt-2 flex flex-wrap justify-center gap-1.5 border-t border-bakery-primary/10 pt-2"><button onClick={() => navigate('/')} className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-medium text-bakery-ink/60 hover:bg-bakery-sky"><ArrowLeft className="h-3.5 w-3.5" />Store</button><button onClick={handleSignOut} className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-medium text-error hover:bg-error/5"><LogOut className="h-3.5 w-3.5" />Sign Out</button></div></div></div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="min-w-0 w-full"><Outlet /></motion.div>
        </main>
      </div>
    </div>
  </div>;
}
