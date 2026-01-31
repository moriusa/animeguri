import type { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { initSupabase } from "../common/supabaseClient";
import { getUserImageUrl } from "../common/imageHelper";

export const handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
) => {
  const sub = event.requestContext.authorizer.jwt.claims.sub as string;

  try {
    const supabase = await initSupabase();
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", sub)
      .single();

    const transData = {
      email: data.email,
      userName: data.user_name,
      profileImageUrl: getUserImageUrl(data.profile_image_s3_key),
      bio: data.bio,
      articleCount: data.article_count,
      xUrl: data.x_url,
      facebookUrl: data.facebook_url,
      youtubeUrl: data.youtube_url,
      websiteUrl: data.website_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    if (!data) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "User not found",
        }),
      };
    }

    if (error) {
      console.error("Supabase error:", error);
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Internal server error",
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ data: transData }),
    };
  } catch (e: any) {
    console.error("Handler error:", e);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Internal server error",
        error: e.message,
      }),
    };
  }
};
