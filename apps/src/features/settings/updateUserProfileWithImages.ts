import { ProfileFormValues } from "@/app/settings/profile/page";
import { genPresignedUrl, uploadImageToS3 } from "@/lib/presignedUrl";
import { updateUserProfile } from "@/lib/userProfile";

export const updateUserProfileWithImages = async (
  formValues: ProfileFormValues,
  idToken: string
) => {
  // 1. 署名付きURLを取得
  const presigned = await genPresignedUrl([formValues.profileImage!], idToken);

  // 2. S3 にアップロード
  const uploaded = await uploadImageToS3(presigned, [formValues.profileImage!]);

  // 3. フォーム + s3_key を DB スキーマに変換
  const reqBody = {
    user_name: formValues.userName,
    bio: formValues.bio,
    profile_image_s3_key: uploaded[0].urlInfo.s3_key,
    x_url: formValues.xUrl,
    facebook_url: formValues.facebookUrl,
    youtube_url: formValues.youtubeUrl,
    website_url: formValues.websiteUrl,
  };

  // 4. DB保存
  const article = await updateUserProfile(reqBody, idToken);
  console.log("更新完了");
  return article;
};
