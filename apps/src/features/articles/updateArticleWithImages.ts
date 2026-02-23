"use server";
import { PostFormValues, ImageItem } from "@/components/post/PostFrom";
import { updateArticle, UpdateArticleBody } from "@/lib/articles";
import { genPresignedUrl, uploadImageToS3 } from "@/lib/presignedUrl";
import { revalidatePath } from "next/cache";
import { geocodeAddress } from "./geocoding";
import { extractS3Key } from "@/utils/extractS3Key";
import { getValidIdToken } from "@/lib/common/authFetch";

type ArticleStatus = "draft" | "published";

interface ReqArticleImage {
  id?: string; // 既存画像のID
  s3Key?: string; // 新規画像はs3Key未定
  caption?: string;
  displayOrder: number;
}

interface ReqArticleReport {
  id?: string;
  title: string;
  description?: string;
  location: string;
  displayOrder: number;
  images: ReqArticleImage[];
  latitude?: number;
  longitude?: number;
  geocodedAddress?: string;
}

export const updateArticleWithImages = async (
  articleId: string,
  formValues: PostFormValues,
  status: ArticleStatus = "draft",
  idToken: string,
) => {
  // ==========================================
  // Step 0: Geocoding（住所→緯度経度）
  // ==========================================

  console.log("🗺️ Geocoding実行中...");

  const reportsWithGeocode = await Promise.all(
    formValues.reports.map(async (report) => {
      // 既存レポートで緯度経度がすでにある場合はスキップ
      if (report.latitude && report.longitude) {
        console.log(`✅ レポート "${report.title}" は既にGeocoding済み`);
        return report;
      }

      // 新規 or 住所が変更された場合はGeocoding実行
      const geocoded = await geocodeAddress(report.location);

      if (geocoded) {
        console.log(
          `✅ "${report.location}" → (${geocoded.latitude}, ${geocoded.longitude})`,
        );
        return {
          ...report,
          latitude: geocoded.latitude,
          longitude: geocoded.longitude,
          geocodedAddress: geocoded.formattedAddress,
        };
      } else {
        console.warn(`⚠️ Geocoding失敗: "${report.location}"`);
        return report; // 緯度経度なしで続行
      }
    }),
  );

  console.log("✅ Geocoding完了");

  // ==========================================
  // Step 1: 新規画像のアップロード
  // ==========================================

  const filesToUpload: File[] = [];
  const fileMetadata: {
    type: "thumbnail" | "report";
    reportIndex?: number;
    imageIndex?: number;
  }[] = [];

  // 1-1. サムネイル
  if (formValues.thumbnail?.file) {
    filesToUpload.push(formValues.thumbnail.file);
    fileMetadata.push({ type: "thumbnail" });
  }

  // 1-2. レポート画像（fileがあるもの = 新規）
  reportsWithGeocode.forEach((report, reportIndex) => {
    report.images.forEach((img, imageIndex) => {
      if (img.file) {
        filesToUpload.push(img.file);
        fileMetadata.push({ type: "report", reportIndex, imageIndex });
      }
    });
  });

  // 1-3. アップロード実行
  let uploadedS3Keys: string[] = [];

  if (filesToUpload.length > 0) {
    console.log(`${filesToUpload.length}個の新規画像をアップロード中...`);
    const presigned = await genPresignedUrl(filesToUpload, idToken);
    const uploaded = await uploadImageToS3(presigned, filesToUpload);
    uploadedS3Keys = uploaded.map((item) => item.urlInfo.s3Key);
  }

  // ==========================================
  // Step 2: リクエストボディを構築
  // ==========================================

  let thumbnailS3Key: string | null = null;
  let uploadIndex = 0;

  // サムネイル
  if (formValues.thumbnail?.file) {
    // 新規アップロード
    thumbnailS3Key = uploadedS3Keys[uploadIndex];
    uploadIndex++;
  } else if (formValues.thumbnail?.isExisting && formValues.thumbnail?.url) {
    // 既存画像を維持
    thumbnailS3Key = extractS3Key(formValues.thumbnail.url);
  } else {
    // サムネイルなし
    thumbnailS3Key = null;
  }

  // レポート
  const reports: ReqArticleReport[] = reportsWithGeocode.map(
    (report, reportIndex) => {
      const images: ReqArticleImage[] = report.images.map((img) => {
        // 既存画像
        if (img.isExisting && img.id) {
          return {
            id: img.id, // ✅ 既存画像ID
            // s3Keyは不要（Lambdaが既存データから取得）
            caption: img.caption,
            displayOrder: img.displayOrder,
          };
        }

        // 新規画像
        const s3Key = uploadedS3Keys[uploadIndex];
        uploadIndex++;

        return {
          s3Key, // ✅ 新規アップロードしたs3Key
          caption: img.caption,
          displayOrder: img.displayOrder,
        };
      });

      return {
        id: report.id, // ✅ 既存レポートID（あれば）
        title: report.title,
        description: report.description,
        location: report.location,
        latitude: report.latitude,
        longitude: report.longitude,
        geocodedAddress: report.geocodedAddress,
        displayOrder: reportIndex + 1,
        images,
      };
    },
  );

  const reqBody: UpdateArticleBody = {
    id: articleId,
    title: formValues.title,
    thumbnailS3Key,
    animeName: formValues.animeName,
    articleStatus: status,
    reports,
  };

  // ==========================================
  // Step 3: Lambda API呼び出し
  // （Lambda側で削除判定 & S3削除 & DB更新）
  // ==========================================

  const updatedArticle = await updateArticle(reqBody, idToken);
  console.log("記事更新完了:", updatedArticle.data.id);

  // キャッシュ無効化
  revalidatePath(`/article/${articleId}`);
  revalidatePath("/articles");
  revalidatePath("/");

  return updatedArticle;
};
