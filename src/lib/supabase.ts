import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zvzzocbmyuihybmyljfh.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_rgEoHQxb_8mM-p8RXh_HaA_im7vJ8gw";

// Direct lightweight Supabase client (Zero Node.js runtime dependencies, 100% browser-safe)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
