// import {
//   S3Client,
//   GetObjectCommand,
//   PutObjectCommand,
//   DeleteObjectCommand,
// } from "@aws-sdk/client-s3";
// import { S3Handler } from "aws-lambda";
// import sharp from "sharp";

// const s3 = new S3Client({});

// interface ImageTypeConfig {
//   maxWidth: number;
//   maxHeight: number;
//   quality: number;
//   fit: "inside" | "cover";
// }

// // 💡 3つのパターン（記事サムネイル、レポート内画像、プロフィール）に最適化
// const CONFIGS: Record<"thumbnail" | "reports" | "profile", ImageTypeConfig> = {
//   thumbnail: {
//     maxWidth: 1200, // 記事のアイキャッチ用
//     maxHeight: 1200,
//     quality: 85,
//     fit: "inside",
//   },
//   reports: {
//     maxWidth: 1200, // 聖地巡礼レポートの写真用
//     maxHeight: 1200,
//     quality: 85,
//     fit: "inside",
//   },
//   profile: {
//     maxWidth: 200, // ユーザーのアイコン用（中央正方形クロップ）
//     maxHeight: 200,
//     quality: 85,
//     fit: "cover",
//   },
// };

// export const handler: S3Handler = async (event) => {
//   const record = event.Records[0];
//   const bucket = record.s3.bucket.name;
//   const srcKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

//   console.log(`Processing file from bucket: ${bucket}, key: ${srcKey}`);

//   // 無限ループ防止
//   if (!srcKey.startsWith("originals/")) {
//     console.log("Not an original image. Skipping process.");
//     return;
//   }

//   // 💡 パスの中身に含まれる文字列（キーワード）から自動でタイプを判定する
//   let imageType: "thumbnail" | "reports" | "profile" | null = null;
//   if (srcKey.includes("/thumbnail/")) {
//     imageType = "thumbnail";
//   } else if (srcKey.includes("/reports/")) {
//     imageType = "reports";
//   } else if (srcKey.includes("/profile/")) {
//     imageType = "profile";
//   }

//   if (!imageType) {
//     console.log(`Unknown image category for key: ${srcKey}. Skipping.`);
//     return;
//   }

//   const currentConfig = CONFIGS[imageType];

//   try {
//     // S3からオリジナル画像を取得
//     const getCommand = new GetObjectCommand({ Bucket: bucket, Key: srcKey });
//     const response = await s3.send(getCommand);

//     if (!response.Body) {
//       throw new Error("Response body is empty");
//     }

//     const responseByteArray = await response.Body.transformToByteArray();
//     const inputBuffer = Buffer.from(responseByteArray);

//     // 💡 先頭の "originals/" を "resized/" に置き換え、末尾の拡張子を一律 ".webp" に変換
//     // 例: originals/sub123/articles/art456/reports/rep789/img.jpg -> resized/sub123/articles/art456/reports/rep789/img.webp
//     const dstKey = srcKey
//       .replace(/^originals\//, "resized/")
//       .replace(/\.[^/.]+$/, ".webp");

//     // sharpによる画像処理
//     const resizedBuffer = await sharp(inputBuffer)
//       .rotate()
//       .resize({
//         width: currentConfig.maxWidth,
//         height: currentConfig.maxHeight,
//         fit: currentConfig.fit,
//         withoutEnlargement: true,
//       })
//       .webp({ quality: currentConfig.quality })
//       .toBuffer();

//     // 最適化した画像をS3に保存
//     const putCommand = new PutObjectCommand({
//       Bucket: bucket,
//       Key: dstKey,
//       Body: resizedBuffer,
//       ContentType: "image/webp",
//     });
//     await s3.send(putCommand);
//     console.log(`Successfully generated ${imageType} image: ${dstKey}`);

//     // 【容量節約】処理が成功したら、元の画像（生データ）を削除
//     const deleteCommand = new DeleteObjectCommand({
//       Bucket: bucket,
//       Key: srcKey,
//     });
//     await s3.send(deleteCommand);
//     console.log(`Successfully deleted original source file: ${srcKey}`);
//   } catch (error) {
//     console.error(`Error processing ${imageType} image:`, error);
//     throw error;
//   }
// };
