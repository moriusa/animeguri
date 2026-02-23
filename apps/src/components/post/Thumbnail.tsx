"use client";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { ImageUploadWithCrop } from "../common/ImageUploadWithCrop";
import { useState } from "react";
import { PostFormValues, ThumbnailItem } from "./PostFrom";

interface Props {
  control: Control<PostFormValues>; // register の代わりに control
  errors: FieldErrors<PostFormValues>;
}

export const Thumbnail = ({ control, errors }: Props) => {

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
          currentImage={field.value?.url || null}
          onImageChange={(file, croppedDataUrl) => {
            const thumbnailItem: ThumbnailItem = {
              file: file,
              url: croppedDataUrl,
              isExisting: false,
            };
            field.onChange(thumbnailItem); // React Hook Form に値を渡す
          }}
          onImageRemove={() => {
            field.onChange(null); // React Hook Form の値をクリア
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