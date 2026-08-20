import { NextResponse } from "next/server";
import { createAdminClient, requireAdmin } from "@/lib/supabase/server";

// Without this, Next statically optimizes a param-less GET with no other
// dynamic signal at build time — meaning the is_admin auth check and the
// DB query would run ONCE at build time and that single cached result
// would be served to every visitor after. Confirmed this actually happens:
// the build output listed this route as "○ (Static)" until this was added.
export const dynamic = "force-dynamic";

/**
 * Raw data for the admin analytics dashboard — combines online orders
 * (website + WhatsApp, via the `orders`/`order_items` tables) with in-person
 * POS sales (via `pos_sales`, tagged with which branch made the sale).
 *
 * Returns raw-ish rows rather than pre-aggregated chart data on purpose:
 * the dashboard does its own bucketing/grouping client-side (same pattern
 * every other admin page uses for its Supabase data), so tweaking what the
 * charts show doesn't require redeploying this route.
 *
 * Auth: orders/order_items have no admin-wide RLS SELECT policy (see the
 * comment in supabase/migrations/0001_init.sql — a signed-in customer can
 * only see their own orders, by design) — admin-wide reads are meant to go
 * through a server route with the service-role key, same as every write in
 * this app already does. middleware.ts only gates page navigation under
 * /admin, not routes under /api, so this route re-checks is_admin itself
 * rather than trusting that the request came from an already-gated page.
 */
export async function GET() {
  const isSupabaseConfigured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!isSupabaseConfigured) {
    return NextResponse.json({ configured: false });
  }

  const caller = await requireAdmin();
  if (!caller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const [ordersRes, itemsRes, posRes] = await Promise.all([
    admin
      .from("orders")
      .select("id, order_number, source, status, payment_status, payment_method, total, created_at")
      .order("created_at", { ascending: true }),
    admin.from("order_items").select("order_id, product_name, quantity, subtotal"),
    admin
      .from("pos_sales")
      .select("sale_number, items, total, payment_method, branch, created_at")
      .order("created_at", { ascending: true }),
  ]);

  if (ordersRes.error || itemsRes.error || posRes.error) {
    console.error("Analytics fetch failed:", ordersRes.error || itemsRes.error || posRes.error);
    return NextResponse.json({ error: "Failed to load analytics data" }, { status: 500 });
  }

  return NextResponse.json({
    configured: true,
    orders: ordersRes.data || [],
    orderItems: itemsRes.data || [],
    posSales: posRes.data || [],
  });
}
