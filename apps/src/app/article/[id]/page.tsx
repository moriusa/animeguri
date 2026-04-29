"use client";
import { ReportImage } from "@/components/article/ReportImage";
import { useGetArticle } from "@/features/articles/hooks/useGetArticle";
import { useBookmark } from "@/features/bookmarks/useBookmark";
import { useLike } from "@/features/likes/useLike";
import { JapaneseDateTime } from "@/utils/formatDate";
import Image from "next/image";
import Link from "next/link";
import { CiLocationOn } from "react-icons/ci";
import { FaBookmark, FaHeart, FaRegBookmark, FaRegHeart } from "react-icons/fa";

const Page = () => {
  const { article, isLoading, error } = useGetArticle();

  const {
    isBookmarked,
    toggleBookmark,
    isToggling: isBookmarkToggling,
    isLoading: chkBookmarkLoading,
    error: bookmarkErr
  } = useBookmark();
  const {
    isLiked,
    toggleLike,
    isToggling: isLikeToggling,
    isLoading: chkLikeLoading,
    error: likeError,
  } = useLike();
  if (isLoading) return <p>記事取得中...</p>;
  if (!article) return <p>記事が見つかりません</p>;
  return (
    <article className="max-w-3xl mx-auto pb-16">
      {/* サムネイル */}
      <section className="text-center pt-8 pb-6">
        <div className="mx-auto">
          <Image
            src={article.thumbnailUrl}
            alt={article.title}
            width={800}
            height={600}
            className="w-full h-full object-cover rounded-lg shadow"
          />
        </div>

        <h1 className="font-bold text-2xl sm:text-3xl mt-18">
          {article.title}
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          {new JapaneseDateTime(article.publishedAt).toJST()}
        </p>

        <p className="mt-1 text-sm text-gray-600">{article.animeName}</p>
      </section>

      {/* 著者情報 */}
      <div className="">
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
            <section>
              <button
                onClick={toggleLike}
                disabled={isLikeToggling || chkLikeLoading}
                className={`mt-3 cursor-pointer`}
              >
                {isLiked ? <FaHeart size={24} /> : <FaRegHeart size={24} />}
              </button>
              {likeError && (
                <div className="text-red-600">
                  <p>{likeError}</p>
                  <button onClick={toggleLike}>再試行</button>
                </div>
              )}
            </section>
            <section>
              <button
                onClick={toggleBookmark}
                disabled={isBookmarkToggling || chkBookmarkLoading}
                className={`mt-3 cursor-pointer`}
              >
                {isBookmarked ? (
                  <FaBookmark size={24} />
                ) : (
                  <FaRegBookmark size={24} />
                )}
              </button>
              {bookmarkErr && (
                <div className="text-red-600">
                  <p>{bookmarkErr}</p>
                  <button onClick={toggleBookmark}>再試行</button>
                </div>
              )}
            </section>
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
                  <p className="">{report.location}</p>
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
    </article>
  );
};

export default Page;
