import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const supabaseUrlParamName = process.env.SUPABASE_URL!;
const supabaseAnonKeyParamName = process.env.SUPABASE_ANON_KEY!;
const ssmClient = new SSMClient({});
let supabase: SupabaseClient | null = null;

// ssmからsupabase認証情報取得
const getSupabaseConfig = async () => {
  console.log("getSupabaseConfig: start", {
    supabaseUrlParamName,
    supabaseAnonKeyParamName,
  });
  const [urlRes, keyRes] = await Promise.all([
    ssmClient.send(
      new GetParameterCommand({
        Name: supabaseUrlParamName,
        WithDecryption: false,
      })
    ),
    ssmClient.send(
      new GetParameterCommand({
        Name: supabaseAnonKeyParamName,
        WithDecryption: true,
      })
    ),
  ]);
  console.log("getSupabaseConfig: got params");
  return {
    supabaseUrl: urlRes.Parameter?.Value,
    supabaseAnonKey: keyRes.Parameter?.Value,
  };
};

export const initSupabase = async () => {
  if (supabase) return supabase;
  console.log("initSupabase: using cached client");

  const { supabaseUrl, supabaseAnonKey } = await getSupabaseConfig();

  console.log("initSupabase: fetching config from SSM");

  try {
    if (!supabaseUrl || !supabaseAnonKey)
      throw new Error("Supabase URL or anon key is missing");
    console.log("initSupabase: creating client");
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("initSupabase: client created");
    return supabase;
  } catch (error) {
    console.error("Failed to initialize Supabase:", error);
    throw error;
  }
};
