import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { initSupabase } from "../common/supabaseClient";

export const handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer
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
          message: "id, email, user_name are required",
        }),
      };
    }

    const supabase = await initSupabase();

    // 既存ユーザー確認（必要なら）
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
        body: JSON.stringify({ message: "DB error" }),
      };
    }

    if (existing) {
      // 既に存在するなら 409 など
      return {
        statusCode: 409,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "User already exists" }),
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
        body: JSON.stringify({ message: "Failed to create user" }),
      };
    }

    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (e: any) {
    console.error("Handler error:", e);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Internal server error",
        error: e.message,
        errorType: e.name,
      }),
    };
  }
};
