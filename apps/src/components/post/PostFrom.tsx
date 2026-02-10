"use client";
import { Input } from "@/components/common";
import { Thumbnail } from "@/components/post/Thumbnail";
import { Report } from "@/components/post";
import { SubmitHandler, useForm } from "react-hook-form";
import { createArticleWithImages } from "@/features/articles/createArticleWithImages";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { redirect } from "next/navigation";
import { updateArticleWithImages } from "@/features/articles/updateArticleWithImages";

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

  const onSubmit: SubmitHandler<PostFormValues> = async (data) => {
    if (mode === "create") {
      await createArticleWithImages(data, "published", user.idToken); // status分岐
    } else if (mode === "edit") {
      await updateArticleWithImages(data.id, data, "published", user.idToken);
    }
    // フォームクリア
    reset();
    redirect("/");
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit(onSubmit)}>
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
        <div className="text-right">
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded mt-4 cursor-pointer"
          >
            公開する
          </button>
        </div>
      </form>
    </div>
  );
};
