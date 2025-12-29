"use client";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { PostFormValues } from "@/app/post/page";
import { ImageUploadWithCrop } from "../common/ImageUploadWithCrop";
import { useState } from "react";

interface Props {
  control: Control<PostFormValues>; // register の代わりに control
  errors: FieldErrors<PostFormValues>;
}

export const Thumbnail = ({ control, errors }: Props) => {
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  return (
    <Controller
      name="thumbnail"
      control={control}
      rules={{
        required: "サムネイル画像は必須です",
        validate: (value) => {
          if (!value) return "サムネイル画像を選択してください";
          return true;
        },
      }}
      render={({ field }) => (
        <ImageUploadWithCrop
          label="サムネイル画像"
          currentImage={croppedImage}
          onImageChange={(file, croppedDataUrl) => {
            field.onChange(file); // React Hook Form に値を渡す
            setCroppedImage(croppedDataUrl);
          }}
          onImageRemove={() => {
            field.onChange(undefined); // React Hook Form の値をクリア
            setCroppedImage(null);
          }}
          aspectRatio={16 / 9}
          shape="rectangle"
          required
          error={errors.thumbnail?.message}
        />
      )}
    />
  );
};