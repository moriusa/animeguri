import { FieldValues, Path, UseFormRegister } from "react-hook-form";
import { HiOutlineXMark } from "react-icons/hi2";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";

interface Props<T extends FieldValues> {
  register: UseFormRegister<T>;
  maxFiles?: number;
  name: Path<T>;
  error?: string;
  images: File[]; // 親から受け取る画像
  previewUrls: string[]; // 親から受け取るプレビューURL
  index: number; // レポート番号
  onChange: (index: number, files: File[]) => void; // 状態変更を親に伝える
}

export const UploadImage = <T extends FieldValues>({
  maxFiles = 4,
  error,
  name,
  register,
  images,
  previewUrls,
  index,
  onChange,
}: Props<T>) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);
    const totalImages = images.length + newFiles.length;
    if (totalImages > maxFiles) {
      alert(`アップロード可能な画像は最大 ${maxFiles} 枚までです。`);
      return;
    }

    const updatedImages = [...images, ...newFiles];
    // 親に変更したデータを通知
    onChange(index, updatedImages);
  };

  const handleRemoveImage = (removeIndex: number) => {
    const updatedImages = images.filter((_, i) => i !== removeIndex);
    // 親に変更したデータを通知
    onChange(index, updatedImages);
  };

  return (
    <div>
      {/* ファイル選択ボタン */}
      {images.length < maxFiles && (
        <label className="cursor-pointer inline-block bg-black/70 p-3 rounded-full mt-3">
          <MdOutlineAddPhotoAlternate size={30} color="white" />
          <input
            type="file"
            multiple
            className="hidden"
            accept=".png, .jpg, .jpeg"
            {...register(name, {
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                handleFileChange(e);
                e.target.dispatchEvent(new Event("input", { bubbles: true }));
              },
            })}
          />
        </label>
      )}

      {/* エラーメッセージ */}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {/* 画像プレビュー */}
      {previewUrls.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-4">
          {previewUrls.map((url, i) => (
            <div key={i} className="relative">
              <img
                src={url}
                alt={`プレビュー ${i + 1}`}
                className="w-full mx-auto object-cover rounded-lg border aspect-video"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(i)}
                className="cursor-pointer p-2 rounded-full bg-black/50 absolute right-3 top-3"
              >
                <HiOutlineXMark size={25} color="white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
