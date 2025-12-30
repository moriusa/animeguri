"use client";
import { TextArea, UploadImage } from ".";
import {
  FieldErrors,
  UseFormClearErrors,
  UseFormRegister,
  UseFormResetField,
} from "react-hook-form";
import { FaRegTrashCan } from "react-icons/fa6";
import { PostFormValues, ReportTypes } from "@/app/post/page";
import { Input } from "../common";

export const Report = ({
  index,
  onDelete,
  register,
  errors,
  onImageChange,
  reportData,
}: {
  index: number;
  onDelete: (index: number) => void;
  register: UseFormRegister<PostFormValues>;
  resetField: UseFormResetField<PostFormValues>;
  clearErrors: UseFormClearErrors<PostFormValues>;
  errors: FieldErrors<PostFormValues>;
  onImageChange: (index: number, files: File[]) => void;
  reportData: ReportTypes;
}) => {
  return (
    <div className="p-4 mb-4 bg-white rounded border">
      <h2 className="font-bold text-lg mb-2">巡礼レポート {index + 1}</h2>

      {/* 画像アップロード */}
      <UploadImage
        maxFiles={10}
        error={errors.reports?.[index]?.images?.message}
        register={register}
        images={reportData.images}
        previewUrls={reportData.previewUrls}
        onChange={onImageChange}
        index={index}
        errors={errors}
      />

      {/* タイトル */}
      <div className="mt-8">
        <Input
          id={"reportTitle"}
          text="タイトル"
          name={`reports.${index}.title`}
          register={register}
          placeholder="タイトルを入力"
          validation={{ required: "タイトルを入力してください" }}
          error={errors?.reports?.[index]?.title?.message}
        />
      </div>

      {/* 聖地の場所 */}
      <div className="mt-8">
        <Input
          id={"location"}
          text="聖地の場所"
          name={`reports.${index}.location`}
          register={register}
          placeholder="聖地の場所を入力"
          validation={{ required: "聖地の場所を入力してください" }}
          error={errors?.reports?.[index]?.location?.message}
        />
      </div>

      {/* レポート内容 */}
      <div className="mt-8">
        <TextArea
          name={`reports.${index}.description`}
          register={register}
          validation={{
            required: "内容を入力してください",
          }}
          error={errors.reports?.[index]?.description?.message}
          text="説明"
          placeholder="この聖地はどうだった？"
        />
      </div>

      {/* 削除ボタン */}
      {index > 0 && (
        <div className="text-right">
          <button
            type="button"
            onClick={() => onDelete(index)}
            className="mt-8 cursor-pointer"
          >
            <FaRegTrashCan size={24} />
          </button>
        </div>
      )}
    </div>
  );
};
