import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Package,
  Clock,
  ChefHat,
  Truck,
  CheckCircle2,
  Users,
  Star,
  ArrowRight,
  Calendar,
  IndianRupee,
  Cookie,
  Layers,
} from 'lucide-react';
import { adminApi, ordersApi } from '@/lib/api';
import { formatINR, formatDate } from '@/lib/format';
import type { Order } from '@/lib/types';

interface Stats {
  total_orders: number;
  today_orders: number;
  revenue: number;
  pending_orders: number;
  preparing_orders: number;
  out_for_delivery: number;
  delivered_orders: number;
  cancelled_orders: number;
  customers: number;
  total_menu_items: number;
  category_count: number;
  pending_reviews: number;
  recent_orders: Order[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.stats().then((res) => {
      if (res.success && res.data) setStats(res.data as Stats);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-bakery-primary/20 border-t-bakery-primary" /></div>;
  }

  const cards = [
    { label: 'Total Orders', value: stats?.total_orders ?? 0, icon: Package, color: 'text-bakery-primary', bg: 'bg-bakery-sky' },
    { label: "Today's Orders", value: stats?.today_orders ?? 0, icon: Calendar, color: 'text-bakery-primary-dark', bg: 'bg-bakery-sky' },
    { label: 'Revenue', value: formatINR(stats?.revenue ?? 0), icon: IndianRupee, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Pending', value: stats?.pending_orders ?? 0, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Preparing', value: stats?.preparing_orders ?? 0, icon: ChefHat, color: 'text-bakery-primary', bg: 'bg-bakery-sky' },
    { label: 'Out for Delivery', value: stats?.out_for_delivery ?? 0, icon: Truck, color: 'text-bakery-primary-dark', bg: 'bg-bakery-sky' },
    { label: 'Delivered', value: stats?.delivered_orders ?? 0, icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Cancelled', value: stats?.cancelled_orders ?? 0, icon: Package, color: 'text-error', bg: 'bg-error/10' },
    { label: 'Customers', value: stats?.customers ?? 0, icon: Users, color: 'text-bakery-primary', bg: 'bg-bakery-sky' },
    { label: 'Menu Items', value: stats?.total_menu_items ?? 0, icon: Cookie, color: 'text-bakery-primary-dark', bg: 'bg-bakery-sky' },
    { label: 'Categories', value: stats?.category_count ?? 0, icon: Layers, color: 'text-bakery-primary', bg: 'bg-bakery-sky' },
    { label: 'Pending Reviews', value: stats?.pending_reviews ?? 0, icon: Star, color: 'text-accent-gold', bg: 'bg-accent-gold/15' },
  ];

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-bakery-ink">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="card p-5"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.bg} ${c.color}`}>
              <c.icon className="h-5 w-5" />
            </div>
            <p className="mt-3 font-display text-2xl font-bold text-bakery-ink">{c.value}</p>
            <p className="text-sm text-bakery-ink/55">{c.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link to="/admin/orders" className="card group flex items-center justify-between p-5 transition-all hover:shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bakery-sky text-bakery-primary"><Package className="h-5 w-5" /></div>
            <div>
              <p className="font-display text-sm font-semibold text-bakery-ink">Manage Orders</p>
              <p className="text-xs text-bakery-ink/50">{stats?.pending_orders ?? 0} pending to confirm</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-bakery-ink/30 transition-transform group-hover:translate-x-1" />
        </Link>

        <Link to="/admin/reviews" className="card group flex items-center justify-between p-5 transition-all hover:shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-gold/15 text-accent-gold"><Star className="h-5 w-5" /></div>
            <div>
              <p className="font-display text-sm font-semibold text-bakery-ink">Moderate Reviews</p>
              <p className="text-xs text-bakery-ink/50">{stats?.pending_reviews ?? 0} awaiting approval</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-bakery-ink/30 transition-transform group-hover:translate-x-1" />
        </Link>

        <Link to="/admin/menu" className="card group flex items-center justify-between p-5 transition-all hover:shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bakery-sky text-bakery-primary"><TrendingUp className="h-5 w-5" /></div>
            <div>
              <p className="font-display text-sm font-semibold text-bakery-ink">Manage Menu</p>
              <p className="text-xs text-bakery-ink/50">Add, edit & update products</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-bakery-ink/30 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Recent orders */}
      <div className="mt-8">
        <h2 className="mb-4 font-display text-lg font-semibold text-bakery-ink">Recent Orders</h2>
        {(stats?.recent_orders ?? []).length === 0 ? (
          <div className="card p-8 text-center">
            <Package className="mx-auto h-10 w-10 text-bakery-primary/30" />
            <p className="mt-3 text-sm text-bakery-ink/50">No orders yet.</p>
          </div>
        ) : (
          <div className="card divide-y divide-bakery-primary/10">
            {(stats?.recent_orders ?? []).map((o) => (
              <Link key={o.id} to={`/orders/${o.id}`} className="flex items-center gap-4 p-4 transition-colors hover:bg-bakery-sky/30">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bakery-sky text-bakery-primary">
                  <Package className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm font-semibold text-bakery-ink">{o.order_number}</p>
                  <p className="text-xs text-bakery-ink/50">{o.customer_name} · {formatDate(o.created_at)}</p>
                </div>
                <p className="font-display text-sm font-bold text-bakery-primary-dark">{formatINR(o.total)}</p>
                <span className={`badge px-2.5 py-1 text-xs ${
                  o.status === 'delivered' ? 'bg-success/10 text-success' :
                  o.status === 'cancelled' ? 'bg-error/10 text-error' : 'bg-bakery-sky text-bakery-primary'
                }`}>{o.status.replace(/_/g, ' ')}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
