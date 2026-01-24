import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { initSupabase } from "../common/supabaseClient";
import { getArticleImageUrl, getUserImageUrl } from "../common/imageHelper";

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  try {
    const supabase = await initSupabase();

    const userId = event.pathParameters?.id;
    // クエリパラメータから limit, offset を取得（例: /articles?limit=20&offset=40）
    const qs = event.queryStringParameters || {};
    const limit = qs.limit ? parseInt(qs.limit, 10) : 20; // デフォルト 20 件
    const offset = qs.offset ? parseInt(qs.offset, 10) : 0; // デフォルト 0 件目から

    if (Number.isNaN(limit) || Number.isNaN(offset) || !userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "param error" }),
      };
    }

    // Supabase range (offset ~ offset+limit-1)
    const from = offset;
    const to = offset + limit - 1;

    const { data, error } = await supabase
      .from("articles")
      .select(
        `
          *,
          author:users (
            id,
            user_name,
            profile_image_s3_key
          )
        `,
      )
      .eq("user_id", userId)
      .eq("article_status", "published")
      .order("created_at", { ascending: false }) // 新しい順など
      .range(from, to);

    if (error) {
      console.error("supabase error:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Failed to fetch articles" }),
      };
    }

    const transData = data.map((article) => ({
      id: article.id,
      userId: article.user_id,
      title: article.title,
      animeName: article.anime_name,
      thumbnailUrl: getArticleImageUrl(article.thumbnail_s3_key),
      likesCount: article.likes_count,
      bookmarkCount: article.bookmark_count,
      commentCount: article.comment_count,
      reportCount: article.report_count,
      articleStatus: article.article_status,
      publishedAt: article.published_at,
      createdAt: article.created_at,
      updatedAt: article.updated_at,
      author: {
        id: article.author.id,
        userName: article.author.user_name,
        profileImageUrl: getUserImageUrl(article.author.profile_image_s3_key),
      },
    }));

    console.log(
      JSON.stringify({
        data: transData,
        pagination: {
          total: offset + limit,
          limit: limit,
          offset: offset,
        },
      }),
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        data: transData,
        pagination: {
          total: offset + limit,
          limit: limit,
          offset: offset,
        },
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
