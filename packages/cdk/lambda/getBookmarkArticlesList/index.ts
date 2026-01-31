import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { initSupabase } from "../common/supabaseClient";
import { getArticleImageUrl, getUserImageUrl } from "../common/imageHelper";

export const handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
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
        *,
        author:users (
          id,
          user_name,
          profile_image_s3_key
        )
      )
    `,
        { count: "exact" },
      )
      .eq("user_id", sub)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.log(error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Bookmark not found" }),
      };
    }

    // データが空でも正常(200を返す)
    const bookmarksData = data || [];
    const totalCount = count ?? 0;

    const transData = bookmarksData.map((bookmark: any) => ({
      id: bookmark.id,
      createdAt: bookmark.created_at,
      article: {
        id: bookmark.article.id,
        userId: bookmark.article.user_id,
        title: bookmark.article.title,
        animeName: bookmark.article.anime_name,
        thumbnailUrl: getArticleImageUrl(bookmark.article.thumbnail_s3_key),
        likesCount: bookmark.article.likes_count,
        bookmarkCount: bookmark.article.bookmark_count,
        commentCount: bookmark.article.comment_count,
        reportCount: bookmark.article.report_count,
        articleStatus: bookmark.article.article_status,
        publishedAt: bookmark.article.published_at,
        createdAt: bookmark.article.created_at,
        updatedAt: bookmark.article.updated_at,
        author: {
          id: bookmark.article.author.id,
          userName: bookmark.article.author.user_name,
          profileImageUrl: getUserImageUrl(
            bookmark.article.author.profile_image_s3_key,
          ),
        },
      },
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({
        data: transData,
        pagination: {
          from,
          to,
          total: count,
          totalPages: Math.ceil(totalCount / limit),
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
      }),
    };
  }
};
