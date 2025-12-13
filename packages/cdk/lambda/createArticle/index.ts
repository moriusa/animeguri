import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { initSupabase } from "../common/supabaseClient";
import { randomUUID } from "crypto";

interface CreateArticleBody {
  title: string;
  thumbnail_s3_key?: string;
  anime_name: string;
  article_status?: "draft" | "published" | "archived";
  reports: {
    title: string;
    description?: string;
    location: string;
    display_order: number; // 1~10
    images: {
      s3_key: string;
      caption?: string;
      display_order: number; // 1~10
    }[];
  }[];
}

export const handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer
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
    if (!body.title || !body.anime_name) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "title and anime_name are required",
        }),
      };
    }

    if (body.title.length > 200) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "title must be 200 characters or less",
        }),
      };
    }

    if (body.anime_name.length > 200) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "anime_name must be 200 characters or less",
        }),
      };
    }

    const supabase = await initSupabase();

    // Step 1: 記事を作成
    const articleId = randomUUID();
    const now = new Date().toISOString();

    const { data: article, error: articleError } = await supabase
      .from("articles")
      .insert({
        id: articleId,
        user_id: sub,
        title: body.title,
        thumbnail_s3_key: body.thumbnail_s3_key || null,
        anime_name: body.anime_name,
        article_status: body.article_status || "draft",
        published_at: body.article_status === "published" ? now : null,
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
        id: randomUUID(),
        article_id: articleId,
        title: report.title,
        description: report.description || null,
        location: report.location,
        display_order: report.display_order,
      }));

      const { data: insertedReports, error: reportsError } = await supabase
        .from("reports")
        .insert(reportsToInsert)
        .select("*");

      if (reportsError) {
        console.error("Failed to create reports:", reportsError);
        // 記事は作成されているので、ロールバック処理
        await supabase.from("articles").delete().eq("id", articleId);

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
      for (let i = 0; i < body.reports.length; i++) {
        const reportImages = body.reports[i].images;
        if (reportImages && reportImages.length > 0) {
          const imagesToInsert = reportImages.map((img) => ({
            id: randomUUID(),
            report_id: reports[i].id,
            s3_key: img.s3_key,
            caption: img.caption || null,
            display_order: img.display_order,
          }));

          const { error: imagesError } = await supabase
            .from("report_images")
            .insert(imagesToInsert);

          if (imagesError) {
            console.error("Failed to create images:", imagesError);
            // ロールバック
            await supabase.from("articles").delete().eq("id", articleId);

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
        )
      `
      )
      .eq("id", articleId)
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

    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(fullArticle),
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
