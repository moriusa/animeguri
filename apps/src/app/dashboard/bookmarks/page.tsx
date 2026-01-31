"use client";
import { ArticleCard } from "@/components/common/ArticleCard";
import { useGetBookmarkArticles } from "@/features/bookmarks/useGetBookmarkArticles";

const Page = () => {
  const { articles, error, loading } = useGetBookmarkArticles(10);
  const articleData = articles?.data;

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!articleData || articleData.length === 0) {
    return (
      <div className="text-center py-8">ブックマークした記事がありません</div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articleData.map((article) => (
          <ArticleCard key={article.article.id} data={article.article} />
        ))}
      </div>
    </div>
  );
};

export default Page;
