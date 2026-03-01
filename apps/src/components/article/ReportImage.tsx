"use client";

import { ReportImage as ReportImageType } from "@/types/api/article";
import Image from "next/image";
import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";

interface ReportImageProps {
  reportImages: ReportImageType[];
}

export const ReportImage = ({ reportImages }: ReportImageProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  if (!reportImages || reportImages.length === 0) {
    return null;
  }

  const slides = reportImages.map((image) => ({
    src: image.imageUrl,
    title: image.caption,
  }));

  const handleImageClick = (index: number) => {
    setPhotoIndex(index);
    setIsOpen(true);
  };

  const isSingleImage = slides.length === 1;

  return (
    <>
      {reportImages.map((image, index) => (
        <>
          {/* ── 画像：ポラロイド風 ── */}
          <figure
            key={image.id}
            onClick={() => handleImageClick(index)}
            className="group cursor-pointer bg-white p-2.5 pb-10 rounded-sm
               shadow-md hover:shadow-lg transition-all duration-300
               relative"
            style={{ transform: `rotate(${index % 2 === 0 ? -1.5 : 1.2}deg)` }}
          >
            {/* マスキングテープ */}
            <div
              className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-20 h-6 bg-amber-200/70 rounded-sm z-10"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.4) 3px, rgba(255,255,255,0.4) 6px)",
              }}
            />

            {/* 画像 */}
            <div className="overflow-hidden">
              <Image
                src={image.imageUrl}
                alt={image.caption || `Image ${index + 1}`}
                width={800}
                height={600}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
              />
            </div>

            {/* キャプション（手書き風） */}
            {image.caption && (
              <figcaption className="absolute bottom-2.5 left-0 right-0 text-center font-yomogi text-sm text-gray-500">
                {image.caption}
              </figcaption>
            )}
          </figure>
        </>
      ))}

      <Lightbox
        open={isOpen}
        close={() => setIsOpen(false)}
        slides={slides}
        index={photoIndex}
        plugins={[Captions]}
        carousel={{
          finite: isSingleImage,
        }}
        render={{
          buttonPrev: isSingleImage ? () => null : undefined,
          buttonNext: isSingleImage ? () => null : undefined,
        }}
        controller={{
          closeOnBackdropClick: true,
        }}
        styles={{
          container: {
            backgroundColor: "rgba(0, 0, 0, 0.9)",
          },
        }}
      />
    </>
  );
};
