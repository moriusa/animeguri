import Image from "next/image";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { HiOutlineXMark } from "react-icons/hi2";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import { Input } from "../common";
import { ImageItem, PostFormValues } from "./PostFrom";

interface Props {
  register: UseFormRegister<PostFormValues>;
  maxFiles?: number;
  error?: string;
  errors?: FieldErrors<PostFormValues>;
  images: ImageItem[]; // 親から受け取る画像
  reportIdx: number; // レポート番号
  onChange: (index: number, images: ImageItem[]) => void; // 状態変更を親に伝える
}

// バリデーション設定
const VALIDATION = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ["image/png", "image/jpeg", "image/jpg"],
  ALLOWED_EXTENSIONS: [".png", ".jpg", ".jpeg"],
  MAX_CAPTION_LENGTH: 100,
};

export const UploadImage = ({
  maxFiles = 4,
  error,
  errors,
  register,
  images,
  reportIdx,
  onChange,
}: Props) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);
    const totalImages = images.length + newFiles.length;
    if (totalImages > maxFiles) {
      alert(`アップロード可能な画像は最大 ${maxFiles} 枚までです。`);
      return;
    }

    // ✅ 各ファイルのバリデーション
    for (const file of newFiles) {
      // ファイルサイズチェック
      if (file.size > VALIDATION.MAX_FILE_SIZE) {
        alert(
          `"${file.name}" のサイズが大きすぎます。\n最大 ${
            VALIDATION.MAX_FILE_SIZE / 1024 / 1024
          }MB までアップロード可能です。`,
        );
        e.target.value = "";
        return;
      }

      // ファイル形式チェック
      if (!VALIDATION.ALLOWED_TYPES.includes(file.type)) {
        alert(
          `"${file.name}" は対応していない形式です。\n対応形式: PNG, JPG, JPEG`,
        );
        e.target.value = "";
        return;
      }
    }
    // File → ImageItem に変換
    const newImageItems: ImageItem[] = newFiles.map((file, i) => ({
      file,
      url: URL.createObjectURL(file),
      isExisting: false,
      displayOrder: images.length + i,
    }));

    const updatedImages = [...images, ...newImageItems];
    // 親に変更したデータを通知
    onChange(reportIdx, updatedImages);
    // inputをリセット（同じファイルを再選択可能にする）
    e.target.value = "";
  };

  const handleRemoveImage = (removeIndex: number) => {
    const removedImage = images[removeIndex];
    // 既存画像の場合はプレビューURLをrevokeしない
    if (!removedImage.isExisting && removedImage.url.startsWith("blob:")) {
      URL.revokeObjectURL(removedImage.url);
    }
    const updatedImages = images.filter((_, i) => i !== removeIndex);
    // 親に変更したデータを通知
    onChange(reportIdx, updatedImages);
  };

  return (
    <div>
      {/* ファイル選択ボタン */}
      {images.length < maxFiles && (
        <div>
          <label className="cursor-pointer inline-block bg-black/70 p-3 rounded-full mt-3">
            <MdOutlineAddPhotoAlternate size={30} color="white" />
            <input
              type="file"
              multiple
              className="hidden"
              accept=".png, .jpg, .jpeg"
              onChange={handleFileChange}
            />
          </label>
          {/* ✅ アップロード可能な情報を表示 */}
          <p className="text-sm text-gray-500 mt-2">
            {images.length}/{maxFiles} 枚 | 最大{" "}
            {VALIDATION.MAX_FILE_SIZE / 1024 / 1024}MB | PNG, JPG, JPEG
          </p>
        </div>
      )}

      {/* エラーメッセージ（全体） */}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {/* 画像プレビュー */}
      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-4">
          {images.map((imageItem, imageIdx) => (
            <div key={imageItem.id || imageIdx} className="relative">
              <Image
                src={imageItem.url}
                alt={`プレビュー ${imageIdx + 1}`}
                width={500}
                height={500}
                className="w-full mx-auto object-cover rounded-lg border aspect-video"
              />

              {/* 既存画像の場合はバッジを表示 */}
              {imageItem.isExisting && (
                <span className="absolute left-2 top-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  既存
                </span>
              )}

              <button
                type="button"
                onClick={() => handleRemoveImage(imageIdx)}
                className="cursor-pointer p-2 rounded-full bg-black/50 absolute right-3 top-3"
              >
                <HiOutlineXMark size={25} color="white" />
              </button>
              <Input
                id={`reports.${reportIdx}.captions.${imageIdx}`}
                text={`画像 ${imageIdx + 1} のキャプション`}
                name={`reports.${reportIdx}.images.${imageIdx}.caption`}
                register={register}
                placeholder="キャプションを入力（例：駐車場から見た景色）"
                defaultValue={imageItem.caption}
                error={
                  errors?.reports?.[reportIdx]?.images?.[imageIdx]?.caption
                    ?.message
                }
              />
              {/* ✅ 文字数カウント */}
              <p className="text-xs text-gray-500 mt-1">
                {VALIDATION.MAX_CAPTION_LENGTH} 文字まで
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
