import Image from "next/image";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { HiOutlineXMark } from "react-icons/hi2";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import { Input } from "../common";
import { ImageItem, PostFormValues } from "./PostFrom";
import EXIF from "exif-js";
import { useConfirm } from "../common/ConfirmDialog";
import { heicTo } from "heic-to";

export interface ExtractedMetadata {
  lat: number;
  lng: number;
  dateTime?: string;
}

interface Props {
  register: UseFormRegister<PostFormValues>;
  maxFiles?: number;
  error?: string;
  errors?: FieldErrors<PostFormValues>;
  images: ImageItem[]; // 親から受け取る画像
  reportIdx: number; // レポート番号
  onChange: (index: number, images: ImageItem[]) => void; // 状態変更を親に伝える
  onMetadataExtracted?: (metadata: ExtractedMetadata) => void; // 抽出した位置情報を親に伝えるための通知関数
}

// バリデーション設定
const VALIDATION = {
  MAX_FILE_SIZE: 8 * 1024 * 1024, // 8MB
  ALLOWED_TYPES: [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/heic",
    "image/heif",
  ],
  MAX_CAPTION_LENGTH: 100,
};

// 💡 Exif読み取り用ヘルパー関数
const getPhotoMetadata = (file: File): Promise<any> => {
  return new Promise((resolve) => {
    EXIF.getData(file as any, function (this: any) {
      resolve(EXIF.getAllTags(this));
    });
  });
};

const convertGPSToDecimal = (
  gpsMinSec: number[],
  ref: string,
): number | null => {
  if (!gpsMinSec || gpsMinSec.length < 3) return null;
  const coordinate = gpsMinSec[0] + gpsMinSec[1] / 60 + gpsMinSec[2] / 3600;
  return ref === "S" || ref === "W" ? -coordinate : coordinate;
};

export const UploadImage = ({
  maxFiles = 4,
  error,
  errors,
  register,
  images,
  reportIdx,
  onChange,
  onMetadataExtracted,
}: Props) => {
  const confirm = useConfirm();
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);
    const totalImages = images.length + newFiles.length;
    if (totalImages > maxFiles) {
      alert(`アップロード可能な画像は最大 ${maxFiles} 枚までです。`);
      return;
    }
    // 各ファイルのバリデーション
    for (const file of newFiles) {
      // ファイルサイズチェック
      if (file.size > VALIDATION.MAX_FILE_SIZE) {
        alert(
          `"${file.name}" のサイズが大きすぎます(${file.size})。\n最大 ${
            VALIDATION.MAX_FILE_SIZE / 1024 / 1024
          }MB までアップロード可能です。`,
        );
        e.target.value = "";
        return;
      }

      // ファイル形式チェック
      // 拡張子とMIMEタイプの両面でHEIC/HEIFかどうかを柔軟に判定
      const isHeicOrHeif =
        VALIDATION.ALLOWED_TYPES.includes(file.type) ||
        file.name.toLowerCase().endsWith(".heic") ||
        file.name.toLowerCase().endsWith(".heif");
      if (!isHeicOrHeif) {
        alert(
          `"${file.name}" は対応していない形式です。\n対応形式: PNG, JPG, JPEG, HEIC`,
        );
        e.target.value = "";
        return;
      }
    }
    // loading
    const initialLoadingItems: ImageItem[] = newFiles.map((file, i) => ({
      id: `temp-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 9)}`, // 重複しない一時ID
      url: "",
      isExisting: false,
      displayOrder: images.length + i,
      isUploading: true,
    }));
    let currentImages = [...images, ...initialLoadingItems];
    onChange(reportIdx, currentImages);
    e.target.value = "";

    let hasExifError = false;
    let exifErrorMsg = "";
    let foundMetadata: ExtractedMetadata | null = null;

    let index = 0;
    for (const originalFile of newFiles) {
      const targetTempId = initialLoadingItems[index].id;
      let activeFile = originalFile;
      let previewUrl = "";

      // A. HEIC形式だった場合は、まずここでJPEGに安全デコード（1枚ずつなので安全）
      if (
        originalFile.name.toLowerCase().endsWith(".heic") ||
        originalFile.type === "image/heic"
      ) {
        try {
          const jpegBlob = await heicTo({
            blob: originalFile,
            type: "image/jpeg",
            quality: 0.8,
          });
          activeFile = new File(
            [jpegBlob],
            originalFile.name.replace(/\.[^.]+$/, ".jpg"),
            { type: "image/jpeg" },
          );
        } catch (err) {
          console.error("HEIC conversion failed:", err);
          // 変換失敗時は生ファイルをフォールバック（またはエラースキップ）
        }
      }

      // B. 1枚ずつ順番にExifを解析（二重ループを撤廃）
      if (onMetadataExtracted && !foundMetadata) {
        try {
          const metadata = await getPhotoMetadata(originalFile); // Exifはオリジナルから抜く
          if (metadata && metadata.GPSLatitude && metadata.GPSLongitude) {
            const lat = convertGPSToDecimal(
              metadata.GPSLatitude,
              metadata.GPSLatitudeRef,
            );
            const lng = convertGPSToDecimal(
              metadata.GPSLongitude,
              metadata.GPSLongitudeRef,
            );
            const dateTime = metadata.DateTimeOriginal || metadata.DateTime;
            if (lat && lng) {
              foundMetadata = { lat, lng, dateTime };
            }
          }
        } catch (err) {
          hasExifError = true;
          exifErrorMsg = String(err);
        }
      }

      // C. 変換が終わった綺麗なJPEGでプレビューURLを作成
      previewUrl = URL.createObjectURL(activeFile);
      currentImages = currentImages.map((item, idx) => {
        if (item.id === targetTempId) {
          return {
            file: activeFile, // 👈 S3にはここでおねんねした「JEPG化済み」のファイルが渡る！
            url: previewUrl,
            isExisting: false,
            displayOrder: idx,
            isUploading: false, // ローディング完了
          };
        }
        return item;
      });

      // 1枚完了するごとに画面にパラパラと反映
      onChange(reportIdx, [...currentImages]);
      index++;
    }

    if (onMetadataExtracted) {
      if (foundMetadata) {
        onMetadataExtracted(foundMetadata);
      } else if (hasExifError) {
        await confirm({
          type: "alert",
          title: "Exif解析エラー",
          description: exifErrorMsg,
          confirmText: "閉じる",
        });
      } else {
        await confirm({
          type: "alert",
          title: "住所自動入力スキップ",
          description:
            "選択された画像に位置情報（GPS）が含まれていないため、手動入力モードになります。",
          confirmText: "了解",
        });
      }
    }
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
      <p className="font-bold">
        画像
        <span className="text-red-500 ml-1">&#42;</span>
      </p>
      {/* ファイル選択ボタン */}
      {images.length < maxFiles && (
        <div>
          <label className="cursor-pointer inline-block bg-black/70 p-3 rounded-full mt-3">
            <MdOutlineAddPhotoAlternate size={30} color="white" />
            <input
              type="file"
              multiple
              className="hidden"
              accept="image/*, .heic, .heif, .HEIC"
              onChange={handleFileChange}
            />
          </label>
          {/* アップロード可能な情報を表示 */}
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
              {imageItem.isUploading ? (
                // スケルトン（ローディング中）の表示
                <div className="w-full aspect-video rounded-lg border bg-gray-200 animate-pulse flex flex-col items-center justify-center text-gray-400">
                  <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <span className="text-xs">画像を処理中...</span>
                </div>
              ) : (
                <>
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
                  <div className="mt-2">
                    <Input
                      id={`reports.${reportIdx}.captions.${imageIdx}`}
                      text={``}
                      name={`reports.${reportIdx}.images.${imageIdx}.caption`}
                      register={register}
                      placeholder="キャプションを入力（例：駐車場から見た景色）"
                      defaultValue={imageItem.caption}
                      error={
                        errors?.reports?.[reportIdx]?.images?.[imageIdx]
                          ?.caption?.message
                      }
                      validation={{
                        maxLength: {
                          value: 100,
                          message:
                            "キャプションは100文字以内で入力してください",
                        },
                      }}
                    />
                  </div>
                  {/* ✅ 文字数カウント */}
                  <p className="text-xs text-gray-500 mt-1">
                    {VALIDATION.MAX_CAPTION_LENGTH} 文字まで
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
