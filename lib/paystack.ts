// Paystack integration — card + M-Pesa (via Paystack's Kenya mobile money
// channel) checkout. All calls run server-side; PAYSTACK_SECRET_KEY must
// never reach the browser.
const PAYSTACK_BASE_URL = "https://api.paystack.co";

function secretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error(
      "PAYSTACK_SECRET_KEY is not set. Add it to .env.local (see .env.example)."
    );
  }
  return key;
}

export interface InitializePaymentInput {
  email: string;
  amount: number; // in KES — converted to kobo/cents internally
  reference: string;
  callback_url: string;
  metadata?: Record<string, unknown>;
}

export interface InitializePaymentResult {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export async function initializePayment(
  input: InitializePaymentInput
): Promise<InitializePaymentResult> {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: Math.round(input.amount * 100), // KES -> kobo-equivalent subunit
      currency: "KES",
      reference: input.reference,
      callback_url: input.callback_url,
      metadata: input.metadata,
      channels: ["card", "mobile_money", "bank"],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Paystack initialize failed (${res.status}): ${body}`);
  }
  return res.json();
}

export interface VerifyPaymentResult {
  status: boolean;
  message: string;
  data: {
    status: "success" | "failed" | "abandoned";
    reference: string;
    amount: number;
    currency: string;
    paid_at: string | null;
    metadata: Record<string, unknown>;
  };
}

export async function verifyPayment(
  reference: string
): Promise<VerifyPaymentResult> {
  const res = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secretKey()}` } }
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Paystack verify failed (${res.status}): ${body}`);
  }
  return res.json();
}

/** Verify the `x-paystack-signature` header on incoming webhooks using HMAC
 * SHA512 of the raw request body, per Paystack's webhook security docs. */
export async function verifyWebhookSignature(
  rawBody: string,
  signature: string | null
): Promise<boolean> {
  if (!signature) return false;
  const crypto = await import("node:crypto");
  const hash = crypto.createHmac("sha512", secretKey()).update(rawBody).digest("hex");
  // Plain `===` on a secret comparison leaks timing information (it returns
  // on the first mismatched character) — negligible odds of a practical
  // exploit here, but it's a one-line fix and the textbook-correct way to
  // compare an HMAC, so there's no reason not to. Length check first since
  // timingSafeEqual throws on mismatched buffer lengths rather than just
  // returning false.
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(signature, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
