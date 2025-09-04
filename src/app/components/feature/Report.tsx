"use client";
import { Input, TextArea, UploadImage } from "../common";
import {
  FieldErrors,
  UseFormClearErrors,
  UseFormRegister,
  UseFormResetField,
} from "react-hook-form";
import { PostFormValues, ReportTypes } from "@/post/page";
import { FaRegTrashCan } from "react-icons/fa6";
import { RegionInput } from "./RegionInput";

interface ReportData {
  images: File[];
  previewUrls: string[];
  place: string;
  inputValue: string;
}

export const Report = ({
  index,
  onDelete,
  register,
  resetField,
  clearErrors,
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
        name={`reports.${index}.images`}
        maxFiles={4}
        error={errors.reports?.[index]?.images?.message}
        register={register}
        images={reportData.images}
        previewUrls={reportData.previewUrls}
        onChange={onImageChange}
        index={index}
      />

      {/* 聖地の場所 */}
      <RegionInput
        register={register}
        error={errors}
        index={index}
        resetField={resetField}
        clearErrors={clearErrors}
      />

      {/* レポート内容 */}
      <div className="mt-8">
        <TextArea
          name={`reports.${index}.inputValue`}
          register={register}
          validation={{
            required: "内容を入力してください",
          }}
          error={errors.reports?.[index]?.inputValue?.message}
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
