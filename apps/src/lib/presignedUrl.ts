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
