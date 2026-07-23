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
import { MarkdownRenderer } from "./MarkdownRenderer";

export const ArticleContent = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) return <p>記事が見つかりません</p>;

  return (
    <article className="max-w-3xl mx-auto pb-16 text-stone-900">
      {/* 1. サムネイル */}
      <section>
        <div className="relative w-full aspect-video overflow-hidden border-b-4 border-stone-900">
          <Image
            src={article.thumbnailUrl}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* 2. ヘッダー情報（アニメ名・タイトル） */}
      <section className="mt-8 px-4 sm:px-0">
        <div className="flex items-center gap-3 mb-3">
          <span className="bg-[#f0c24d] text-stone-950 font-black px-3 py-1 border-2 border-stone-900 text-sm tracking-wider">
            {article.animeName}
          </span>
          <span className="text-sm font-bold text-stone-500">
            {new JapaneseDateTime(article.publishedAt).toJST()} 公開
          </span>
        </div>
        <h1 className="font-black text-2xl sm:text-3xl leading-snug border-l-8 border-[#f0c24d] pl-4 py-1">
          {article.title}
        </h1>
      </section>

      {/* 3. 著者情報 & アクションバー */}
      <section className="mt-8 bg-stone-100 border-y-2 border-stone-900 py-3 px-4 sm:px-2 flex justify-between items-center">
        <Link
          href={`/user/${article.author.id}`}
          className="flex items-center gap-3 hover:opacity-70 transition-opacity"
        >
          <div className="w-10 h-10 relative rounded-full overflow-hidden border border-stone-400">
            <Image
              src={article.author.profileImageUrl}
              alt={article.author.userName}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-bold uppercase tracking-wider mb-0.5">
              Reporter
            </p>
            <p className="text-sm font-bold text-stone-800">
              {article.author.userName}
            </p>
          </div>
        </Link>
        <div className="flex gap-4 items-center">
          <LikeButton />
          <BookmarkButton />
        </div>
      </section>

      {/* 4. 記事概要（Official Comment風） */}
      {article.overview && (
        <section className="mt-10 px-4 sm:px-0">
          <div className="bg-[#fbf9f5] border-2 border-stone-900 p-5 shadow-[4px_4px_0px_rgba(28,25,23,1)] relative">
            <span className="absolute -top-3 left-4 bg-stone-900 text-[#f0c24d] text-[10px] font-black px-2 py-0.5 border border-stone-900 uppercase tracking-widest">
              OVERVIEW
            </span>
            <div className="mt-2">
              <MarkdownRenderer content={article.overview} />
            </div>
          </div>
        </section>
      )}

      {/* 5. 楽天アイテム (上部) */}
      <div className="mt-12 px-4 sm:px-0">
        <Suspense
          fallback={
            <div className="h-24 bg-stone-100 animate-pulse border-2 border-stone-200" />
          }
        >
          <RakutenItems animeName={article.animeName} startIdx={0} len={6} />
        </Suspense>
      </div>

      {/* 6. マップビュー */}
      <div className="mt-12 px-4 sm:px-0">
        <div className="border-2 border-stone-900 shadow-[4px_4px_0px_rgba(28,25,23,1)] p-1 bg-white">
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
      </div>

      {/* 7. レポート一覧 */}
      <section className="mt-16 px-4 sm:px-0">
        {article.reports.map((report, idx) => {
          return (
            <div key={report.id} id={`report-${report.id}`} className="mb-16">
              {/* スポットの見出し（インダストリアル風） */}
              <div className="flex items-center gap-3 border-b-2 border-stone-900 pb-2 mb-4">
                <span className="bg-stone-900 text-[#f0c24d] font-black text-xl px-2.5 py-0.5 shadow-[2px_2px_0px_#f0c24d]">
                  {String(report.displayOrder ?? idx + 1).padStart(2, "0")}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold">
                  {report.title}
                </h2>
              </div>

              {/* 住所情報 */}
              <div className="flex items-center gap-1 mt-3 mb-6 text-sm font-bold text-stone-600 bg-stone-100 p-2 border border-stone-300 w-fit">
                <span className="text-orange-600 text-lg">
                  <CiLocationOn />
                </span>
                <p>
                  {report.prefecture}
                  {report.city}
                  {report.streetAddress} {report.spotName}
                </p>
              </div>

              {/* 画像エリア */}
              {report.reportImages.length > 0 && (
                <div
                  className={`mt-4 ${report.reportImages.length === 1 ? "" : "flex flex-col gap-8"}`}
                >
                  <ReportImage reportImages={report.reportImages} />
                </div>
              )}

              {/* レポート本文 */}
              {report.description && (
                <div className="mt-6">
                  <MarkdownRenderer content={report.description} />
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* 8. 楽天アイテム (下部) */}
      <div className="mt-12 px-4 sm:px-0 border-t-2 border-dashed border-stone-300 pt-12">
        <Suspense
          fallback={
            <div className="h-24 bg-stone-100 animate-pulse border-2 border-stone-200" />
          }
        >
          <RakutenItems animeName={article.animeName} startIdx={6} len={12} />
        </Suspense>
      </div>
    </article>
  );
};
