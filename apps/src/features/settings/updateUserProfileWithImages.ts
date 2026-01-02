"use server";
import { ProfileFormValues } from "@/app/settings/profile/page";
import { genPresignedUrl, uploadImageToS3 } from "@/lib/presignedUrl";
import { updateUserProfile } from "@/lib/userProfile";
import { extractS3Key } from "@/utils/extractS3Key";
import { revalidatePath } from "next/cache";

export const updateUserProfileWithImages = async (
  formValues: ProfileFormValues,
  idToken: string
) => {
  let profileImageS3Key: string | undefined;

  // 画像が File型（新規アップロード）の場合のみ処理
  if (formValues.profileImage instanceof File) {
    console.log("🖼️ 新しい画像をアップロード中...");

    // 1. 署名付きURLを取得
    const presigned = await genPresignedUrl([formValues.profileImage], idToken);

    // 2. S3 にアップロード
    const uploaded = await uploadImageToS3(presigned, [
      formValues.profileImage,
    ]);

    profileImageS3Key = uploaded[0].urlInfo.s3_key;
  } else if (typeof formValues.profileImage === "string") {
    // 既存の画像URL（変更なし）
    console.log("既存の画像を使用");
    profileImageS3Key = formValues.profileImage; // 既存のs3_key
  } else {
    // 画像が削除された場合
    console.log("画像を削除");
    profileImageS3Key = undefined;
  }

  if(!profileImageS3Key){
    return console.log("プロフィール画像がありません")
  }

  // 3. フォーム + s3_key を DB スキーマに変換
  const reqBody = {
    user_name: formValues.userName,
    bio: formValues.bio,
    profile_image_s3_key: extractS3Key(profileImageS3Key),
    x_url: formValues.xUrl,
    facebook_url: formValues.facebookUrl,
    youtube_url: formValues.youtubeUrl,
    website_url: formValues.websiteUrl,
  };

  console.log("form変換", reqBody)

  // 4. DB保存
  const profile = await updateUserProfile(reqBody, idToken);
  console.log("更新完了");
  revalidatePath("/", "layout");
  // revalidatePath("/user");
  // revalidatePath("/dashboard");
  // revalidatePath("/settings");
  return profile
};
