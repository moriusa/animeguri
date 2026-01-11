import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { initSupabase } from "../common/supabaseClient";

export const handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer
) => {
  const sub = event.requestContext.authorizer.jwt.claims.sub as string;

  try {
    console.log("Event:", JSON.stringify(event, null, 2));
    const supabase = await initSupabase();

    if (!event.body) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Request body is required" }),
      };
    }
    const { articleId } = JSON.parse(event.body);
    const { data, error } = await supabase
      .from("bookmarks")
      .insert({ user_id: sub, article_id: articleId })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        // 重複
        return {
          statusCode: 409,
          body: JSON.stringify({ message: "Already bookmarked" }),
        };
      }
      throw error;
    }
    return { statusCode: 201, body: JSON.stringify(data) };

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
