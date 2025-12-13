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
  image_type: "thumbnail" | "report";
}

interface PresignedUrlBatchRequest {
  files: PresignedUrlRequest[];
}

export const handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer
) => {
  const sub = event.requestContext.authorizer.jwt.claims.sub as string;

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Request body is required" }),
      };
    }

    const body: PresignedUrlBatchRequest = JSON.parse(event.body);

    if (!body.files || body.files.length === 0) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "files is required" }),
      };
    }

    // ここでまとめて処理
    const results = await Promise.all(
      body.files.map(async (file) => {
        // =============================
        // バリデーション
        // =============================
        if (!ALLOWED_CONTENT_TYPES.includes(file.content_type)) {
          throw new Error(`Invalid content type: ${file.content_type}`);
        }

        if (file.file_size > MAX_FILE_SIZE) {
          throw new Error(
            `File size exceeds limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`
          );
        }

        if (!file.file_name || file.file_name.length > 255) {
          throw new Error("Invalid file name");
        }

        // =============================
        // S3キーの生成
        // =============================
        const imageId = randomUUID();
        const extension = file.content_type.split("/")[1];
        const timestamp = new Date().toISOString().split("T")[0];

        const s3Key = `uploads/${sub}/${file.image_type}/${timestamp}/${imageId}.${extension}`;

        const command = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: s3Key,
          ContentType: file.content_type,
          ContentLength: file.file_size,
          Metadata: {
            "uploaded-by": sub,
            "original-filename": file.file_name,
            "upload-timestamp": new Date().toISOString(),
            "image-type": file.image_type,
          },
        });

        const presignedUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 3600,
        });

        return {
          file_name: file.file_name,
          image_type: file.image_type,
          presigned_url: presignedUrl,
          image_id: imageId,
          s3_key: s3Key,
          public_url: `https://${BUCKET_NAME}.s3.ap-northeast-1.amazonaws.com/${s3Key}`,
          expires_at: new Date(Date.now() + 3600000).toISOString(),
        };
      })
    );

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ urls: results }),
    };
  } catch (e: any) {
    console.error("Generate Presigned URL error:", e);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Failed to generate presigned URLs",
        error: e.message,
      }),
    };
  }
};
