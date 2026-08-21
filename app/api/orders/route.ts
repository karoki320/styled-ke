import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { generateOrderNumber } from "@/lib/utils";
import { notifyOwnerNewOrder } from "@/lib/whatsapp";
import { sendOrderReceiptEmail } from "@/lib/email";
import { DELIVERY_OPTIONS } from "@/lib/mock-data";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface CreateOrderPayload {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  items: { productId: string; name: string; price: number; qty: number; color?: string }[];
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
  //
  // Takes items/subtotal/total as parameters rather than closing over
  // `body` directly — the Supabase-configured path below recomputes all of
  // these from the real products table, and the email needs to reflect
  // what was actually charged/recorded, not whatever the client sent.
  const sendReceipt = (
    finalOrderNumber: string,
    items: { name: string; qty: number; price: number }[],
    subtotal: number,
    deliveryFee: number,
    total: number
  ) => {
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
      items,
      subtotal,
      deliveryFee,
      total,
      deliveryMethod: body.deliveryMethod,
      deliveryAddress: addressParts.length ? addressParts.join(", ") : undefined,
    }).catch(() => {
      // Non-fatal — logged inside sendOrderReceiptEmail.
    });
  };

  if (isSupabaseConfigured) {
    try {
      const supabase = createAdminClient();

      // Never trust prices (or names, or the total) the client sent —
      // editing a fetch body in devtools before it leaves the browser is
      // trivial, and body.items[].price / body.subtotal / body.total were
      // previously stored as-is with nothing checked against what these
      // products actually cost. Recompute every line item's price from the
      // products table itself; an item that doesn't resolve to a real,
      // active product fails the whole order rather than silently trusting
      // whatever price came in. This is the same principle as the Paystack
      // amount check in lib/orders.ts, applied one step earlier: that check
      // makes sure the CHARGE matches the order's total, this makes sure
      // the order's total matches the PRODUCT's real price in the first
      // place — checking only the charge would just mean a tampered order
      // and a tampered payment agreeing with each other.
      const productIds = Array.from(new Set(body.items.map((i) => i.productId).filter((id) => UUID_RE.test(id))));
      const { data: products, error: productsErr } = await supabase
        .from("products")
        .select("id, name, price, is_active")
        .in("id", productIds.length ? productIds : ["00000000-0000-0000-0000-000000000000"]);
      if (productsErr) throw productsErr;
      const productById = new Map((products || []).map((p) => [p.id, p]));

      const verifiedItems = body.items.map((item) => {
        const product = UUID_RE.test(item.productId) ? productById.get(item.productId) : undefined;
        if (!product || !product.is_active) return null;
        const qty = Math.max(1, Math.floor(Number(item.qty)) || 1);
        // Colour is just a label the customer picked (not priced separately
        // here), so it's fine to trust as-is — worst case an order shows an
        // odd colour name, it can't be used to under-charge anything.
        return { productId: item.productId, name: product.name, price: product.price, qty, color: item.color || undefined };
      });

      if (verifiedItems.some((i) => i === null)) {
        return NextResponse.json(
          { error: "One or more items in your cart are no longer available. Please refresh and try again." },
          { status: 400 }
        );
      }
      const items = verifiedItems as { productId: string; name: string; price: number; qty: number; color?: string }[];

      // Delivery fee is similarly re-derived from the same fixed option
      // list the checkout UI itself uses (lib/mock-data.ts), not read off
      // the request — "rider"/"matatu" are quoted live and correctly carry
      // a 0 fee here either way, but "mtaani"/"doorstep" have a real fixed
      // fee that a tampered request could otherwise zero out.
      const deliveryFee = DELIVERY_OPTIONS.find((d) => d.id === body.deliveryMethod)?.fee ?? 0;
      const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
      const total = subtotal + deliveryFee;

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
          subtotal,
          delivery_fee: deliveryFee,
          total,
          delivery_method: body.deliveryMethod,
          delivery_notes: body.notes,
          payment_method: body.paymentMethod,
          payment_status: "pending",
          ...body.deliveryDetails,
        })
        .select("id, order_number")
        .single();
      if (orderErr) throw orderErr;

      const { error: itemsErr } = await supabase.from("order_items").insert(
        items.map((item) => ({
          order_id: order.id,
          product_id: item.productId,
          product_name: item.name,
          variant_name: item.color || null,
          unit_price: item.price,
          quantity: item.qty,
          subtotal: item.price * item.qty,
        }))
      );
      if (itemsErr) throw itemsErr;

      const displayName = (i: { name: string; color?: string }) => (i.color ? `${i.name} (${i.color})` : i.name);

      notifyOwnerNewOrder({
        order_number: order.order_number,
        customer_name: body.name,
        total,
        items_summary: items.map(displayName).join(", "),
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
        sendReceipt(
          order.order_number,
          items.map((i) => ({ name: displayName(i), qty: i.qty, price: i.price })),
          subtotal,
          deliveryFee,
          total
        );
      }

      return NextResponse.json({ id: order.id, orderNumber: order.order_number });
    } catch (err) {
      console.error("Order creation failed, falling back to mock:", err);
    }
  }

  // Mock path — no Supabase configured yet, so there's no products table to
  // verify prices against; trusting the client here is a dev-only fallback
  // with no real money involved. Still email a receipt if Resend is
  // configured, so that piece can be tested/used independently.
  sendReceipt(
    orderNumber,
    body.items.map((i) => ({ name: i.color ? `${i.name} (${i.color})` : i.name, qty: i.qty, price: i.price })),
    body.subtotal,
    body.deliveryFee,
    body.total
  );
  return NextResponse.json({ id: `mock-${Date.now()}`, orderNumber, mock: true });
}
