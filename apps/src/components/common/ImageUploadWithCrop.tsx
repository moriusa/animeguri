"use client";
import React, { useRef, useState } from "react";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import { HiOutlineXMark } from "react-icons/hi2";
import { CropImageModal } from "../common";
import Image from "next/image";
// ⭕ 実行時エラーを防ぐため、モジュール全体を安全にインポートする形式に統一
import * as heicToModule from "heic-to";

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
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const originalFile = event.target.files?.[0];
    if (!originalFile) return;

    const MAX_SIZE = 8 * 1024 * 1024; // 8MB
    if (originalFile.size > MAX_SIZE) {
      alert("画像のサイズが大きすぎます。8MB以下の画像を選択してください。");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    let activeFile = originalFile;
    setIsProcessing(true);

    const isHeic = 
      originalFile.name.toLowerCase().endsWith(".heic") || 
      originalFile.name.toLowerCase().endsWith(".heif") ||
      originalFile.type === "image/heic";

    if (isHeic) {
      try {
        // ⭕ 実行時エラー（CJS/ESM互換性）を完全に潰す呼び出し方
        const heicToFn = (heicToModule as any).heicTo || (heicToModule as any).default || heicToModule;
        
        const jpegBlob = await heicToFn({
          blob: originalFile,
          type: "image/jpeg",
          quality: 0.8
        });

        activeFile = new File(
          [jpegBlob],
          originalFile.name.replace(/\.[^.]+$/, ".jpg"),
          { type: "image/jpeg" }
        );
      } catch (err) {
        console.error("サムネイルのHEIC変換に失敗しました:", err);
        // 変換にコケた場合は、元のファイルで強行突破を試みる
        activeFile = originalFile;
      }
    }

    // 💡 解決策：重くて不安定な FileReader をやめ、超軽量・確実な ObjectURL に変更
    try {
      const blobUrl = URL.createObjectURL(activeFile);
      setImageSrc(blobUrl); // トリミングモーダルにこのURLを渡す
      setIsModalShow(true);
    } catch (err) {
      console.error("プレビューURLの生成に失敗しました:", err);
      alert("画像の読み込みに失敗しました。");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCrop = (cropped: string) => {
    fetch(cropped)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "thumbnail.jpg", { type: "image/jpeg" });
        onImageChange(file, cropped);
        
        // ⭕ メモリリーク防止：使い終わった古いBlob URLをブラウザから解放
        if (imageSrc && imageSrc.startsWith("blob:")) {
          URL.revokeObjectURL(imageSrc);
        }
        
        setIsModalShow(false);
        setImageSrc(null);
        if (inputRef.current) inputRef.current.value = "";
      });
  };

  const closeModal = () => {
    // ⭕ メモリリーク防止：キャンセル時もURLを解放
    if (imageSrc && imageSrc.startsWith("blob:")) {
      URL.revokeObjectURL(imageSrc);
    }
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
          <label className={`cursor-pointer flex flex-col items-center gap-3 text-gray-400 hover:text-black transition-colors ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}>
            <input
              type="file"
              accept="image/*, .heic, .heif, .HEIC"
              ref={inputRef}
              onChange={handleFileChange}
              className="hidden"
              disabled={isProcessing}
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
              className={"w-full max-w-md object-cover aspect-video rounded-lg border"}
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
          className={`cursor-pointer inline-block bg-black/70 p-3 rounded-full mt-3 ${
            isProcessing ? "animate-pulse bg-gray-400 pointer-events-none" : ""
          }`}
        >
          {isProcessing ? (
            <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <MdOutlineAddPhotoAlternate size={30} color="white" />
              <input
                type="file"
                accept="image/*, .heic, .heif, .HEIC"
                ref={inputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </>
          )}
        </label>
      )}

      {isModalShow && imageSrc && (
        <CropImageModal
          imageSrc={imageSrc}
          onClose={closeModal}
          onCrop={handleCrop}
          aspectRatio={aspectRatio}
        />
      )}
    </div>
  );
};