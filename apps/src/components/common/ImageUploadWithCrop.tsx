"use client";
import React, { useRef, useState } from "react";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import { HiOutlineXMark } from "react-icons/hi2";
import { CropImageModal } from "../common";
import Image from "next/image";
import { heicTo } from "heic-to";

interface ImageUploadWithCropProps {
  label: string;
  currentImage: string | null;
  onImageChange: (file: File, croppedDataUrl: string) => void;
  onImageRemove: () => void;
  aspectRatio?: number; // 1 = 正方形, 16/9 = 横長など
  shape: "rectangle" | "circle"; // 表示形状
  required?: boolean;
  error?: string;
}

export const ImageUploadWithCrop = ({
  label,
  currentImage,
  onImageChange,
  onImageRemove,
  aspectRatio = 16 / 9,
  shape = "rectangle",
  required = false,
  error,
}: ImageUploadWithCropProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isModalShow, setIsModalShow] = useState<boolean>(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const originalFile = event.target.files?.[0];
    if (!originalFile) return;

    let targetFile = originalFile;

    // 💡 HEIC / HEIF の判定
    const isHeicOrHeif =
      originalFile.type.includes("heic") ||
      originalFile.type.includes("heif") ||
      originalFile.name.toLowerCase().endsWith(".heic") ||
      originalFile.name.toLowerCase().endsWith(".heif");

    if (isHeicOrHeif) {
      try {
        console.log(
          `クロップ前にHEIC/HEIFを検出。JPEGに変換中: ${originalFile.name}`,
        );

        // JPEGへ変換（Blobが返る）
        const convertedBlob = await heicTo({
          blob: originalFile,
          type: "image/jpeg",
          quality: 0.8,
        });

        // 拡張子を .jpg に差し替えた File オブジェクトを作成
        const newFileName = originalFile.name.replace(/\.[^/.]+$/, "") + ".jpg";
        targetFile = new File([convertedBlob], newFileName, {
          type: "image/jpeg",
          lastModified: originalFile.lastModified,
        });
      } catch (error) {
        console.error("HEICファイルのクロップ前変換に失敗しました:", error);
        // 失敗した場合はそのまま進みます（FileReader側で弾かれるかエラーになります）
      }
    }

    // 💡 完全にJPEG化された targetFile を使ってデータURLを読み込む
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setIsModalShow(true);
    };
    reader.readAsDataURL(targetFile);
  };

  const handleCrop = (cropped: string) => {
    // Data URLをFileに変換
    fetch(cropped)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "image.jpg", { type: "image/jpeg" });
        onImageChange(file, cropped);
        setIsModalShow(false);
        setImageSrc(null);
      });
  };

  const closeModal = () => {
    setIsModalShow(false);
    setImageSrc(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onImageRemove();
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <div className="flex gap-2 items-center">
        <p className="font-bold">
          {label}
          {required && <span className="text-red-500 ml-1">&#42;</span>}
        </p>
        {error && <p className="text-red-500 text-xs">{error}</p>}
      </div>

      {currentImage ? (
        shape === "circle" ? (
          <label className="cursor-pointer flex flex-col items-center gap-3 text-gray-400 hover:text-black transition-colors">
            <input
              type="file"
              accept="image/*, .heic, .heif"
              ref={inputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="relative group">
              <Image
                src={currentImage}
                alt={label}
                width={500}
                height={500}
                className="w-36 h-36 rounded-full object-cover group-hover:opacity-80 transition"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-full">
                <span className="text-white font-bold">変更</span>
              </div>
            </div>
            <span className="font-medium">変更する</span>
          </label>
        ) : (
          <div className="relative mt-3 w-fit">
            <Image
              src={currentImage}
              alt={label}
              width={150}
              height={150}
              className={"w-full max-w-md"}
            />
            <button
              type="button"
              onClick={handleRemove}
              className="cursor-pointer p-2 rounded-full bg-black/50 absolute right-1 top-1"
            >
              <HiOutlineXMark size={20} color="white" />
            </button>
          </div>
        )
      ) : (
        <label
          className={
            "cursor-pointer inline-block bg-black/70 p-3 rounded-full mt-3"
          }
        >
          <MdOutlineAddPhotoAlternate size={30} color="white" />
          <input
            type="file"
            accept="image/*"
            ref={inputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}

      {isModalShow && imageSrc && (
        <CropImageModal
          imageSrc={imageSrc}
          onClose={closeModal}
          onCrop={handleCrop} // トリミング結果を渡すための関数
          aspectRatio={aspectRatio}
        />
      )}
    </div>
  );
};
