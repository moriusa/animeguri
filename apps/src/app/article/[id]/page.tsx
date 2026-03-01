"use client";
import { ReportImage } from "@/components/article/ReportImage";
import { useGetArticle } from "@/features/articles/useGetArticle";
import { useBookmark } from "@/features/bookmarks/useBookmark";
import { JapaneseDateTime } from "@/utils/formatDate";
import Image from "next/image";
import Link from "next/link";
import { CiLocationOn } from "react-icons/ci";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";

const Page = () => {
  const { article, loading, error } = useGetArticle();
  const data = article?.data;

  const {
    isBookmarked,
    toggleBookmark,
    loading: bookmarkLoading,
    checkLoading,
    error: bookmarkError,
  } = useBookmark();
  if (loading) return <p>記事取得中...</p>;
  if (!data) return <p>記事が見つかりません</p>;
  return (
    <article className="max-w-3xl mx-auto pb-16">
      {/* サムネイル */}
      <section className="text-center pt-8 pb-6">
        <div className="mx-auto">
          <Image
            src={data.thumbnailUrl}
            alt={data.title}
            width={800}
            height={600}
            className="w-full h-full object-cover rounded-lg shadow"
          />
        </div>

        <h1 className="font-bold text-2xl sm:text-3xl mt-18">{data.title}</h1>

        <p className="mt-2 text-sm text-gray-500">
          {new JapaneseDateTime(data.publishedAt).toJST()}
        </p>

        <p className="mt-1 text-sm text-gray-600">{data.animeName}</p>
      </section>

      {/* 著者情報 */}
      <div className="bg-white rounded-lg shadow-sm ">
        <div className="p-5 flex justify-between">
          <section className="inline-block">
            <Link
              href={`/user/${data.author.id}`}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 relative rounded-full overflow-hidden">
                <Image
                  src={data.author.profileImageUrl}
                  alt={data.author.userName}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-semibold">{data.author.userName}</p>
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
        <section>
          {data.reports.map((report, idx) => {
            return (
              <div
                key={report.id}
                className="relative mx-3 my-8 p-5 rounded-lg overflow-hidden"
                style={{
                  backgroundColor: "#f5e6d3",
                }}
              >
                <div
                  className="absolute inset-0 rounded-lg shadow-inner pointer-events-none"
                  style={{
                    boxShadow: "inset 0 0 30px rgba(34, 23, 9, 0.15)",
                  }}
                ></div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-xs text-gray-400">
                    {String(report.displayOrder ?? idx + 1).padStart(2, "0")}
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
                {idx < data.reports.length - 1 && (
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
