import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { ordersApi } from '@/lib/api';
import type { Order } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/format';
import { EmptyState, LoadingScreen } from '@/components/ui';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    ordersApi.list().then((res) => {
      setOrders((res.data as Order[]) ?? []);
      setLoading(false);
    });
  }, [user]);

  if (!user) {
    return (
      <div className="container-bk py-16">
        <EmptyState icon={Package} title="Please sign in" message="Sign in to view your order history." actionLabel="Sign In" actionTo="/login" />
      </div>
    );
  }

  if (loading) return <LoadingScreen label="Loading your orders..." />;

  return (
    <div className="container-bk py-12">
      <h1 className="mb-8 font-display text-3xl font-bold text-bakery-ink">My Orders</h1>

      {orders.length === 0 ? (
        <EmptyState icon={Package} title="No orders yet" message="When you place an order, it'll show up here for easy tracking." actionLabel="Start Ordering" actionTo="/menu" />
      ) : (
        <div className="space-y-4">
          {orders.map((o, i) => (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/orders/${o.id}`} className="card flex items-center gap-4 p-5 transition-all hover:shadow-card hover:border-bakery-primary/20">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-bakery-sky text-bakery-primary">
                  <Package className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm font-semibold text-bakery-ink">{o.order_number}</p>
                  <p className="text-xs text-bakery-ink/50">{formatDate(o.created_at)} · {o.items.length} item(s) · {o.payment_method.toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-sm font-bold text-bakery-primary-dark">{formatINR(o.total)}</p>
                  <span className={`badge mt-1 ${o.status === 'delivered' ? 'bg-success/10 text-success' : o.status === 'cancelled' ? 'bg-error/10 text-error' : 'bg-bakery-sky text-bakery-primary'}`}>
                    {o.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 text-bakery-ink/30" />
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
