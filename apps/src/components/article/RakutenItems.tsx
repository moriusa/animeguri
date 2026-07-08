import { fetchRakutenAds } from "@/features/articles/fetchRakutenAds";
import Image from "next/image";
import Link from "next/link";

interface Props {
  animeName: string;
  startIdx: number;
  len: number;
}

export const RakutenItems = async ({ animeName, startIdx, len }: Props) => {
  const ads = await fetchRakutenAds(animeName);
  const organizedData = ads.Items.slice(startIdx, startIdx + len);
  return (
    <div className="bg-white rounded">
      <span className=" tracking-wider text-gray-500 p-2 text-xs">
        この記事の関連商品（楽天アフィリエイト）
      </span>
      <div className="grid grid-cols-3 items-center w-full gap-4 px-2 py-5 sm:grid-cols-6">
        {organizedData.map((ad, idx) => (
          <div
            key={idx}
            className={`${idx >= 6 ? "sm:block hidden" : "block"} hover:scale-110 transition`}
          >
            <Link href={ad.Item.affiliateUrl} target="_blank">
              <Image
                src={ad.Item.mediumImageUrl}
                width={120}
                height={120}
                alt={ad.Item.title}
                style={{ height: "auto" }}
                className="object-contain mx-auto"
              />
              <p className="text-xs p-1 text-center">{ad.Item.title}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
