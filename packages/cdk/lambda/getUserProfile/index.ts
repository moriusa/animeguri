import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { type SupabaseClient } from "@supabase/supabase-js";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { initSupabase } from "../common/supabaseClient";

const s3Client = new S3Client({});
const bucketName = process.env.S3_BUCKET_NAME!;

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
