import { genPresignedUrl, uploadImageToS3 } from "@/lib/presignedUrl";
import { authFetcher } from "@/lib/fetcher";
import { extractS3Key } from "@/utils/extractS3Key";
import { useGetUserProfile } from "./useGetUserProfile";
import { useState } from "react";
import { UserResponse } from "@/types/api/user";
import { ProfileFormValues } from "@/app/settings/profile/page";

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

export const useUpdateUserProfile = () => {
  const { refreshUser } = useGetUserProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateProfile = async (formValues: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      // 1. 画像処理
      const profileImageS3Key = await resolveProfileImage(
        formValues.profileImage,
      );

      // 2. リクエストボディ作成
      const reqBody = {
        userName: formValues.userName,
        bio: formValues.bio,
        profileImageS3Key: profileImageS3Key
          ? extractS3Key(profileImageS3Key)
          : undefined,
        xUrl: formValues.xUrl,
        facebookUrl: formValues.facebookUrl,
        youtubeUrl: formValues.youtubeUrl,
        websiteUrl: formValues.websiteUrl,
      };

      // 3. API呼び出し
      const profile = await authFetcher<UserResponse>(
        `${API_ENDPOINT}/user/me`,
        {
          method: "PATCH",
          body: JSON.stringify(reqBody),
        },
      );

      // 4. SWRキャッシュ更新
      await refreshUser();

      return profile;
    } catch (error) {
      console.error("プロフィール更新失敗:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    updateProfile,
    isSubmitting,
  };
};

// 画像処理
const resolveProfileImage = async (
  profileImage: File | string | null | undefined,
): Promise<string | undefined> => {
  // 画像が File型（新規アップロード）の場合のみ処理
  if (profileImage instanceof File) {
    console.log("新しい画像をアップロード中...");
    // 1. 署名付きURLを取得
    const presigned = await genPresignedUrl([profileImage]);
    // 2. S3 にアップロード
    const uploaded = await uploadImageToS3(presigned, [profileImage]);
    return uploaded[0].urlInfo.s3Key;
  }
  if (profileImage === "/defaults/user-avatar.png") {
    console.log("デフォルト画像を使用");
    return undefined;
  }

  if (typeof profileImage === "string") {
    console.log("既存の画像を使用");
    return profileImage;
  }

  console.log("画像なし");
  return undefined;
};
