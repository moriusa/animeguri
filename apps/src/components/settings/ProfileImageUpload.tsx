"use client";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { ImageUploadWithCrop } from "../common/ImageUploadWithCrop";
import { useState } from "react";
import { ProfileFormValues } from "@/app/settings/profile/page";

interface Props {
  control: Control<ProfileFormValues>;
  errors?: FieldErrors<ProfileFormValues>;
  defaultImage?: string;
}

export const ProfileImageUpload = ({
  control,
  errors,
  defaultImage,
}: Props) => {
  const [croppedImage, setCroppedImage] = useState<string | null>(
    defaultImage || null
  );

  return (
    <Controller
      name="profileImage"
      control={control}
      rules={{
        required: false, // プロフィール画像は任意
      }}
      render={({ field }) => (
        <ImageUploadWithCrop
          label=""
          currentImage={croppedImage}
          onImageChange={(file, croppedDataUrl) => {
            field.onChange(file);
            setCroppedImage(croppedDataUrl);
          }}
          onImageRemove={() => {
            field.onChange(undefined);
            setCroppedImage(null);
          }}
          aspectRatio={1}
          shape="circle"
          required={false}
          error={errors?.profileImage?.message}
        />
      )}
    />
  );
};
