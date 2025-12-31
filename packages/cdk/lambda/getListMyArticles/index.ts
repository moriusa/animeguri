import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { initSupabase } from "../common/supabaseClient";

const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN!;
const buildImageUrl = (s3Key?: string | null) =>
  s3Key ? `https://${CLOUDFRONT_DOMAIN}/${s3Key}` : null;

export const handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer
) => {
  try {
    const sub = event.requestContext.authorizer.jwt.claims.sub as string;
    const supabase = await initSupabase();

    const qs = event.queryStringParameters || {};
    const limit = qs.limit ? parseInt(qs.limit, 10) : 20; // デフォルト 20 件
    const offset = qs.offset ? parseInt(qs.offset, 10) : 0; // デフォルト 0 件目から
    const statusFilter = qs.status; // 'draft', 'public', 'all'const status = qs.status ?? "all";

    if (Number.isNaN(limit) || Number.isNaN(offset)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "limit and offset must be numbers" }),
      };
    }

    // Supabase range (offset ~ offset+limit-1)
    const from = offset;
    const to = offset + limit - 1;
    let query = supabase
      .from("articles")
      .select(
        `
          *,
          author:users (
            id,
            user_name,
            profile_image_s3_key
          )
        `
      )
      .eq("user_id", sub)
      .order("created_at", { ascending: false }) // 新しい順など
      .range(from, to);

    // ステータスフィルタ
    if (statusFilter === "draft") {
      query = query.eq("status", "draft");
    } else if (statusFilter === "public") {
      query = query.eq("status", "public");
    }
    // 'all' or 未指定 →

    const { data, error } = await query;

    if (error) {
      console.error("supabase error:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Failed to fetch articles" }),
      };
    }

    // ここで CloudFront URL に整形
    // const items = (data ?? []).map((row) => ({
    //   ...row,
    //   thumbnail_url: buildImageUrl(row.thumbnail_s3_key),
    //   author: {
    //     ...row.user,
    //     profile_image_url: buildImageUrl(row.user.profile_image_s3_key),
    //   },
    // }));
    // console.log(items);

    return {
      statusCode: 200,
      body: JSON.stringify({
        data,
        status: statusFilter,
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
