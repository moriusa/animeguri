interface PresignedUrlRes {
  urls: {
    file_name: string;
    image_type: string;
    presigned_url: string;
    image_id: string;
    s3_key: string;
    public_url: string;
    expires_at: string;
  }[];
}

const API_ENDPOINT =
  "https://13ququ06v4.execute-api.ap-northeast-1.amazonaws.com";

export const genPresignedUrl = async (
  files: File[],
  idToken: string
): Promise<PresignedUrlRes> => {
  const payload = {
    files: files.map((file) => ({
      file_name: file.name,
      content_type: file.type,
      file_size: file.size,
      image_type: "report" as const,
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
  presigned: PresignedUrlRes,
  files: File[]
) => {
  if (presigned.urls.length !== files.length) {
    throw new Error("presigned urls と files の数が一致していません");
  }

  // presigned.urls[i] と files[i] を対応させてアップロード
  const uploadPromises = presigned.urls.map((urlInfo, index) => {
    const file = files[index];

    return fetch(urlInfo.presigned_url, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
        "Content-Length": file.size.toString(),
      },
    }).then((res) => {
      if (!res.ok) {
        throw new Error(
          `Upload failed for ${urlInfo.file_name}: ${res.status}`
        );
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
