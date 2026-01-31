import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { supabase } from "../common/supabaseClient";
import { getArticleImageUrl, getUserImageUrl } from "../common/imageHelper";

type ArticleWithAuthor = {
  id: string;
  user_id: string;
  title: string;
  anime_name: string;
  thumbnail_s3_key: string | null;
  likes_count: number;
  bookmark_count: number;
  comment_count: number;
  report_count: number;
  article_status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    user_name: string;
    profile_image_s3_key: string | null;
  };
};

export const handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
) => {
  const startTime = Date.now();

  try {
    // 1. 認証処理
    const authStart = Date.now();
    const sub = event.requestContext.authorizer.jwt.claims.sub as string;
    console.log(`[TIMING] Auth: ${Date.now() - authStart}ms`);

    // 2. パラメータ解析
    const parseStart = Date.now();
    const qs = event.queryStringParameters || {};
    const limit = qs.limit ? parseInt(qs.limit, 10) : 20;
    const offset = qs.offset ? parseInt(qs.offset, 10) : 0;
    const statusFilter = qs.status ?? "draft";
    console.log(`[TIMING] Parse: ${Date.now() - parseStart}ms`);

    if (Number.isNaN(limit) || Number.isNaN(offset)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "limit and offset must be numbers" }),
      };
    }

    // 3. Supabaseクエリ
    const queryStart = Date.now();
    const from = offset;
    const to = offset + limit - 1;

    let query = supabase
      .from("articles")
      .select(
        `
          id,
          user_id,
          title,
          anime_name,
          thumbnail_s3_key,
          likes_count,
          bookmark_count,
          comment_count,
          report_count,
          article_status,
          published_at,
          created_at,
          updated_at,
          author:users (
            id,
            user_name,
            profile_image_s3_key
          )
        `,
      )
      .eq("user_id", sub)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (statusFilter === "draft") {
      query = query.eq("article_status", "draft");
    } else if (statusFilter === "published") {
      query = query.eq("article_status", "published");
    }

    const { data, error } = await query;
    console.log(`[TIMING] Query: ${Date.now() - queryStart}ms`);

    if (error) {
      console.error("supabase error:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Failed to fetch articles" }),
      };
    }

    const articles = data as unknown as ArticleWithAuthor[];

    console.log(`[INFO] Fetched ${data?.length || 0} articles`);
    console.log(`[INFO] Data size: ${JSON.stringify(data).length} bytes`);

    // 4. データ変換
    const transformStart = Date.now();
    const transData = articles.map((article) => ({
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
    console.log(`[TIMING] Transform: ${Date.now() - transformStart}ms`);

    // 5. レスポンス作成
    const responseStart = Date.now();
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        data: transData,
        pagination: {
          total: offset + limit,
          limit: limit,
          offset: offset,
        },
        status: statusFilter,
      }),
    };
    console.log(`[TIMING] Response: ${Date.now() - responseStart}ms`);

    console.log(
      `[TIMING] ========== TOTAL: ${Date.now() - startTime}ms ==========`,
    );

    return response;
  } catch (e) {
    console.error("get articles error:", e);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
