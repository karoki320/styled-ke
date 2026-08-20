import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, requireAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const VALID_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

// Mirrors the *_at timestamp columns on `orders` (see 0001_init.sql) so the
// order timeline reflects when a status actually changed, not just that it
// did. Statuses with no dedicated column (pending, processing, cancelled)
// simply don't set one.
const TIMESTAMP_FIELD: Record<string, string> = {
  confirmed: "confirmed_at",
  shipped: "shipped_at",
  delivered: "delivered_at",
};

/** Updates an order's status. Admin-only — same requireAdmin() gate every
 * other admin-mutating route uses, since middleware.ts doesn't cover /api. */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const isSupabaseConfigured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "Supabase isn't configured." }, { status: 400 });
  }

  const caller = await requireAdmin();
  if (!caller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { status } = (await req.json()) as { status?: string };
  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const admin = createAdminClient();
  const update: Record<string, string> = { status };
  const tsField = TIMESTAMP_FIELD[status];
  if (tsField) update[tsField] = new Date().toISOString();

  const { error } = await admin.from("orders").update(update).eq("id", params.id);
  if (error) {
    console.error("Order status update failed:", error);
    return NextResponse.json({ error: "Failed to update order." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
