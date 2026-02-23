"use client";
import { Input } from "@/components/common";
import { ProfileImageUpload } from "@/components/settings/ProfileImageUpload";
import { setUserProfile } from "@/features";
import { updateUserProfileWithImages } from "@/features/settings/updateUserProfileWithImages";
import { useGetUserProfile } from "@/features/settings/useGetUserProfile";
import { RootState } from "@/store";
import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

export interface ProfileFormValues {
  userName: string;
  bio: string;
  profileImage: File | string | null;
  xUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  websiteUrl: string;
}

const Page = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const { profile, error, loading } = useGetUserProfile();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    mode: "onChange",
    defaultValues: {
      userName: "",
      bio: "",
      profileImage: null,
      xUrl: "",
      facebookUrl: "",
      youtubeUrl: "",
      websiteUrl: "",
    },
  });

  // プロフィール取得後、フォームにデフォルト値をセット
  useEffect(() => {
    console.log(profile);
    if (profile) {
      reset({
        userName: profile.userName || "",
        bio: profile.bio || "",
        profileImage: profile.profileImageUrl,
        xUrl: profile.xUrl || "",
        facebookUrl: profile.facebookUrl || "",
        youtubeUrl: profile.youtubeUrl || "",
        websiteUrl: profile.websiteUrl || "",
      });
    }
  }, [profile, reset]);

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    try {
      const res = await updateUserProfileWithImages(data, user!.idToken);
      dispatch(setUserProfile(res.data));
      // フォームの状態をリセット（これで isDirty が false になる）
      reset(data);
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirm = window.confirm(
        "変更内容が保存されていません。破棄しますか？",
      );
      if (!confirm) return;
    }

    // プロフィール値にリセット
    if (profile) {
      reset({
        userName: profile.userName || "",
        bio: profile.bio || "",
        profileImage: profile.profileImageUrl || null,
        xUrl: profile.xUrl || "",
        facebookUrl: profile.facebookUrl || "",
        youtubeUrl: profile.youtubeUrl || "",
        websiteUrl: profile.websiteUrl || "",
      });
    }
  };

  // ローディング表示
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  // エラー表示
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold mb-2">
            エラーが発生しました
          </h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  // ユーザー未認証
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">ログインが必要です</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="font-bold text-2xl text-gray-900">プロフィール編集</h2>
          <p className="text-gray-600 text-sm mt-1">
            あなたの公開プロフィール情報を編集できます
          </p>
        </div>

        {/* プロフィール画像セクション */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-4">
            プロフィール画像
          </h3>
          <ProfileImageUpload
            control={control}
            defaultImage={profile?.profileImageUrl}
            errors={errors}
          />
        </div>

        {/* 基本情報セクション */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-6">基本情報</h3>
          <div className="space-y-6">
            <Input
              id="userName"
              text="ユーザー名"
              type="text"
              name="userName"
              register={register}
              validation={{
                required: "ユーザー名は必須です",
                minLength: {
                  value: 2,
                  message: "ユーザー名は2文字以上で入力してください",
                },
                maxLength: {
                  value: 50,
                  message: "ユーザー名は50文字以内で入力してください",
                },
              }}
              error={errors.userName?.message}
              placeholder="山田太郎"
            />

            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                自己紹介
              </label>
              <textarea
                id="bio"
                {...register("bio", {
                  maxLength: {
                    value: 500,
                    message: "自己紹介は500文字以内で入力してください",
                  },
                })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="あなたについて簡単に教えてください"
              />
              {errors.bio && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.bio.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ソーシャルリンクセクション */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-2">
            ソーシャルリンク
          </h3>
          <p className="text-gray-600 text-sm mb-6">
            あなたのソーシャルメディアやウェブサイトのURLを追加できます（任意）
          </p>

          <div className="space-y-6">
            <Input
              id="xUrl"
              text="X (Twitter)"
              type="url"
              name="xUrl"
              register={register}
              validation={{
                pattern: {
                  value: /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/.+$/,
                  message: "正しいX/TwitterのURLを入力してください",
                },
              }}
              error={errors.xUrl?.message}
              placeholder="https://twitter.com/example"
            />

            <Input
              id="facebookUrl"
              text="Facebook"
              type="url"
              name="facebookUrl"
              register={register}
              validation={{
                pattern: {
                  value: /^(https?:\/\/)?(www\.)?facebook\.com\/.+$/,
                  message: "正しいFacebookのURLを入力してください",
                },
              }}
              error={errors.facebookUrl?.message}
              placeholder="https://facebook.com/example"
            />

            <Input
              id="youtubeUrl"
              text="YouTube"
              type="url"
              name="youtubeUrl"
              register={register}
              validation={{
                pattern: {
                  value: /^(https?:\/\/)?(www\.)?youtube\.com\/.+$/,
                  message: "正しいYouTubeのURLを入力してください",
                },
              }}
              error={errors.youtubeUrl?.message}
              placeholder="https://youtube.com/channel/example"
            />

            <Input
              id="websiteUrl"
              text="ウェブサイト"
              type="url"
              name="websiteUrl"
              register={register}
              validation={{
                pattern: {
                  value: /^(https?:\/\/)?(www\.)?[\w\-]+(\.[\w\-]+)+[/#?]?.*$/,
                  message: "正しいURLを入力してください",
                },
              }}
              error={errors.websiteUrl?.message}
              placeholder="https://example.com"
            />
          </div>
        </div>

        {/* 送信ボタン */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  保存中...
                </>
              ) : (
                "変更を保存"
              )}
            </button>
          </div>

          {/* 変更があることを示すメッセージ */}
          {isDirty && !isSubmitting && (
            <p className="text-sm text-yellow-600 mt-3 text-right">
              ⚠️ 未保存の変更があります
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default Page;
