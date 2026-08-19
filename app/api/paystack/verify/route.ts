import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/lib/paystack";
import { createAdminClient } from "@/lib/supabase/server";
import { markOrderPaidAndNotify } from "@/lib/orders";

/** Paystack redirects the customer's browser here (via callback_url) after
 * checkout. We verify the transaction server-side, mark the order paid, and
 * bounce the customer to the success page.
 *
 * This is also a fallback confirmation path, not just a redirect — a lot of
 * small shops never get around to configuring the webhook URL in their
 * Paystack dashboard, and without this, a card/instant-M-Pesa order would
 * never get its "you're confirmed" email or WhatsApp at all.
 * markOrderPaidAndNotify() is idempotent, so it's safe for both this route
 * and the webhook to race to confirm the same order — see lib/orders.ts. */
export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

  if (!reference) {
    return NextResponse.redirect(`${appUrl}/checkout`);
  }

  try {
    const result = await verifyPayment(reference);

    if (result.data.status === "success") {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const supabase = createAdminClient();
        await markOrderPaidAndNotify(supabase, reference, reference);
      }

      const params = new URLSearchParams({
        order: reference,
        total: String(result.data.amount / 100),
      });
      return NextResponse.redirect(`${appUrl}/checkout/success?${params.toString()}`);
    }

    return NextResponse.redirect(`${appUrl}/checkout?payment=failed`);
  } catch (err) {
    console.error(err);
    return NextResponse.redirect(`${appUrl}/checkout?payment=error`);
  }
}
