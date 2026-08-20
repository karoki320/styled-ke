import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paystack";
import { createAdminClient } from "@/lib/supabase/server";
import { markOrderPaidAndNotify } from "@/lib/orders";

/** Paystack's server-to-server webhook — the reliable source of truth for
 * payment status (the browser redirect in /api/paystack/verify can be
 * closed/interrupted by the customer, this cannot). Configure this URL
 * (https://yourdomain/api/paystack/webhook) in the Paystack dashboard.
 *
 * The actual "mark paid + email receipt + WhatsApp the customer" work lives
 * in lib/orders.ts (markOrderPaidAndNotify), shared with the verify-redirect
 * route below — both can end up confirming the same order, and that
 * function is what keeps a customer from getting the receipt twice. */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  const valid = await verifyWebhookSignature(rawBody, signature);
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "charge.success") {
    const { reference, amount } = event.data;

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createAdminClient();
      // amount is in kobo/cents from Paystack, per their API — /100 for KES.
      await markOrderPaidAndNotify(supabase, reference, reference, amount / 100);
    }
  }

  return NextResponse.json({ received: true });
}
