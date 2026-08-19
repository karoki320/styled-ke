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
