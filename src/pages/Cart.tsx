import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, Truck, ArrowLeft } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import { formatINR } from '@/lib/format';
import { DELIVERY_CHARGE, FREE_DELIVERY_THRESHOLD } from '@/lib/types';
import { EmptyState } from '@/components/ui';

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal, deliveryCharge, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container-bk py-12">
        <h1 className="mb-8 font-display text-3xl font-bold text-bakery-ink">Your Cart</h1>
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          message="Browse our freshly baked menu and add your favourite treats."
          actionLabel="Browse Menu"
          actionTo="/menu"
        />
      </div>
    );
  }

  const handleCheckout = () => {
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } });
    } else {
      navigate('/checkout');
    }
  };

  const remaining = FREE_DELIVERY_THRESHOLD - subtotal;

  return (
    <div className="container-bk py-12">
      <h1 className="mb-8 font-display text-3xl font-bold text-bakery-ink">Your Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {/* free delivery progress */}
          {deliveryCharge > 0 && (
            <div className="card flex items-center gap-3 p-4">
              <Truck className="h-5 w-5 text-bakery-primary shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-bakery-ink/70">
                  Add <span className="font-semibold text-bakery-primary">{formatINR(remaining)}</span> more for FREE delivery!
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-bakery-sky">
                  <div className="h-full rounded-full bg-bakery-primary transition-all" style={{ width: `${Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100)}%` }} />
                </div>
              </div>
            </div>
          )}
          {deliveryCharge === 0 && (
            <div className="card flex items-center gap-3 p-4 bg-success/5 border-success/20">
              <Truck className="h-5 w-5 text-success shrink-0" />
              <p className="text-sm font-medium text-success">You've unlocked FREE delivery!</p>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={`${item.id}-${item.variant_label ?? 'std'}`}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40 }}
                className="card flex gap-4 p-4"
              >
                <img src={item.image} alt={item.name} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display text-sm font-semibold text-bakery-ink">{item.name}</h3>
                      {item.variant_label && <p className="text-xs text-bakery-ink/50">{item.variant_label}</p>}
                    </div>
                    <button onClick={() => removeItem(item.id, item.variant_label)} className="rounded-lg p-1.5 text-bakery-ink/40 transition-colors hover:bg-error/10 hover:text-error">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 rounded-full border border-bakery-primary/15 bg-bakery-sky/40 px-1 py-1">
                      <button onClick={() => updateQuantity(item.id, item.variant_label, item.quantity - 1)} className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-bakery-primary shadow-sm transition-transform active:scale-90">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-[1.5rem] text-center text-sm font-semibold text-bakery-ink">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.variant_label, item.quantity + 1)} className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-bakery-primary shadow-sm transition-transform active:scale-90">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="font-display font-bold text-bakery-primary-dark">{formatINR(item.price * item.quantity)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="flex items-center justify-between pt-2">
            <Link to="/menu" className="btn-ghost">
              <ArrowLeft className="h-4 w-4" /> Continue Shopping
            </Link>
            <button onClick={clearCart} className="text-sm text-bakery-ink/50 hover:text-error">
              Clear cart
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24 p-6">
            <h2 className="font-display text-lg font-semibold text-bakery-ink">Order Summary</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-bakery-ink/60">Subtotal</span>
                <span className="font-medium text-bakery-ink">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-bakery-ink/60">Delivery</span>
                <span className="font-medium text-bakery-ink">
                  {deliveryCharge === 0 ? <span className="text-success">FREE</span> : formatINR(deliveryCharge)}
                </span>
              </div>
              {deliveryCharge > 0 && (
                <p className="text-xs text-bakery-ink/45">Free over {formatINR(FREE_DELIVERY_THRESHOLD)} · {formatINR(DELIVERY_CHARGE)} flat</p>
              )}
              <div className="border-t border-bakery-primary/10 pt-3 flex justify-between">
                <span className="font-display font-semibold text-bakery-ink">Total</span>
                <span className="font-display text-xl font-bold text-bakery-primary-dark">{formatINR(total)}</span>
              </div>
            </div>
            <button onClick={handleCheckout} className="btn-primary mt-6 w-full">
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </button>
            {!user && (
              <p className="mt-3 text-center text-xs text-bakery-ink/50">You'll need to sign in to complete your order.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
