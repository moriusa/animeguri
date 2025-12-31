"use client";
import { Control, Controller, FieldErrors, useWatch } from "react-hook-form";
import { ImageUploadWithCrop } from "../common/ImageUploadWithCrop";
import { useEffect, useState } from "react";
import { ProfileFormValues } from "@/app/settings/profile/page";

interface Props {
  control: Control<ProfileFormValues>;
  errors?: FieldErrors<ProfileFormValues>;
  defaultImage?: string;
}

export const ProfileImageUpload = ({
  control,
  errors,
  defaultImage = "https://placehold.jp/150x150.png",
}: Props) => {
  const [croppedImage, setCroppedImage] = useState<string | null>(defaultImage);

  // フォームの値を監視
  const profileImageValue = useWatch({
    control,
    name: "profileImage",
  });

  // 値が変更されたらプレビューを更新
  useEffect(() => {
    const updatePreview = async () => {
      if (typeof profileImageValue === "string") {
        // 既存のURL
        setCroppedImage(profileImageValue);
      } else if (profileImageValue instanceof File) {
        // 新規ファイル
        const reader = new FileReader();
        reader.onloadend = () => {
          setCroppedImage(reader.result as string);
        };
        reader.readAsDataURL(profileImageValue);
      } else {
        // null or undefined
        setCroppedImage(defaultImage);
      }
    };

    updatePreview();
  }, [profileImageValue, defaultImage]);

  return (
    <Controller
      name="profileImage"
      control={control}
      render={({ field }) => (
        <ImageUploadWithCrop
          label=""
          currentImage={croppedImage}
          onImageChange={(file, croppedDataUrl) => {
            field.onChange(file);
            setCroppedImage(croppedDataUrl);
          }}
          onImageRemove={() => {
            field.onChange(null);
            setCroppedImage(defaultImage);
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
