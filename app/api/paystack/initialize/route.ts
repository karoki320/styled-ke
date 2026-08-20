import { NextRequest, NextResponse } from "next/server";
import { initializePayment } from "@/lib/paystack";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { email, amount: clientAmount, reference, metadata } = await req.json();

  if (!email || !clientAmount || !reference) {
    return NextResponse.json(
      { error: "email, amount and reference are required." },
      { status: 400 }
    );
  }

  if (!process.env.PAYSTACK_SECRET_KEY) {
    return NextResponse.json(
      {
        error:
          "Paystack isn't configured yet. Add PAYSTACK_SECRET_KEY to your environment to enable card/M-Pesa checkout.",
      },
      { status: 501 }
    );
  }

  // `amount` from the client is never trusted for what actually gets
  // charged — checkout's `reference` is the order_number /api/orders just
  // created, so the order's own stored total is the one number that
  // matters here. Without this, editing the request in devtools before it
  // leaves the browser (or replaying it with a smaller value) would
  // authorize a real payment for less than the order is worth, and nothing
  // downstream double-checked that Paystack actually collected the right
  // amount before marking the order confirmed. See lib/orders.ts for the
  // matching check on the confirmation side — that one stays regardless,
  // this closes the same gap at its source instead of just detecting it
  // after the fact.
  let amount = clientAmount;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = createAdminClient();
    const { data: order } = await supabase.from("orders").select("total").eq("order_number", reference).maybeSingle();
    if (order) {
      amount = order.total;
    } else {
      // No matching order — reference doesn't correspond to anything this
      // server created. Refuse rather than initialize a payment for a
      // number nobody can verify.
      return NextResponse.json({ error: "Unknown order reference." }, { status: 400 });
    }
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
    const result = await initializePayment({
      email,
      amount,
      reference,
      callback_url: `${appUrl}/api/paystack/verify?redirect=1`,
      metadata,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to initialize Paystack payment." },
      { status: 502 }
    );
  }
}
