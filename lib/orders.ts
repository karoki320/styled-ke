import type { createAdminClient } from "@/lib/supabase/server";
import { notifyCustomerOrderConfirmed } from "@/lib/whatsapp";
import { sendOrderReceiptEmail } from "@/lib/email";

type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * The single place that marks a Paystack order as paid and fires the
 * customer-facing "you're confirmed" notifications (WhatsApp + email
 * receipt). Called from both the Paystack webhook (the reliable
 * server-to-server source of truth) and the browser verify redirect (a
 * fallback for shops that haven't configured the webhook URL in their
 * Paystack dashboard yet — easy to forget, and without it no email would
 * ever go out for card/instant-M-Pesa orders).
 *
 * Idempotency matters here because both of those can end up racing to
 * confirm the same order (webhook retries, or webhook + redirect both
 * firing for one payment) — sending a customer two "your order is
 * confirmed" emails reads as broken, not thorough. The guard is the
 * `.eq("payment_status", "pending")` on the update itself: whichever call
 * gets there first flips the row to "paid" and gets it back from
 * `.select()`; every other call's WHERE clause no longer matches (the row
 * is already "paid"), so it gets zero rows back and quietly no-ops. No
 * separate lock or flag table needed — the state transition IS the lock.
 *
 * Manual M-Pesa Paybill orders never call this — they have no automated
 * payment signal at all, so their receipt is sent at order placement
 * instead (see app/api/orders/route.ts). This function is Paystack-only.
 */
export async function markOrderPaidAndNotify(
  supabase: AdminClient,
  orderNumber: string,
  paystackReference: string
): Promise<void> {
  const { data: order, error } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      status: "confirmed",
      paystack_reference: paystackReference,
      paid_at: new Date().toISOString(),
      confirmed_at: new Date().toISOString(),
    })
    .eq("order_number", orderNumber)
    .eq("payment_status", "pending") // idempotency guard — see doc comment above
    .select(
      "id, order_number, subtotal, delivery_fee, total, customer_id, delivery_method, delivery_address, delivery_city, delivery_zone, delivery_agent"
    )
    .maybeSingle();

  if (error) {
    console.error("markOrderPaidAndNotify: order update failed:", error);
    return;
  }
  // Already confirmed by the other caller (webhook vs. redirect), or the
  // reference doesn't match a known order — either way, nothing to notify.
  if (!order) return;

  const [{ data: items }, { data: customer }] = await Promise.all([
    supabase.from("order_items").select("product_name, quantity, unit_price").eq("order_id", order.id),
    order.customer_id
      ? supabase.from("customers").select("full_name, phone, email").eq("id", order.customer_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  if (customer?.phone) {
    notifyCustomerOrderConfirmed(customer.phone, {
      customer_name: customer.full_name,
      order_number: order.order_number,
      total: `KES ${order.total.toLocaleString()}`,
      items: (items || []).map((i) => i.product_name).join(", "),
    }).catch(() => {
      // Non-fatal — WhatsApp isn't configured yet or the send failed.
    });
  }

  if (customer?.email) {
    const addressParts = [order.delivery_address, order.delivery_zone, order.delivery_agent, order.delivery_city].filter(
      Boolean
    );
    sendOrderReceiptEmail({
      to: customer.email,
      customerName: customer.full_name,
      orderNumber: order.order_number,
      items: (items || []).map((i) => ({ name: i.product_name, qty: i.quantity, price: i.unit_price })),
      subtotal: order.subtotal,
      deliveryFee: order.delivery_fee,
      total: order.total,
      deliveryMethod: order.delivery_method || "delivery",
      deliveryAddress: addressParts.length ? addressParts.join(", ") : undefined,
    }).catch(() => {
      // Non-fatal — logged inside sendOrderReceiptEmail.
    });
  }
}
