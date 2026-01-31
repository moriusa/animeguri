import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { supabase } from "../common/supabaseClient";
import { getUserImageUrl } from "../common/imageHelper";

export const handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
) => {
  const sub = event.requestContext.authorizer.jwt.claims.sub as string;
  const email = event.requestContext.authorizer.jwt.claims.email as string;
  const defaultUserName = `user_${sub.slice(0, 8)}`;
  try {
    console.log("Event:", JSON.stringify(event, null, 2));

    // 必須項目チェック（必要に応じて調整）
    if (!sub || !email) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "id, email are required",
        }),
      };
    }

    // 既存ユーザー確認
    const { data: existing, error: existingError } = await supabase
      .from("users")
      .select("id")
      .eq("id", sub)
      .maybeSingle();

    if (existingError) {
      console.error("Supabase select error:", existingError);
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Internal server error" }),
      };
    }

    if (existing) {
      return {
        statusCode: 409,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "User already exists",
          email: email,
        }),
      };
    }

    // insert
    const { data, error } = await supabase
      .from("users")
      .insert({
        id: sub,
        email,
        user_name: defaultUserName,
      })
      .select("*")
      .single();

    if (error || !data) {
      console.error("Supabase insert error:", error);
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Internal server error" }),
      };
    }

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

    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "User created successfully",
        data: transData,
      }),
    };
  } catch (e: any) {
    console.error("Handler error:", e);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Internal server error",
      }),
    };
  }
};
