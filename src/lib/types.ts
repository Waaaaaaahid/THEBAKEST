export type Role = 'customer' | 'admin';

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: Role;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
}

export interface PriceVariant {
  label: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  description: string;
  image: string;
  price: number;
  price_variants: PriceVariant[];
  available: boolean;
  featured: boolean;
  bestseller: boolean;
  veg: boolean;
  tags: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
  category?: Category | null;
}

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  variant_label: string | null;
  quantity: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  delivery_charge: number;
  total: number;
  payment_method: 'cod' | 'online';
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  address: string;
  city: string;
  pincode: string;
  instructions: string;
  created_at: string;
  updated_at: string;
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Review {
  id: string;
  order_id: string | null;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  created_at: string;
}

export interface CartItem {
  id: string;          // menu item id
  name: string;
  image: string;
  price: number;
  variant_label: string | null;
  quantity: number;
}

export const ORDER_STATUSES: { value: OrderStatus; label: string; step: number }[] = [
  { value: 'placed', label: 'Order Placed', step: 0 },
  { value: 'confirmed', label: 'Confirmed', step: 1 },
  { value: 'preparing', label: 'Preparing', step: 2 },
  { value: 'ready', label: 'Ready', step: 3 },
  { value: 'out_for_delivery', label: 'Out for Delivery', step: 4 },
  { value: 'delivered', label: 'Delivered', step: 5 },
];

export const DELIVERY_CHARGE = 40;
export const FREE_DELIVERY_THRESHOLD = 750;

export const statusLabel = (s: OrderStatus): string =>
  ORDER_STATUSES.find((o) => o.value === s)?.label ?? s;
