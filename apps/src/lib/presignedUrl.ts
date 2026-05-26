import { PresignedUrlResponse } from "@/types/api/presignedUrl";
import { getValidIdToken } from "./common/authFetch";
import { heicTo } from "heic-to";

export interface FileWithMeta {
  file: File;
  imageType: "profile" | "thumbnail" | "report";
  articleId?: string;
  reportId?: string;
}

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

export const genPresignedUrl = async (
  filesWithMeta: FileWithMeta[],
): Promise<PresignedUrlResponse> => {
  const idToken = await getValidIdToken();
  if (!idToken) {
    throw new Error("認証トークンが取得できません");
  }
  const payload = {
    files: filesWithMeta.map(({ file, imageType, articleId, reportId }) => ({
      fileName: file.name,
      contentType: file.type,
      fileSize: file.size,
      imageType: imageType,
      articleId,
      reportId,
    })),
  };
  const response = await fetch(`${API_ENDPOINT}/presigned-url`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }

  return response.json();
};

export const uploadImageToS3 = async (
  presigned: PresignedUrlResponse,
  files: File[],
) => {
  if (presigned.data.length !== files.length) {
    throw new Error("presigned urls と files の数が一致していません");
  }

  // presigned.urls[i] と files[i] を対応させてアップロード
  const uploadPromises = presigned.data.map((urlInfo, index) => {
    const file = files[index];

    return fetch(urlInfo.presignedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
        "Content-Length": file.size.toString(),
      },
    }).then((res) => {
      if (!res.ok) {
        throw new Error(`Upload failed for ${urlInfo.fileName}: ${res.status}`);
      }

      return {
        file,
        urlInfo, // S3 のキーや public_url など
      };
    });
  });

  // 並列で全部投げる
  const results = await Promise.all(uploadPromises);

  // そのまま返してもいいし、必要な情報だけ抽出して返してもOK
  return results;
};

export const convertHeicFilesIfNeeded = async (
  items: FileWithMeta[],
): Promise<FileWithMeta[]> => {
  return Promise.all(
    items.map(async (item) => {
      const { file } = item;

      const isHeicOrHeif =
        file.type.includes("heic") ||
        file.type.includes("heif") ||
        file.name.toLowerCase().endsWith(".heic") ||
        file.name.toLowerCase().endsWith(".heif");

      if (!isHeicOrHeif) {
        return item; // HEIC以外はそのまま無加工で返す
      }

      try {
        console.log(`HEIC/HEIF検出・JPEG変換中: ${file.name}`);
        // 💡 heic-toの戻り値は Blob 型になります
        const convertedBlob = await heicTo({
          blob: file,
          type: "image/jpeg",
          quality: 0.8,
        });

        // 💡 【ここを修正】Blob から正式な「File」オブジェクトを再生成する
        // 元の拡張子（.heicなど）を .jpg に置換したファイル名を作る
        const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";

        const convertedFile = new File([convertedBlob], newFileName, {
          type: "image/jpeg",
          lastModified: file.lastModified, // 元の更新日時を引き継ぐ
        });

        return {
          ...item,
          file: convertedFile, // 新しいJPEGのFileオブジェクトに差し替え
        };
      } catch (error) {
        console.error(`画像の変換に失敗 (${file.name}):`, error);
        return item; // 失敗時は安全のため元のファイルを流す
      }
    }),
  );
};
