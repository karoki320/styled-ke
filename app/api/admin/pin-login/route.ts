import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Quick-access admin login for in-person demos (client meetings, etc.),
 * where typing a full email + password on someone else's phone or a
 * conference-room screen isn't practical.
 *
 * This is NOT a separate, weaker auth system — it's a shortcut that ends
 * up in exactly the same signed-in state as the email/password form on
 * /account. A correct PIN just tells this route to run the real
 * supabase.auth.signInWithPassword() sign-in on the visitor's behalf,
 * using one real admin account's credentials kept server-side only
 * (ADMIN_LOGIN_EMAIL / ADMIN_LOGIN_PASSWORD). The resulting session cookie
 * is the same cookie middleware.ts and requireAdmin() already check against
 * profiles.is_admin — so RLS, the admin-gate middleware, and every /api
 * route's requireAdmin() call all keep working exactly as before. The PIN
 * itself is never accepted as proof of adminship by anything except this
 * one route.
 *
 * Basic brute-force protection: a small in-memory attempt counter per IP.
 * This resets on every deploy/restart and isn't shared across serverless
 * instances — it's a speed bump for someone fat-fingering a PIN, not a
 * substitute for a strong PIN. Use a real passphrase in ADMIN_PIN, not a
 * short numeric code, since anyone who guesses it gets full admin access.
 */

const attempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const now = Date.now();
  const entry = attempts.get(ip);

  if (entry && entry.lockedUntil > now) {
    const waitMin = Math.ceil((entry.lockedUntil - now) / 60000);
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${waitMin} minute${waitMin === 1 ? "" : "s"}.` },
      { status: 429 }
    );
  }

  const pin = process.env.ADMIN_PIN;
  const email = process.env.ADMIN_LOGIN_EMAIL;
  const password = process.env.ADMIN_LOGIN_PASSWORD;

  if (!pin || !email || !password) {
    return NextResponse.json(
      { error: "PIN login isn't configured yet — set ADMIN_PIN, ADMIN_LOGIN_EMAIL and ADMIN_LOGIN_PASSWORD." },
      { status: 501 }
    );
  }

  let body: { pin?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body.pin || body.pin !== pin) {
    const count = (entry?.count || 0) + 1;
    attempts.set(ip, {
      count,
      lockedUntil: count >= MAX_ATTEMPTS ? now + LOCKOUT_MS : 0,
    });
    return NextResponse.json({ error: "Incorrect PIN." }, { status: 401 });
  }

  attempts.delete(ip);

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("PIN login: underlying admin sign-in failed:", error.message);
      return NextResponse.json(
        { error: "PIN was correct but the admin account sign-in failed. Check ADMIN_LOGIN_EMAIL/PASSWORD." },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PIN login error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
