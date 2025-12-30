import React from "react";
import Link from "next/link";
import { FaMapMarkerAlt, FaRegHeart, FaRegComment } from "react-icons/fa";
import { daysAgoConvert } from "@/utils/daysAgoConvert";
import Image from "next/image";
import { ArticleCard as ArticleCardType } from "@/types";
import { s3KeyToImageUrl } from "@/utils/s3KeyToImageUrl";

export const ArticleCard = ({ data }: { data: ArticleCardType }) => {
  console.log(data);
  return (
    <div className="rounded bg-secondary text-xs">
      <Link href={`/article/${data.id}`}>
        <p className="py-1 px-2 text-white">{data.anime_name}</p>
        <Image
          src={data.thumbnail_url}
          alt=""
          className="aspect-video object-cover"
          width={250}
          height={250}
        />
        <div className="bg-white p-3 text-gray-500">
          <p className="text-black text-base font-bold line-clamp-2 h-[48px]">
            {data.title}
          </p>
          {/* <div className="flex items-center gap-1 mt-3">
            <FaMapMarkerAlt size={14} />
            <p>
              {data.prefectureName} {data.cityName}
            </p>
          </div> */}
          <div className="flex items-center gap-1 mt-3">
            <Image
              src={s3KeyToImageUrl(data.author.profile_image_s3_key)}
              alt=""
              className="w-7 rounded-full"
              width={250}
              height={250}
            />
            <p className="line-clamp-1">{data.author.user_name}</p>
          </div>
          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                <FaRegHeart />
                <p>{data.likes_count}</p>
              </div>
              <div className="flex items-center gap-0.5">
                <FaRegComment />
                <p>{data.comment_count}</p>
              </div>
            </div>
            <p className="">{daysAgoConvert(new Date(data.published_at))}</p>
          </div>
        </div>
      </Link>
    </div>
  );
};
