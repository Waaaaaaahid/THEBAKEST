import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User as UserIcon, Mail, Phone, LogOut, Package, Shield, Edit3, Save, X } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';
import { authApi, ordersApi } from '@/lib/api';
import { formatDateShort } from '@/lib/format';
import type { Order } from '@/lib/types';

export default function Profile() {
  const { user, signOut, refreshProfile, isAdmin } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (user) {
      setForm({ firstName: user.firstName, lastName: user.lastName, phone: user.phone });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      ordersApi.list().then((res) => {
        setOrders(((res.data as Order[]) ?? []).slice(0, 5));
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="container-bk py-16">
        <div className="card mx-auto max-w-md p-8 text-center">
          <UserIcon className="mx-auto h-12 w-12 text-bakery-primary/40" />
          <h1 className="mt-4 font-display text-xl font-semibold text-bakery-ink">Please sign in</h1>
          <Link to="/login" className="btn-primary mt-6">Sign In</Link>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    const res = await authApi.updateProfile(form.firstName, form.lastName, form.phone);
    setSaving(false);
    if (!res.success) {
      notify('Could not save changes', 'error');
    } else {
      await refreshProfile();
      setEditing(false);
      notify('Profile updated', 'success');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const fullName = `${user.firstName} ${user.lastName}`.trim() || 'Bakest Customer';

  return (
    <div className="container-bk py-12">
      <h1 className="mb-8 font-display text-3xl font-bold text-bakery-ink">My Profile</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Profile card */}
        <div className="lg:col-span-1">
          <div className="card p-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-bakery-primary text-2xl font-bold text-white">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <h2 className="mt-4 font-display text-lg font-semibold text-bakery-ink">{fullName}</h2>
            <p className="text-sm text-bakery-ink/50">Customer since {formatDateShort(user.created_at)}</p>

            {isAdmin && (
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-bakery-sky px-3 py-1 text-xs font-semibold text-bakery-primary">
                <Shield className="h-3 w-3" /> Admin
              </span>
            )}

            {!editing ? (
              <button onClick={() => setEditing(true)} className="btn-secondary mt-5 w-full">
                <Edit3 className="h-4 w-4" /> Edit Profile
              </button>
            ) : (
              <div className="mt-5 space-y-3 text-left">
                <div><label className="label">First name</label><input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input" /></div>
                <div><label className="label">Last name</label><input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input" /></div>
                <div><label className="label">Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" /></div>
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving} className="btn-primary flex-1"><Save className="h-4 w-4" /> Save</button>
                  <button onClick={() => setEditing(false)} className="btn-ghost border border-bakery-primary/15"><X className="h-4 w-4" /></button>
                </div>
              </div>
            )}

            <button onClick={handleSignOut} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium text-error transition-colors hover:bg-error/5">
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>

          {isAdmin && (
            <Link to="/admin" className="btn-secondary mt-4 w-full">
              <Shield className="h-4 w-4" /> Admin Panel
            </Link>
          )}
        </div>

        {/* Details + recent orders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="mb-4 font-display text-lg font-semibold text-bakery-ink">Account Details</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-bakery-primary" />
                <span className="text-bakery-ink/60">Email</span>
                <span className="ml-auto font-medium text-bakery-ink">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-bakery-primary" />
                <span className="text-bakery-ink/60">Phone</span>
                <span className="ml-auto font-medium text-bakery-ink">{user.phone || '—'}</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-bakery-ink">Recent Orders</h2>
              <Link to="/orders" className="text-sm font-semibold text-bakery-primary hover:text-bakery-primary-dark">View all</Link>
            </div>
            {orders.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <Package className="h-10 w-10 text-bakery-primary/30" />
                <p className="mt-3 text-sm text-bakery-ink/50">No orders yet</p>
                <Link to="/menu" className="btn-secondary mt-4">Start Ordering</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((o) => (
                  <motion.div
                    key={o.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between rounded-xl border border-bakery-primary/10 p-4"
                  >
                    <div>
                      <p className="font-display text-sm font-semibold text-bakery-ink">{o.order_number}</p>
                      <p className="text-xs text-bakery-ink/50">{formatDateShort(o.created_at)} · {o.items.length} item(s)</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-sm font-bold text-bakery-primary-dark">₹{o.total}</p>
                      <span className={`badge mt-1 ${o.status === 'delivered' ? 'bg-success/10 text-success' : o.status === 'cancelled' ? 'bg-error/10 text-error' : 'bg-bakery-sky text-bakery-primary'}`}>{o.status.replace(/_/g, ' ')}</span>
                    </div>
                    <Link to={`/orders/${o.id}`} className="btn-ghost ml-2">Track</Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
