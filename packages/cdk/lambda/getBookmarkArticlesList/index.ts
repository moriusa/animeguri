import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { initSupabase } from "../common/supabaseClient";

export const handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer
) => {
  const sub = event.requestContext.authorizer.jwt.claims.sub as string;

  try {
    console.log("Event:", JSON.stringify(event, null, 2));
    const supabase = await initSupabase();

    // クエリパラメータから limit, offset を取得
    const qs = event.queryStringParameters || {};
    const limit = qs.limit ? parseInt(qs.limit, 10) : 20; // デフォルト 20 件
    const offset = qs.offset ? parseInt(qs.offset, 10) : 0; // デフォルト 0 件目から

    if (Number.isNaN(limit) || Number.isNaN(offset)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "limit and offset must be numbers" }),
      };
    }
    // Supabase range (offset ~ offset+limit-1)
    const from = offset;
    const to = offset + limit - 1;

    const { data, error, count } = await supabase
      .from("bookmarks")
      .select(
        `
      id,
      created_at,
      article:articles (
        id,
        title,
        thumbnail_s3_key,
        author:users (
          id,
          user_name,
          profile_image_s3_key
        ),
        bookmark_count,
        published_at
      )
    `,
        { count: "exact" }
      )
      .eq("user_id", sub)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error || !data || !count) {
      console.log(error)
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Bookmark not found" }),
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({
        data,
        pagination: {
          from,
          to,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
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
