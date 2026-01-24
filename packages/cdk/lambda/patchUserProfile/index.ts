import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { initSupabase } from "../common/supabaseClient";
import { getUserImageUrl } from "../common/imageHelper";

export interface ProfileFormValues {
  userName: string;
  bio: string;
  profileImageS3Key?: string;
  xUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  websiteUrl?: string;
}

export const handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer
) => {
  try {
    const supabase = await initSupabase();
    const userId = event.requestContext.authorizer.jwt.claims.sub as string;

    console.log("Event:", JSON.stringify(event, null, 2));

    // リクエストボディのチェック
    if (!event.body) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Request body is required",
        }),
      };
    }

    const body: ProfileFormValues = JSON.parse(event.body);

    // 更新日時を追加
    const updateData = {
      ...body,
      updated_at: new Date().toISOString(),
    };

    // プロフィール更新
    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", userId)
      .select("*")
      .single();

    if (error) {
      console.error("Supabase error:", error);

      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Failed to update profile",
          error: error.message,
        }),
      };
    }

    // データが存在しない場合
    if (!data) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "User not found" }),
      };
    }

    // CloudFront URLに整形
    const profile = {
      id: data.id,
      userName: data.user_name,
      bio: data.bio,
      xUrl: data.x_url,
      facebookUrl: data.facebook_url,
      youtubeUrl: data.youtube_url,
      websiteUrl: data.website_url,
      profileImageUrl: getUserImageUrl(data.profile_image_s3_key),
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    console.log("Updated profile:", profile);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Profile updated successfully",
        data: profile,
      }),
    };
  } catch (e) {
    console.error("Update profile error:", e);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Internal server error",
      }),
    };
  }
};
