"use client";
import { Input } from "@/components/common";
import { Thumbnail } from "@/components/post/Thumbnail";
import { Report } from "@/components/post";
import { SubmitHandler, useForm } from "react-hook-form";
import { usePopup } from "@/features/popup";
import { createArticleWithImages } from "@/features/articles/createArticleWithImages";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

// interface CreateArticleBody {
//   title: string;
//   thumbnail_url?: string;
//   anime_name: string;
//   article_status?: "draft" | "published" | "archived";
//   reports: {
//     title: string;
//     description?: string;
//     location: string;
//     display_order: number; // 1~10
//     images: {
//       image_url: string;
//       caption?: string;
//       display_order: number; // 1~10
//     }[];
//   }[];
// }
export interface ReportTypes {
  id: number;
  images: File[];
  inputValue: string;
  previewUrls: string[];
  location: string;
  captions: string[];
  description: string;
}

export interface PostFormValues {
  title: string;
  thumbnail: File | null;
  animeName: string;
  reports: ReportTypes[];
}

const Page = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    resetField,
    formState: { errors },
    watch,
    control
  } = useForm<PostFormValues>({
    defaultValues: {
      title: "",
      thumbnail: null,
      animeName: "",
      reports: [
        {
          id: 1,
          images: [],
          inputValue: "",
          previewUrls: [],
          location: "",
          captions: [],
          description: "",
        },
      ],
    },
  });

  const reports = watch("reports");

  // レポート追加
  const handleAddReport = () => {
    const newReport = {
      id: Date.now(),
      images: [],
      inputValue: "",
      previewUrls: [],
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
      reports.filter((_, i) => i !== index)
    );
  };

  // 画像変更処理
  const handleImageChange = (index: number, files: File[]) => {
    if (files) {
      const updatedReports = [...reports];
      const newPreviewUrls = files.map(
        (file) => URL.createObjectURL(file) // プレビューURLを生成
      );

      // images と previewUrls を同時に更新
      updatedReports[index].images = Array.from(files);
      updatedReports[index].previewUrls = newPreviewUrls;

      setValue("reports", updatedReports);
    }
  };

  if (!user) {
    return <p>ログインしてください</p>;
  }

  const onSubmit: SubmitHandler<PostFormValues> = (data) => {
    console.log("フォーム送信データ:", data);
    createArticleWithImages(data, "draft", user.idToken); // status分岐
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

export default Page;
