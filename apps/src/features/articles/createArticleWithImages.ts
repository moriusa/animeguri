import { PostFormValues } from "@/app/post/page";
import { createArticle, CreateArticleBody } from "@/lib/articles";
import { genPresignedUrl, uploadImageToS3 } from "@/lib/presignedUrl";

type ArticleStatus = "draft" | "published" | "archived";

interface ReqArticleImage {
  s3_key: string;
  caption?: string;
  display_order: number;
}

interface ReqArticleReport {
  title: string;
  description?: string;
  location: string;
  display_order: number;
  images: ReqArticleImage[];
}

// 投稿スキーマからDBスキーマに変換
const toReqArticle = (
  form: PostFormValues,
  params: {
    articleStatus: ArticleStatus;
    thumbnailS3Key: string | null;
    reportImageS3Keys: string[][]; // [reportIndex][imageIndex]
  }
): CreateArticleBody => {
  const { articleStatus, thumbnailS3Key, reportImageS3Keys } = params;
  const reports: ReqArticleReport[] = form.reports.map(
    (report, reportIndex) => {
      const s3Keys = reportImageS3Keys[reportIndex] ?? [];
      const images: ReqArticleImage[] = s3Keys.map((s3Key, imageIndex) => ({
        s3_key: s3Key,
        caption: report.captions?.[imageIndex] || undefined,
        display_order: imageIndex + 1,
      }));

      return {
        title: report.inputValue, // ← ここをどの値にするかは要件次第
        description: report.description, // フォームに description があればここでマッピング
        location: report.location,
        display_order: reportIndex + 1,
        images,
      };
    }
  );

  return {
    title: form.title,
    thumbnail_s3_key: thumbnailS3Key,
    anime_name: form.animeName,
    article_status: articleStatus,
    reports,
  };
};

export const createArticleWithImages = async (
  formValues: PostFormValues,
  status: ArticleStatus = "draft"
) => {
  // 1. アップロード対象ファイルを 1 本の配列にまとめる
  const files: File[] = [];

  // thumbnail を先頭に入れる（あれば）
  const hasThumbnail = !!formValues.thumbnail;
  if (formValues.thumbnail) {
    files.push(formValues.thumbnail);
  }

  // 各レポートの images を順番に詰める
  const reportImageStartIndex: number[] = []; // 各 report の images の開始インデックスを記録
  formValues.reports.forEach((report) => {
    reportImageStartIndex.push(files.length);
    files.push(...report.images);
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
  const presigned = await genPresignedUrl(files);

  // 3. S3 にアップロード
  const uploaded = await uploadImageToS3(presigned, files);

  // 4. thumbnailS3Key と reportImageS3Keys を組み立てる
  let thumbnailS3Key: string | null = null;
  const reportImageS3Keys: string[][] = formValues.reports.map(() => []);

  uploaded.forEach((item, index) => {
    const s3Key = item.urlInfo.s3_key;

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
  const reqBody = toReqArticle(formValues, {
    articleStatus: status,
    thumbnailS3Key,
    reportImageS3Keys,
  });

  // 6. DB 保存
  const article = await createArticle(reqBody);
  return article;
};
