import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const s3Client = new S3Client({});
const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

// 許可する画像タイプ
const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

// 最大ファイルサイズ（5MB）
const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface PresignedUrlRequest {
  file_name: string;
  content_type: string;
  file_size: number;
  image_type: "thumbnail" | "report"; // 画像の用途
}

export const handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer
) => {
  const sub = event.requestContext.authorizer.jwt.claims.sub as string;

  try {
    console.log(
      "Generate Presigned URL Event:",
      JSON.stringify(event, null, 2)
    );

    if (!event.body) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Request body is required" }),
      };
    }

    const body: PresignedUrlRequest = JSON.parse(event.body);

    // ========================================
    // バリデーション
    // ========================================

    // 1. Content-Type チェック
    if (!ALLOWED_CONTENT_TYPES.includes(body.content_type)) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Invalid content type",
          allowed_types: ALLOWED_CONTENT_TYPES,
        }),
      };
    }

    // 2. ファイルサイズチェック
    if (body.file_size > MAX_FILE_SIZE) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `File size exceeds limit of ${
            MAX_FILE_SIZE / 1024 / 1024
          }MB`,
        }),
      };
    }

    // 3. ファイル名の検証
    if (!body.file_name || body.file_name.length > 255) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Invalid file name",
        }),
      };
    }

    // ========================================
    // S3キーの生成
    // ========================================
    const imageId = randomUUID();
    const extension = body.content_type.split("/")[1]; // jpeg, png, webp, gif
    const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // パスの構造: uploads/{user_id}/{image_type}/{date}/{uuid}.{ext}
    const s3Key = `uploads/${sub}/${body.image_type}/${timestamp}/${imageId}.${extension}`;

    // ========================================
    // 署名付きURL生成（制約付き）
    // ========================================
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      ContentType: body.content_type, // ✅ アップロード時にこのContent-Typeを強制
      ContentLength: body.file_size, // ✅ 指定したサイズのみ許可
      Metadata: {
        "uploaded-by": sub,
        "original-filename": body.file_name,
        "upload-timestamp": new Date().toISOString(),
        "image-type": body.image_type,
      },
    });

    // 署名付きURL生成（1時間有効）
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1時間
    });

    // ========================================
    // レスポンス
    // ========================================
    const response = {
      presigned_url: presignedUrl,
      image_id: imageId,
      s3_key: s3Key,
      // ✅ フロントがアップロード完了後にDBに保存するURL
      public_url: `https://${BUCKET_NAME}.s3.ap-northeast-1.amazonaws.com/${s3Key}`,
      expires_at: new Date(Date.now() + 3600000).toISOString(), // 1時間後
    };

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(response),
    };
  } catch (e: any) {
    console.error("Generate Presigned URL error:", e);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Failed to generate presigned URL",
        error: e.message,
      }),
    };
  }
};
