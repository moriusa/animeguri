"use client";

import { ArticleCard02 } from "@/components/common/ArticleCard02";
import { DraftArticleCard } from "@/components/common/DraftArticleCard";
import { useGetMyArticleCards } from "@/features/articles/useGetMyArticleCards";

const Page = () => {
  const { articles, loading, error } = useGetMyArticleCards();
  const articleData = articles?.data;

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!articleData || articleData.length === 0) {
    return <div className="text-center py-8">記事がありません</div>;
  }

  return (
    <div className="space-y-4">
      {articles.data.map((article) =>
        article.articleStatus === "draft" ? (
          <DraftArticleCard key={article.id} data={article} />
        ) : (
          <ArticleCard02 key={article.id} data={article} />
        ),
      )}
    </div>
  );
};

export default Page;
