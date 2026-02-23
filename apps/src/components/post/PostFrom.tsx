"use client";
import { Input } from "@/components/common";
import { Thumbnail } from "@/components/post/Thumbnail";
import { Report } from "@/components/post";
import { useForm } from "react-hook-form";
import { createArticleWithImages } from "@/features/articles/createArticleWithImages";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { redirect } from "next/navigation";
import { updateArticleWithImages } from "@/features/articles/updateArticleWithImages";
import { getValidIdToken } from "@/lib/common/authFetch";

export interface ImageItem {
  id?: string; // 既存画像のID（編集時のみ使用）
  file?: File; // 新規画像のFileオブジェクト
  url: string; // プレビュー表示用URL（既存 or createObjectURL）
  caption?: string;
  isExisting: boolean; // 既存画像かどうか
  displayOrder: number;
}

export interface ThumbnailItem {
  file?: File;
  url?: string;
  isExisting: boolean;
}

export interface ReportTypes {
  id: string;
  title: string;
  images: ImageItem[];
  location: string;
  description: string;
  latitude?: number;
  longitude?: number;
  geocodedAddress?: string;
}

export interface PostFormValues {
  id: string;
  title: string;
  thumbnail: ThumbnailItem | null;
  animeName: string;
  reports: ReportTypes[];
}

interface PostFormProps {
  mode: "create" | "edit";
  initialData?: PostFormValues; // 編集時の初期データ
}

export const PostForm = ({ mode, initialData }: PostFormProps) => {
  const user = useSelector((state: RootState) => state.auth.user);

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    resetField,
    reset,
    formState: { errors },
    watch,
    control,
    getValues,
  } = useForm<PostFormValues>({
    defaultValues: initialData || {
      id: Date.now().toString(),
      title: "",
      thumbnail: null,
      animeName: "",
      reports: [
        {
          id: "",
          images: [],
          title: "",
          location: "",
          description: "",
        },
      ],
    },
  });

  const reports = watch("reports");

  // レポート追加
  const handleAddReport = () => {
    const newReport = {
      id: Date.now().toString(),
      images: [],
      title: "",
      location: "",
      captions: [],
      description: "",
    };
    setValue("reports", [...reports, newReport]);
  };

  // レポート削除
  const handleDeleteReport = (index: number) => {
    alert(`このレポート${index + 1}を削除しました`);
    setValue(
      "reports",
      reports.filter((_, i) => i !== index),
    );
  };

  // 画像変更処理
  const handleImageChange = (index: number, images: ImageItem[]) => {
    const updatedReports = [...reports];
    updatedReports[index].images = images;
    setValue("reports", updatedReports);
  };

  if (!user) {
    return <p>ログインしてください</p>;
  }

  const onSubmit = async (
    data: PostFormValues,
    status: "draft" | "published",
  ) => {
    console.log("送信:", status, data);
    const idToken = await getValidIdToken();
    if (!idToken) return console.log("idToken is undefined");
    if (mode === "create") {
      await createArticleWithImages(data, status, idToken);
    } else if (mode === "edit") {
      await updateArticleWithImages(data.id, data, status, idToken);
    }
    reset();
    redirect("/");
  };

  // 下書き：バリデーション無しで保存
  const handleDraftSubmit = async () => {
    const data = getValues();
    await onSubmit(data, "draft");
  };
  // 公開：バリデーションして保存（今ある required が効く）
  const handlePublishSubmit = handleSubmit((data) =>
    onSubmit(data, "published"),
  );

  return (
    <div className="p-4">
      <form>
        <Input
          id={"title"}
          text="タイトル"
          name={"title"}
          register={register}
          placeholder="タイトルを入力"
          validation={{ required: "タイトルを入力してください" }}
          error={errors?.title?.message}
        />
        <Input
          id={"animeName"}
          text="アニメ名"
          name={"animeName"}
          register={register}
          placeholder="アニメ名を入力"
          validation={{ required: "アニメ名を入力してください" }}
          error={errors?.animeName?.message}
        />
        <div className="mt-8">
          <Thumbnail control={control} errors={errors} />
        </div>

        {/* レポート一覧 */}
        <div className="mt-8">
          {reports.map((report, index) => (
            <Report
              key={report.id}
              index={index}
              onImageChange={handleImageChange}
              onDelete={handleDeleteReport}
              register={register}
              errors={errors}
              reportData={report}
              clearErrors={clearErrors}
              resetField={resetField}
            />
          ))}
        </div>

        {/* レポート追加ボタン */}
        {reports.length < 10 && (
          <div>
            <button
              type="button"
              onClick={handleAddReport}
              className="w-full border py-1 rounded mt-4 cursor-pointer text-4xl"
            >
              +
            </button>
          </div>
        )}

        {/* フォーム送信ボタン */}
        <div className="flex gap-4 justify-end mt-4">
          <button
            type="button"
            onClick={handleDraftSubmit}
            className="bg-gray-500 text-white py-2 px-4 rounded cursor-pointer hover:bg-gray-600"
          >
            下書き保存
          </button>
          <button
            type="button"
            onClick={handlePublishSubmit}
            className="bg-blue-500 text-white py-2 px-4 rounded cursor-pointer hover:bg-blue-600"
          >
            公開する
          </button>
        </div>
      </form>
    </div>
  );
};
