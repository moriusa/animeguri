import { Article } from "@/types";
import { JapaneseDateTime } from "@/utils/formatDate";
import Image from "next/image";
import { FaMapMarkerAlt } from "react-icons/fa";

const dummyArticles: Article = {
  id: "article-1",
  title: "聖地巡礼レポート：渋谷で『ぼっち・ざ・ろっく！』を巡る",
  thumbnail_url: "https://placehold.jp/240x240.png",
  anime_name: "ぼっち・ざ・ろっく！",
  likes_count: 123,
  comment_count: 12,
  published_at: "2025-12-13T11:10:33.219882+00:00",
  author: {
    id: "user-1",
    user_name: "アニメ好き太郎",
    profile_image_url: "https://placehold.jp/240x240.png",
  },
  reports: [
    {
      id: "report-1-1",
      title: "渋谷駅周辺のロケ地",
      description:
        "渋谷駅周辺に点在するロケ地を朝から順番に回りました。特にスクランブル交差点周辺は作中の雰囲気そのままで感動。",
      location: "東京都渋谷区 渋谷駅周辺",
      display_order: 1,
      images: [
        {
          id: "img-1-1-1",
          image_url: "https://placehold.jp/240x240.png",
          caption: "渋谷駅前のシーンと同じ構図で撮影",
          display_order: "1",
        },
        {
          id: "img-1-1-2",
          image_url: "https://placehold.jp/240x240.png",
          caption: "OPに登場するビル群のカット",
          display_order: "2",
        },
      ],
    },
  ],
};

const page = (data: Article) => {
  data = dummyArticles;
  const publishedAt = new JapaneseDateTime(data.published_at);
  return (
    <article className="max-w-3xl mx-auto pb-16">
      {/* HERO 部分 */}
      <header className="text-center px-4 pt-8 pb-6">
        <div className="relative w-full max-w-md mx-auto aspect-[4/3]">
          <Image
            src={data.thumbnail_url}
            alt={data.title}
            fill
            className="object-cover rounded-lg shadow"
          />
        </div>

        <h1 className="font-bold text-2xl sm:text-3xl mt-4">
          {data.title}
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          {publishedAt.toJapanese()}
        </p>

        <p className="mt-1 text-sm text-gray-600">
          {data.anime_name}
        </p>
      </header>

      {/* 著者情報 */}
      <section className="flex items-center gap-3 px-4 mb-6">
        <div className="w-10 h-10 relative rounded-full overflow-hidden">
          <Image
            src={data.author.profile_image_url}
            alt={data.author.user_name}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <p className="text-sm font-semibold">
            {data.author.user_name}
          </p>
          {/* ここに「投稿数」「フォローする」などを後で足せる */}
        </div>
      </section>

      {/* レポート一覧 */}
      <section className="space-y-8 px-4">
        {data.reports.map((report, idx) => (
          <div
            className="bg-white rounded-lg shadow-sm p-5"
            key={report.id}
          >
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-xs text-gray-400">
                {String(report.display_order ?? idx + 1).padStart(2, "0")}
              </span>
              <h2 className="text-lg font-semibold">{report.title}</h2>
            </div>

            <p className="text-sm text-gray-700 whitespace-pre-line">
              {report.description}
            </p>

            <div className="flex items-center gap-2 mt-3 text-sm">
              <span className="text-red-600">
                <FaMapMarkerAlt size={14} />
              </span>
              <p className="text-gray-500">{report.location}</p>
            </div>

            {/* 画像エリア */}
            {report.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {report.images.map((image) => (
                  <figure key={image.id}>
                    <div className="relative w-full aspect-[4/3] overflow-hidden rounded-md">
                      <Image
                        src={image.image_url}
                        alt={image.caption || report.title}
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
              </div>
            )}
          </div>
        ))}
      </section>
    </article>
  );
};

export default page;
