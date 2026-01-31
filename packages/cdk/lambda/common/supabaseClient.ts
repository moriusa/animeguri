import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Supabase URL or anon key is missing");
}

// ✅ モジュールロード時に1回だけ実行
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
