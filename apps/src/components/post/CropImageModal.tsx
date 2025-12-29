"use client";
import { useRef } from "react";
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css"; // Cropper.jsのスタイルをインポート
import { Button } from "../common/Button";

interface Props {
  imageSrc: string;
  onClose: () => void;
  onCrop: (croppedIMage: string) => void;
  aspectRatio: number;
}

export const CropImageModal = ({
  imageSrc,
  onClose,
  onCrop,
  aspectRatio,
}: Props) => {
  const cropperRef = useRef<ReactCropperElement>(null); // Cropperの参照を保持

  // 画像のトリミングを処理する関数
  const handleCrop = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const croppedCanvas = cropper.getCroppedCanvas(); // 切り取られた結果をキャンバスとして取得
      const croppedDataUrl = croppedCanvas.toDataURL("image/png"); // Base64形式として取得
      onCrop(croppedDataUrl); // トリミング結果を親に渡す
      onClose(); // モーダルを閉じる
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black/70 z-50">
      <div className="bg-primary w-2/3 overflow-hidden p-1">
        <Cropper
          src={imageSrc}
          className="w-full h-96"
          aspectRatio={aspectRatio}
          guides={false} // ガイド線を表示しない
          ref={cropperRef} // Cropperインスタンスへの参照を設定
          viewMode={1} // トリミングエリアが画像の外に出ないように設定
          dragMode="move"
          minCropBoxWidth={200}
          background={false}
        />
        <div className="flex justify-center items-center gap-10 p-4">
          <Button text="キャンセル" btnColor="white" onClick={onClose} />
          <Button text="トリミング" onClick={handleCrop} />
        </div>
      </div>
    </div>
  );
};
