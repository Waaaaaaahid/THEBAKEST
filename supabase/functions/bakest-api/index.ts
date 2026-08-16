import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface ApiResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

function json(data: ApiResponse, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status = 400): Response {
  return json({ success: false, message }, status);
}

// Verify the JWT from the client and return the user id + role
async function getUser(req: Request): Promise<{ id: string; email: string; role: string } | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return null;
  // fetch role from profiles
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();
  return {
    id: data.user.id,
    email: data.user.email ?? "",
    role: profile?.role ?? "customer",
  };
}

async function isAdminUser(req: Request): Promise<boolean> {
  const user = await getUser(req);
  return user?.role === "admin";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/functions\/v1\/bakest-api/, "").replace(/^\/+/, "");
    const segments = path.split("/").filter(Boolean);
    const method = req.method;

    // ─── HEALTH ───
    if (segments.length === 0 || segments[0] === "health") {
      return json({ success: true, message: "The Bakest API is running" });
    }

    // ─── AUTH ───
    if (segments[0] === "auth") {
      const action = segments[1];

      if (action === "register" && method === "POST") {
        const body = await req.json();
        const { email, password, firstName, lastName, phone } = body;
        if (!email || !password) return errorResponse("Email and password are required");
        if (password.length < 6) return errorResponse("Password must be at least 6 characters");

        const { data, error } = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { first_name: firstName, last_name: lastName, phone },
        });
        if (error) {
          if (error.message.includes("already") || error.message.includes("exists")) {
            return errorResponse("An account with this email already exists", 409);
          }
          return errorResponse(error.message);
        }

        // create profile
        await admin.from("profiles").upsert({
          id: data.user.id,
          first_name: firstName || "",
          last_name: lastName || "",
          phone: phone || "",
          role: "customer",
        });

        // sign in to get session token
        const { data: signInData, error: signInError } = await admin.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) return errorResponse("Account created but login failed: " + signInError.message);

        return json({
          success: true,
          message: "Account created successfully",
          data: {
            access_token: signInData.session?.access_token,
            refresh_token: signInData.session?.refresh_token,
            user: { id: data.user.id, email, firstName, lastName, phone, role: "customer" },
          },
        });
      }

      if (action === "login" && method === "POST") {
        const body = await req.json();
        const { email, password } = body;
        if (!email || !password) return errorResponse("Email and password are required");

        const { data, error } = await admin.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.includes("Invalid") || error.message.includes("credentials")) {
            return errorResponse("Invalid email or password", 401);
          }
          return errorResponse(error.message, 401);
        }

        const { data: profile } = await admin
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .maybeSingle();

        return json({
          success: true,
          message: "Login successful",
          data: {
            access_token: data.session?.access_token,
            refresh_token: data.session?.refresh_token,
            user: {
              id: data.user.id,
              email: data.user.email,
              firstName: profile?.first_name ?? "",
              lastName: profile?.last_name ?? "",
              phone: profile?.phone ?? "",
              role: profile?.role ?? "customer",
            },
          },
        });
      }

      if (action === "me" && method === "GET") {
        const user = await getUser(req);
        if (!user) return errorResponse("Not authenticated", 401);
        const { data: profile } = await admin
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        return json({
          success: true,
          message: "Profile fetched",
          data: {
            id: user.id,
            email: user.email,
            firstName: profile?.first_name ?? "",
            lastName: profile?.last_name ?? "",
            phone: profile?.phone ?? "",
            role: profile?.role ?? "customer",
            created_at: profile?.created_at ?? "",
          },
        });
      }

      if (action === "update-profile" && method === "PUT") {
        const user = await getUser(req);
        if (!user) return errorResponse("Not authenticated", 401);
        const body = await req.json();
        const { firstName, lastName, phone } = body;
        const { error: updErr } = await admin
          .from("profiles")
          .update({ first_name: firstName, last_name: lastName, phone })
          .eq("id", user.id);
        if (updErr) return errorResponse("Could not update profile");
        return json({ success: true, message: "Profile updated" });
      }

      return errorResponse("Unknown auth endpoint", 404);
    }

    // ─── CATEGORIES ───
    if (segments[0] === "categories") {
      if (method === "GET") {
        const { data, error } = await admin.from("categories").select("*").order("sort_order", { ascending: true });
        if (error) return errorResponse("Failed to fetch categories", 500);
        return json({ success: true, message: "Categories fetched", data });
      }

      // Admin-only writes
      if (!await isAdminUser(req)) return errorResponse("Admin access required", 403);

      if (method === "POST") {
        const body = await req.json();
        const { name, slug, sortOrder } = body;
        if (!name) return errorResponse("Category name is required");
        const catSlug = slug || name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
        const { data, error } = await admin.from("categories").insert({
          name, slug: catSlug, sort_order: sortOrder || 0,
        }).select().maybeSingle();
        if (error) return errorResponse(error.message.includes("duplicate") ? "Slug already exists" : error.message);
        return json({ success: true, message: "Category created", data });
      }

      if (method === "PUT" && segments[1]) {
        const body = await req.json();
        const { name, slug, sortOrder } = body;
        const updates: Record<string, unknown> = {};
        if (name !== undefined) updates.name = name;
        if (slug !== undefined) updates.slug = slug;
        if (sortOrder !== undefined) updates.sort_order = sortOrder;
        const { data, error } = await admin.from("categories").update(updates).eq("id", segments[1]).select().maybeSingle();
        if (error) return errorResponse(error.message);
        return json({ success: true, message: "Category updated", data });
      }

      if (method === "DELETE" && segments[1]) {
        const { error } = await admin.from("categories").delete().eq("id", segments[1]);
        if (error) return errorResponse(error.message);
        return json({ success: true, message: "Category deleted" });
      }

      return errorResponse("Unknown category endpoint", 404);
    }

    // ─── MENU ───
    if (segments[0] === "menu") {
      if (method === "GET") {
        let query = admin.from("menu_items").select("*, category:categories(*)");
        if (segments[1] === "category" && segments[2]) {
          query = query.eq("category_id", segments[2]);
        }
        const { data, error } = await query.order("sort_order", { ascending: true });
        if (error) return errorResponse("Failed to fetch menu items", 500);
        return json({ success: true, message: "Menu items fetched", data });
      }

      // Admin-only writes
      if (!await isAdminUser(req)) return errorResponse("Admin access required", 403);

      if (method === "POST") {
        const body = await req.json();
        const { data, error } = await admin.from("menu_items").insert({
          name: body.name,
          slug: body.slug || body.name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-"),
          category_id: body.categoryId,
          description: body.description || "",
          image: body.image || "",
          price: body.price || 0,
          price_variants: body.priceVariants || [],
          available: body.available ?? true,
          featured: body.featured ?? false,
          bestseller: body.bestseller ?? false,
          veg: body.veg ?? true,
          tags: body.tags || [],
          sort_order: body.sortOrder || 0,
        }).select().maybeSingle();
        if (error) return errorResponse(error.message.includes("duplicate") ? "Slug already exists" : error.message);
        return json({ success: true, message: "Menu item created", data });
      }

      if (method === "PUT" && segments[1]) {
        const body = await req.json();
        const updates: Record<string, unknown> = {};
        if (body.name !== undefined) updates.name = body.name;
        if (body.slug !== undefined) updates.slug = body.slug;
        if (body.categoryId !== undefined) updates.category_id = body.categoryId;
        if (body.description !== undefined) updates.description = body.description;
        if (body.image !== undefined) updates.image = body.image;
        if (body.price !== undefined) updates.price = body.price;
        if (body.priceVariants !== undefined) updates.price_variants = body.priceVariants;
        if (body.available !== undefined) updates.available = body.available;
        if (body.featured !== undefined) updates.featured = body.featured;
        if (body.bestseller !== undefined) updates.bestseller = body.bestseller;
        if (body.veg !== undefined) updates.veg = body.veg;
        if (body.tags !== undefined) updates.tags = body.tags;
        if (body.sortOrder !== undefined) updates.sort_order = body.sortOrder;
        updates.updated_at = new Date().toISOString();
        const { data, error } = await admin.from("menu_items").update(updates).eq("id", segments[1]).select().maybeSingle();
        if (error) return errorResponse(error.message);
        return json({ success: true, message: "Menu item updated", data });
      }

      if (method === "DELETE" && segments[1]) {
        const { error } = await admin.from("menu_items").delete().eq("id", segments[1]);
        if (error) return errorResponse(error.message);
        return json({ success: true, message: "Menu item deleted" });
      }

      return errorResponse("Unknown menu endpoint", 404);
    }

    // ─── ORDERS ───
    if (segments[0] === "orders") {
      if (method === "GET") {
        const user = await getUser(req);
        if (!user) return errorResponse("Not authenticated", 401);

        if (user.role === "admin") {
          // Admin sees all orders
          const { data, error } = await admin.from("orders").select("*").order("created_at", { ascending: false });
          if (error) return errorResponse("Failed to fetch orders", 500);
          return json({ success: true, message: "Orders fetched", data });
        }

        // Customer sees only their orders
        const { data, error } = await admin
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (error) return errorResponse("Failed to fetch orders", 500);
        return json({ success: true, message: "Orders fetched", data });
      }

      if (method === "POST") {
        const user = await getUser(req);
        if (!user) return errorResponse("Please sign in to place an order", 401);

        const body = await req.json();
        const { items, subtotal, deliveryCharge, total, paymentMethod, customerName, customerPhone, customerEmail, address, city, pincode, instructions } = body;

        if (!items || !items.length) return errorResponse("Cart is empty");
        if (!customerName || !customerPhone || !address) return errorResponse("Missing delivery details");

        const orderNumber = `BK-${Math.floor(1000 + Math.random() * 9000)}`;

        const { data, error } = await admin.from("orders").insert({
          order_number: orderNumber,
          user_id: user.id,
          status: "placed",
          items,
          subtotal,
          delivery_charge: deliveryCharge,
          total,
          payment_method: paymentMethod || "cod",
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail || "",
          address,
          city: city || "",
          pincode: pincode || "",
          instructions: instructions || "",
        }).select().maybeSingle();

        if (error) return errorResponse("Could not place order: " + error.message, 500);
        return json({ success: true, message: "Order placed successfully", data });
      }

      if (method === "PUT" && segments[1] === "status" && segments[2]) {
        if (!await isAdminUser(req)) return errorResponse("Admin access required", 403);
        const body = await req.json();
        const { status } = body;
        const valid = ["placed", "confirmed", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"];
        if (!valid.includes(status)) return errorResponse("Invalid status");
        const { error } = await admin.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", segments[2]);
        if (error) return errorResponse(error.message);
        return json({ success: true, message: "Order status updated" });
      }

      if (method === "GET" && segments[1]) {
        const user = await getUser(req);
        if (!user) return errorResponse("Not authenticated", 401);
        const { data, error } = await admin.from("orders").select("*").eq("id", segments[1]).maybeSingle();
        if (error) return errorResponse("Order not found", 404);
        if (!data) return errorResponse("Order not found", 404);
        // Customer can only see their own order
        if (user.role !== "admin" && data.user_id !== user.id) return errorResponse("Order not found", 404);
        return json({ success: true, message: "Order fetched", data });
      }

      return errorResponse("Unknown order endpoint", 404);
    }

    // ─── REVIEWS ───
    if (segments[0] === "reviews") {
      if (method === "GET") {
        // Public: only approved reviews
        if (segments[1] === "approved" || !segments[1]) {
          const { data, error } = await admin
            .from("reviews")
            .select("*")
            .eq("status", "approved")
            .order("created_at", { ascending: false });
          if (error) return errorResponse("Failed to fetch reviews", 500);
          return json({ success: true, message: "Reviews fetched", data });
        }

        // Admin: all reviews
        if (segments[1] === "all") {
          if (!await isAdminUser(req)) return errorResponse("Admin access required", 403);
          const { data, error } = await admin.from("reviews").select("*").order("created_at", { ascending: false });
          if (error) return errorResponse("Failed to fetch reviews", 500);
          return json({ success: true, message: "Reviews fetched", data });
        }

        // User's own reviews for an order
        if (segments[1] === "order" && segments[2]) {
          const user = await getUser(req);
          if (!user) return errorResponse("Not authenticated", 401);
          const { data, error } = await admin.from("reviews").select("*").eq("order_id", segments[2]).maybeSingle();
          if (error) return errorResponse("Failed to fetch review", 500);
          return json({ success: true, message: "Review fetched", data });
        }

        return errorResponse("Unknown review endpoint", 404);
      }

      if (method === "POST") {
        const user = await getUser(req);
        if (!user) return errorResponse("Please sign in to review", 401);
        const body = await req.json();
        const { orderId, rating, comment } = body;
        if (!rating || rating < 1 || rating > 5) return errorResponse("Rating must be 1-5");
        if (!comment?.trim()) return errorResponse("Review text is required");

        // verify order belongs to user and is delivered
        const { data: order } = await admin.from("orders").select("status, user_id, customer_name").eq("id", orderId).maybeSingle();
        if (!order) return errorResponse("Order not found", 404);
        if (order.user_id !== user.id) return errorResponse("Not authorized", 403);
        if (order.status !== "delivered") return errorResponse("Can only review delivered orders");

        // check if already reviewed
        const { data: existing } = await admin.from("reviews").select("id").eq("order_id", orderId).maybeSingle();
        if (existing) return errorResponse("You have already reviewed this order", 409);

        const { data, error } = await admin.from("reviews").insert({
          order_id: orderId,
          user_id: user.id,
          user_name: order.customer_name || user.email,
          rating,
          comment,
          status: "pending",
        }).select().maybeSingle();
        if (error) return errorResponse("Could not submit review");
        return json({ success: true, message: "Review submitted — pending approval", data });
      }

      // Admin moderation
      if (method === "PUT" && segments[1]) {
        if (!await isAdminUser(req)) return errorResponse("Admin access required", 403);
        const body = await req.json();
        const { action } = body;
        if (action === "approve") {
          await admin.from("reviews").update({ status: "approved" }).eq("id", segments[1]);
        } else if (action === "reject") {
          await admin.from("reviews").update({ status: "rejected" }).eq("id", segments[1]);
        } else if (action === "delete") {
          await admin.from("reviews").delete().eq("id", segments[1]);
        } else {
          return errorResponse("Invalid action");
        }
        return json({ success: true, message: `Review ${action}d` });
      }

      return errorResponse("Unknown review endpoint", 404);
    }

    // ─── ADMIN STATS ───
    if (segments[0] === "admin" && segments[1] === "stats") {
      if (!await isAdminUser(req)) return errorResponse("Admin access required", 403);

      const [orders, todayOrders, customers, menuItems, categories, pendingReviews] = await Promise.all([
        admin.from("orders").select("*"),
        admin.from("orders").select("*").gte("created_at", new Date().toISOString().split("T")[0]),
        admin.from("profiles").select("*").eq("role", "customer"),
        admin.from("menu_items").select("*"),
        admin.from("categories").select("*"),
        admin.from("reviews").select("*").eq("status", "pending"),
      ]);

      const allOrders = orders.data || [];
      const revenue = allOrders.filter((o: Record<string, unknown>) => o.status !== "cancelled").reduce((s: number, o: Record<string, unknown>) => s + Number(o.total), 0);

      const stats = {
        total_orders: allOrders.length,
        today_orders: todayOrders.data?.length || 0,
        revenue,
        pending_orders: allOrders.filter((o: Record<string, unknown>) => o.status === "placed").length,
        preparing_orders: allOrders.filter((o: Record<string, unknown>) => o.status === "preparing").length,
        out_for_delivery: allOrders.filter((o: Record<string, unknown>) => o.status === "out_for_delivery").length,
        delivered_orders: allOrders.filter((o: Record<string, unknown>) => o.status === "delivered").length,
        cancelled_orders: allOrders.filter((o: Record<string, unknown>) => o.status === "cancelled").length,
        customers: customers.data?.length || 0,
        total_menu_items: menuItems.data?.length || 0,
        category_count: categories.data?.length || 0,
        pending_reviews: pendingReviews.data?.length || 0,
        recent_orders: allOrders.slice(0, 5),
      };

      return json({ success: true, message: "Stats fetched", data: stats });
    }

    // ─── ADMIN CUSTOMERS ───
    if (segments[0] === "admin" && segments[1] === "customers") {
      if (!await isAdminUser(req)) return errorResponse("Admin access required", 403);

      const { data: profiles } = await admin.from("profiles").select("*").eq("role", "customer").order("created_at", { ascending: false });
      const { data: users } = await admin.auth.admin.listUsers();
      const { data: allOrders } = await admin.from("orders").select("user_id, total, status");

      const emailMap = new Map((users.users || []).map((u: Record<string, unknown>) => [u.id, u.email]));
      const orderMap = new Map<string, { count: number; spent: number }>();
      for (const o of allOrders || []) {
        const uid = (o as Record<string, unknown>).user_id as string;
        const total = Number((o as Record<string, unknown>).total);
        const existing = orderMap.get(uid) || { count: 0, spent: 0 };
        existing.count++;
        if ((o as Record<string, unknown>).status !== "cancelled") existing.spent += total;
        orderMap.set(uid, existing);
      }

      const customers = (profiles || []).map((p: Record<string, unknown>) => ({
        user_id: p.id,
        first_name: p.first_name,
        last_name: p.last_name,
        phone: p.phone,
        email: emailMap.get(p.id) || "",
        order_count: orderMap.get(p.id as string)?.count || 0,
        total_spent: orderMap.get(p.id as string)?.spent || 0,
        joined_at: p.created_at,
      }));

      return json({ success: true, message: "Customers fetched", data: customers });
    }

    return errorResponse("Endpoint not found: " + path, 404);
  } catch (err) {
    return errorResponse("Server error: " + (err instanceof Error ? err.message : "Unknown error"), 500);
  }
});
