import { NextRequest, NextResponse } from "next/server";
import { initializePayment } from "@/lib/paystack";

export async function POST(req: NextRequest) {
  const { email, amount, reference, metadata } = await req.json();

  if (!email || !amount || !reference) {
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
