import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { initSupabase } from "../common/supabaseClient";

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const supabase = await initSupabase();
    const articleId = event.pathParameters?.id;

    if (!articleId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Article ID is required" }),
      };
    }

    const { data, error } = await supabase
      .from("articles")
      .select(
        `
        *,
        reports (
          *,
          report_images (*)
        )
      `
      )
      .eq("id", articleId)
      .eq("article_status", "published")
      // reports の並び順
      .order("display_order", {
        foreignTable: "reports",
        ascending: true,
      })
      // report_images の並び順
      .order("display_order", {
        foreignTable: "reports.report_images",
        ascending: true,
      })
      .single(); // 単一レコード取得

    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
