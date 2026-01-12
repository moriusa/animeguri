"use client";
import { ReportImage } from "@/components/article/ReportImage";
import { useGetArticle } from "@/features/articles/useGetArticle";
import { useBookmark } from "@/features/bookmarks/useBookmark";
import { JapaneseDateTime } from "@/utils/formatDate";
import { s3KeyToImageUrl } from "@/utils/s3KeyToImageUrl";
import Image from "next/image";
import Link from "next/link";
import { CiLocationOn } from "react-icons/ci";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";

const Page = () => {
  const { article, loading, error } = useGetArticle();
  const {
    isBookmarked,
    toggleBookmark,
    loading: bookmarkLoading,
    checkLoading,
    error: bookmarkError,
  } = useBookmark();
  if (loading) return <p>記事取得中...</p>;
  if (!article) return <p>記事が見つかりません</p>;
  return (
    <article className="max-w-3xl mx-auto pb-16">
      {/* サムネイル */}
      <section className="text-center pt-8 pb-6">
        <div className="mx-auto">
          <Image
            src={s3KeyToImageUrl(article.thumbnail_s3_key)}
            alt={article.title}
            width={800}
            height={600}
            className="w-full h-full object-cover rounded-lg shadow"
          />
        </div>

        <h1 className="font-bold text-2xl sm:text-3xl mt-18">{article.title}</h1>

        <p className="mt-2 text-sm text-gray-500">
          {new JapaneseDateTime(article.published_at).toJST()}
        </p>

        <p className="mt-1 text-sm text-gray-600">{article.anime_name}</p>
      </section>

      {/* 著者情報 */}
      <div className="bg-white rounded-lg shadow-sm ">
        <div className="p-5 flex justify-between">
          <section className="inline-block">
            <Link
              href={`/user/${article.author.id}`}
              className="flex items-center gap-3"
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
                <p className="text-sm font-semibold">
                  {article.author.user_name}
                </p>
              </div>
            </Link>
          </section>
          <section>
            <button
              onClick={toggleBookmark}
              disabled={bookmarkLoading}
              className={`mt-3 cursor-pointer`}
            >
              {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
            </button>

            {bookmarkError && (
              <div className="error-message">
                <p>{bookmarkError}</p>
                <button onClick={toggleBookmark}>再試行</button>
              </div>
            )}
          </section>
        </div>
        <hr className="text-gray-300" />
        {/* レポート一覧 */}
        <section className="space-y-8 p-5">
          {article.reports.map((report, idx) => {
            return (
              <div key={report.id}>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-xs text-gray-400">
                    {String(report.display_order ?? idx + 1).padStart(2, "0")}
                  </span>
                  <h2 className="text-xl">{report.title}</h2>
                </div>

                <div className="flex items-center gap-1 mt-3 text-sm">
                  <span className="text-red-600">
                    <CiLocationOn size={20} />
                  </span>
                  <p className="text-gray-500">{report.location}</p>
                </div>

                {/* 画像エリア */}
                {report.report_images.length > 0 && (
                  <div
                    className={`mt-4 gap-3 ${
                      report.report_images.length === 1
                        ? "flex justify-center"
                        : "grid grid-cols-1 sm:grid-cols-2"
                    }`}
                  >
                    <ReportImage reportImages={report.report_images} />
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
