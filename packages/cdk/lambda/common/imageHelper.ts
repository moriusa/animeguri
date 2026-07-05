import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import sharp from "sharp";

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

export const replaceResizedS3Key = (s3Key: string | null) => {
  if (!s3Key) return null;
  return s3Key
    .replace(/^originals\//, "resized/")
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

export const imageConvert = async (s3Key: string) => {
  const s3 = new S3Client({});
  let imageType: "thumbnail" | "reports" | "profile" | null = null;
  if (s3Key.includes("/thumbnail/")) {
    imageType = "thumbnail";
  } else if (s3Key.includes("/reports/")) {
    imageType = "reports";
  } else if (s3Key.includes("/profile/")) {
    imageType = "profile";
  }

  if (!imageType) {
    console.log(`Unknown image category for key: ${s3Key}. Skipping.`);
    return;
  }
  const currentConfig = CONVERT_IMG_CONFIGS[imageType];
  try {
    const getCommand = new GetObjectCommand({ Bucket: S3_BUCKET_NAME, Key: s3Key });
    const response = await s3.send(getCommand);

    if (!response.Body) {
      throw new Error("Response body is empty");
    }
    const responseByteArray = await response.Body.transformToByteArray();
    const inputBuffer = Buffer.from(responseByteArray);

    const dstKey = s3Key
      .replace(/^originals\//, "resized/")
      .replace(/\.[^/.]+$/, ".webp");
    // sharpによる画像処理
    const resizedBuffer = await sharp(inputBuffer)
      .rotate()
      .resize({
        width: currentConfig.maxWidth,
        height: currentConfig.maxHeight,
        fit: currentConfig.fit,
        withoutEnlargement: true,
      })
      .webp({ quality: currentConfig.quality })
      .toBuffer();

    // 最適化した画像をS3に保存
    const putCommand = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: dstKey,
      Body: resizedBuffer,
      ContentType: "image/webp",
    });
    await s3.send(putCommand);
    console.log(`Successfully generated ${imageType} image: ${dstKey}`);

    // delete
    const deleteCommand = new DeleteObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: s3Key,
    });
    await s3.send(deleteCommand);
    console.log(`Successfully deleted original source file: ${s3Key}`);
  } catch (error) {
    console.error(`Error processing ${imageType} image:`, error);
    throw error;
  }
};
