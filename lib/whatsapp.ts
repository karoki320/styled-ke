// Meta WhatsApp Cloud API client. All calls run server-side using
// WHATSAPP_TOKEN — never expose it to the browser. See app/api/whatsapp for
// the webhook receiver and send endpoint that use these helpers.
const GRAPH_VERSION = "v20.0";

function graphUrl(path: string): string {
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  if (!phoneId) {
    throw new Error(
      "WHATSAPP_PHONE_ID is not set. Add it to .env.local (see .env.example)."
    );
  }
  return `https://graph.facebook.com/${GRAPH_VERSION}/${phoneId}/${path}`;
}

function authHeaders(): HeadersInit {
  const token = process.env.WHATSAPP_TOKEN;
  if (!token) {
    throw new Error(
      "WHATSAPP_TOKEN is not set. Add it to .env.local (see .env.example)."
    );
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

/** Send a free-form text message. Only usable within Meta's 24h customer
 * service window — outside it, use sendWhatsAppTemplate instead. */
export async function sendWhatsAppText(to: string, body: string) {
  const res = await fetch(graphUrl("messages"), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body },
    }),
  });
  if (!res.ok) throw new Error(`WhatsApp send failed: ${await res.text()}`);
  return res.json();
}

/** Send a pre-approved template message (works outside the 24h window —
 * required for proactive notifications like order status updates). */
export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  variables: Record<string, string> = {},
  languageCode = "en"
) {
  const parameters = Object.values(variables).map((text) => ({
    type: "text",
    text,
  }));
  const res = await fetch(graphUrl("messages"), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode },
        components: parameters.length
          ? [{ type: "body", parameters }]
          : undefined,
      },
    }),
  });
  if (!res.ok)
    throw new Error(`WhatsApp template send failed: ${await res.text()}`);
  return res.json();
}

/** Notify the store owner of a new order (called right after order creation). */
export async function notifyOwnerNewOrder(order: {
  order_number: string;
  customer_name: string;
  total: number;
  items_summary: string;
}) {
  const ownerNumber = process.env.OWNER_WHATSAPP_NUMBER;
  if (!ownerNumber) return; // not configured yet — no-op rather than throw
  await sendWhatsAppText(
    ownerNumber,
    `🔔 New order ${order.order_number}\n👤 ${order.customer_name}\n🛍 ${order.items_summary}\n💰 KES ${order.total.toLocaleString()}`
  );
}

/** Notify the customer their order was confirmed. Uses the approved
 * `order_confirmed` template so it works outside the 24h session window. */
export async function notifyCustomerOrderConfirmed(
  phone: string,
  vars: { customer_name: string; order_number: string; total: string; items: string }
) {
  return sendWhatsAppTemplate(phone, "order_confirmed", vars);
}

export function verifyWebhookChallenge(
  mode: string | null,
  token: string | null,
  challenge: string | null
): string | null {
  if (
    mode === "subscribe" &&
    token === process.env.WHATSAPP_VERIFY_TOKEN &&
    challenge
  ) {
    return challenge;
  }
  return null;
}

/**
 * Verifies Meta's `X-Hub-Signature-256` header on inbound webhook POSTs
 * (HMAC SHA256 of the raw body, keyed with the app's secret — find it in
 * the Meta App Dashboard under Settings -> Basic -> App Secret).
 *
 * Returns true when WHATSAPP_APP_SECRET isn't configured yet, same
 * graceful-degradation philosophy as the rest of this app when an
 * integration isn't wired up — but that means the endpoint is unverified
 * until it is. Set WHATSAPP_APP_SECRET to actually enforce this: without
 * it, anyone who finds this URL (a predictable, publicly-guessable path)
 * can POST fake "incoming message" payloads that land straight in the
 * admin WhatsApp dashboard and the automation-flow keyword matcher. */
export async function verifyMetaSignature(rawBody: string, signatureHeader: string | null): Promise<boolean> {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret) return true; // not configured — see doc comment above
  if (!signatureHeader?.startsWith("sha256=")) return false;

  const crypto = await import("node:crypto");
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const provided = signatureHeader.slice("sha256=".length);

  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(provided, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
