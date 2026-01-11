"use client";
import { ArticleCard } from "@/components/common/ArticleCard";
import { ArticleCard as ArticleCardType } from "@/types";
import { useGetBookmarkArticles } from "@/features/bookmarks/useGetBookmarkArticles";

const Page = () => {
  const {articles, error, loading} = useGetBookmarkArticles(10);

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!articles) {
    return <div className="text-center py-8">記事がありません</div>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.id} data={article} />
        ))}
      </div>
    </div>
  );
};

export default Page;
