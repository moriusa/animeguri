// lambdas/common/imageHelper.ts
const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN!;

// デフォルト画像はフロントの相対パスを返すようにする
export const DEFAULT_IMAGES = {
  USER_AVATAR: `/defaults/user-avatar.png`,
  ARTICLE_IMAGE: `/defaults/article-thumbnail.png`,
} as const;

export type ImageType = "user" | "article";

/**
 * S3キーをCloudfrontのURLに変換
 * キーがnullの場合はデフォルト画像を返す
 */
export const buildImageUrl = (
  s3Key: string | null | undefined,
  type: ImageType = "user"
): string => {
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
export const getUserImageUrl = (s3Key?: string | null): string => {
  return buildImageUrl(s3Key, "user");
};

/**
 * 記事サムネイルURL取得
 */
export const getArticleImageUrl = (s3Key?: string | null): string => {
  return buildImageUrl(s3Key, "article");
};
