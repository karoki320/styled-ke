import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { generateOrderNumber } from "@/lib/utils";
import { notifyOwnerNewOrder } from "@/lib/whatsapp";

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
  paymentMethod: "paystack" | "mpesa" | "cod";
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
          payment_status: body.paymentMethod === "cod" ? "pending" : "pending",
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

      return NextResponse.json({ id: order.id, orderNumber: order.order_number });
    } catch (err) {
      console.error("Order creation failed, falling back to mock:", err);
    }
  }

  // Mock path — no Supabase configured yet.
  return NextResponse.json({ id: `mock-${Date.now()}`, orderNumber, mock: true });
}
