import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookChallenge, verifyMetaSignature } from "@/lib/whatsapp";
import { createAdminClient } from "@/lib/supabase/server";
import { AUTOMATION_FLOWS } from "@/lib/mock-data";

/** Meta calls this with GET once, to verify the webhook URL when you first
 * configure it in the Meta App Dashboard. */
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  const result = verifyWebhookChallenge(mode, token, challenge);
  if (result) return new NextResponse(result, { status: 200 });
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

/** Meta POSTs every inbound message and status update here. We store the
 * message, run the automation-flow keyword matcher, and notify the admin
 * dashboard via Supabase Realtime (the dashboard subscribes to
 * whatsapp_messages inserts). */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const valid = await verifyMetaSignature(rawBody, req.headers.get("x-hub-signature-256"));
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  const body = JSON.parse(rawBody);

  const entry = body.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;
  const message = value?.messages?.[0];

  if (!message) {
    // Likely a status update (sent/delivered/read) rather than a new message.
    return NextResponse.json({ received: true });
  }

  const from: string = message.from;
  const text: string = message.text?.body || "";
  const contactName: string = value?.contacts?.[0]?.profile?.name || from;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = createAdminClient();

    let { data: conversation } = await supabase
      .from("whatsapp_conversations")
      .select("id")
      .eq("wa_phone", from)
      .maybeSingle();

    if (!conversation) {
      const { data: newConv } = await supabase
        .from("whatsapp_conversations")
        .insert({ wa_phone: from, wa_contact_name: contactName, status: "bot" })
        .select("id")
        .single();
      conversation = newConv;
    }

    if (conversation) {
      await supabase.from("whatsapp_messages").insert({
        conversation_id: conversation.id,
        wa_message_id: message.id,
        direction: "inbound",
        content: text,
        status: "delivered",
      });

      await supabase
        .from("whatsapp_conversations")
        .update({
          last_message_at: new Date().toISOString(),
          unread_count: 1,
        })
        .eq("id", conversation.id);
    }
  }

  // Simple keyword automation matcher — first matching active flow wins.
  const lower = text.toLowerCase();
  const flow = AUTOMATION_FLOWS.find((f) =>
    f.is_active &&
    f.trigger_keyword.split(",").some((kw) => lower.includes(kw.trim()))
  );

  if (flow) {
    // In production this calls sendWhatsAppText(from, flow.response_content).
    console.log(`[whatsapp bot] matched "${flow.name}" for ${from}: ${flow.response_content}`);
  }

  return NextResponse.json({ received: true });
}
