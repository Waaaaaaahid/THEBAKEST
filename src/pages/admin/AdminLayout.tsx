import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Cookie, Star, Users, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Logo } from '@/components/ui';
import { motion } from 'framer-motion';

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: Package },
  { to: '/admin/menu', label: 'Menu', icon: Cookie },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/customers', label: 'Customers', icon: Users },
];

export default function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-bakery-primary/20 border-t-bakery-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace state={{ from: '/admin' }} />;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-bakery-cream">
      <div className="container-bk py-6">
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card p-5">
              <div className="mb-4 flex items-center justify-between">
                <Logo className="!text-base" />
              </div>
              <div className="mb-4 rounded-xl bg-bakery-sky/60 px-3 py-2">
                <p className="text-xs font-semibold text-bakery-primary">Admin Panel</p>
                <p className="truncate text-xs text-bakery-ink/50">{user.firstName} {user.lastName}</p>
              </div>
              <nav className="space-y-1">
                {adminNav.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive ? 'bg-bakery-primary text-white shadow-soft' : 'text-bakery-ink/70 hover:bg-bakery-sky'
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              <div className="mt-4 space-y-1 border-t border-bakery-primary/10 pt-4">
                <button onClick={() => navigate('/')} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-bakery-ink/60 hover:bg-bakery-sky">
                  <ArrowLeft className="h-4 w-4" /> Back to Store
                </button>
                <button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-error hover:bg-error/5">
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
