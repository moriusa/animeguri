import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { supabase } from "../common/supabaseClient";
import {
  getArticleImageUrl,
  getUserImageUrl,
  replaceProcessedS3Key,
} from "../common/imageHelper";

interface Report {
  id: string;
  title: string;
  description?: string;
  prefecture: string;
  city: string;
  streetAddress?: string;
  spotName?: string;
  displayOrder: number;
  latitude?: number;
  longitude?: number;
  geocodedAddress?: string;
  images: {
    id: string;
    s3Key: string;
    caption?: string;
    displayOrder: number;
  }[];
}

interface CreateArticleBody {
  id: string;
  title: string;
  thumbnailS3Key: string;
  description: string;
  animeName: string;
  articleStatus: "draft" | "published";
  reports: Report[];
}

export const handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
) => {
  const sub = event.requestContext.authorizer.jwt.claims.sub as string;

  try {
    console.log("Event:", JSON.stringify(event, null, 2));

    if (!event.body) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Request body is required" }),
      };
    }

    const body: CreateArticleBody = JSON.parse(event.body);

    // バリデーション
    // if (!body.title || !body.anime_name) {
    //   return {
    //     statusCode: 400,
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({
    //       message: "title and anime_name are required",
    //     }),
    //   };
    // }

    // if (body.title.length > 200) {
    //   return {
    //     statusCode: 400,
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({
    //       message: "title must be 200 characters or less",
    //     }),
    //   };
    // }

    // if (body.anime_name.length > 200) {
    //   return {
    //     statusCode: 400,
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({
    //       message: "anime_name must be 200 characters or less",
    //     }),
    //   };
    // }

    // Step 1: 記事を作成
    const now = new Date().toISOString();

    const { data: article, error: articleError } = await supabase
      .from("articles")
      .insert({
        id: body.id,
        user_id: sub,
        title: body.title,
        thumbnail_s3_key: replaceProcessedS3Key(body.thumbnailS3Key),
        description: body.description,
        anime_name: body.animeName,
        article_status: body.articleStatus,
        published_at: body.articleStatus === "published" ? now : null,
      })
      .select("*")
      .single();

    if (articleError || !article) {
      console.error("Failed to create article:", articleError);
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Failed to create article",
          error: articleError?.message,
        }),
      };
    }

    // Step 2: レポートを作成（存在する場合）
    let reports: any[] = [];
    if (body.reports && body.reports.length > 0) {
      const reportsToInsert = body.reports.map((report) => ({
        id: report.id,
        article_id: body.id,
        title: report.title,
        description: report.description || null,
        prefecture: report.prefecture,
        city: report.city,
        street_address: report.streetAddress,
        spot_name: report.spotName,
        latitude: report.latitude,
        longitude: report.longitude,
        geocoded_address: report.geocodedAddress,
        display_order: report.displayOrder,
      }));

      const { data: insertedReports, error: reportsError } = await supabase
        .from("reports")
        .insert(reportsToInsert)
        .select("*");

      if (reportsError) {
        console.error("Failed to create reports:", reportsError);
        // 記事は作成されているので、ロールバック処理
        await supabase.from("articles").delete().eq("id", body.id);

        return {
          statusCode: 500,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: "Failed to create reports",
            error: reportsError.message,
          }),
        };
      }

      reports = insertedReports || [];

      // Step 3: 各レポートの画像を作成
      for (const report of body.reports) {
        const reportImages = report.images;
        const imagesData = reportImages.map((img) => ({
          id: img.id,
          report_id: report.id,
          s3_key: replaceProcessedS3Key(img.s3Key),
          caption: img.caption || null,
          display_order: img.displayOrder,
        }));
        const { error: imagesError } = await supabase
          .from("report_images")
          .insert(imagesData);
        if (imagesError) {
          console.error("Failed to create images:", imagesError);
          // ロールバック
          await supabase.from("articles").delete().eq("id", body.id);
          return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: "Failed to create report images",
              error: imagesError.message,
            }),
          };
        }
      }
    }

    // Step 4: 完全なデータを取得して返す
    const { data: fullArticle, error: fetchError } = await supabase
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
      .eq("id", body.id)
      .single();

    if (fetchError) {
      console.error("Failed to fetch full article:", fetchError);
      return {
        statusCode: 201,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify(article), // 記事だけ返す
      };
    }

    const transReportsData = fullArticle.reports.map((report: any) => {
      return {
        id: report.id,
        title: report.title,
        prefecture: report.prefecture,
        city: report.city,
        streetAddress: report.street_address,
        spotName: report.spot_name,
        latitude: report.latitude,
        longitude: report.longitude,
        geocodedAddress: report.geocoded_address,
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
      id: fullArticle.id,
      userId: fullArticle.user_id,
      title: fullArticle.title,
      animeName: fullArticle.anime_name,
      thumbnailUrl: getArticleImageUrl(fullArticle.thumbnail_s3_key),
      description: fullArticle.description,
      likesCount: fullArticle.likes_count,
      bookmarkCount: fullArticle.bookmark_count,
      commentCount: fullArticle.comment_count,
      reportCount: fullArticle.report_count,
      articleStatus: fullArticle.article_status,
      publishedAt: fullArticle.published_at,
      createdAt: fullArticle.created_at,
      updatedAt: fullArticle.updated_at,
      reports: transReportsData,
      author: {
        id: fullArticle.author.id,
        userName: fullArticle.author.user_name,
        profileImageUrl: getUserImageUrl(
          fullArticle.author.profile_image_s3_key,
        ),
      },
    };

    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ data: transData }),
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
