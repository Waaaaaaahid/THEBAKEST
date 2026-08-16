import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Phone, Mail, Package, IndianRupee } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatINR, formatDate } from '@/lib/format';

interface CustomerRow {
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  order_count: number;
  total_spent: number;
  joined_at: string;
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.customers().then((res) => {
      if (res.success && res.data) setCustomers(res.data as CustomerRow[]);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-bakery-primary/20 border-t-bakery-primary" /></div>;
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-bakery-ink">Customers</h1>

      {customers.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="mx-auto h-10 w-10 text-bakery-primary/30" />
          <p className="mt-3 text-sm text-bakery-ink/50">No customers yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {customers.map((c, i) => (
            <motion.div
              key={c.user_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card p-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bakery-primary text-lg font-bold text-white">
                  {(c.first_name || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-semibold text-bakery-ink">
                    {c.first_name} {c.last_name}
                  </p>
                  <p className="truncate text-xs text-bakery-ink/50">Joined {formatDate(c.joined_at)}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                {c.email && (
                  <p className="flex items-center gap-2 text-bakery-ink/60 truncate">
                    <Mail className="h-3.5 w-3.5 text-bakery-primary shrink-0" /> <span className="truncate">{c.email}</span>
                  </p>
                )}
                {c.phone && (
                  <p className="flex items-center gap-2 text-bakery-ink/60">
                    <Phone className="h-3.5 w-3.5 text-bakery-primary" /> {c.phone}
                  </p>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-bakery-primary/10 pt-3">
                <div className="text-center">
                  <p className="flex items-center justify-center gap-1 font-display text-lg font-bold text-bakery-primary-dark">
                    <Package className="h-4 w-4" /> {c.order_count}
                  </p>
                  <p className="text-xs text-bakery-ink/45">Orders</p>
                </div>
                <div className="text-center">
                  <p className="flex items-center justify-center gap-1 font-display text-lg font-bold text-bakery-primary-dark">
                    <IndianRupee className="h-4 w-4" /> {c.total_spent ? Math.round(c.total_spent) : 0}
                  </p>
                  <p className="text-xs text-bakery-ink/45">Total Spent</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
