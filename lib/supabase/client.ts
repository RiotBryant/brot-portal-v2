// lib/supabase/client.ts
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Export singleton instance
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

// Export function to create new client instances
export const createClient = () => createSupabaseClient(supabaseUrl, supabaseAnonKey);

