// lambda/updateArticle.ts
import { S3Client, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { supabase } from "../common/supabaseClient";
import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";

export interface UpdateArticleBody {
  id: string;
  title: string;
  thumbnailS3Key: string | null;
  animeName: string;
  articleStatus: "draft" | "published";
  reports: {
    id?: string;
    title: string;
    description?: string;
    location: string;
    displayOrder: number;
    latitude?: number;
    longitude?: number;
    geocodedAddress?: string;
    images: {
      id?: string;
      s3Key?: string;
      caption?: string;
      displayOrder: number;
    }[];
  }[];
}

const s3Client = new S3Client({ region: "ap-northeast-1" });

export const handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
) => {
  if (!event.body) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Request body is required" }),
    };
  }
  const body: UpdateArticleBody = JSON.parse(event.body);
  const sub = event.requestContext.authorizer.jwt.claims.sub;
  const articleId = body.id;

  try {
    // ==========================================
    // Step 1: 既存データを取得（権限チェック）
    // ==========================================
    const { data: existingArticle, error: fetchError } = await supabase
      .from("articles")
      .select(
        `
        *,
        reports (
          id,
          report_images (
            id,
            s3_key
          )
        )
      `,
      )
      .eq("id", articleId)
      .eq("user_id", sub)
      .single();

    if (fetchError || !existingArticle) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: "Forbidden" }),
      };
    }

    // ==========================================
    // Step 2: 削除対象を判定
    // ==========================================
    const s3KeysToDelete: string[] = [];

    // 2-1. サムネイルの削除判定
    if (existingArticle.thumbnail_s3_key && body.thumbnailS3Key) {
      s3KeysToDelete.push(existingArticle.thumbnail_s3_key);
    }

    // 2-2. レポート画像の削除判定
    const clientReportIds = new Set(
      body.reports.map((r) => r.id).filter(Boolean),
    );

    existingArticle.reports.forEach((existingReport: any) => {
      // レポート自体が削除された
      if (!clientReportIds.has(existingReport.id)) {
        existingReport.report_images.forEach((img: any) => {
          s3KeysToDelete.push(img.s3_key);
        });
        return;
      }

      // レポートは残っているが画像が削除された
      const clientReport = body.reports.find((r) => r.id === existingReport.id);
      if (clientReport) {
        const clientImageIds = new Set(
          clientReport.images.map((img) => img.id).filter(Boolean),
        );

        existingReport.report_images.forEach((img: any) => {
          if (!clientImageIds.has(img.id)) {
            s3KeysToDelete.push(img.s3_key);
          }
        });
      }
    });

    // ==========================================
    // Step 3: S3から削除
    // ==========================================
    if (s3KeysToDelete.length > 0) {
      console.log("削除対象:", s3KeysToDelete);

      await s3Client.send(
        new DeleteObjectsCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Delete: {
            Objects: s3KeysToDelete.map((key) => ({ Key: key })),
          },
        }),
      );

      console.log("S3削除完了");
    }

    // ==========================================
    // Step 4: DB更新
    // ==========================================

    // 記事本体の更新
    const { error: updateError } = await supabase
      .from("articles")
      .update({
        title: body.title,
        thumbnail_s3_key: body.thumbnailS3Key,
        anime_name: body.animeName,
        article_status: body.articleStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", articleId);

    if (updateError) throw updateError;

    // レポートの削除（クライアントから送られていないもの）
    const { error: deleteReportsError } = await supabase
      .from("reports")
      .delete()
      .eq("article_id", articleId)
      .not(
        "id",
        "in",
        `(${body.reports
          .map((r) => r.id)
          .filter(Boolean)
          .join(",")})`,
      );

    // レポートの更新/挿入
    for (const [index, report] of body.reports.entries()) {
      let reportId = report.id;

      if (reportId) {
        // 既存レポートの更新
        await supabase
          .from("reports")
          .update({
            title: report.title,
            description: report.description,
            location: report.location,
            latitude: report.latitude,
            longitude: report.longitude,
            geocoded_address: report.geocodedAddress,
            display_order: report.displayOrder,
          })
          .eq("id", reportId);
      } else {
        // 新規レポートの挿入
        const { data: newReport } = await supabase
          .from("reports")
          .insert({
            article_id: articleId,
            title: report.title,
            description: report.description,
            location: report.location,
            latitude: report.latitude,
            longitude: report.longitude,
            geocoded_address: report.geocodedAddress,
            display_order: report.displayOrder,
          })
          .select()
          .single();

        reportId = newReport.id;
      }

      // 画像の削除（クライアントから送られていないもの）
      const clientImageIds = report.images.map((img) => img.id).filter(Boolean);

      await supabase
        .from("report_images")
        .delete()
        .eq("report_id", reportId)
        .not("id", "in", `(${clientImageIds.join(",")})`);

      // 画像の更新/挿入
      for (const image of report.images) {
        if (image.id) {
          // 既存画像の更新
          await supabase
            .from("report_images")
            .update({
              caption: image.caption,
              display_order: image.displayOrder,
            })
            .eq("id", image.id);
        } else {
          // 新規画像の挿入
          await supabase.from("report_images").insert({
            report_id: reportId,
            s3_key: image.s3Key,
            caption: image.caption,
            display_order: image.displayOrder,
          });
        }
      }
    }

    // ==========================================
    // Step 5: 更新後のデータを返す
    // ==========================================
    const { data: updatedArticle } = await supabase
      .from("articles")
      .select("*")
      .eq("id", articleId)
      .single();

    return {
      statusCode: 200,
      body: JSON.stringify({
        data: updatedArticle,
        message: "Update success!",
      }),
    };
  } catch (error) {
    console.error("更新エラー:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
