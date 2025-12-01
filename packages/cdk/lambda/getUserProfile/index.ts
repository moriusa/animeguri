import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { APIGatewayProxyEventV2 } from "aws-lambda";

const s3Client = new S3Client({});
const ssmClient = new SSMClient({});
const bucketName = process.env.S3_BUCKET_NAME!;
const supabaseUrlParamName = process.env.SUPABASE_URL!;
const supabaseAnonKeyParamName = process.env.SUPABASE_ANON_KEY!;
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

const initSupabase = async () => {
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

// Supabaseからユーザー情報取得
const getUserProfile = async (
  userId: string,
  supabaseClient: SupabaseClient
) => {
  try {
    const { data, error } = await supabaseClient
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    console.log("Supabase data:", data);
    console.log("Supabase error:", error);

    if (error) throw error;
    if (!data) {
      throw new Error("User not found in DB");
    }

    const key = (data as any).profile_image_key as string | null;

    // S3から画像URLを取得
    let imageUrl: string | null = null;
    if (key) {
      const cmd = new GetObjectCommand({ Bucket: bucketName, Key: key });
      imageUrl = await getSignedUrl(s3Client, cmd, { expiresIn: 3600 });
    }
    console.log("Profile image URL:", imageUrl);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        profileImageUrl: imageUrl,
      }),
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return {
      statusCode: 404,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "User not found" }),
    };
  }
};

export const handler = async (event: APIGatewayProxyEventV2) => {
  try {
    console.log("Event:", JSON.stringify(event, null, 2));
    const userId = event.pathParameters?.userId;
    if (!userId) {
      console.log("User ID not found");
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: "User ID not found" }),
      };
    }

    const supabaseClient = await initSupabase();
    console.log("handler: supabase client ready");
    return await getUserProfile(userId, supabaseClient);
  } catch (error: any) {
    console.error("Handler error:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Internal server error",
        error: error.message,
        errorType: error.name,
      }),
    };
  }
};
