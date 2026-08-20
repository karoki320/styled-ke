import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient as createRawClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/** Server Component / Route Handler client — respects the signed-in user's
 * session and RLS. Use in Server Components, Server Actions, and API routes
 * that act on behalf of a customer. */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — middleware refreshes the
            // session instead, so this can be safely ignored.
          }
        },
      },
    }
  );
}

/** Service-role client — bypasses RLS entirely. Use ONLY in trusted
 * server-side code (API routes, webhooks, admin actions). Never import this
 * from a Client Component or expose the key to the browser. */
export function createAdminClient() {
  return createRawClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/** Re-checks "is this a signed-in admin?" from inside an API route.
 *
 * middleware.ts already gates page navigation under /admin, but it does
 * NOT run for routes under /api — those are reachable directly regardless
 * of which page (if any) linked to them. Any /api route that reads or acts
 * on data beyond what an anonymous storefront visitor should see (cross-
 * customer data, sending real WhatsApp messages, etc.) needs this check
 * itself rather than assuming the request came from an already-gated page.
 * Returns null when there's no signed-in admin — callers should respond
 * 401/403 and stop. */
export async function requireAdmin(): Promise<{ id: string } | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // Can't verify anyone's identity without Supabase configured — fail
    // closed rather than skip the check, unlike middleware.ts's page-level
    // dev-convenience bypass. There's no legitimate "local dev without
    // Supabase" reason to let real WhatsApp sends or cross-customer data
    // reads through unauthenticated.
    return null;
  }
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
    if (!profile?.is_admin) return null;
    return { id: user.id };
  } catch (err) {
    console.error("requireAdmin: auth check failed:", err);
    return null;
  }
}

/** Public-read client — anon key, no session/cookies. Use for storefront
 * reads that are the same for every visitor (product catalogue, hero
 * slides, announcements — all gated by "is_active = true" RLS policies
 * anyone can read). Unlike `createClient()`, this never touches
 * `next/headers` cookies(), so pages using it are NOT forced into fully
 * dynamic (uncached, per-request) rendering — they can use `revalidate`
 * and actually get served from cache. Never use this for anything that
 * needs to know who's signed in. */
export function createPublicClient() {
  return createRawClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
