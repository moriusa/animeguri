import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { initSupabase } from "../common/supabaseClient";

export const handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer
) => {
  const sub = event.requestContext.authorizer.jwt.claims.sub as string;
  const { articleId } = event.queryStringParameters || {};

  if (!articleId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "articleId is required" }),
    };
  }

  try {
    console.log("Event:", JSON.stringify(event, null, 2));
    const supabase = await initSupabase();

    const { data, error } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", sub)
      .eq("article_id", articleId)
      .maybeSingle(); // エラーを出さずにnullを返す

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({
        isBookmarked: !!data,
      }),
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
