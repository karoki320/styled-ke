import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { generateOrderNumber } from "@/lib/utils";
import { notifyOwnerNewOrder } from "@/lib/whatsapp";
import { sendOrderReceiptEmail } from "@/lib/email";

export interface CreateOrderPayload {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  items: { productId: string; name: string; price: number; qty: number }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryMethod: string;
  deliveryDetails: Record<string, string>;
  paymentMethod: "paystack" | "mpesa";
  source?: "website" | "pos" | "whatsapp";
}

/** Creates an order. Writes to Supabase when configured (NEXT_PUBLIC_SUPABASE_URL
 * + SUPABASE_SERVICE_ROLE_KEY present); otherwise returns a mock confirmation
 * so the storefront stays fully clickable during local development. */
export async function POST(req: NextRequest) {
  const body = (await req.json()) as CreateOrderPayload;

  if (!body.name || !body.phone || !body.items?.length) {
    return NextResponse.json(
      { error: "Missing required order fields (name, phone, items)." },
      { status: 400 }
    );
  }

  const orderNumber = generateOrderNumber();
  const isSupabaseConfigured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  // We don't call customers to confirm — the emailed receipt is the
  // confirmation. Fire-and-forget: sendOrderReceiptEmail no-ops quietly if
  // no email was given or Resend isn't configured yet.
  const sendReceipt = (finalOrderNumber: string) => {
    if (!body.email) return;
    const addressParts = [
      body.deliveryDetails.delivery_address,
      body.deliveryDetails.delivery_zone,
      body.deliveryDetails.delivery_agent,
      body.deliveryDetails.delivery_city,
    ].filter(Boolean);
    sendOrderReceiptEmail({
      to: body.email,
      customerName: body.name,
      orderNumber: finalOrderNumber,
      items: body.items.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
      subtotal: body.subtotal,
      deliveryFee: body.deliveryFee,
      total: body.total,
      deliveryMethod: body.deliveryMethod,
      deliveryAddress: addressParts.length ? addressParts.join(", ") : undefined,
    }).catch(() => {
      // Non-fatal — logged inside sendOrderReceiptEmail.
    });
  };

  if (isSupabaseConfigured) {
    try {
      const supabase = createAdminClient();

      let { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("phone", body.phone)
        .maybeSingle();

      if (!customer) {
        const { data: newCustomer, error: custErr } = await supabase
          .from("customers")
          .insert({ full_name: body.name, phone: body.phone, email: body.email })
          .select("id")
          .single();
        if (custErr) throw custErr;
        customer = newCustomer;
      }

      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          customer_id: customer!.id,
          status: "pending",
          source: body.source || "website",
          subtotal: body.subtotal,
          delivery_fee: body.deliveryFee,
          total: body.total,
          delivery_method: body.deliveryMethod,
          delivery_notes: body.notes,
          payment_method: body.paymentMethod,
          payment_status: "pending",
          ...body.deliveryDetails,
        })
        .select("id, order_number")
        .single();
      if (orderErr) throw orderErr;

      // item.productId comes from the storefront's cart, which now sources
      // products from Supabase (real uuid ids). Guard with a uuid check
      // anyway so any stale cart still holding an old mock id (e.g. "1")
      // from before the catalog migration degrades gracefully to null
      // instead of failing the whole insert.
      const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const { error: itemsErr } = await supabase.from("order_items").insert(
        body.items.map((item) => ({
          order_id: order.id,
          product_id: UUID_RE.test(item.productId) ? item.productId : null,
          product_name: item.name,
          unit_price: item.price,
          quantity: item.qty,
          subtotal: item.price * item.qty,
        }))
      );
      if (itemsErr) throw itemsErr;

      notifyOwnerNewOrder({
        order_number: order.order_number,
        customer_name: body.name,
        total: body.total,
        items_summary: body.items.map((i) => i.name).join(", "),
      }).catch(() => {
        // Non-fatal — WhatsApp isn't configured yet or the send failed.
      });
      // Only manual M-Pesa Paybill has no automated payment signal — the
      // customer pays outside the app and nothing calls back to confirm it,
      // so order placement IS the confirmation there (matches the checkout
      // copy: "your receipt is emailed the moment you order"). Paystack
      // (card / instant M-Pesa) orders get their receipt from
      // markOrderPaidAndNotify() once payment is actually confirmed — see
      // app/api/paystack/webhook and /verify. Emailing a "here's your
      // receipt" here, before the customer has even reached Paystack's
      // payment page, would confirm an order nobody has paid for yet.
      if (body.paymentMethod === "mpesa") {
        sendReceipt(order.order_number);
      }

      return NextResponse.json({ id: order.id, orderNumber: order.order_number });
    } catch (err) {
      console.error("Order creation failed, falling back to mock:", err);
    }
  }

  // Mock path — no Supabase configured yet. Still email a receipt if Resend
  // is configured, so that piece can be tested/used independently.
  sendReceipt(orderNumber);
  return NextResponse.json({ id: `mock-${Date.now()}`, orderNumber, mock: true });
}
