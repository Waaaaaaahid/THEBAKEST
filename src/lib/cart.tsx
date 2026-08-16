import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartItem } from './types';
import { DELIVERY_CHARGE, FREE_DELIVERY_THRESHOLD } from './types';

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, variant_label: string | null) => void;
  updateQuantity: (id: string, variant_label: string | null, quantity: number) => void;
  clearCart: () => void;
  count: number;
  subtotal: number;
  deliveryCharge: number;
  total: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = 'bakest_cart_v1';

const sameLine = (a: CartItem, id: string, variant_label: string | null) =>
  a.id === id && (a.variant_label ?? null) === (variant_label ?? null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((p) => sameLine(p, item.id, item.variant_label));
      if (existing) {
        return prev.map((p) =>
          sameLine(p, item.id, item.variant_label)
            ? { ...p, quantity: p.quantity + item.quantity }
            : p
        );
      }
      return [...prev, item];
    });
  };

  const removeItem = (id: string, variant_label: string | null) => {
    setItems((prev) => prev.filter((p) => !sameLine(p, id, variant_label)));
  };

  const updateQuantity = (id: string, variant_label: string | null, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id, variant_label);
      return;
    }
    setItems((prev) =>
      prev.map((p) =>
        sameLine(p, id, variant_label) ? { ...p, quantity } : p
      )
    );
  };

  const clearCart = () => setItems([]);

  const { count, subtotal } = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.count += item.quantity;
        acc.subtotal += item.price * item.quantity;
        return acc;
      },
      { count: 0, subtotal: 0 }
    );
  }, [items]);

  const deliveryCharge =
    subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const total = subtotal + deliveryCharge;

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, count, subtotal, deliveryCharge, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
