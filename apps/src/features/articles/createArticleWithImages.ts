"use server";
import { ImageItem, PostFormValues, ReportTypes } from "@/components/post/PostFrom";
import { createArticle, CreateArticleBody } from "@/lib/articles";
import { genPresignedUrl, uploadImageToS3 } from "@/lib/presignedUrl";
import { revalidatePath } from "next/cache";
import { geocodeAddress } from "./geocoding";

type ArticleStatus = "draft" | "published";

interface ReqArticleImage {
  s3Key: string;
  caption?: string;
  displayOrder: number;
}

interface ReqArticleReport {
  title: string;
  description?: string;
  location: string;
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
): CreateArticleBody => {
  const { articleStatus, thumbnailS3Key, reportImageS3Keys } = params;
  const reports: ReqArticleReport[] = reportsIncludeGeo.map(
    (report, reportIndex) => {
      const s3Keys = reportImageS3Keys[reportIndex] ?? [];
      const images: ReqArticleImage[] = s3Keys.map((s3Key, imageIndex) => {
        const imageItem = report.images[imageIndex];
        return {
          s3Key: s3Key,
          caption: imageItem?.caption || undefined,
          displayOrder: imageItem?.displayOrder ?? imageIndex + 1,
        };
      });

      return {
        title: report.title,
        description: report.description, // フォームに description があればここでマッピング
        location: report.location,
        latitude: report.latitude,
        longitude: report.longitude,
        geocodedAddress: report.geocodedAddress,
        displayOrder: reportIndex + 1,
        images,
      };
    },
  );

  return {
    title: form.title,
    thumbnailS3Key: thumbnailS3Key,
    animeName: form.animeName,
    articleStatus: articleStatus,
    reports,
  };
};

export const createArticleWithImages = async (
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
  // 1. アップロード対象ファイルを 1 本の配列にまとめる
  const files: File[] = [];

  // thumbnail を先頭に入れる（あれば）
  const hasThumbnail = !!formValues.thumbnail;
  if (formValues.thumbnail?.file) {
    files.push(formValues.thumbnail.file);
  }

  // 各レポートの images から File を抽出
  const reportImageStartIndex: number[] = [];
  reportsWithGeocode.forEach((report) => {
    reportImageStartIndex.push(files.length);

    // ImageItem[] から file が存在するもののみ抽出
    const imageFiles = report.images
      .filter((img: ImageItem) => img.file !== undefined)
      .map((img: ImageItem) => img.file!);

    files.push(...imageFiles);
  });

  // ファイルがなければ画像なし記事としてそのまま DB 保存してもよい
  // if (files.length === 0) {
  //   const reqBody = toReqArticle(formValues, {
  //     articleStatus: status,
  //     thumbnailUrl: null,
  //     reportImageUrls: formValues.reports.map(() => []),
  //   });
  //   return await createArticle(reqBody);
  // }

  // 2. 署名付きURLを取得
  const presigned = await genPresignedUrl(files, idToken);

  // 3. S3 にアップロード
  const uploaded = await uploadImageToS3(presigned, files);

  // 4. thumbnailS3Key と reportImageS3Keys を組み立てる
  let thumbnailS3Key: string | null = null;
  const reportImageS3Keys: string[][] = reportsWithGeocode.map(() => []);

  uploaded.forEach((item, index) => {
    const s3Key = item.urlInfo.s3Key;

    if (hasThumbnail && index === 0) {
      thumbnailS3Key = s3Key;
      return;
    }

    const offset = hasThumbnail ? index - 1 : index;

    let reportIndex = 0;
    while (
      reportIndex < reportImageStartIndex.length - 1 &&
      offset >= reportImageStartIndex[reportIndex + 1] - (hasThumbnail ? 1 : 0)
    ) {
      reportIndex++;
    }
    reportImageS3Keys[reportIndex].push(s3Key);
  });

  // 5. フォーム + s3_key を DB スキーマに変換
  const reqBody = toReqArticle(formValues,reportsWithGeocode,
  {
    articleStatus: status,
    thumbnailS3Key,
    reportImageS3Keys,
  });

  // 6. DB 保存
  const article = await createArticle(reqBody, idToken);
  console.log("投稿完了");
  // キャッシュを無効化
  revalidatePath("/");
  return article;
};
