"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

/** Browser-side Supabase client — safe to use in Client Components. Reads
 * only, subject to Row Level Security (see supabase/migrations/0001_init.sql). */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
