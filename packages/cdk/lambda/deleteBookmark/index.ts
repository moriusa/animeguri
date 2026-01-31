import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { initSupabase } from "../common/supabaseClient";

export const handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
) => {
  const sub = event.requestContext.authorizer.jwt.claims.sub as string;

  try {
    console.log("Event:", JSON.stringify(event, null, 2));
    const supabase = await initSupabase();

    const articleId = event.pathParameters?.id;

    const { data, error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", sub)
      .eq("article_id", articleId)
      .select()
      .single();

    if (error || !data) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Bookmark not found" }),
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Removed bookmark" }),
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
