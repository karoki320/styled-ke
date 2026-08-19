import { NextRequest, NextResponse } from "next/server";
import { buildBluetoothPrintPayload, type ReceiptData } from "@/lib/pos-printer";

export const dynamic = "force-dynamic";

/**
 * Response endpoint for the "Bluetooth Print" Android app (see
 * lib/pos-printer.ts for the full explanation). The app fetches this URL
 * itself — over the phone's own connection, independent of the admin's
 * browser tab — after being launched via a my.bluetoothprint.scheme://
 * link, and prints whatever JSON array comes back.
 *
 * Stateless by design: the receipt data is round-tripped through the URL
 * itself (base64 in the `d` query param, built client-side in
 * buildBluetoothPrintAppUrl) rather than looked up from a database, so
 * this route never touches Supabase or exposes anything the admin's own
 * browser didn't already have.
 */
const MAX_PAYLOAD_LEN = 4000; // generous for a multi-item receipt; guards against abuse

function fallback(message: string) {
  return NextResponse.json(
    [{ type: 0, content: message, bold: 1, align: 1, format: 0 }],
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("d");
  if (!raw || raw.length > MAX_PAYLOAD_LEN) {
    return fallback("No receipt data received.");
  }

  try {
    const b64 = raw.replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(b64, "base64").toString("utf-8");
    const data = JSON.parse(json) as ReceiptData;
    const width = req.nextUrl.searchParams.get("w") === "80" ? 42 : 32;
    const items = buildBluetoothPrintPayload(data, width);
    return NextResponse.json(items, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return fallback("Could not read this receipt.");
  }
}
