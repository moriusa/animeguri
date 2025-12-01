import { APIGatewayProxyEventV2 } from "aws-lambda";
import { initSupabase } from "../common/supabaseClient";

export const handler = async (event: APIGatewayProxyEventV2) => {
  try {
    console.log("Event:", JSON.stringify(event, null, 2));

    if (!event.body) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Request body is required" }),
      };
    }

    // JSON パース
    let payload: any;
    try {
      payload = JSON.parse(event.body);
    } catch {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Invalid JSON" }),
      };
    }

    const { id, email, user_name, bio, user_image_key } = payload;

    // 必須項目チェック（必要に応じて調整）
    if (!id || !email || !user_name) {
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
      .eq("id", id)
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
        id,
        email,
        user_name,
        bio: bio ?? null,
        user_image_key: user_image_key ?? null,
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
