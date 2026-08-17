import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paystack";
import { createAdminClient } from "@/lib/supabase/server";
import { notifyCustomerOrderConfirmed } from "@/lib/whatsapp";

/** Paystack's server-to-server webhook — the reliable source of truth for
 * payment status (the browser redirect in /api/paystack/verify can be
 * closed/interrupted by the customer, this cannot). Configure this URL
 * (https://yourdomain/api/paystack/webhook) in the Paystack dashboard. */
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
      const { data: order } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          status: "confirmed",
          paystack_reference: reference,
          paid_at: new Date().toISOString(),
          confirmed_at: new Date().toISOString(),
        })
        .eq("order_number", reference)
        .select("order_number, total, customer_id")
        .single();

      if (order?.customer_id) {
        const { data: cust } = await supabase
          .from("customers")
          .select("full_name, phone")
          .eq("id", order.customer_id)
          .maybeSingle();

        if (cust?.phone) {
          notifyCustomerOrderConfirmed(cust.phone, {
            customer_name: cust.full_name,
            order_number: order.order_number,
            total: `KES ${(amount / 100).toLocaleString()}`,
            items: "",
          }).catch(() => {});
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
