import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { supabase } from "../common/supabaseClient";
import { getArticleImageUrl, getUserImageUrl } from "../common/imageHelper";

export const handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
) => {
  try {
    const articleId = event.pathParameters?.id;
    const sub = event.requestContext.authorizer.jwt.claims.sub as string;

    const { data, error } = await supabase
      .from("articles")
      .select(
        `
        *,
        reports (
          *,
          report_images (*)
        ),
        author:users (
          id,
          user_name,
          profile_image_s3_key
        )
      `,
      )
      .eq("id", articleId)
      .eq("user_id", sub)
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
      console.log(error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Internal Server Error" }),
      };
    }

    console.log(JSON.stringify(data));

    const transReportsData = data.reports.map((report: any) => {
      return {
        id: report.id,
        title: report.title,
        location: report.location,
        articleId: report.article_id,
        createdAt: report.created_at,
        updatedAt: report.updated_at,
        description: report.description,
        displayOrder: report.display_order,
        reportImages: report.report_images.map((image: any) => ({
          id: image.id,
          imageUrl: getArticleImageUrl(image.s3_key),
          caption: image.caption,
          reportId: image.report_id,
          createdAt: image.created_at,
          updatedAt: image.updated_at,
          displayOrder: image.display_order,
        })),
      };
    });

    const transData = {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      animeName: data.anime_name,
      thumbnailUrl: getArticleImageUrl(data.thumbnail_s3_key),
      likesCount: data.likes_count,
      bookmarkCount: data.bookmark_count,
      commentCount: data.comment_count,
      reportCount: data.report_count,
      articleStatus: data.article_status,
      publishedAt: data.published_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      reports: transReportsData,
      author: {
        id: data.author.id,
        userName: data.author.user_name,
        profileImageUrl: getUserImageUrl(data.author.profile_image_s3_key),
      },
    };

    return {
      statusCode: 200,
      body: JSON.stringify({ data: transData }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
