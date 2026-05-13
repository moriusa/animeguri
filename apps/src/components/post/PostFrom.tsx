"use client";
import { Button, Input } from "@/components/common";
import { Thumbnail } from "@/components/post/Thumbnail";
import { Report } from "@/components/post";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { getValidIdToken } from "@/lib/common/authFetch";
import { useEffect, useState } from "react";
import { GoPlus } from "react-icons/go";
import { useConfirm } from "../common/ConfirmDialog";
import { useCreateArticle } from "@/features/articles/hooks/useCreateArticle";
import { useUpdateArticle } from "@/features/articles/hooks/useUpdateArticle";

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
  prefecture: string;
  city: string;
  streetAddress?: string;
  spotName?: string;
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

const createDefaultValues = (): PostFormValues => ({
  id: crypto.randomUUID(),
  title: "",
  thumbnail: null,
  animeName: "",
  reports: [
    {
      id: crypto.randomUUID(),
      images: [],
      title: "",
      prefecture: "",
      city: "",
      streetAddress: "",
      spotName: "",
      description: "",
    },
  ],
});

export const PostForm = ({ mode, initialData }: PostFormProps) => {
  const confirm = useConfirm();
  const router = useRouter();
  const { createArticle } = useCreateArticle();
  const { updateArticle } = useUpdateArticle();

  const {
    register,
    handleSubmit,
    setValue,
    resetField,
    reset,
    formState: { errors },
    watch,
    control,
    getValues,
    setError,
    clearErrors,
  } = useForm<PostFormValues>({
    defaultValues: initialData ?? {
      id: "",
      title: "",
      thumbnail: null,
      animeName: "",
      reports: [],
    },
  });

  const reports = watch("reports");

  // コンポーネントマウント時に初期化
  useEffect(() => {
    if (mode === "create" && !initialData) {
      reset(createDefaultValues());
    }
  }, [initialData, mode, reset]);

  // レポート追加
  const handleAddReport = () => {
    const newReport = {
      id: crypto.randomUUID(),
      images: [],
      title: "",
      prefecture: "",
      city: "",
      streetAddress: "",
      spotName: "",
      captions: [],
      description: "",
    };
    setValue("reports", [...reports, newReport]);
  };

  // レポート削除
  const handleDeleteReport = async (index: number) => {
    const ok = await confirm({
      title: `レポート${index + 1}を本当に削除しますか？`,
      description: "この操作は取り消せません。",
      confirmText: "削除",
      confirmVariant: "danger",
    });
    if (!ok) return;
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

    // 画像が1枚以上になったらエラーを消す
    if (images.length > 0) {
      clearErrors(`reports.${index}.images`);
    } else {
      setError(`reports.${index}.images`, {
        type: "manual",
        message: "画像を1枚以上アップロードしてください",
      });
    }
  };

  // if (!user) {
  //   return <p>ログインしてください</p>;
  // }

  const onSubmit = async (
    data: PostFormValues,
    status: "draft" | "published",
  ) => {
    const confirmOptions = {
      "published-create": {
        title: "記事を公開しますか？",
        description: "公開すると全てのユーザーが閲覧できるようになります。",
        confirmText: "公開する",
      },
      "published-edit": {
        title: "編集内容を公開しますか？",
        description: "変更内容が全てのユーザーに反映されます。",
        confirmText: "更新する",
      },
      "draft-create": {
        title: "記事を下書き保存しますか？",
        description: "他のユーザーは閲覧することはできません。",
        confirmText: "下書き保存",
      },
      "draft-edit": {
        title: "編集内容を下書き保存しますか？",
        description: "公開していた記事の場合、非公開になります。",
        confirmText: "下書き保存",
      },
    } as const;

    const key = `${status}-${mode}` as keyof typeof confirmOptions;

    const ok = await confirm({
      ...confirmOptions[key],
      confirmVariant: "default",
    });
    if (!ok) return;

    console.log("送信:", status, data);
    if (mode === "create") {
      await createArticle(data, status);
    } else if (mode === "edit") {
      await updateArticle(data.id, data, status);
    }
    reset(createDefaultValues());
    router.push("/");
    router.refresh(); // キャッシュもリフレッシュ
  };

  // 下書き：バリデーション無しで保存
  const handleDraftSubmit = async () => {
    const data = getValues();
    await onSubmit(data, "draft");
  };
  // 公開：バリデーションして保存（今ある required が効く）
  const handlePublishSubmit = async () => {
    // 画像バリデーションを手動で実行
    reports.forEach((report, index) => {
      if (report.images.length === 0) {
        setError(`reports.${index}.images`, {
          type: "manual",
          message: "画像を1枚以上アップロードしてください",
        });
      } else {
        clearErrors(`reports.${index}.images`);
      }
    });

    handleSubmit((data) => {
      const hasImageError = reports.some(
        (report) => report.images.length === 0,
      );
      if (hasImageError) return;
      onSubmit(data, "published");
    })();
  };

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
          required={true}
        />
        <div className="mt-4">
          <Input
            id={"animeName"}
            text="アニメ名"
            name={"animeName"}
            register={register}
            placeholder="アニメ名を入力"
            validation={{ required: "アニメ名を入力してください" }}
            error={errors?.animeName?.message}
            required={true}
          />
        </div>
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
              resetField={resetField}
              setValue={setValue}
              watch={watch}
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
              <GoPlus className="mx-auto" />
            </button>
          </div>
        )}

        {/* フォーム送信ボタン */}
        <div className="flex gap-4 mt-8 sm:w-1/3 ml-auto">
          <Button
            text="下書き保存"
            btnColor="white"
            onClick={handleDraftSubmit}
            type="button"
          />
          <Button text="公開する" onClick={handlePublishSubmit} type="button" />
        </div>
      </form>
    </div>
  );
};
