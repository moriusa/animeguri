import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN!;
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME!;

// デフォルト画像はフロントの相対パスを返すようにする
export const DEFAULT_IMAGES = {
  USER_AVATAR: `/defaults/user-avatar.png`,
  ARTICLE_IMAGE: null,
} as const;

export type ImageType = "user" | "article";

/**
 * S3キーをCloudfrontのURLに変換
 * キーがnullの場合はデフォルト画像を返す
 */
export const buildImageUrl = (
  s3Key: string | null | undefined,
  type: ImageType = "user",
): string | null => {
  if (!s3Key) {
    return type === "user"
      ? DEFAULT_IMAGES.USER_AVATAR
      : DEFAULT_IMAGES.ARTICLE_IMAGE;
  }
  return `https://${CLOUDFRONT_DOMAIN}/${s3Key}`;
};

/**
 * ユーザー画像URL取得
 */
export const getUserImageUrl = (s3Key?: string | null) => {
  return buildImageUrl(s3Key, "user");
};

/**
 * 記事サムネイルURL取得
 */
export const getArticleImageUrl = (s3Key?: string | null) => {
  return buildImageUrl(s3Key, "article");
};

export const replaceProcessedS3Key = (s3Key: string | null) => {
  if (!s3Key) return null;
  return s3Key
    .replace(/^originals\//, "processed/")
    .replace(/\.[^/.]+$/, ".webp");
};

// webp変換処理
interface ConvertImageConfigType {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  fit: "inside" | "cover";
}

const CONVERT_IMG_CONFIGS: Record<
  "thumbnail" | "reports" | "profile",
  ConvertImageConfigType
> = {
  thumbnail: {
    maxWidth: 1200, // 記事のアイキャッチ用
    maxHeight: 1200,
    quality: 85,
    fit: "inside",
  },
  reports: {
    maxWidth: 1200, // 聖地巡礼レポートの写真用
    maxHeight: 1200,
    quality: 85,
    fit: "inside",
  },
  profile: {
    maxWidth: 200, // ユーザーのアイコン用（中央正方形クロップ）
    maxHeight: 200,
    quality: 85,
    fit: "cover",
  },
};
