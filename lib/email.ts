import { Resend } from "resend";

/** Sends order receipt emails via Resend. No-op if RESEND_API_KEY isn't set
 * yet, so checkout never fails because email isn't configured — mirrors the
 * pattern used for WhatsApp owner alerts in lib/whatsapp.ts. */

function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export interface ReceiptLineItem {
  name: string;
  qty: number;
  price: number;
}

export interface OrderReceiptInput {
  to: string;
  customerName: string;
  orderNumber: string;
  items: ReceiptLineItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryMethod: string;
  deliveryAddress?: string;
}

function fmt(n: number) {
  return `KES ${n.toLocaleString()}`;
}

function receiptHtml(order: OrderReceiptInput): string {
  const rows = order.items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 0;color:#333;font-size:14px;">${i.name} × ${i.qty}</td>
        <td style="padding:8px 0;text-align:right;color:#333;font-size:14px;">${fmt(i.price * i.qty)}</td>
      </tr>`
    )
    .join("");

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a;">
    <div style="background:#1a1a1a;color:#fff;padding:20px 24px;text-align:center;">
      <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#c9a96e;">Styled.ke</div>
      <div style="font-size:20px;font-weight:bold;margin-top:4px;">Order Confirmed</div>
    </div>
    <div style="padding:24px;border:1px solid #eee;border-top:none;">
      <p style="font-size:14px;line-height:1.6;">Hi ${order.customerName.split(" ")[0]},</p>
      <p style="font-size:14px;line-height:1.6;">
        Thanks for shopping with Styled.ke! Here's your receipt for order
        <strong>${order.orderNumber}</strong>.
      </p>
      <table style="width:100%;border-collapse:collapse;margin:18px 0;">
        ${rows}
        <tr><td colspan="2" style="border-top:1px solid #eee;padding-top:10px;"></td></tr>
        <tr>
          <td style="padding:4px 0;color:#777;font-size:13px;">Subtotal</td>
          <td style="padding:4px 0;text-align:right;font-size:13px;">${fmt(order.subtotal)}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#777;font-size:13px;">Delivery (${order.deliveryMethod})</td>
          <td style="padding:4px 0;text-align:right;font-size:13px;">${
            order.deliveryFee > 0 ? fmt(order.deliveryFee) : "Confirmed with rider"
          }</td>
        </tr>
        <tr>
          <td style="padding:10px 0 0;font-weight:bold;font-size:15px;">Total</td>
          <td style="padding:10px 0 0;text-align:right;font-weight:bold;font-size:15px;color:#c9a96e;">${fmt(
            order.total
          )}</td>
        </tr>
      </table>
      ${
        order.deliveryAddress
          ? `<p style="font-size:13px;color:#777;">Delivering to: ${order.deliveryAddress}</p>`
          : ""
      }
      <p style="font-size:13px;line-height:1.6;color:#777;margin-top:18px;">
        We don't call before delivery — we'll get your order to you and this email is your
        confirmation. If you have questions in the meantime, reach us on WhatsApp:
        <strong>0734 807 511</strong>.
      </p>
    </div>
    <div style="text-align:center;padding:14px;font-size:11px;color:#aaa;">
      Styled.ke — Nairobi, Kenya
    </div>
  </div>`;
}

/** Sends the order receipt email. Fire-and-forget from the caller — never
 * throws, so a misconfigured or down email provider can't fail checkout. */
export async function sendOrderReceiptEmail(order: OrderReceiptInput): Promise<void> {
  const resend = getResendClient();
  if (!resend || !order.to) return;

  const from = process.env.RESEND_FROM_EMAIL || "Styled.ke <onboarding@resend.dev>";

  try {
    await resend.emails.send({
      from,
      to: order.to,
      subject: `Your Styled.ke receipt — ${order.orderNumber}`,
      html: receiptHtml(order),
    });
  } catch (err) {
    console.error("Failed to send receipt email:", err);
  }
}
