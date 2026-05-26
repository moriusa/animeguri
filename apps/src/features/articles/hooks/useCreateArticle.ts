import { PostFormValues, ReportTypes } from "@/components/post/PostFrom";
import {
  convertHeicFilesIfNeeded,
  FileWithMeta,
  genPresignedUrl,
  uploadImageToS3,
} from "@/lib/presignedUrl";
import { useState } from "react";
import { geocodeAddress } from "../geocoding";
import { ArticleResponse } from "@/types/api/article";
import { authFetcher } from "@/lib/fetcher";
import { useSWRConfig } from "swr";
import { clearCache } from "../clearCache";

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

type ArticleStatus = "draft" | "published";

interface ReqArticleImage {
  id: string;
  s3Key: string;
  caption?: string;
  displayOrder: number;
}

interface ReqArticleReport {
  id: string;
  title: string;
  description?: string;
  prefecture: string;
  city: string;
  streetAddress?: string;
  spotName?: string;
  displayOrder: number;
  images: ReqArticleImage[];
  latitude?: number;
  longitude?: number;
  geocodedAddress?: string;
}

// 投稿スキーマからDBスキーマに変換
const toReqArticle = (
  form: PostFormValues,
  reportsIncludeGeo: ReportTypes[],
  params: {
    articleStatus: ArticleStatus;
    thumbnailS3Key: string | null;
    reportImageS3Keys: string[][]; // [reportIndex][imageIndex]
  },
) => {
  const { articleStatus, thumbnailS3Key, reportImageS3Keys } = params;
  const reports: ReqArticleReport[] = reportsIncludeGeo.map(
    (report, reportIndex) => {
      const s3Keys = reportImageS3Keys[reportIndex] ?? [];
      const images: ReqArticleImage[] = s3Keys.map((s3Key, imageIndex) => {
        const imageItem = report.images[imageIndex];
        return {
          id: crypto.randomUUID(),
          s3Key: s3Key,
          caption: imageItem?.caption || undefined,
          displayOrder: imageItem?.displayOrder ?? imageIndex + 1,
        };
      });

      return {
        id: report.id,
        title: report.title,
        description: report.description, // フォームに description があればここでマッピング
        prefecture: report.prefecture,
        city: report.city,
        streetAddress: report.streetAddress,
        spotName: report.spotName,
        latitude: report.latitude,
        longitude: report.longitude,
        geocodedAddress: report.geocodedAddress,
        displayOrder: reportIndex + 1,
        images,
      };
    },
  );

  return {
    id: form.id,
    title: form.title,
    thumbnailS3Key: thumbnailS3Key,
    animeName: form.animeName,
    articleStatus: articleStatus,
    reports,
  };
};

export const useCreateArticle = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const { mutate } = useSWRConfig();

  const createArticle = async (
    formValues: PostFormValues,
    status: ArticleStatus = "draft",
  ) => {
    try {
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
          const geocoded = await geocodeAddress({
            prefecture: report.prefecture,
            city: report.city,
            streetAddress: report.streetAddress,
            spotName: report.spotName,
          });

          if (geocoded) {
            console.log(
              `"${report.prefecture} ${report.city} ${report.streetAddress} ${report.spotName}" → (${geocoded.latitude}, ${geocoded.longitude})`,
            );
            return {
              ...report,
              latitude: geocoded.latitude,
              longitude: geocoded.longitude,
              geocodedAddress: geocoded.formattedAddress,
            };
          } else {
            console.warn(
              `⚠️ Geocoding失敗: "${report.prefecture} ${report.city} ${report.streetAddress} ${report.spotName}"`,
            );
            return report; // 緯度経度なしで続行
          }
        }),
      );

      console.log("✅ Geocoding完了");
      // ==========================================
      // Step 1: アップロード対象ファイルをまとめる
      // ==========================================
      const filesWithMeta: FileWithMeta[] = [];
      if (formValues.thumbnail?.file) {
        filesWithMeta.push({
          file: formValues.thumbnail.file,
          imageType: "thumbnail",
          articleId: formValues.id, // フロントで事前生成したID
        });
      }

      // 各レポートの images から File を抽出
      reportsWithGeocode.forEach((report) => {
        report.images
          .filter((img) => img.file)
          .forEach((img) => {
            filesWithMeta.push({
              file: img.file!,
              imageType: "report",
              articleId: formValues.id,
              reportId: report.id,
            });
          });
      });

      // ==========================================
      // Step 2: S3アップロード
      // ==========================================
      let uploadedS3Keys: string[] = [];
      if (filesWithMeta.length > 0) {
        const jpegFilesWithMeta = await convertHeicFilesIfNeeded(filesWithMeta);
        console.log(`${filesWithMeta.length}個の新規画像をアップロード中...`);
        const presigned = await genPresignedUrl(jpegFilesWithMeta);
        const uploaded = await uploadImageToS3(
          presigned,
          filesWithMeta.map((f) => f.file),
        );
        uploadedS3Keys = uploaded.map((item) => item.urlInfo.s3Key);
      }

      // ==========================================
      // Step 3: thumbnailS3Key と reportImageS3Keys を組み立てる
      // ==========================================
      let uploadIndex = 0;

      const thumbnailS3Key = formValues.thumbnail?.file
        ? uploadedS3Keys[uploadIndex++] // 新規
        : null; // サムネイルなし

      const reportImageS3Keys: string[][] = reportsWithGeocode.map((report) => {
        return report.images
          .filter((img) => img.file)
          .map(() => uploadedS3Keys[uploadIndex++]);
      });

      // ==========================================
      // Step 4: DBスキーマに変換してAPI呼び出し
      // ==========================================
      const reqBody = toReqArticle(formValues, reportsWithGeocode, {
        articleStatus: status,
        thumbnailS3Key,
        reportImageS3Keys,
      });

      const res = await authFetcher<ArticleResponse>(
        `${API_ENDPOINT}/articles`,
        {
          method: "POST",
          body: JSON.stringify(reqBody),
        },
      );

      // キャッシュ削除
      await mutate(
        (key) => typeof key === "string" && key.includes("/articles"),
      );
      await mutate((key) => typeof key === "string" && key.includes("/user"));
      await mutate(
        (key) => typeof key === "string" && key.includes("/reports"),
      );
      clearCache();
      return res;
    } catch (error: unknown) {
      setError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createArticle,
    isSubmitting,
    error,
  };
};
