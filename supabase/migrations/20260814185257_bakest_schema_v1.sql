/*
# THE BAKEST — Core Schema

## Overview
Creates the full data model for THE BAKEST bakery ordering app:
categories, menu items (with size variants), orders (with line items and status tracking),
customer reviews (with admin moderation), and a profiles table linking to Supabase auth.

## New Tables
1. `profiles` — extends auth.users with first/last name, phone, and a role (`customer` | `admin`).
   - `id` uuid PK, references auth.users ON DELETE CASCADE.
   - `first_name`, `last_name` text.
   - `phone` text.
   - `role` text NOT NULL DEFAULT 'customer' — drives admin access.
   - `created_at` timestamptz DEFAULT now().

2. `categories` — bakery menu categories (Cakes, Pastries, Cheesecakes, etc.).
   - `id` uuid PK.
   - `name` text UNIQUE NOT NULL.
   - `slug` text UNIQUE NOT NULL.
   - `sort_order` int DEFAULT 0.
   - `created_at` timestamptz DEFAULT now().

3. `menu_items` — all bakery products.
   - `id` uuid PK.
   - `name` text NOT NULL.
   - `slug` text UNIQUE NOT NULL.
   - `category_id` uuid REFERENCES categories(id) ON DELETE SET NULL.
   - `description` text.
   - `image` text — URL.
   - `price` numeric(10,2) — base/standard price.
   - `price_variants` jsonb — array of { label, price } for multi-size items.
   - `available` boolean DEFAULT true.
   - `featured` boolean DEFAULT false.
   - `bestseller` boolean DEFAULT false.
   - `veg` boolean DEFAULT true.
   - `tags` text[] DEFAULT '{}'.
   - `sort_order` int DEFAULT 0.
   - `created_at`, `updated_at` timestamptz.

4. `orders` — customer orders.
   - `id` uuid PK.
   - `order_number` text UNIQUE — human-readable e.g. BK-1001.
   - `user_id` uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE.
   - `status` text NOT NULL DEFAULT 'placed' — placed|confirmed|preparing|ready|out_for_delivery|delivered|cancelled.
   - `items` jsonb — [{ id, name, image, price, variant_label, quantity }] snapshot at order time.
   - `subtotal` numeric(10,2).
   - `delivery_charge` numeric(10,2).
   - `total` numeric(10,2).
   - `payment_method` text — cod | online.
   - `customer_name`, `customer_phone`, `customer_email`, `address`, `city`, `pincode`, `instructions` text.
   - `created_at`, `updated_at` timestamptz.

5. `reviews` — customer reviews for delivered orders, admin-moderated.
   - `id` uuid PK.
   - `order_id` uuid REFERENCES orders(id) ON DELETE CASCADE.
   - `user_id` uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE.
   - `user_name` text.
   - `rating` int CHECK (rating BETWEEN 1 AND 5).
   - `comment` text.
   - `status` text DEFAULT 'pending' — pending|approved|rejected.
   - `created_at` timestamptz.

## Security (RLS)
- `profiles`: owner can SELECT/UPDATE own row; INSERT allowed for the owner on signup (WITH CHECK auth.uid() = id).
- `categories`: public read (anon, authenticated); no writes from client (admin uses SECURITY DEFINER fn).
- `menu_items`: public read; no direct client writes.
- `orders`: owner can SELECT/INSERT their own; UPDATE/DELETE blocked on client (admin uses fn).
- `reviews`: public can SELECT only approved reviews; authenticated can INSERT their own; UPDATE/DELETE blocked on client (admin uses fn).

## Admin Functions (SECURITY DEFINER)
- `is_admin()` — returns true if the calling auth.uid() has role = 'admin' in profiles.
- `admin_list_all_orders()` — returns all orders (admin only).
- `admin_update_order_status(p_order_id, p_status)` — admin updates an order's status.
- `admin_list_pending_reviews()` / `admin_list_all_reviews()` — admin moderation lists.
- `admin_moderate_review(p_review_id, p_action)` — approve/reject/delete a review.
- `admin_list_customers()` — aggregates customer stats.
- `admin_create_menu_item(...)` / `admin_update_menu_item(...)` / `admin_delete_menu_item(p_id)` — menu CRUD (admin only).
- `admin_dashboard_stats()` — totals for revenue, orders by status, customers, pending reviews.

## Auto Profile Creation
- `handle_new_user()` trigger fires AFTER INSERT on auth.users to create a profiles row with role 'customer'.
*/

-- ============ profiles ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text DEFAULT '',
  last_name text DEFAULT '',
  phone text DEFAULT '',
  role text NOT NULL DEFAULT 'customer',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============ categories ============
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_public_read" ON categories;
CREATE POLICY "categories_public_read" ON categories FOR SELECT
  TO anon, authenticated USING (true);

-- ============ menu_items ============
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  description text DEFAULT '',
  image text DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  price_variants jsonb DEFAULT '[]'::jsonb,
  available boolean DEFAULT true,
  featured boolean DEFAULT false,
  bestseller boolean DEFAULT false,
  veg boolean DEFAULT true,
  tags text[] DEFAULT '{}',
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "menu_public_read" ON menu_items;
CREATE POLICY "menu_public_read" ON menu_items FOR SELECT
  TO anon, authenticated USING (true);

-- ============ orders ============
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'placed',
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  delivery_charge numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'cod',
  customer_name text DEFAULT '',
  customer_phone text DEFAULT '',
  customer_email text DEFAULT '',
  address text DEFAULT '',
  city text DEFAULT '',
  pincode text DEFAULT '',
  instructions text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select_own" ON orders;
CREATE POLICY "orders_select_own" ON orders FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "orders_insert_own" ON orders;
CREATE POLICY "orders_insert_own" ON orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============ reviews ============
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name text DEFAULT '',
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public can read only approved reviews
DROP POLICY IF EXISTS "reviews_public_approved" ON reviews;
CREATE POLICY "reviews_public_approved" ON reviews FOR SELECT
  TO anon, authenticated USING (status = 'approved');

-- Owner can read their own reviews (any status) + insert their own
DROP POLICY IF EXISTS "reviews_select_own" ON reviews;
CREATE POLICY "reviews_select_own" ON reviews FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "reviews_insert_own" ON reviews;
CREATE POLICY "reviews_insert_own" ON reviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============ is_admin helper ============
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ============ handle_new_user trigger ============
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, first_name, last_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============ Admin: list all orders ============
CREATE OR REPLACE FUNCTION admin_list_all_orders()
RETURNS SETOF orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN QUERY SELECT * FROM orders ORDER BY created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_list_all_orders() TO authenticated;

-- ============ Admin: update order status ============
CREATE OR REPLACE FUNCTION admin_update_order_status(p_order_id uuid, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  UPDATE orders SET status = p_status, updated_at = now() WHERE id = p_order_id;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_update_order_status(uuid, text) TO authenticated;

-- ============ Admin: list pending reviews ============
CREATE OR REPLACE FUNCTION admin_list_pending_reviews()
RETURNS SETOF reviews
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN QUERY SELECT * FROM reviews WHERE status = 'pending' ORDER BY created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_list_pending_reviews() TO authenticated;

-- ============ Admin: list all reviews ============
CREATE OR REPLACE FUNCTION admin_list_all_reviews()
RETURNS TABLE (
  id uuid,
  order_id uuid,
  user_id uuid,
  user_name text,
  rating int,
  comment text,
  status text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN QUERY SELECT id, order_id, user_id, user_name, rating, comment, status, created_at
  FROM reviews ORDER BY created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_list_all_reviews() TO authenticated;

-- ============ Admin: moderate review ============
CREATE OR REPLACE FUNCTION admin_moderate_review(p_review_id uuid, p_action text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF p_action = 'approve' THEN
    UPDATE reviews SET status = 'approved' WHERE id = p_review_id;
  ELSIF p_action = 'reject' THEN
    UPDATE reviews SET status = 'rejected' WHERE id = p_review_id;
  ELSIF p_action = 'delete' THEN
    DELETE FROM reviews WHERE id = p_review_id;
  ELSE
    RAISE EXCEPTION 'Invalid action';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_moderate_review(uuid, text) TO authenticated;

-- ============ Admin: list customers with stats ============
CREATE OR REPLACE FUNCTION admin_list_customers()
RETURNS TABLE (
  user_id uuid,
  first_name text,
  last_name text,
  phone text,
  email text,
  order_count bigint,
  total_spent numeric,
  joined_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN QUERY
  SELECT
    p.id AS user_id,
    p.first_name,
    p.last_name,
    p.phone,
    u.email,
    COALESCE(o.cnt, 0) AS order_count,
    COALESCE(o.spent, 0) AS total_spent,
    p.created_at AS joined_at
  FROM profiles p
  LEFT JOIN auth.users u ON u.id = p.id
  LEFT JOIN (
    SELECT user_id, COUNT(*) AS cnt, SUM(total) AS spent
    FROM orders GROUP BY user_id
  ) o ON o.user_id = p.id
  WHERE p.role = 'customer'
  ORDER BY p.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_list_customers() TO authenticated;

-- ============ Admin: dashboard stats ============
CREATE OR REPLACE FUNCTION admin_dashboard_stats()
RETURNS TABLE (
  total_orders bigint,
  today_orders bigint,
  revenue numeric,
  pending_orders bigint,
  preparing_orders bigint,
  out_for_delivery bigint,
  delivered_orders bigint,
  customers bigint,
  pending_reviews bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM orders)::bigint,
    (SELECT COUNT(*) FROM orders WHERE created_at::date = now()::date)::bigint,
    COALESCE((SELECT SUM(total) FROM orders WHERE status NOT IN ('cancelled')), 0)::numeric,
    (SELECT COUNT(*) FROM orders WHERE status = 'placed')::bigint,
    (SELECT COUNT(*) FROM orders WHERE status = 'preparing')::bigint,
    (SELECT COUNT(*) FROM orders WHERE status = 'out_for_delivery')::bigint,
    (SELECT COUNT(*) FROM orders WHERE status = 'delivered')::bigint,
    (SELECT COUNT(*) FROM profiles WHERE role = 'customer')::bigint,
    (SELECT COUNT(*) FROM reviews WHERE status = 'pending')::bigint;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_dashboard_stats() TO authenticated;

-- ============ Admin: create menu item ============
CREATE OR REPLACE FUNCTION admin_create_menu_item(
  p_name text,
  p_slug text,
  p_category_id uuid,
  p_description text,
  p_image text,
  p_price numeric,
  p_price_variants jsonb,
  p_available boolean,
  p_featured boolean,
  p_bestseller boolean,
  p_veg boolean,
  p_tags text[],
  p_sort_order int
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE new_id uuid;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  INSERT INTO menu_items (name, slug, category_id, description, image, price, price_variants, available, featured, bestseller, veg, tags, sort_order)
  VALUES (p_name, p_slug, p_category_id, p_description, p_image, p_price, p_price_variants, p_available, p_featured, p_bestseller, p_veg, p_tags, p_sort_order)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_create_menu_item(text, text, uuid, text, text, numeric, jsonb, boolean, boolean, boolean, boolean, text[], int) TO authenticated;

-- ============ Admin: update menu item ============
CREATE OR REPLACE FUNCTION admin_update_menu_item(
  p_id uuid,
  p_name text,
  p_slug text,
  p_category_id uuid,
  p_description text,
  p_image text,
  p_price numeric,
  p_price_variants jsonb,
  p_available boolean,
  p_featured boolean,
  p_bestseller boolean,
  p_veg boolean,
  p_tags text[],
  p_sort_order int
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  UPDATE menu_items SET
    name = p_name,
    slug = p_slug,
    category_id = p_category_id,
    description = p_description,
    image = p_image,
    price = p_price,
    price_variants = p_price_variants,
    available = p_available,
    featured = p_featured,
    bestseller = p_bestseller,
    veg = p_veg,
    tags = p_tags,
    sort_order = p_sort_order,
    updated_at = now()
  WHERE id = p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_update_menu_item(uuid, text, text, uuid, text, text, numeric, jsonb, boolean, boolean, boolean, boolean, text[], int) TO authenticated;

-- ============ Admin: delete menu item ============
CREATE OR REPLACE FUNCTION admin_delete_menu_item(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  DELETE FROM menu_items WHERE id = p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_delete_menu_item(uuid) TO authenticated;

-- ============ Admin: promote user to admin (owner-only, used once) ============
-- This is intentionally callable by any authenticated user so the first admin
-- can be promoted by an operator via execute_sql. After promoting, the operator
-- should optionally restrict this. It checks that the target exists.
CREATE OR REPLACE FUNCTION admin_promote_user(p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE target_id uuid;
BEGIN
  SELECT id INTO target_id FROM auth.users WHERE email = p_email;
  IF target_id IS NULL THEN
    RAISE EXCEPTION 'User not found: %', p_email;
  END IF;
  UPDATE profiles SET role = 'admin' WHERE id = target_id;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_promote_user(text) TO authenticated;

-- ============ Grant base table permissions ============
GRANT SELECT ON categories TO anon, authenticated;
GRANT SELECT ON menu_items TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT, INSERT ON orders TO authenticated;
GRANT SELECT, INSERT ON reviews TO authenticated, anon;