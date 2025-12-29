import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { initSupabase } from "../common/supabaseClient";

export interface ProfileFormValues {
  user_name?: string;
  bio?: string;
  profile_image_s3_key?: string;
  x_url?: string;
  facebook_url?: string;
  youtube_url?: string;
  website_url?: string;
}

const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN!;

const buildImageUrl = (s3Key?: string | null) =>
  s3Key ? `https://${CLOUDFRONT_DOMAIN}/${s3Key}` : null;

// バリデーション関数
const validateProfileData = (data: ProfileFormValues) => {
  const errors: string[] = [];

  // ユーザー名の検証
  if (data.user_name !== undefined) {
    if (data.user_name.length < 2) {
      errors.push("ユーザー名は2文字以上である必要があります");
    }
    if (data.user_name.length > 50) {
      errors.push("ユーザー名は50文字以内である必要があります");
    }
  }

  // 自己紹介の検証
  if (data.bio !== undefined && data.bio.length > 500) {
    errors.push("自己紹介は500文字以内である必要があります");
  }

  // URL形式の検証
  const urlFields = [
    { key: "x_url", label: "X(Twitter)" },
    { key: "facebook_url", label: "Facebook" },
    { key: "youtube_url", label: "YouTube" },
    { key: "website_url", label: "ウェブサイト" },
  ] as const;

  for (const field of urlFields) {
    const url = data[field.key];
    if (url && url.length > 0) {
      try {
        new URL(url); // URL形式チェック
      } catch {
        errors.push(`${field.label}のURLが不正です`);
      }
    }
  }

  return errors;
};

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

    // 空のオブジェクトチェック
    if (Object.keys(body).length === 0) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "No fields to update",
        }),
      };
    }

    // バリデーション
    const validationErrors = validateProfileData(body);
    if (validationErrors.length > 0) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Validation failed",
          errors: validationErrors,
        }),
      };
    }

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

      // エラーの種類に応じて適切なステータスコードを返す
      if (error.code === "PGRST116") {
        return {
          statusCode: 404,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: "User not found" }),
        };
      }

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
      user_name: data.user_name,
      bio: data.bio,
      x_url: data.x_url,
      facebook_url: data.facebook_url,
      youtube_url: data.youtube_url,
      website_url: data.website_url,
      profile_image_url: buildImageUrl(data.profile_image_s3_key),
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    console.log("Updated profile:", profile);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Profile updated successfully",
        profile,
      }),
    };
  } catch (e) {
    console.error("Update profile error:", e);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Internal server error",
        error: e instanceof Error ? e.message : String(e),
      }),
    };
  }
};
