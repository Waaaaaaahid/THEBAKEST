import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Package,
  ChefHat,
  Bell,
  Truck,
  Home,
  ShoppingBag,
  Star,
  XCircle,
  ArrowLeft,
  MapPin,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';
import { ordersApi, reviewsApi } from '@/lib/api';
import type { Order, OrderStatus } from '@/lib/types';
import { ORDER_STATUSES } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/format';
import { LoadingScreen, EmptyState } from '@/components/ui';

const statusIcons: Record<OrderStatus, typeof Package> = {
  placed: ShoppingBag,
  confirmed: CheckCircle2,
  preparing: ChefHat,
  ready: Bell,
  out_for_delivery: Truck,
  delivered: Home,
  cancelled: XCircle,
};

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { notify } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [hasReview, setHasReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id || !user) { setLoading(false); return; }
    (async () => {
      const res = await ordersApi.get(id);
      setOrder((res.data as Order) ?? null);
      if (res.data) {
        const revRes = await reviewsApi.byOrder(id);
        setHasReview(!!revRes.data);
      }
      setLoading(false);
    })();
  }, [id, user]);

  // Poll for status updates
  useEffect(() => {
    if (!order || order.status === 'delivered' || order.status === 'cancelled') return;
    const interval = setInterval(async () => {
      const res = await ordersApi.get(order.id);
      const fresh = res.data as Order | undefined;
      if (fresh && fresh.status !== order.status) {
        setOrder({ ...order, status: fresh.status });
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [order]);

  const submitReview = async () => {
    if (!order || !user) return;
    setSubmitting(true);
    const res = await reviewsApi.create(order.id, rating, comment);
    setSubmitting(false);
    if (!res.success) {
      notify(res.message || 'Could not submit review', 'error');
    } else {
      setHasReview(true);
      setReviewOpen(false);
      notify('Review submitted! It will appear once approved by our team.', 'success');
    }
  };

  if (loading) return <LoadingScreen label="Loading order..." />;
  if (!order) {
    return (
      <div className="container-bk py-12">
        <EmptyState icon={Package} title="Order not found" message="This order may have been removed or doesn't belong to your account." actionLabel="View Orders" actionTo="/orders" />
      </div>
    );
  }

  const cancelled = order.status === 'cancelled';
  const delivered = order.status === 'delivered';
  const currentStep = ORDER_STATUSES.find((s) => s.value === order.status)?.step ?? 0;

  return (
    <div className="container-bk py-12">
      <Link to="/orders" className="btn-ghost mb-6"><ArrowLeft className="h-4 w-4" /> All Orders</Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-bakery-ink sm:text-3xl">{order.order_number}</h1>
          <p className="text-sm text-bakery-ink/50">{formatDate(order.created_at)}</p>
        </div>
        <span className={`badge px-3 py-1.5 text-sm ${
          cancelled ? 'bg-error/10 text-error' : delivered ? 'bg-success/10 text-success' : 'bg-bakery-sky text-bakery-primary'
        }`}>
          {order.status.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Tracking */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {delivered ? (
              <motion.div
                key="delivered-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card overflow-hidden"
              >
                <div className="bg-gradient-to-br from-success/10 to-bakery-sky p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.15 }}
                    className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/20"
                  >
                    <CheckCircle2 className="h-10 w-10 text-success" />
                  </motion.div>
                  <h2 className="mt-5 font-display text-2xl font-bold text-bakery-ink">ORDER DELIVERED</h2>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-bakery-ink/65">
                    Thank you for ordering from THE BAKEST. We hope you enjoyed your treats and look forward to serving you again.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    {!hasReview ? (
                      <button onClick={() => setReviewOpen(true)} className="btn-primary">
                        <Star className="h-4 w-4 fill-white" /> Rate Your Experience
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-2.5 text-sm font-medium text-success">
                        <CheckCircle2 className="h-4 w-4" /> Review submitted — thank you!
                      </span>
                    )}
                    <Link to="/menu" className="btn-secondary">Order Again</Link>
                  </div>
                </div>
              </motion.div>
            ) : cancelled ? (
              <motion.div
                key="cancelled-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card p-8 text-center"
              >
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-error/10">
                  <XCircle className="h-10 w-10 text-error" />
                </div>
                <h2 className="mt-5 font-display text-2xl font-bold text-bakery-ink">Order Cancelled</h2>
                <p className="mt-2 text-sm text-bakery-ink/60">This order has been cancelled. If you have questions, please contact us.</p>
                <Link to="/menu" className="btn-secondary mt-6">Browse Menu</Link>
              </motion.div>
            ) : (
              <motion.div
                key="tracking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card p-6 sm:p-8"
              >
                <h2 className="mb-6 font-display text-lg font-semibold text-bakery-ink">Order Tracking</h2>
                <div className="relative">
                  {ORDER_STATUSES.map((s, idx) => {
                    const Icon = statusIcons[s.value];
                    const isDone = idx <= currentStep;
                    const isCurrent = idx === currentStep;
                    const isLast = idx === ORDER_STATUSES.length - 1;
                    return (
                      <div key={s.value} className="relative flex gap-4 pb-8 last:pb-0">
                        {!isLast && (
                          <div className={`absolute left-5 top-12 h-[calc(100%-1rem)] w-0.5 transition-colors duration-500 ${idx < currentStep ? 'bg-bakery-primary' : 'bg-bakery-primary/15'}`} />
                        )}
                        <motion.div
                          initial={{ scale: 0.8 }}
                          animate={{ scale: isCurrent ? 1.1 : 1 }}
                          className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                            isDone ? 'bg-bakery-primary text-white' : 'bg-bakery-sky text-bakery-ink/40'
                          } ${isCurrent ? 'ring-4 ring-bakery-primary/20' : ''}`}
                        >
                          <Icon className="h-5 w-5" />
                        </motion.div>
                        <div className="pt-1.5">
                          <p className={`text-sm font-semibold transition-colors ${isDone ? 'text-bakery-ink' : 'text-bakery-ink/40'}`}>{s.label}</p>
                          {isCurrent && (
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="mt-0.5 text-xs text-bakery-primary font-medium"
                            >
                              Current status
                            </motion.p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Review modal */}
          <AnimatePresence>
            {reviewOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setReviewOpen(false)}
                className="fixed inset-0 z-[80] flex items-center justify-center bg-bakery-ink/40 backdrop-blur-sm p-4"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="card w-full max-w-md p-6"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-display text-lg font-semibold text-bakery-ink">Rate Your Experience</h3>
                    <button onClick={() => setReviewOpen(false)} className="text-bakery-ink/40 hover:text-bakery-ink/70">✕</button>
                  </div>
                  <p className="text-sm text-bakery-ink/60">How was your order from THE BAKEST?</p>
                  <div className="mt-4 flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => setRating(n)} className="transition-transform hover:scale-110">
                        <Star className={`h-8 w-8 ${n <= rating ? 'fill-accent-gold text-accent-gold' : 'text-bakery-primary/20'}`} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="input mt-4 resize-none"
                    placeholder="Tell us about your experience..."
                  />
                  <button onClick={submitReview} disabled={submitting} className="btn-primary mt-4 w-full">
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Order summary */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="mb-4 font-display text-lg font-semibold text-bakery-ink">Order Items</h2>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={`${item.id}-${item.variant_label}-${i}`} className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-bakery-ink">{item.name}</p>
                    <p className="text-xs text-bakery-ink/50">{item.variant_label ? `${item.variant_label} · ` : ''}×{item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-bakery-ink">{formatINR(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 border-t border-bakery-primary/10 pt-4 text-sm">
              <div className="flex justify-between"><span className="text-bakery-ink/60">Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-bakery-ink/60">Delivery</span><span>{order.delivery_charge === 0 ? <span className="text-success">FREE</span> : formatINR(order.delivery_charge)}</span></div>
              <div className="flex justify-between border-t border-bakery-primary/10 pt-2"><span className="font-display font-semibold">Total</span><span className="font-display text-lg font-bold text-bakery-primary-dark">{formatINR(order.total)}</span></div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="mb-3 font-display text-lg font-semibold text-bakery-ink">Delivery Info</h2>
            <div className="space-y-2 text-sm">
              <p className="flex items-start gap-2 text-bakery-ink/70"><MapPin className="h-4 w-4 text-bakery-primary mt-0.5 shrink-0" /> {order.address}, {order.city} - {order.pincode}</p>
              <p className="text-bakery-ink/70">{order.customer_name} · {order.customer_phone}</p>
              {order.instructions && <p className="text-xs text-bakery-ink/50 italic">Note: {order.instructions}</p>}
              <p className="flex items-center gap-2 pt-2 text-bakery-ink/70"><CreditCard className="h-4 w-4 text-bakery-primary" /> {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
