"use client";

import { ReportsImages } from "@/types";
import { s3KeyToImageUrl } from "@/utils/s3KeyToImageUrl";
import Image from "next/image";
import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";

interface ReportImageProps {
  reportImages: ReportsImages[];
}

export const ReportImage = ({ reportImages }: ReportImageProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  if (!reportImages || reportImages.length === 0) {
    return null;
  }

  const slides = reportImages.map((image) => ({
    src: s3KeyToImageUrl(image.s3_key),
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
        <figure
          key={image.id}
          onClick={() => handleImageClick(index)}
          className="cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="relative w-full aspect-[4/3] overflow-hidden rounded-md">
            <Image
              src={s3KeyToImageUrl(image.s3_key)}
              alt={image.caption || `Image ${index + 1}`}
              fill
              className="object-cover"
            />
          </div>
          {image.caption && (
            <figcaption className="mt-1 text-xs text-gray-600">
              {image.caption}
            </figcaption>
          )}
        </figure>
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
