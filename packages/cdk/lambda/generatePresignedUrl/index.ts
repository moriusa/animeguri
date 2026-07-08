import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const s3Client = new S3Client({});
const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

// 最大ファイルサイズ（20MB）
const MAX_FILE_SIZE = 20 * 1024 * 1024;

interface PresignedUrlRequest {
  fileName: string;
  contentType: string;
  fileSize: number;
  imageType: "profile" | "thumbnail" | "report";
  articleId?: string;
  reportId?: string;
}

interface PresignedUrlBatchRequest {
  files: PresignedUrlRequest[];
}

export const handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
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
        if (file.fileSize > MAX_FILE_SIZE) {
          throw new Error(
            `File size exceeds limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          );
        }

        if (!file.fileSize || file.fileName.length > 255) {
          throw new Error("Invalid file name");
        }

        // =============================
        // S3キーの生成
        // =============================
        const imageId = randomUUID();
        function getExtension(file: PresignedUrlRequest): string {
          // file.type があればそこから、無ければファイル名から取得
          if (file.contentType) {
            const extFromType = file.contentType.split("/")[1];
            if (extFromType) return extFromType.toLowerCase();
          }
          // file.name から最後のドット以降を取得（万が一ドットがない場合は名前全体が返る）
          return file.fileName.split(".").pop()?.toLowerCase() ?? "";
        }
        const extension = getExtension(file);

        const baseKey =
          file.imageType === "thumbnail"
            ? `${sub}/articles/${file.articleId}/thumbnail/${imageId}.${extension}`
            : file.imageType === "report"
              ? `${sub}/articles/${file.articleId}/reports/${file.reportId}/${imageId}.${extension}`
              : `${sub}/profile/${imageId}.${extension}`;

        const s3Key = `originals/${baseKey}`;
        const deliveryKey = s3Key
          .replace(/^originals\//, "processed/")
          .replace(/\.[^/.]+$/, ".webp");
        const publicUrl = `https://${BUCKET_NAME}.s3.ap-northeast-1.amazonaws.com/${deliveryKey}`;

        const command = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: s3Key,
          ContentType: file.contentType,
          ContentLength: file.fileSize,
          Metadata: {
            "uploaded-by": sub,
            "original-filename": file.fileName,
            "upload-timestamp": new Date().toISOString(),
            "image-type": file.imageType,
          },
        });

        const presignedUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 3600,
        });

        return {
          fileName: file.fileName,
          imageType: file.imageType,
          presignedUrl: presignedUrl,
          imageId: imageId,
          s3Key: s3Key,
          publicUrl: publicUrl,
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
        };
      }),
    );

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ data: results }),
    };
  } catch (e: any) {
    console.error("Generate Presigned URL error:", e);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Internal server error",
      }),
    };
  }
};
