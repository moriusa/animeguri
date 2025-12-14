import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { initSupabase } from "../common/supabaseClient";

const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN!;
const buildImageUrl = (s3Key?: string | null) =>
  s3Key ? `https://${CLOUDFRONT_DOMAIN}/${s3Key}` : null;

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const supabase = await initSupabase();

    // クエリパラメータから limit, offset を取得（例: /articles?limit=20&offset=40）
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

    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false }) // 新しい順など
      .range(from, to);

    if (error) {
      console.error("supabase error:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Failed to fetch articles" }),
      };
    }

    // ここで CloudFront URL に整形
    const items = (data ?? []).map((row) => ({
      ...row,
      // サムネのみ(今後user画像も追加)
      thumbnail_url: buildImageUrl(row.thumbnail_s3_key),
    }));
    console.log(items);

    return {
      statusCode: 200,
      body: JSON.stringify({
        items,
        limit,
        offset,
      }),
    };
  } catch (e) {
    console.error("get articles error:", e);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
