import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./types";

let globalAdminClient: ReturnType<typeof createSupabaseClient<Database>> | null = null;
let globalPublicClient: ReturnType<typeof createSupabaseClient<Database>> | null = null;

export function getSharedAdminClient(): ReturnType<typeof createSupabaseClient<Database>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase admin environment variables (URL or service role key)");
  }
  if (!globalAdminClient) {
    globalAdminClient = createSupabaseClient<Database>(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return globalAdminClient;
}

export function getSharedPublicClient(): ReturnType<typeof createSupabaseClient<Database>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase public environment variables (URL or anon key)");
  }
  if (!globalPublicClient) {
    globalPublicClient = createSupabaseClient<Database>(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return globalPublicClient;
}
