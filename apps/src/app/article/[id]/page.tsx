"use client";
import { useGetArticle } from "@/features/articles/useGetArticle";
import { s3KeyToImageUrl } from "@/utils/s3KeyToImageUrl";
import Image from "next/image";
import Link from "next/link";
import { FaMapMarkerAlt } from "react-icons/fa";

const Page = () => {
  const { article, loading, error } = useGetArticle();
  if (!article) return <p>記事が見つかりません</p>;
  console.log(article);
  return (
    <article className="max-w-3xl mx-auto pb-16">
      {/* HERO 部分 */}
      <header className="text-center px-4 pt-8 pb-6">
        <div className="relative w-full max-w-md mx-auto aspect-[4/3]">
          <Image
            src={s3KeyToImageUrl(article.thumbnail_s3_key)}
            alt={article.title}
            fill
            className="object-cover rounded-lg shadow"
          />
        </div>

        <h1 className="font-bold text-2xl sm:text-3xl mt-4">{article.title}</h1>

        <p className="mt-2 text-sm text-gray-500">{article.published_at}</p>

        <p className="mt-1 text-sm text-gray-600">{article.anime_name}</p>
      </header>

      {/* 著者情報 */}
      <section className="inline-block">
        <Link
          href={`/user/${article.author.id}`}
          className="flex items-center gap-3 px-4 mb-6"
        >
          <div className="w-10 h-10 relative rounded-full overflow-hidden">
            <Image
              src={s3KeyToImageUrl(article.author.profile_image_s3_key)}
              alt={article.author.user_name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-semibold">{article.author.user_name}</p>
            {/* ここに「投稿数」「フォローする」などを後で足せる */}
          </div>
        </Link>
      </section>

      {/* レポート一覧 */}
      <section className="space-y-8 px-4">
        {article.reports.map((report, idx) => (
          <div className="bg-white rounded-lg shadow-sm p-5" key={report.id}>
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
            {report.report_images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {report.report_images.map((image) => (
                  <figure key={image.id}>
                    <div className="relative w-full aspect-[4/3] overflow-hidden rounded-md">
                      <Image
                        src={s3KeyToImageUrl(image.s3_key)}
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

export default Page;
