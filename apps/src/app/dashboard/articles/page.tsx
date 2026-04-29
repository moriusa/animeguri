"use client";

import { ArticleCard02 } from "@/components/common/ArticleCard02";
import { useGetMyArticleCards } from "@/features/articles/hooks/useGetMyArticleCards";

const Page = () => {
  const { articles, isLoading, error } = useGetMyArticleCards(10);

  if (isLoading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!articles || articles.length === 0) {
    return <div className="text-center py-8">記事がありません</div>;
  }

  return (
    <div className="space-y-4">
      {articles.map((article) =>
       <ArticleCard02 key={article.id} data={article} />
      )}
    </div>
  );
};

export default Page;
