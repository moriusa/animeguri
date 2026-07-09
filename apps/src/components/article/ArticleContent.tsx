import { BookmarkButton } from "@/components/article/BookmarkButton";
import { LikeButton } from "@/components/article/LikeButton";
import { ReportImage } from "@/components/article/ReportImage";
import { getArticle } from "@/features/articles/hooks/getArticle";
import { JapaneseDateTime } from "@/utils/formatDate";
import Image from "next/image";
import Link from "next/link";
import { CiLocationOn } from "react-icons/ci";
import { MapView } from "../map/MapView";
import { RakutenItems } from "./RakutenItems";
import { Suspense } from "react";

export const ArticleContent = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) return <p>記事が見つかりません</p>;
  return (
    <article className="max-w-3xl mx-auto pb-16">
      {/* サムネイル */}
      <section>
        <div className="relative w-full aspect-video overflow-hidden">
          <Image
            src={article.thumbnailUrl}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="mt-10 text-center">
          <h1 className="font-bold text-2xl sm:text-3xl leading-snug">
            {article.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {new JapaneseDateTime(article.publishedAt).toJST()} に公開
          </p>
        </div>
        <div className="mt-8 flex justify-end">
          <span className=" px-4 py-2 font-bold text-white bg-secondary border-2 border-gray-800">
            {article.animeName}
          </span>
        </div>
      </section>
      <div className="mt-8">
        <Suspense>
          <RakutenItems animeName={article.animeName} startIdx={0} len={6} />
        </Suspense>
      </div>
      <div className="mt-8">
        <MapView
          initialReports={article.reports}
          initialViewState={{
            latitude: article.reports[0]?.latitude,
            longitude: article.reports[0]?.longitude,
            zoom: 12,
          }}
          popType="navigation"
        />
      </div>

      {/* 著者情報 */}
      <div className="mt-5">
        <div className="p-3 flex justify-between">
          <section className="inline-block">
            <Link
              href={`/user/${article.author.id}`}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 relative rounded-full overflow-hidden">
                <Image
                  src={article.author.profileImageUrl}
                  alt={article.author.userName}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {article.author.userName}
                </p>
              </div>
            </Link>
          </section>
          <div className="flex gap-5 items-center">
            <LikeButton />
            <BookmarkButton />
          </div>
        </div>
        <hr className="" />
        {/* レポート一覧 */}
        <section>
          {article.reports.map((report, idx) => {
            return (
              <div
                key={report.id}
                className="relative my-8 p-5 rounded-lg overflow-hidden"
                id={`report-${report.id}`}
              >
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-xs">
                    {String(report.displayOrder ?? idx + 1).padStart(2, "0")} -
                  </span>
                  <h2 className="text-xl">{report.title}</h2>
                </div>

                <div className="flex items-center gap-1 mt-3 text-sm">
                  <span className="text-red-600">
                    <CiLocationOn size={20} />
                  </span>
                  <p className="">
                    {report.prefecture}
                    {report.city}
                    {report.streetAddress}
                    {report.spotName}
                  </p>
                </div>

                {/* 画像エリア */}
                {report.reportImages.length > 0 && (
                  <div
                    className={`mt-4 ${
                      report.reportImages.length === 1
                        ? ""
                        : "flex flex-col gap-12"
                    }`}
                  >
                    <ReportImage reportImages={report.reportImages} />
                  </div>
                )}
                <p className="text-sm text-gray-700 whitespace-pre-line mt-4">
                  {report.description}
                </p>
                {idx < article.reports.length - 1 && (
                  <hr className="my-8 border-gray-200" />
                )}
              </div>
            );
          })}
        </section>
      </div>
      <div className="mt-8">
        <Suspense>
          <RakutenItems animeName={article.animeName} startIdx={6} len={12} />
        </Suspense>
      </div>
    </article>
  );
};
