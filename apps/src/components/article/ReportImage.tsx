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
        <figure
          key={image.id}
          onClick={() => handleImageClick(index)}
          className="cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="aspect-[4/3] overflow-hidden rounded-md">
            <Image
              src={image.imageUrl}
              alt={image.caption || `Image ${index + 1}`}
              width={800}
              height={600}
              className="w-full h-full object-cover"
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
