import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/lib/paystack";
import { createAdminClient } from "@/lib/supabase/server";

/** Paystack redirects the customer's browser here (via callback_url) after
 * checkout. We verify the transaction server-side, mark the order paid, and
 * bounce the customer to the success page. */
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
        await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            status: "confirmed",
            paystack_reference: reference,
            paid_at: new Date().toISOString(),
            confirmed_at: new Date().toISOString(),
          })
          .eq("order_number", reference);
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
