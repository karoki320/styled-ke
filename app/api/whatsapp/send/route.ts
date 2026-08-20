import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppText, sendWhatsAppTemplate } from "@/lib/whatsapp";
import { createAdminClient, requireAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Used by the admin WhatsApp dashboard (and order status "Notify" buttons)
 * to send an outbound message. Body: { to, text } for free-form text, or
 * { to, template, variables } for a template send.
 *
 * This was reachable with no auth at all before — anyone who found the URL
 * could POST any `to` number and blast messages from the business's real
 * WhatsApp number, which both costs money per Meta's pricing and risks
 * Meta suspending the number for abuse. requireAdmin() closes that. */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
