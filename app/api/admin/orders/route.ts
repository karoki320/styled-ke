import { NextResponse } from "next/server";
import { createAdminClient, requireAdmin } from "@/lib/supabase/server";

// Same static-optimization trap as /api/admin/analytics: a param-less GET
// with no other dynamic signal gets frozen at build time otherwise. See the
// comment there for how this was confirmed via build output.
export const dynamic = "force-dynamic";

/**
 * Real orders for the admin Orders page. This page used to render the
 * hardcoded `ORDERS` sample array from lib/mock-data.ts unconditionally —
 * meaning every order actually placed through the storefront or WhatsApp
 * was saved to Supabase correctly, but never showed up here. This route
 * (and the page that now calls it) fixes that.
 *
 * Auth: orders/customers/order_items have no admin-wide RLS SELECT policy
 * (see supabase/migrations/0001_init.sql — a signed-in customer can only
 * see their own orders, by design), so this reads via the service-role
 * client and re-checks is_admin itself — middleware.ts only gates page
 * navigation under /admin, not routes under /api.
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
  const { data, error } = await admin
    .from("orders")
    .select(
      `id, order_number, status, source, subtotal, delivery_fee, total,
       delivery_method, delivery_address, delivery_city, delivery_zone, delivery_agent,
       payment_method, payment_status, created_at,
       customers ( full_name, phone ),
       order_items ( product_name, quantity )`
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Admin orders fetch failed:", error);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }

  return NextResponse.json({ configured: true, orders: data });
}
