"use client";
import { Input } from "@/components/common";
import { Thumbnail } from "@/components/post/Thumbnail";
import { Report } from "@/components/post";
import { useForm } from "react-hook-form";
import { usePopup } from "@/features/popup";

export interface ReportTypes {
  id: number;
  images: File[]; // 複数画像データ
  inputValue: string;
  prefecture: string;
  city: string;
  overseasRegion: string;
  previewUrls: string[];
}

export interface PostFormValues {
  title: string;
  thumbnail: File | null;
  animeName: string;
  reports: ReportTypes[];
}

const Page = () => {
  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    resetField,
    formState: { errors },
    watch,
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
          prefecture: "",
          city: "",
          overseasRegion: "",
          previewUrls: [],
        },
      ],
    },
  });

  const {closePopup, popupState, showPopup} = usePopup();

  const reports = watch("reports");

  // レポート追加
  const handleAddReport = () => {
    const newReport = {
      id: Date.now(),
      images: [],
      inputValue: "",
      prefecture: "",
      city: "",
      overseasRegion: "",
      previewUrls: [],
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

  const onSubmit = (data: PostFormValues) => {
    console.log("フォーム送信データ:", data);
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
        <div className="mt-8">
          <Thumbnail register={register} error={errors} setValue={setValue} />
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
