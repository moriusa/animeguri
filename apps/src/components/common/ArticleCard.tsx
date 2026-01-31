import Link from "next/link";
import { FaRegHeart, FaRegComment } from "react-icons/fa";
import { daysAgoConvert } from "@/utils/daysAgoConvert";
import Image from "next/image";
import { ArticleCard as ArticleCardType } from "@/types/api/article";

export const ArticleCard = ({ data }: { data: ArticleCardType }) => {
  return (
    <div className="rounded bg-secondary text-xs">
      <Link href={`/article/${data.id}`}>
        <p className="py-1 px-2 text-white">{data.animeName}</p>
        <Image
          src={data.thumbnailUrl}
          alt=""
          className="aspect-video object-cover"
          width={250}
          height={250}
        />
        <div className="bg-white p-3 text-gray-500">
          <p className="text-black text-base font-bold line-clamp-2 h-[48px]">
            {data.title}
          </p>
          <div className="flex items-center gap-1 mt-3">
            <Image
              src={data.author.profileImageUrl}
              alt=""
              className="w-7 rounded-full"
              width={250}
              height={250}
            />
            <p className="line-clamp-1">{data.author.userName}</p>
          </div>
          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                <FaRegHeart />
                <p>{data.likesCount}</p>
              </div>
              <div className="flex items-center gap-0.5">
                <FaRegComment />
                <p>{data.commentCount}</p>
              </div>
            </div>
            <p className="">{daysAgoConvert(new Date(data.publishedAt))}</p>
          </div>
        </div>
      </Link>
    </div>
  );
};
