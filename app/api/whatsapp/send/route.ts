import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppText, sendWhatsAppTemplate } from "@/lib/whatsapp";
import { createAdminClient } from "@/lib/supabase/server";

/** Used by the admin WhatsApp dashboard (and order status "Notify" buttons)
 * to send an outbound message. Body: { to, text } for free-form text, or
 * { to, template, variables } for a template send. */
export async function POST(req: NextRequest) {
  const { to, text, template, variables, conversationId } = await req.json();

  if (!to || (!text && !template)) {
    return NextResponse.json(
      { error: "`to` and either `text` or `template` are required." },
      { status: 400 }
    );
  }

  if (!process.env.WHATSAPP_TOKEN || !process.env.WHATSAPP_PHONE_ID) {
    return NextResponse.json(
      {
        error:
          "WhatsApp isn't configured yet. Add WHATSAPP_TOKEN and WHATSAPP_PHONE_ID to enable sending.",
      },
      { status: 501 }
    );
  }

  try {
    const result = template
      ? await sendWhatsAppTemplate(to, template, variables || {})
      : await sendWhatsAppText(to, text);

    if (
      conversationId &&
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      const supabase = createAdminClient();
      await supabase.from("whatsapp_messages").insert({
        conversation_id: conversationId,
        direction: "outbound",
        content: text || `[template: ${template}]`,
        status: "sent",
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to send WhatsApp message." }, { status: 502 });
  }
}
