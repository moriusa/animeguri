import { PostFormValues } from "@/components/post/PostFrom";
import { FileWithMeta, genPresignedUrl, uploadImageToS3 } from "@/lib/presignedUrl";
import { useState } from "react";
import { geocodeAddress } from "../geocoding";
import { ArticleResponse } from "@/types/api/article";
import { authFetcher } from "@/lib/fetcher";
import { extractS3Key } from "@/utils/extractS3Key";
import { useSWRConfig } from "swr";
import { clearCache } from "../clearCache";

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

type ArticleStatus = "draft" | "published";

interface ReqArticleImage {
  id: string;
  s3Key?: string; // 新規画像はs3Key未定
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

export const useUpdateArticle = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const { mutate } = useSWRConfig();

  const updateArticle = async (
    articleId: string,
    formValues: PostFormValues,
    status: ArticleStatus = "draft",
  ) => {
    setIsSubmitting(true);
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
              `✅ "${report.prefecture} ${report.city} ${report.streetAddress} ${report.spotName}" → (${geocoded.latitude}, ${geocoded.longitude})`,
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
          articleId,
        });
      }

      reportsWithGeocode.forEach((report) => {
        report.images
          .filter((img) => img.file)
          .forEach((img) => {
            filesWithMeta.push({
              file: img.file!,
              imageType: "report",
              articleId,
              reportId: report.id,
            });
          });
      });

      // ==========================================
      // Step 2: S3アップロード
      // ==========================================
      let uploadedS3Keys: string[] = [];
      if (filesWithMeta.length > 0) {
        console.log(`${filesWithMeta.length}個の新規画像をアップロード中...`);
        const presigned = await genPresignedUrl(filesWithMeta);
        const uploaded = await uploadImageToS3(
          presigned,
          filesWithMeta.map((f) => f.file),
        );
        uploadedS3Keys = uploaded.map((item) => item.urlInfo.s3Key);
      }

      // ==========================================
      // Step 3: thumbnailS3Key と reports を組み立てる
      // ==========================================
      let uploadIndex = 0;

      // サムネイル
      let thumbnailS3Key: string | null = null;
      if (formValues.thumbnail?.file) {
        // 新規アップロード
        thumbnailS3Key = uploadedS3Keys[uploadIndex++];
      } else if (
        formValues.thumbnail?.isExisting &&
        formValues.thumbnail?.url
      ) {
        // 既存画像を維持
        thumbnailS3Key = extractS3Key(formValues.thumbnail.url);
      }

      // レポート
      const reports: ReqArticleReport[] = reportsWithGeocode.map(
        (report, reportIndex) => {
          const images: ReqArticleImage[] = report.images.map((img) => {
            if (img.isExisting) {
              // 既存画像はs3Keyそのまま
              return {
                id: img.id || "",
                caption: img.caption,
                displayOrder: img.displayOrder,
              };
            }
            // 新規画像
            return {
              id: "",
              s3Key: uploadedS3Keys[uploadIndex++],
              caption: img.caption,
              displayOrder: img.displayOrder,
            };
          });

          return {
            id: report.id,
            title: report.title,
            description: report.description,
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

      // ==========================================
      // Step 4: API呼び出し
      // ==========================================
      const reqBody = {
        id: articleId,
        title: formValues.title,
        thumbnailS3Key,
        animeName: formValues.animeName,
        articleStatus: status,
        reports,
      };

      const res = await authFetcher<ArticleResponse>(
        `${API_ENDPOINT}/articles`,
        {
          method: "PATCH",
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
    updateArticle,
    isSubmitting,
    error,
  };
};
